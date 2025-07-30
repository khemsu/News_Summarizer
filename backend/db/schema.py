from pydantic import BaseModel
import datetime

class Article(BaseModel):
    filename: str
    content: str
    category: str
    summary: str
    uploaded_at: datetime.datetime

class User(BaseModel):
    email: str
    username: str
    hashed_password: str
    created_at: datetime.datetime 
