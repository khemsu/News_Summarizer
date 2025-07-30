from fastapi import FastAPI, Form, Response, Header, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi import UploadFile, File, Body
from bson.objectid import ObjectId
from typing import Optional, Annotated  
from datetime import datetime, timezone
from db.schema import Article, User
from db.mongo_config import get_user_collection, get_article_collection
from model.sumAndclassification import generate_summary, classify_article, model, extract_text_from_url
from utils.pdf_reader import extract_text_from_pdf
from pydantic import BaseModel
from auth import get_password_hash, verify_password, create_access_token, get_current_user
import os
from dotenv import load_dotenv

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

class Token(BaseModel):
    access_token: str
    token_type: str

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

@app.post("/register", response_model=Token)
async def register(user: UserRegister):
    """Register a new user."""
    try:
        users_collection = get_user_collection()
        print(f"Attempting to register user: {user.username}")
        
        # Check if user already exists
        existing_user = users_collection.find_one({"$or": [{"email": user.email}, {"username": user.username}]})
        if existing_user:
            print(f"User already exists: {existing_user}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email or username already exists"
            )
        
        # Hash the password
        hashed_password = get_password_hash(user.password)
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
        access_token = create_access_token(data={"sub": user.username})
        print(f"Access token created for user: {user.username}")
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    except Exception as e:
        print(f"Error during registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@app.post("/login", response_model=Token)
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
    if not verify_password(user.password, user_doc["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.username})
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/logout")
async def logout():
    """Logout user (client should discard the token)."""
    return {"message": "Successfully logged out"}

@app.get("/me")
async def get_current_user_info(current_user: str = Depends(get_current_user)):
    """Get current user information."""
    try:
        users_collection = get_user_collection()
        print(f"Looking for user: {current_user}")
        user = users_collection.find_one({"username": current_user}, {"hashed_password": 0})
        print(f"Found user: {user}")
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user
    except Exception as e:
        print(f"Error in /me endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving user info: {str(e)}"
        )

# Protected endpoints (require authentication)
@app.post("/analyze/")
async def analyze_article(file: UploadFile = File(...), current_user: str = Depends(get_current_user)):
    """Analyze article (protected endpoint)."""
    content = extract_text_from_pdf(file.file)
    if not content:
        return {"error": "No text found in the PDF file."}
    articles_collection = get_article_collection()
    category = classify_article(content)
    article_data = Article(
        filename=file.filename,
        content=content,
        category=category,
        summary = "",
        uploaded_at=datetime.now(timezone.utc)
    )
    result = articles_collection.insert_one(article_data.dict())
    return {"content": content, "article_id": str(result.inserted_id), "category": category}

@app.get("/summarize/")
async def summarize_article(article_id: Optional[str] = None, current_user: str = Depends(get_current_user)):
    """Summarize article (protected endpoint)."""
    articles_collection = get_article_collection()
    if article_id:
        article = articles_collection.find_one({"_id": ObjectId(article_id)})
    else:
        article = articles_collection.find_one(sort=[("uploaded_at", -1)])
    if not article:
        return {"error": "No article found."}
    content = article["content"]
    summary = generate_summary(content, model, diversity_lambda=0.7)
    category = article.get("category")
    if not category:
        category = classify_article(content)
        articles_collection.update_one({"_id": article["_id"]}, {"$set": {"category": category}})
    return {"summary": summary, "category": category}

@app.post("/text-summarize")
async def summarize_from_text(article_text: Annotated[str, Form()], current_user: str = Depends(get_current_user)):
    """Summarize from text (protected endpoint)."""
    if not article_text:
        return {"error": "No article text provided."}
    summary = generate_summary(article_text, model, diversity_lambda=0.7)
    category = classify_article(article_text)
    return {"summary": summary, "category": category}

class URLRequest(BaseModel):
    url: str

class ArticleIDRequest(BaseModel):
    article_id: str

@app.post("/extract-url-content")
async def extract_url_content(payload: URLRequest, accept: str = Header(None), current_user: str = Depends(get_current_user)):
    """Extract content from URL (protected endpoint)."""
    url = payload.url
    if not url:
        return {"error": "No URL provided."}
    try:
        content = extract_text_from_url(url)
        if not content.strip():
            return {"error": "No content could be extracted from the URL."}
        articles_collection = get_article_collection()
        from db.schema import Article
        article_data = Article(
            filename=url,
            content=content,
            category="",
            summary="",
            uploaded_at=datetime.now(timezone.utc)
        )
        insert_result = articles_collection.insert_one(article_data.dict())
        
        # Return plain text if Accept header requests it
        if accept and "text/plain" in accept:
            return Response(content=content, media_type="text/plain")
        
        # Otherwise return JSON
        return {
            "article_id": str(insert_result.inserted_id),
            "filename": url,
            "content": content,
            "uploaded_at": article_data.uploaded_at.isoformat()
        }
    except Exception as e:
        return {"error": f"Failed to extract content: {str(e)}"}

@app.post("/summarize-url")
async def summarize_url(payload: ArticleIDRequest, current_user: str = Depends(get_current_user)):
    """Summarize URL content (protected endpoint)."""
    article_id = payload.article_id
    if not article_id:
        return {"error": "No article_id provided."}
    try:
        articles_collection = get_article_collection()
        article = articles_collection.find_one({"_id": ObjectId(article_id)})
        if not article:
            return {"error": "No article found for the given article_id. Please extract content first."}
        content = article["content"]
        summary = generate_summary(content, model, diversity_lambda=0.7)
        category = classify_article(content)
        articles_collection.update_one({"_id": article["_id"]}, {"$set": {"summary": summary, "category": category}})
        return {"summary": summary, "category": category}
    except Exception as e:
        return {"error": f"Failed to summarize and classify: {str(e)}"}




