from fastapi import FastAPI, Form, Response, Header, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi import UploadFile, File, Body
from bson.objectid import ObjectId
from typing import Optional, Annotated  
from datetime import datetime, timezone
from db.schema import Article, User
from db.mongo_config import get_user_collection, get_article_collection, article_collection
from model.sumAndclassification import model, Summarizer
from pydantic import BaseModel
# from auth import get_password_hash, verify_password, create_access_token, get_current_user
import os
from dotenv import load_dotenv
from bson import ObjectId
from auth import Authentication

load_dotenv()

app = FastAPI()
# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for simplicity; adjust as needed
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)   

# Request models for authentication
class UserRegister(BaseModel):
    email: str
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class TokenData(BaseModel):
    username: Optional[str] = None

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

def display_user_details(username: str):
    """Display user details in console for debugging."""
    try:
        users_collection = get_user_collection()
        user = users_collection.find_one({"username": username})
        if user:
            print("=" * 50)
            print("USER DETAILS SAVED IN MONGODB:")
            print("=" * 50)
            print(f"Username: {user.get('username')}")
            print(f"Email: {user.get('email')}")
            print(f"Created At: {user.get('created_at')}")
            print(f"User ID: {user.get('_id')}")
            print(f"Password Hash: {user.get('hashed_password')[:20]}...")
            print("=" * 50)
        else:
            print(f"❌ User '{username}' not found in database")
    except Exception as e:
        print(f"❌ Error displaying user details: {str(e)}")

@app.post("/register", response_model=Authentication)
async def register(user: UserRegister):
    """Register a new user."""
    try:
        users_collection = get_user_collection()
        print(f"Attempting to register user: {user.username}")
        
        # Check if user already exists
        existing_user = users_collection.find_one({"$or": [{"email": user.email},{"username": user.username}]})
        if existing_user:
            print(f"User already exists: {existing_user}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email or username already exists"
            )
        
        # Hash the password
        hashed_password = Authentication.get_password_hash(user.password)
        print(f"Password hashed successfully for user: {user.username}")
        
        # Create user document
        user_data = User(
            email=user.email,
            username=user.username,
            hashed_password=hashed_password,
            created_at=datetime.now(timezone.utc)
        )
        
        print(f"User data created: {user_data.dict()}")
        
        # Insert into database
        result = users_collection.insert_one(user_data.dict())
        print(f"User inserted with ID: {result.inserted_id}")
        
        # Display user details in console
        display_user_details(user.username)
        
        # Create access token
        access_token = Authentication.create_access_token(data={"sub": user.username})
        print(f"Access token created for user: {user.username}")
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    except Exception as e:
        print(f"Error during registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@app.post("/login", response_model=Authentication)
async def login(user: UserLogin):
    """Login user and return JWT token."""
    users_collection = get_user_collection()
    
    # Find user by username
    user_doc = users_collection.find_one({"username": user.username})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Verify password
    if not Authentication.verify_password(user.password, user_doc["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Create access token
    access_token = Authentication.create_access_token(data={"sub": user.username})
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/logout")
async def logout():
    """Logout user (client should discard the token)."""
    return {"message": "Successfully logged out"}

@app.get("/me")
async def get_me(current_user: str = Depends(Authentication.get_current_user)):
    """Get current user information."""
    try:
        users_collection = get_user_collection()
        print(f"Looking for user: {current_user}")
        user_doc = users_collection.find_one({"username": current_user})
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found")
        return serialize_doc(user_doc)
    except Exception as e:
        print(f"Error in /me endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving user info: {str(e)}"
        )

def serialize_doc(doc: dict) -> dict:
    """Convert MongoDB document to JSON-serializable dict."""
    if not doc:
        return None
    out = {}
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            out["id"] = str(v)
        elif isinstance(v, datetime):
            out[k] = v.isoformat()
        else:
            out[k] = v
    # keep consistent field name for id if _id present
    if "_id" in doc and "id" not in out:
        out["id"] = str(doc["_id"])
    out.pop("_id", None)
    return out

# Protected endpoints (require authenticator)
@app.post("/analyze/")
async def analyze_article(file: UploadFile = File(...), current_user: str = Depends(Authentication.get_current_user)):
    """Analyze article (protected endpoint)."""
    content = Article.extract_text_from_pdf(file.file)
    if not content:
        return {"error": "No text found in the PDF file."}
    articles_collection = get_article_collection()
    category = Summarizer.classify_article(content)
    article_data = Article(
        filename=file.filename,
        content=content,
        uploaded_by=current_user,  
        summary="",  # Add default empty summary
        classification=category,
        uploaded_at=datetime.now()
    )
    result = articles_collection.insert_one(article_data.model_dump())
    return {"content": content, "article_id": str(result.inserted_id), "classification": category}

@app.get("/summarize/")
async def summarize_article(article_id: Optional[str] = None, current_user: str = Depends(Authentication.get_current_user)):
    """Summarize article (protected endpoint)."""
    articles_collection = get_article_collection()
    if article_id:
        article = articles_collection.find_one({"_id": ObjectId(article_id)})
    else:
        article = articles_collection.find_one(sort=[("uploaded_at", -1)])
    if not article:
        return {"error": "No article found."}
    content = article["content"]
    result = Summarizer.generate_summary_with_counts(content, model, diversity_lambda=0.7)
    summary = result["summary"]
    articles_collection.update_one({"_id": article["_id"]}, {"$set": {"summary": summary}})
    category = article.get("category")
    if not category:
        category = Summarizer.classify_article(content)
        articles_collection.update_one({"_id": article["_id"]}, {"$set": {"category": category}})
    return {
        "summary": summary,
        "category": category,
        "original_word_count": result["original_word_count"],
        "summary_word_count": result["summary_word_count"],
    }

@app.post("/text-summarize")
async def summarize_from_text(article_text: Annotated[str, Form()], current_user: str = Depends(Authentication.get_current_user)):
    """Summarize from text (protected endpoint)."""
    if not article_text:
        return {"error": "No article text provided."}
    result = Summarizer.generate_summary_with_counts(article_text, model, diversity_lambda=0.7)
    summary = result["summary"]
    original_word_count = result["original_word_count"]
    summary_word_count = result["summary_word_count"]
    category = Summarizer.classify_article(article_text)
    article_data = Article(
        filename="text_input",
        uploaded_by=current_user,
        content=article_text,
        summary=summary,
        category=category,
        uploaded_at=datetime.now()
    )
    article_collection.insert_one(article_data.model_dump())

    return {"summary": summary, "category": category, "original_word_count": original_word_count, "summary_word_count": summary_word_count}

class URLRequest(BaseModel):
    url: str

class ArticleIDRequest(BaseModel):
    article_id: str

@app.post("/summarize-url-content")
async def summarize_url_content(payload: URLRequest, current_user: str = Depends(Authentication.get_current_user)):
    """Extract content from URL (protected endpoint)."""
    url = payload.url
    if not url:
        return {"error": "No URL provided."}
    try:
        content = Article.extract_text_from_url(url)
        if not content.strip():
            return {"error": "No content could be extracted from the URL."}
        articles_collection = get_article_collection()
        result = Summarizer.generate_summary_with_counts(content, model, diversity_lambda=0.7)
        summary = result["summary"]
        category = Summarizer.classify_article(content)
        
        # Create article with all required fields including uploaded_by
        article_data = Article(
            filename=url,
            uploaded_by=current_user,  
            summary=summary,
            category=category,
            content=content,
            uploaded_at=datetime.now()
        )
        insert_result = articles_collection.insert_one(article_data.model_dump())
        
        # Return plain text if Accept header requests it
        # Otherwise return JSON
        return {
            "article_id": str(insert_result.inserted_id),
            "filename": url,
            "uploaded_by": current_user,  
            "summary": summary,
            "content": content,
            "category": category,
            "uploaded_at": article_data.uploaded_at.isoformat()
        }
    except Exception as e:
        return {"error": f"Failed to extract content: {str(e)}"}

@app.get("/articles/{category}")
async def get_articles_by_category(category: str, current_user: str = Depends(Authentication.get_current_user)):
    """Get articles by category (protected endpoint)."""
    try:
        # articles_collection = get_article_collection()
        
        # Find articles by category, sorted by upload date (newest first)
        articles = list(article_collection.find(
            {"category": category, "uploaded_by": current_user}, {"_id":0}
        ).sort("uploaded_at", -1))
        
        if not articles:
            return {"articles": [], "message": f"No articles found in category: {category}"}
        
        return {
            "uploaded_by": current_user,
            "articles": articles,
            "category": category,
        }
        
    except Exception as e:
        print(f"Error fetching articles by category: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch articles: {str(e)}"
        )

@app.get("/articles")
async def get_all_articles(current_user: str = Depends(Authentication.get_current_user)):
    """Get all articles (protected endpoint)."""
    try:
        
        # Find all articles, sorted by upload date (newest first)
        articles = list(article_collection.find({"uploaded_by": current_user}, {"_id": 0}).sort("uploaded_at", -1))

        # Serialize the articles
        return {
            "articles": articles,
            "count": len(articles)
        }
        
    except Exception as e:
        print(f"Error fetching all articles: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch articles: {str(e)}"
        )


