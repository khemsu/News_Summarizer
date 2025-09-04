import React, { useState } from 'react'
import FileUpload from '../components/FileUpload'
import Summarize from '../components/Summarize'
import { Link } from 'react-router-dom'
import axios from 'axios'

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setShowResults(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setSearchError('Please login to search articles');
        setIsSearching(false);
        return;
      }

      const response = await axios.get('http://localhost:8000/articles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Filter articles based on filename (heading) and summary containing search query
      const filteredArticles = response.data.articles.filter(article => {
        const filename = article.filename ? article.filename.toLowerCase() : '';
        const summary = article.summary ? article.summary.toLowerCase() : '';
        const searchTerm = searchQuery.toLowerCase();
        
        return filename.includes(searchTerm) || summary.includes(searchTerm);
      });

      setSearchResults(filteredArticles);
    } catch (err) {
      console.error('Search error:', err);
      if (err.response?.status === 401) {
        setSearchError('Your session has expired. Please login again.');
      } else {
        setSearchError('Failed to search articles. Please try again.');
      }
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setSearchError(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const openArticle = (article) => {
    setSelectedArticle(article);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedArticle(null);
  };
  return (
    <div className="min-h-screen bg-white font-['Noto_Sans']">
        {/* Hero Section - Added pt-20 to account for fixed navbar */}
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center pt-20">
            <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-black leading-tight">
                Summarize and Classify News Articles Effortlessly
            </h1>
            
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
                Upload your news articles or documents and get concise summaries and classifications with a unique ID for easy tracking.
            </p>

            {/* Search Bar */}
            <div className="w-full max-w-2xl mx-auto pt-6">
                <form onSubmit={handleSearch} className="relative">
                <div className="flex items-center bg-gray-50 border border-gray-300 rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles by title, filename, or summary content..."
                    className="flex-1 px-6 py-4 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-lg"
                    />
                    <button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-6 py-4 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-semibold rounded-full"
                    >
                    {isSearching ? (
                        <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Searching...
                        </div>
                    ) : (
                        "Search"
                    )}
                    </button>
                    {searchQuery && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="px-4 py-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                        ×
                    </button>
                    )}
                </div>
                </form>
            </div>
            
            <div className="pt-4">
                <Link to="/summarize" className="bg-black hover:bg-gray-800 text-white border border-black px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Get Started
                </Link>
            </div>
            </div>
            
            {/* Decorative shapes - subtle gray versions */}
            <div className="absolute top-32 left-10 w-32 h-32 bg-gray-200 rounded-full blur-sm"></div>
            <div className="absolute bottom-20 right-10 w-48 h-48 bg-gray-300 rounded-full blur-sm"></div>
            <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-gray-100 rounded-full blur-sm"></div>
        </div>

        {/* Search Results Section */}
        {showResults && (
          <div className="bg-gray-50 py-12 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Search Results</h2>
                <p className="text-gray-600">
                  {searchError ? (
                    <span className="text-red-600">{searchError}</span>
                  ) : (
                    `Found ${searchResults.length} article${searchResults.length !== 1 ? 's' : ''} matching "${searchQuery}"`
                  )}
                </p>
              </div>

              {searchError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <div className="text-red-600 text-lg font-medium mb-2">Error</div>
                  <p className="text-red-500">{searchError}</p>
                </div>
              ) : searchResults.length === 0 && !isSearching ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No articles found</h3>
                  <p className="text-gray-500">Try searching with different keywords</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((article, index) => (
                    <div
                      key={article.id || article._id || index}
                      onClick={() => openArticle(article)}
                      className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer hover:scale-102 transform"
                    >
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                          {truncateText(article.filename, 60) || 'Untitled Article'}
                        </h3>
                        {(article.category || article.classification) && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize">
                            {article.category || article.classification}
                          </span>
                        )}
                      </div>

                      {article.summary && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {truncateText(article.summary, 120)}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>By: {article.uploaded_by || 'Unknown'}</span>
                        <span>{formatDate(article.uploaded_at)}</span>
                      </div>

                      {article.filename && article.filename.startsWith('http') && (
                        <a
                          href={article.filename}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Original
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Article Modal */}
        {showModal && selectedArticle && (
          <div className="fixed inset-0 backdrop-blur-2xl flex items-center justify-center z-50 p-4 ">
            <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4 border-2 border-gray-300 shadow-xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex-1 pr-4">
                  {selectedArticle.filename || 'Article Details'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Article Info */}
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>By: {selectedArticle.uploaded_by || 'Unknown'}</span>
                    <span>•</span>
                    <span>{formatDate(selectedArticle.uploaded_at)}</span>
                    {(selectedArticle.category || selectedArticle.classification) && (
                      <>
                        <span>•</span>
                        <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full capitalize">
                          {selectedArticle.category || selectedArticle.classification}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Summary */}
                {selectedArticle.summary && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <p className="text-gray-800 leading-relaxed">{selectedArticle.summary}</p>
                    </div>
                  </div>
                )}

                {/* Full Content */}
                {selectedArticle.content && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Full Article</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-justify">
                        {selectedArticle.content}
                      </p>
                    </div>
                  </div>
                )}

                {/* Source Link */}
                {selectedArticle.filename && selectedArticle.filename.startsWith('http') && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <a
                      href={selectedArticle.filename}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Original Article
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

export default Home