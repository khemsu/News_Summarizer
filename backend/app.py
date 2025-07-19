from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi import UploadFile, File
from bson.objectid import ObjectId
from model.summarizer import generate_summary, model 
from typing import Optional
from datetime import datetime, timezone

from db.mongo_config import get_db
from utils.pdf_reader import extract_text_from_pdf
app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for simplicity; adjust as needed
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)   


@app.get("/", response_class=HTMLResponse)
async def read_root():
    return """
    <html>
        <head>
            <title>FastAPI App</title>
        </head>
        <body>
            <h1>Welcome to the FastAPI App!</h1>
        </body>
    </html>
    """

@app.post("/analyze/")
async def analyze_article(file: UploadFile = File(...)):
    content = extract_text_from_pdf(file.file)
    if not content:
        return {"error": "No text found in the PDF file."}
    db = get_db()
    article = {
        "content": content,
        "filename": file.filename,
        "uploaded_at": datetime.now(timezone.utc)
    }
    result = db.articles.insert_one(article)
    return {"content": content, "article_id": str(result.inserted_id)}

@app.get("/summarize/")
async def summarize_article(article_id: Optional[str] = None):
    db = get_db()
    if article_id:
        article = db.articles.find_one({"_id": ObjectId(article_id)})
    else:
        article = db.articles.find_one(sort=[("uploaded_at", -1)])
    if not article:
        return {"error": "No article found."}
    content = article["content"]
    summary = generate_summary(content, model, diversity_lambda=0.7)
    return {"summary": summary}

@app.get("/classify/")
async def classify_article(article_id: Optional[str] = None):
    db = get_db()
    if article_id:
        article = db.articles.find_one({"_id": ObjectId(article_id)})
    else:
        article = db.articles.find_one(sort=[("uploaded_at", -1)])
    if not article:
        return {"error": "No article found."}
    content = article["content"]
    
    # Simple classification logic - you can enhance this with your ML model
    # For now, let's do a basic keyword-based classification
    content_lower = content.lower()
    
    if any(word in content_lower for word in ['politics', 'government', 'election', 'policy']):
        classification = "Politics"
        confidence = 85
    elif any(word in content_lower for word in ['technology', 'tech', 'ai', 'software', 'computer']):
        classification = "Technology"
        confidence = 90
    elif any(word in content_lower for word in ['business', 'economy', 'finance', 'market', 'company']):
        classification = "Business"
        confidence = 80
    elif any(word in content_lower for word in ['health', 'medical', 'medicine', 'doctor', 'hospital']):
        classification = "Health"
        confidence = 88
    elif any(word in content_lower for word in ['sports', 'football', 'basketball', 'soccer', 'game']):
        classification = "Sports"
        confidence = 92
    else:
        classification = "General"
        confidence = 70
    
    return {"classification": classification, "confidence": confidence} 



