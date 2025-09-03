# News Summarizer

This project is a news summarizer that uses a machine learning model to summarize articles and classify them into categories. It has a React frontend and a Flask backend.

## Project Structure

### Frontend

The frontend is a React application located in the `frontend/news_summarizer_frontend` directory.

-   `public/`: Contains the public assets of the application.
-   `src/`: Contains the source code of the application.
    -   `assets/`: Contains the assets used in the application, such as images and fonts.
    -   `components/`: Contains the reusable components of the application.
        -   `ArticleSummarizer.jsx`: A component that allows the user to input a URL to a news article and view the summary and category.
        -   `Footer.jsx`: The footer of the application.
        -   `Hero.jsx`: The hero section of the application.
        -   `Loader.jsx`: A loader component to be displayed while the application is fetching data.
        -   `Logo.jsx`: The logo of the application.
        -   `PDFSummarizer.jsx`: A component that allows the user to upload a PDF file and view the summary and category.
    -   `pages/`: Contains the pages of the application.
        -   `Home.jsx`: The home page of the application.
        -   `Summarizer.jsx`: The page that contains the article and PDF summarizers.
    -   `App.jsx`: The main component of the application.
    -   `index.css`: The global CSS file of the application.
    -   `main.jsx`: The entry point of the application.
-   `index.html`: The main HTML file of the application.
-   `package.json`: The file that contains the dependencies and scripts of the application.

### Backend

The backend is a Flask application located in the `backend/` directory.

-   `db/`: Contains the database configuration of the application.
    -   `mongo_config.py`: The file that contains the configuration of the MongoDB database.
-   `model/`: Contains the machine learning model of the application.
    -   `calibrated_gb_model.joblib`: The pre-trained model for classifying news articles.
    -   `news_classifier.joblib`: The pre-trained model for classifying news articles.
    -   `sumAndclassification.py`: The file that contains the logic for summarizing and classifying news articles.
    -   `summarizer.py`: The file that contains the logic for summarizing news articles.
    -   `vectorizer.joblib`: The pre-trained model for vectorizing text.
-   `utils/`: Contains the utility functions of the application.
    -   `pdf_reader.py`: The file that contains the logic for reading PDF files.
-   `app.py`: The main file of the backend application.
-   `train.py`: The file that contains the logic for training the machine learning model.

## Getting Started

### Prerequisites

-   Python 3.11 or higher
-   Node.js and npm

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/news-summarizer.git
    cd news-summarizer
    ```

2.  **Backend Setup:**

    ```bash
    cd backend
    pip install -r requirements.txt
    ```

3.  **Frontend Setup:**

    ```bash
    cd ../frontend/news_summarizer_frontend
    npm install
    ```

### Running the Application

1.  **Start the Backend:**

    ```bash
    cd backend
    python app.py
    ```

    The backend will be running at `http://127.0.0.1:5000`.

2.  **Start the Frontend:**

    ```bash
    cd ../frontend/news_summarizer_frontend
    npm run dev
    ```

    The frontend will be running at `http://localhost:5173`.
