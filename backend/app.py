from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from utils.pdf_reader import extract_text_from_pdf
from fastapi import UploadFile, File

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
    # summary = summarize(content)

    # prediction = classifier.predict([content])[0]

    # record = {
    #     "filename": file.filename,
    #     "summary": summary,
    #     "category": prediction
    # }
    # collection.insert_one(record)

    return {"content": content}  # Return the extracted text for now

