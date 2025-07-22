# News Summarizer

This project is a news summarizer that uses a machine learning model to summarize articles and classify them into categories. It has a React frontend and a Flask backend.

## Project Structure

- `frontend/`: Contains the React frontend code.
- `backend/`: Contains the Flask backend code, including the machine learning model.

## Getting Started

### Prerequisites

- Python 3.11 or higher
- Node.js and npm

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/news-summarizer.git
   cd news-summarizer
   ```

2. **Backend Setup:**

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Frontend Setup:**

   ```bash
   cd ../frontend/news_summarizer_frontend
   npm install
   ```

### Running the Application

1. **Start the Backend:**

   ```bash
   cd backend
   python app.py
   ```

   The backend will be running at `http://127.0.0.1:5000`.

2. **Start the Frontend:**

   ```bash
   cd ../frontend/news_summarizer_frontend
   npm run dev
   ```

   The frontend will be running at `http://localhost:5173`.

## How It Works

The user can either input a URL to a news article or upload a PDF file. The backend will then:

1.  **Extract the text** from the URL or PDF.
2.  **Summarize the text** using a fine-tuned model.
3.  **Classify the article** into one of the following categories: Business, Entertainment, Politics, Sport, or Tech.
4.  **Return the summary and category** to the frontend to be displayed to the user.
