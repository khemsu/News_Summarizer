import os
import re
import numpy as np
import pandas as pd
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from nltk import pos_tag
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import train_test_split
from rouge_score import rouge_scorer
import nltk
nltk.download('punkt_tab')

import nltk
nltk.download('punkt_tab')

# Download all required NLTK data
nltk.download([
    'punkt',          # Tokenizer
    'stopwords',      # Stopwords list
    'wordnet',        # WordNet lemmatizer
    'averaged_perceptron_tagger_eng'  # POS tagger
])



articles_path = "BBC News Summary/Summaries/entertainment"
summaries_path = "BBC News Summary/Summaries/entertainment"
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

def read_text_files(filepath_list, folder_path):
    """Read all .txt files with proper encoding handling"""
    contents = []
    for filename in filepath_list:
        with open(os.path.join(folder_path, filename), 'r', encoding='latin1') as f:
            contents.append(f.read())
    return contents

article_files = sorted([f for f in os.listdir(articles_path) if f.endswith('.txt')])
summary_files = sorted([f for f in os.listdir(summaries_path) if f.endswith('.txt')])

article_texts = read_text_files(article_files, articles_path)
summary_texts = read_text_files(summary_files, summaries_path)

print(f"Found {len(article_files)} articles and {len(summary_files)} summaries")
print("First 5 article filenames:", article_files[:5])
print("First 5 summary filenames:", summary_files[:5])

df = pd.DataFrame({'article': article_texts, 'summary': summary_texts})

def preprocess(text):
    """Clean and tokenize text while preserving sentence structure"""
    sentences = sent_tokenize(text)
    clean_sentences = []
    for sent in sentences:
        # sentence to word
        words = word_tokenize(sent.lower())

        #words to alphnumeric only ie removing punctuations
        words = [w for w in words if w.isalnum() and w not in stopwords.words('english')]

        #joining into clean_sentences
        clean_sentences.append(' '.join(words))
    return clean_sentences

preprocessed_articles = [preprocess(text) for text in article_texts]
preprocessed_summaries = [preprocess(text) for text in summary_texts]

def label_sentences(articles, summaries):
    labels = []
    for art_sents, sum_sents in zip(articles, summaries):
        emb_art = model.encode(art_sents)
        emb_sum = model.encode(sum_sents)
        sim_matrix = cosine_similarity(emb_art, emb_sum)
        max_sim = sim_matrix.max(axis=1)
        labels.append((max_sim >= 0.8).astype(int).tolist())
    return labels

def postprocess_labels(article, labels, min_sentence_length=5):
    """Ensure very short sentences or boilerplate are not selected."""
    for i, (sent, label) in enumerate(zip(article, labels)):
        if len(sent.split()) < min_sentence_length:
            labels[i] = 0  # Discard short sentences
    return labels

def extract_advanced_features(sentences):
    """Extract multiple linguistic features for each sentence"""
    features = []
    positions = np.linspace(0, 1, num=len(sentences))
    tfidf = TfidfVectorizer().fit_transform(sentences)
    tfidf_avg = np.array(tfidf.mean(axis=1)).flatten()

    for i, sent in enumerate(sentences):
        # Quantitative features
        numbers = len(re.findall(r'\$?\d+(?:\.\d+)?%?', sent))
        proper_nouns = len([word for word, tag in pos_tag(word_tokenize(sent)) if tag == 'NNP'])

        # Structural features
        word_count = len(word_tokenize(sent))
        char_count = len(sent)
        is_question = 1 if sent.strip().endswith('?') else 0

        # Semantic features (simplified)
        has_connector = 1 if any(word in sent for word in ['however', 'therefore', 'although']) else 0

        features.append([
            positions[i],      # Normalized position (0=start, 1=end)
            tfidf_avg[i],     # TF-IDF importance
            numbers,          # Count of numerical values
            proper_nouns,     # Count of proper nouns
            word_count,       # Word length
            char_count/100,   # Normalized character length
            is_question,      # Is question sentence
            has_connector     # Contains discourse connector
        ])

    return np.array(features)

# Preprocess and label
df['clean_article'] = df['article'].apply(preprocess)
df['clean_summary'] = df['summary'].apply(preprocess)
y_labels = label_sentences(df['clean_article'], df['clean_summary'])



## 4. Model Training =====================================================

# Feature extraction
X_features = []
for sentences in df['clean_article']:
    features = extract_advanced_features(sentences)
    X_features.append(features)

# Prepare training data
X = np.vstack(X_features)
y = np.concatenate(y_labels)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

from collections import Counter
print("Label distribution:", Counter(y))


# Train calibrated model
model = GradientBoostingClassifier(
    n_estimators=200,
    learning_rate=0.01,
    max_depth=3,
    random_state=42
)
calibrated_model = CalibratedClassifierCV(model, cv=5)
calibrated_model.fit(X_train, y_train)

print(f"\nTraining Accuracy: {calibrated_model.score(X_train, y_train):.2f}")
print(f"Test Accuracy: {calibrated_model.score(X_test, y_test):.2f}")

def generate_summary(article, model, diversity_lambda=0.7):
    """
    Generate extractive summary using MMR (diversity + relevance).
    `diversity_lambda`: trade-off between relevance and diversity (0.7 = more relevance).
    """
    sentences = sent_tokenize(article)
    if len(sentences) <= 3:
        return article

    top_n = max(3, int(len(sentences) * 0.3))

    # Clean and preprocess
    clean_sents = preprocess(article)
    features = extract_advanced_features(clean_sents)
    probas = model.predict_proba(features)[:, 1]  # Classifier probability as relevance

    # Sentence embeddings
    sent_embeddings = model_embed.encode(clean_sents)
    doc_embedding = np.mean(sent_embeddings, axis=0, keepdims=True)

    # Compute similarity of each sentence to the whole document
    relevance_scores = cosine_similarity(sent_embeddings, doc_embedding).flatten()

    # Normalize classifier and similarity scores
    probas_norm = (probas - probas.min()) / (probas.max() - probas.min() + 1e-8)
    relevance_scores = (relevance_scores - relevance_scores.min()) / (relevance_scores.max() - relevance_scores.min() + 1e-8)

    # Combine relevance (classifier) and semantic similarity
    relevance = 0.5 * probas_norm + 0.5 * relevance_scores

    selected = []
    remaining = list(range(len(sentences)))

    # Select the first sentence with highest relevance
    first_idx = np.argmax(relevance)
    selected.append(first_idx)
    remaining.remove(first_idx)

    while len(selected) < top_n and remaining:
        mmr_scores = []
        for idx in remaining:
            # Relevance to the document
            rel = relevance[idx]
            # Similarity to already selected sentences (to reduce redundancy)
            sim_to_selected = max(cosine_similarity([sent_embeddings[idx]], [sent_embeddings[j] for j in selected])[0])
            mmr = diversity_lambda * rel - (1 - diversity_lambda) * sim_to_selected
            mmr_scores.append(mmr)

        next_idx = remaining[np.argmax(mmr_scores)]
        selected.append(next_idx)
        remaining.remove(next_idx)

    selected.sort()
    summary = ' '.join([sentences[i] for i in selected])

    # Post-process
    summary = summary[0].upper() + summary[1:]
    if not summary.endswith(('.', '!', '?')):
        summary += '.'

    return summary


# Initialize ROUGE scorer
scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
for sample_idx in range(10):  # Generate summaries for first 10 articles
    article = df['article'][sample_idx]
    reference = df['summary'][sample_idx]
    generated = generate_summary(article, calibrated_model)
    
    scores = scorer.score(reference, generated)
    
    print(f"\n=== Sample {sample_idx + 1} ===")
    print("\n--- Original Article ---")
    print(article[:1000] + "...")

    print("\n--- Reference Summary ---")
    print(reference)

    print("\n--- Generated Summary ---")
    print(generated)

    print("\n--- ROUGE Scores ---")
    print(f"ROUGE-1: F1={scores['rouge1'].fmeasure:.3f} (Recall={scores['rouge1'].recall:.3f}, Precision={scores['rouge1'].precision:.3f})")
    print(f"ROUGE-2: F1={scores['rouge2'].fmeasure:.3f} (Recall={scores['rouge2'].recall:.3f}, Precision={scores['rouge2'].precision:.3f})")
    print(f"ROUGE-L: F1={scores['rougeL'].fmeasure:.3f} (Recall={scores['rougeL'].recall:.3f}, Precision={scores['rougeL'].precision:.3f})")
    print("="*80)
