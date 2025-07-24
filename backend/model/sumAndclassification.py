import joblib
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from nltk import pos_tag
import numpy as np
import re
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from newspaper import Article as NewsArticle

# Download required NLTK data
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('averaged_perceptron_tagger')


model = joblib.load('model/calibrated_gb_model.joblib')
clf = joblib.load('model/news_classifier.joblib')
model_embed = SentenceTransformer('all-MiniLM-L6-v2')
vectorizer = joblib.load('model/vectorizer.joblib')

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

def preprocess(text):
    sentences = sent_tokenize(text)
    clean_sentences = []
    for sent in sentences:
        words = word_tokenize(sent.lower())
        words = [w for w in words if w.isalnum() and w not in stopwords.words('english')]
        clean_sentences.append(' '.join(words))
    return clean_sentences

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

def generate_summary(article, model, diversity_lambda=0.7):
    # sourcery skip: merge-list-append, move-assign-in-block
    sentences = sent_tokenize(article)
    if len(sentences) <= 3:
        return article
    top_n = max(3, int(len(sentences) * 0.3))
    clean_sents = preprocess(article)
    features = extract_advanced_features(clean_sents)
    probas = model.predict_proba(features)[:, 1] # 1 is the probability of the positive class
    sent_embeddings = model_embed.encode(clean_sents) # encode the sentences into embeddings
    
    doc_embedding = np.mean(sent_embeddings, axis=0, keepdims=True) # average the embeddings of the sentences
    relevance_scores = cosine_similarity(sent_embeddings, doc_embedding).flatten() # calculate the relevance scores
    probas_norm = (probas - probas.min()) / (probas.max() - probas.min() + 1e-8) # normalize the probabilities
    relevance_scores = (relevance_scores - relevance_scores.min()) / (relevance_scores.max() - relevance_scores.min() + 1e-8) # normalize the relevance scores
    relevance = 0.5 * probas_norm + 0.5 * relevance_scores # combine the probabilities and relevance scores
    selected = [] # initialize the selected sentences
    remaining = list(range(len(sentences)))
    first_idx = int(np.argmax(relevance)) # get the index of the most relevant sentence
    selected.append(first_idx)
    remaining.remove(first_idx)
    while len(selected) < top_n and remaining:
        mmr_scores = [] # calculate the MMR scores
        for idx in remaining:
            rel = relevance[idx] # get the relevance score of the sentence
            sim_to_selected = max(cosine_similarity([sent_embeddings[idx]], [sent_embeddings[j] for j in selected])[0]) # calculate the similarity between the sentence and the selected sentences
            mmr = diversity_lambda * rel - (1 - diversity_lambda) * sim_to_selected # calculate the MMR score
            mmr_scores.append(mmr)
        next_idx = int(remaining[np.argmax(mmr_scores)]) # get the index of the next sentence to add
        selected.append(next_idx)
        remaining.remove(next_idx)
    selected.sort() # sort the selected sentences by their index
    summary = ' '.join([sentences[i] for i in selected]) # join the selected sentences into a summary
    summary = summary[0].upper() + summary[1:] # capitalize the first letter of the summary
    if not summary.endswith(('.', '!', '?')):
        summary += '.'
    return summary

def classify_article(article_text):
    processed = ' '.join([w for w in word_tokenize(article_text.lower()) if w.isalnum() and w not in stopwords.words('english')])
    try:
        fitted_vectorizer = joblib.load('model/vectorizer.joblib')
        X = fitted_vectorizer.transform([processed])
    except:
        vectorizer = TfidfVectorizer(max_features=2000)
        dummy_corpus = [processed]
        X = vectorizer.fit_transform(dummy_corpus)
    pred = clf.predict(X)
    return pred[0]

def extract_text_from_url(url):
    """Extracts and returns the main text content from a news URL using newspaper3k."""
    article = NewsArticle(url)
    article.download()
    article.parse()
    return article.text


def summarize_and_classify_url(url, model, diversity_lambda=0.7):
    """Given a news URL, extract content, summarize, and classify it."""
    text = extract_text_from_url(url)
    if not text.strip():
        return {"error": "No content could be extracted from the URL."}
    summary = generate_summary(text, model, diversity_lambda=diversity_lambda)
    category = classify_article(text)
    return {"summary": summary, "category": category, "content": text}
