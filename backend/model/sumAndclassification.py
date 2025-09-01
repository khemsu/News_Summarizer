import joblib
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from nltk import pos_tag
import numpy as np
import re
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from newspaper import Article as NewsArticle
from pydantic import BaseModel

# Download required NLTK data
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('averaged_perceptron_tagger')


# Load models
model = joblib.load('model/calibrated_gb_model.joblib')
clf = joblib.load('model/news_classifier.joblib')
model_embed = SentenceTransformer('all-MiniLM-L6-v2')
vectorizer = joblib.load('model/vectorizer.joblib')


# ---------------- CUSTOM COSINE SIMILARITY ---------------- #

def cosine_similarity_custom(vec1, vec2):
    """
    Compute cosine similarity between two vectors from scratch.
    """
    vec1 = np.array(vec1).flatten()
    vec2 = np.array(vec2).flatten()

    if vec1.shape != vec2.shape:
        raise ValueError("Vectors must have the same dimensions")

    dot_product = np.dot(vec1, vec2)
    magnitude1 = np.linalg.norm(vec1)
    magnitude2 = np.linalg.norm(vec2)

    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0

    cosine_sim = dot_product / (magnitude1 * magnitude2)
    cosine_sim = np.clip(cosine_sim, -1.0, 1.0)
    return cosine_sim


def cosine_similarity_matrix(embeddings1, embeddings2=None):
    """
    Compute cosine similarity matrix between two sets of embeddings.
    If embeddings2 is None, compute similarity within embeddings1.
    """
    if embeddings2 is None:
        embeddings2 = embeddings1

    embeddings1 = np.array(embeddings1)
    embeddings2 = np.array(embeddings2)

    norm1 = np.linalg.norm(embeddings1, axis=1, keepdims=True)
    norm2 = np.linalg.norm(embeddings2, axis=1, keepdims=True)

    norm1 = np.where(norm1 == 0, 1, norm1)
    norm2 = np.where(norm2 == 0, 1, norm2)

    embeddings1_norm = embeddings1 / norm1
    embeddings2_norm = embeddings2 / norm2

    similarity_matrix = np.dot(embeddings1_norm, embeddings2_norm.T)
    similarity_matrix = np.clip(similarity_matrix, -1.0, 1.0)
    return similarity_matrix


# ---------------- SUMMARIZER CLASS ---------------- #

class Summarizer(BaseModel):

    @staticmethod
    def preprocess(text):
        sentences = sent_tokenize(text)
        clean_sentences = []
        for sent in sentences:
            words = word_tokenize(sent.lower())
            words = [w for w in words if w.isalnum() and w not in stopwords.words('english')]
            clean_sentences.append(' '.join(words))
        return clean_sentences

    @staticmethod
    def extract_advanced_features(sentences):
        features = []
        positions = np.linspace(0, 1, num=len(sentences))
        for i, sent in enumerate(sentences):
            words = word_tokenize(sent)
            numbers = len(re.findall(r'\$?\d+(?:\.\d+)?%?', sent))
            proper_nouns = len([word for word, tag in pos_tag(words) if tag == 'NNP'])
            word_count = len(words)
            char_count = len(sent)
            is_question = 1 if sent.strip().endswith('?') else 0
            has_connector = 1 if any(word in sent for word in ['however', 'therefore', 'although']) else 0
            unique_words = set(words)
            tfidf_approx = len(unique_words) / len(words) if words else 0
            features.append([
                positions[i],
                tfidf_approx,
                numbers,
                proper_nouns,
                word_count,
                char_count / 100,
                is_question,
                has_connector
            ])
        return np.array(features)

    @staticmethod
    def generate_summary(article, model, diversity_lambda=0.7):
        sentences = sent_tokenize(article)
        if len(sentences) <= 3:
            return article

        top_n = max(3, int(len(sentences) * 0.3))
        clean_sents = Summarizer.preprocess(article)
        features = Summarizer.extract_advanced_features(clean_sents)
        probas = model.predict_proba(features)[:, 1]

        # Sentence embeddings
        sent_embeddings = model_embed.encode(clean_sents)

        # Use custom cosine similarity
        doc_embedding = np.mean(sent_embeddings, axis=0, keepdims=True)
        relevance_scores = cosine_similarity_matrix(sent_embeddings, doc_embedding).flatten()

        # Normalize
        probas_norm = (probas - probas.min()) / (probas.max() - probas.min() + 1e-8)
        relevance_scores = (relevance_scores - relevance_scores.min()) / (relevance_scores.max() - relevance_scores.min() + 1e-8)
        relevance = 0.5 * probas_norm + 0.5 * relevance_scores

        selected = []
        remaining = list(range(len(sentences)))
        first_idx = int(np.argmax(relevance))
        selected.append(first_idx)
        remaining.remove(first_idx)

        while len(selected) < top_n and remaining:
            mmr_scores = []
            for idx in remaining:
                rel = relevance[idx]
                sims = [cosine_similarity_custom(sent_embeddings[idx], sent_embeddings[j]) for j in selected]
                sim_to_selected = max(sims) if sims else 0.0
                mmr = diversity_lambda * rel - (1 - diversity_lambda) * sim_to_selected
                mmr_scores.append(mmr)

            next_idx = remaining[int(np.argmax(mmr_scores))]
            selected.append(next_idx)
            remaining.remove(next_idx)

        selected.sort()
        summary = ' '.join([sentences[i] for i in selected])
        summary = summary[0].upper() + summary[1:]
        if not summary.endswith(('.', '!', '?')):
            summary += '.'
        return summary

    @staticmethod
    def classify_article(article_text):
        processed = ' '.join([w for w in word_tokenize(article_text.lower()) if w.isalnum() and w not in stopwords.words('english')])
        try:
            fitted_vectorizer = joblib.load('model/vectorizer.joblib')
            X = fitted_vectorizer.transform([processed])
        except Exception:
            vectorizer = TfidfVectorizer(max_features=2000)
            dummy_corpus = [processed]
            X = vectorizer.fit_transform(dummy_corpus)
        pred = clf.predict(X)
        return pred[0]


# def summarize_and_classify_url(url, model, diversity_lambda=0.7):
#     """Given a news URL, extract content, summarize, and classify it."""
#     text = extract_text_from_url(url)
#     if not text.strip():
#         return {"error": "No content could be extracted from the URL."}
#     summary = generate_summary(text, model, diversity_lambda=diversity_lambda)
#     category = classify_article(text)
#     return {"summary": summary, "category": category, "content": text}
