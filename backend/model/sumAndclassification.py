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
import requests
from bs4 import BeautifulSoup

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
    """Extracts and returns the main text content from a news URL using BeautifulSoup."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove unwanted elements more aggressively
        unwanted_selectors = [
            "script", "style", "nav", "header", "footer", "aside", "sidebar", 
            "advertisement", "ads", "social", "share", "comment", "related", 
            "recommended", ".navigation", ".menu", ".sidebar", ".widget", 
            ".ad", ".advertisement", ".social", ".share", ".related", 
            ".recommended", ".trending", ".popular", ".latest", ".breaking",
            ".news-list", ".headlines", ".top-stories", ".featured"
        ]
        
        for selector in unwanted_selectors:
            for element in soup.select(selector):
                element.decompose()
        
        # More specific selectors for news content (prioritized)
        content_selectors = [
            '.article-body',
            '.post-body', 
            '.entry-content',
            '.story-content',
            '.article-content',
            '.content-body',
            '.post-content',
            '.article-text',
            '.story-text',
            '.article-main',
            '.post-main',
            'article .content',
            'article p',
            '.main-content',
            '.content',
            'article',
            'main',
            '.story-body',
            '.article-content p',
            '.post-content p',
            '.entry-content p'
        ]
        
        content = ""
        for selector in content_selectors:
            elements = soup.select(selector)
            if elements:
                # Get text from all matching elements
                text_parts = []
                for elem in elements:
                    text = elem.get_text(strip=True)
                    # Filter out very short text and likely navigation
                    if (len(text) > 100 and 
                        not any(keyword in text.lower() for keyword in 
                               ['share', 'follow', 'like', 'comment', 'related', 'recommended', 'trending', 'breaking', 'latest'])):
                        text_parts.append(text)
                
                if text_parts:
                    content = ' '.join(text_parts)
                    if len(content) > 500:  # Ensure we have substantial content
                        break
        
        # If still no substantial content, try paragraph-based extraction with better filtering
        if not content or len(content) < 500:
            paragraphs = soup.find_all('p')
            if paragraphs:
                text_parts = []
                for p in paragraphs:
                    text = p.get_text(strip=True)
                    # Only include substantial paragraphs that don't look like navigation
                    if (len(text) > 100 and 
                        not any(keyword in text.lower() for keyword in 
                               ['share', 'follow', 'like', 'comment', 'related', 'recommended', 'trending', 'breaking', 'latest', 'read more', 'click here'])):
                        text_parts.append(text)
                content = ' '.join(text_parts)
        
        # Final fallback: get all text but filter out very short sections and navigation
        if not content or len(content) < 300:
            all_text = soup.get_text()
            # Split by lines and filter out very short or likely non-content lines
            lines = all_text.split('\n')
            content_lines = []
            for line in lines:
                line = line.strip()
                if (len(line) > 100 and 
                    not line.startswith(('©', 'Share', 'Follow', 'Like', 'Comment', 'Related', 'Recommended', 'Trending', 'Breaking', 'Latest')) and
                    not any(keyword in line.lower() for keyword in ['share', 'follow', 'like', 'comment', 'related', 'recommended', 'trending', 'breaking', 'latest', 'read more', 'click here'])):
                    content_lines.append(line)
            content = ' '.join(content_lines)
        
        # Clean up the text
        content = re.sub(r'\s+', ' ', content)  # Replace multiple spaces with single space
        content = re.sub(r'\n+', '\n', content)  # Replace multiple newlines with single newline
        content = re.sub(r'Share.*?Follow', '', content, flags=re.IGNORECASE)  # Remove share/follow text
        content = re.sub(r'Related.*?Recommended', '', content, flags=re.IGNORECASE)  # Remove related/recommended text
        content = re.sub(r'Read more.*?Click here', '', content, flags=re.IGNORECASE)  # Remove read more/click here text
        
        final_content = content.strip()
        
        # Print the extracted content to console
        print("=" * 80)
        print("EXTRACTED CONTENT FROM URL:")
        print("=" * 80)
        print(f"URL: {url}")
        print(f"Content Length: {len(final_content)} characters")
        print("-" * 80)
        print(final_content)
        print("=" * 80)
        
        return final_content
        
    except Exception as e:
        raise Exception(f"Failed to extract content from URL: {str(e)}")


# def summarize_and_classify_url(url, model, diversity_lambda=0.7):
#     """Given a news URL, extract content, summarize, and classify it."""
#     text = extract_text_from_url(url)
#     if not text.strip():
#         return {"error": "No content could be extracted from the URL."}
#     summary = generate_summary(text, model, diversity_lambda=diversity_lambda)
#     category = classify_article(text)
#     return {"summary": summary, "category": category, "content": text}
