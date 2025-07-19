import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

def get_db():
    client = MongoClient(os.getenv("MONGODB_URI"))
    db = client["News_Summarizer"]
    return db

