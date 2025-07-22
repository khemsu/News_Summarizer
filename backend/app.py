from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi import UploadFile, File
from bson.objectid import ObjectId
from model.sumAndclassification import generate_summary, classify_article, model
from typing import Optional, Annotated
from datetime import datetime, timezone
from db.schema import Article
from db.mongo_config import get_db
from model.sumAndclassification import generate_summary, classify_article, model
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
async def analyze_article( file: UploadFile = File(...)):
    content = extract_text_from_pdf(file.file)
    if not content:
        return {"error": "No text found in the PDF file."}
    db = get_db()
    category = classify_article(content)
    article_data = Article(
        filename=file.filename,
        content=content,
        category=category,
        summary = "",
        uploaded_at=datetime.now(timezone.utc)
    )
    result = db.articles.insert_one(article_data.dict())
    return {"content": content, "article_id": str(result.inserted_id), "category": category}

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
    category = article.get("category")
    if not category:
        category = classify_article(content)
        db.articles.update_one({"_id": article["_id"]}, {"$set": {"category": category}})
    return {"summary": summary, "category": category}

@app.post("/text-summarize")
async def summarize_from_text(article_text: Annotated[str, Form()]):
    if not article_text:
        return {"error": "No article text provided."}
    summary = generate_summary(article_text, model, diversity_lambda=0.7)
    category = classify_article(article_text)
    return {"summary": summary, "category": category}




