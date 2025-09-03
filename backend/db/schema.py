from pydantic import BaseModel
import datetime
import pdfplumber
import requests
from bs4 import BeautifulSoup
import re

class Article(BaseModel):
    filename: str
    content: str
    uploaded_at: datetime.datetime

    @staticmethod
    def extract_text_from_pdf(file) -> str:
        with pdfplumber.open(file) as pdf:
            text = ''
            for page in pdf.pages:
                text += page.extract_text() + '\n'
        return text
    
    @staticmethod
    def extract_text_from_url(url):
        """Extracts and returns the main text content from a news URL using BeautifulSoup."""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove unwanted elements more aggressively
            unwanted_selectors = [
                "script", "style", "nav", "header", "footer", "aside", "sidebar", 
                "advertisement", "ads", "social", "share", "comment", "related", 
                "recommended", ".navigation", ".menu", ".sidebar", ".widget", 
                ".ad", ".advertisement", ".social", ".share", ".related", 
                ".recommended", ".trending", ".popular", ".latest", ".breaking",
                ".news-list", ".headlines", ".top-stories", ".featured"
            ]
            
            for selector in unwanted_selectors:
                for element in soup.select(selector):
                    element.decompose()
            
            # More specific selectors for news content (prioritized)
            content_selectors = [
                '.article-body',
                '.post-body', 
                '.entry-content',
                '.story-content',
                '.article-content',
                '.content-body',
                '.post-content',
                '.article-text',
                '.story-text',
                '.article-main',
                '.post-main',
                'article .content',
                'article p',
                '.main-content',
                '.content',
                'article',
                'main',
                '.story-body',
                '.article-content p',
                '.post-content p',
                '.entry-content p'
            ]
            
            content = ""
            for selector in content_selectors:
                elements = soup.select(selector)
                if elements:
                    # Get text from all matching elements
                    text_parts = []
                    for elem in elements:
                        text = elem.get_text(strip=True)
                        # Filter out very short text and likely navigation
                        if (len(text) > 100 and 
                            not any(keyword in text.lower() for keyword in 
                                ['share', 'follow', 'like', 'comment', 'related', 'recommended', 'trending', 'breaking', 'latest'])):
                            text_parts.append(text)
                    
                    if text_parts:
                        content = ' '.join(text_parts)
                        if len(content) > 500:  # Ensure we have substantial content
                            break
            
            # If still no substantial content, try paragraph-based extraction with better filtering
            if not content or len(content) < 500:
                paragraphs = soup.find_all('p')
                if paragraphs:
                    text_parts = []
                    for p in paragraphs:
                        text = p.get_text(strip=True)
                        # Only include substantial paragraphs that don't look like navigation
                        if (len(text) > 100 and 
                            not any(keyword in text.lower() for keyword in 
                                ['share', 'follow', 'like', 'comment', 'related', 'recommended', 'trending', 'breaking', 'latest', 'read more', 'click here'])):
                            text_parts.append(text)
                    content = ' '.join(text_parts)
            
            # Final fallback: get all text but filter out very short sections and navigation
            if not content or len(content) < 300:
                all_text = soup.get_text()
                # Split by lines and filter out very short or likely non-content lines
                lines = all_text.split('\n')
                content_lines = []
                for line in lines:
                    line = line.strip()
                    if (len(line) > 100 and 
                        not line.startswith(('©', 'Share', 'Follow', 'Like', 'Comment', 'Related', 'Recommended', 'Trending', 'Breaking', 'Latest')) and
                        not any(keyword in line.lower() for keyword in ['share', 'follow', 'like', 'comment', 'related', 'recommended', 'trending', 'breaking', 'latest', 'read more', 'click here'])):
                        content_lines.append(line)
                content = ' '.join(content_lines)
            
            # Clean up the text
            content = re.sub(r'\s+', ' ', content)  # Replace multiple spaces with single space
            content = re.sub(r'\n+', '\n', content)  # Replace multiple newlines with single newline
            content = re.sub(r'Share.*?Follow', '', content, flags=re.IGNORECASE)  # Remove share/follow text
            content = re.sub(r'Related.*?Recommended', '', content, flags=re.IGNORECASE)  # Remove related/recommended text
            content = re.sub(r'Read more.*?Click here', '', content, flags=re.IGNORECASE)  # Remove read more/click here text
            
            final_content = content.strip()
            
            # Print the extracted content to console
            print("=" * 80)
            print("EXTRACTED CONTENT FROM URL:")
            print("=" * 80)
            print(f"URL: {url}")
            print(f"Content Length: {len(final_content)} characters")
            print("-" * 80)
            print(final_content)
            print("=" * 80)
            
            return final_content
            
        except Exception as e:
            raise Exception(f"Failed to extract content from URL: {str(e)}")


class User(BaseModel):
    email: str
    username: str
    hashed_password: str
    created_at: datetime.datetime 
