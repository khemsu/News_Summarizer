import React, { useState } from 'react';
import axios from 'axios';

const NewsPortal = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const categories = [
    { name: 'politics', label: 'Politics', icon: '🏛️' },
    { name: 'sport', label: 'Sports', icon: '⚽' },
    { name: 'finance', label: 'Finance', icon: '💰' },
    { name: 'business', label: 'Business', icon: '🏢' },
    { name: 'entertainment', label: 'Entertainment', icon: '🎬' }
  ];

  const fetchArticlesByCategory = async (category) => {
    setLoading(true);
    setError(null);
    setSelectedCategory(category);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view articles');
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:8000/articles/${category}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setArticles(response.data.articles || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
      
      if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
        // Clear invalid token
        localStorage.removeItem('token');
      } else {
        const errorMessage = err.response?.data?.detail || 
                           err.response?.data?.error || 
                           err.message || 
                           `Failed to fetch ${category} articles`;
        setError(errorMessage);
      }
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">News Portal</h1>
          <p className="text-lg text-gray-600">Discover articles by category</p>
        </div>

        {/* Category Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => fetchArticlesByCategory(category.name)}
              className={`p-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${
                selectedCategory === category.name
                  ? 'bg-gray-900 text-white shadow-xl'
                  : 'bg-white text-gray-800 hover:bg-indigo-50 hover:shadow-xl'
              }`}
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <div>{category.label}</div>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading articles...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-lg font-medium mb-2">Error</div>
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Articles Display */}
        {selectedCategory && !loading && !error && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <span className="text-2xl mr-3">
                {categories.find(cat => cat.name === selectedCategory)?.icon}
              </span>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {categories.find(cat => cat.name === selectedCategory)?.label} Articles
              </h2>
              <span className="ml-auto text-sm text-gray-500">
                {articles.length} article{articles.length !== 1 ? 's' : ''}
              </span>
            </div>

            {articles.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-500">There are no articles in this category yet.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article, index) => (
                  <div
                    key={article.id || article._id || index}
                    onClick={() => openArticle(article)}
                    className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200 cursor-pointer hover:shadow-lg transform hover:scale-102"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {article.filename || 'Untitled Article'}
                      </h3>
                    </div>

                    {article.summary && (
                      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                        {truncateText(article.summary)}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>By: {article.uploaded_by || 'Unknown'}</span>
                      <span>{formatDate(article.uploaded_at)}</span>
                    </div>

                    {(article.category || article.classification) && (
                      <div className="mt-3">
                        <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full capitalize">
                          {article.category || article.classification}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!selectedCategory && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">📰</div>
            <h3 className="text-2xl font-medium text-gray-900 mb-4">Welcome to News Portal</h3>
            <p className="text-gray-600 text-lg mb-8">Click on any category above to explore articles</p>
          </div>
        )}

        {/* Article Modal */}
        {showModal && selectedArticle && (
          <div className="fixed inset-0 backdrop-blur-2xl flex items-center justify-center z-50 p-4">
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
    </div>
  );
};

export default NewsPortal;