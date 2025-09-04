import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI"))
db = client["News_Summarizer"]
article_collection = db["articles"]

def get_user_collection():
    """Get the User collection for storing user credentials."""
    return db["User"]

def get_article_collection():
    """Get the articles collection for storing news articles."""
    return db["articles"]


