import joblib
import os
import numpy as np
import re
import nltk
from nltk.corpus import stopwords as nltk_stopwords
from sentence_transformers import SentenceTransformer
from newspaper import Article as NewsArticle
from collections import Counter
import math

def sentence_tokenizer(text):
   
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s for s in sentences if s]

def word_tokenizer(sentence):

    sentence = re.sub(r'[^\w\s]', '', sentence)  # remove punctuation
    words = sentence.split()
    return words

def cosine_similarity_custom(vec1, vec2):
    vec1 = np.array(vec1).flatten()
    vec2 = np.array(vec2).flatten()
    if vec1.shape != vec2.shape:
        raise ValueError("Vectors must have the same dimensions")
    dot_product = np.dot(vec1, vec2)
    magnitude1 = np.linalg.norm(vec1)
    magnitude2 = np.linalg.norm(vec2)
    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0
    return np.clip(dot_product / (magnitude1 * magnitude2), -1.0, 1.0)

def cosine_similarity_matrix(embeddings1, embeddings2=None):
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
    return np.clip(similarity_matrix, -1.0, 1.0)

# ---------------- LOAD MODELS ---------------- #
_BASE_DIR = os.path.dirname(__file__)
_CALIBRATED_GB_MODEL_PATH = os.path.join(_BASE_DIR, 'calibrated_gb_model.joblib')
_NEWS_CLASSIFIER_PATH = os.path.join(_BASE_DIR, 'news_classifier.joblib')
_VECTORIZER_PATH = os.path.join(_BASE_DIR, 'vectorizer.joblib')

model = joblib.load(_CALIBRATED_GB_MODEL_PATH)
clf = joblib.load(_NEWS_CLASSIFIER_PATH)
vectorizer_sklearn = joblib.load(_VECTORIZER_PATH)
model_embed = SentenceTransformer('all-MiniLM-L6-v2')

# ---------------- CUSTOM TF-IDF IMPLEMENTATION ---------------- #
class TFIDFVectorizerCustom:
    def __init__(self):
        self.vocab = {}
        self.idf = {}

    def fit(self, corpus):
        df_counts = Counter()
        total_docs = len(corpus)
        for doc in corpus:
            words = set(word_tokenizer(doc.lower()))
            for w in words:
                df_counts[w] += 1
        self.vocab = {w: i for i, w in enumerate(df_counts.keys())}
        self.idf = {
            w: math.log((total_docs + 1) / (df_counts[w] + 1)) + 1
            for w in df_counts
        }

    def transform(self, corpus):
        X = np.zeros((len(corpus), len(self.vocab)))
        for i, doc in enumerate(corpus):
            words = word_tokenizer(doc.lower())
            tf_counts = Counter(words)
            doc_len = len(words)
            for w, tf in tf_counts.items():
                if w in self.vocab:
                    tfidf = (tf / doc_len) * self.idf[w]
                    X[i, self.vocab[w]] = tfidf
        return X

    def fit_transform(self, corpus):
        self.fit(corpus)
        return self.transform(corpus)

# ---------------- SUMMARIZER CLASS ---------------- #
class Summarizer:
    nltk.download('stopwords')

    @staticmethod
    def preprocess(text):
        sentences = sentence_tokenizer(text)
        clean_sentences = []

        # Load English stopwords from NLTK
        stop_words = set(nltk_stopwords.words('english'))

        for sent in sentences:
            words = [w.lower() for w in word_tokenizer(sent) if w.isalnum() and w.lower() not in stop_words]
            clean_sentences.append(' '.join(words))
        return clean_sentences

    @staticmethod
    def extract_advanced_features(sentences):
        features = []
        positions = np.linspace(0, 1, num=len(sentences))
        for i, sent in enumerate(sentences):
            words = word_tokenizer(sent)
            numbers = len(re.findall(r'\$?\d+(?:\.\d+)?%?', sent))
            proper_nouns = len([w for w in words if w.istitle()])
            word_count = len(words)
            char_count = len(sent)
            is_question = 1 if sent.strip().endswith('?') else 0
            has_connector = 1 if any(connector in sent.lower() for connector in ['however', 'therefore', 'although']) else 0
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
        sentences = sentence_tokenizer(article)
        if len(sentences) <= 3:
            return article
        top_n = max(3, int(len(sentences) * 0.3))
        clean_sents = Summarizer.preprocess(article)
        features = Summarizer.extract_advanced_features(clean_sents)
        probas = model.predict_proba(features)[:, 1] #probs is for sentence relevance
        sent_embeddings = model_embed.encode(clean_sents)
        doc_embedding = np.mean(sent_embeddings, axis=0, keepdims=True)
        relevance_scores = cosine_similarity_matrix(sent_embeddings, doc_embedding).flatten()
        probas_norm = (probas - probas.min()) / (probas.max() - probas.min() + 1e-8)
        relevance_scores = (relevance_scores - relevance_scores.min()) / (relevance_scores.max() - relevance_scores.min() + 1e-8)
        relevance = 0.5 * probas_norm + 0.5 * relevance_scores #MMR
        selected, remaining = [int(np.argmax(relevance))], list(range(len(sentences)))
        remaining.remove(selected[0])
        while len(selected) < top_n and remaining:
            mmr_scores = []
            for idx in remaining:
                rel = relevance[idx]
                sims = [cosine_similarity_custom(sent_embeddings[idx], sent_embeddings[j]) for j in selected]
                sim_to_selected = max(sims, default=0.0)
                mmr_scores.append(diversity_lambda * rel - (1 - diversity_lambda) * sim_to_selected)
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
    def get_word_count(text):
        words = [w for w in word_tokenizer(text) if w.isalnum()]
        return len(words)

    @staticmethod
    def generate_summary_with_counts(article, model, diversity_lambda=0.7):
        summary = Summarizer.generate_summary(article, model, diversity_lambda=diversity_lambda)
        original_word_count = Summarizer.get_word_count(article)
        summary_word_count = Summarizer.get_word_count(summary)
        return {
            "summary": summary,
            "original_word_count": original_word_count,
            "summary_word_count": summary_word_count,
        }

    @staticmethod
    def classify_article(article_text):
        stopwords = {
            "the",
            "a",
            "an",
            "in",
            "on",
            "at",
            "for",
            "with",
            "to",
            "from",
            "by",
            "and",
            "or",
            "but",
            "if",
            "of",
            "is",
            "are",
        }
        processed = ' '.join([w.lower() for w in word_tokenizer(article_text) if w.isalnum() and w.lower() not in stopwords])
        # Use the pre-trained vectorizer to ensure feature dimensions match the classifier
        X = vectorizer_sklearn.transform([processed])
        pred = clf.predict(X)
        return pred[0]
    
    