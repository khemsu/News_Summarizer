import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()


#my code
def get_db():
    client = MongoClient(os.getenv("MONGODB_URI"))
    db = client["News_Summarizer"]
    # db = client[os.getenv("MONGODB_DB_NAME")]
    return db



#bips
# def get_db():
#     client = MongoClient(os.getenv("MONGODB_URI"))
#     return db

