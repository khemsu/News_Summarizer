from pydantic import BaseModel
import datetime

class Article(BaseModel):
    filename: str
    content: str
    category: str
    summary: str
    uploaded_at: datetime.datetime 