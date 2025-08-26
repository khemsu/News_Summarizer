import React from 'react'
import { useState } from 'react'
import axios from 'axios';

const UrlSum = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [articleId, setArticleId] = useState("");
  const [summary, setSummary] = useState("");
  const [classification, setClassification] = useState("");
  const [url, setUrl] = useState("");

  const handleInputChange = (e) => {
    setUrl(e.target.value);
  }

  async function handleSummarize() {
    if (!url.trim()) {
      alert("Please enter a URL to summarize.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/extract-url-content', { url });
      setContent(response.data.content);
      setArticleId(response.data.article_id);
    } catch (error) {
      console.error("Error fetching summary:", error);
      alert("Failed to fetch summary. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setUrl("");
    setContent("");
    setArticleId("");
    setSummary("");
    setClassification("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 font-['Noto_Sans']">
      <div className="max-w-4xl mx-auto px-6 py-20 pt-32">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-black via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight mb-4">
            URL Summarizer
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Paste a URL to summarize the content of the article and get intelligent insights.
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200 shadow-xl p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-gray-800 font-semibold mb-3 text-lg">Enter URL:</label>
              <input
                type="text"
                value={url}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-gray-500/20 focus:border-gray-600 transition-all duration-200 text-lg bg-white backdrop-blur-sm disabled:opacity-50"
                placeholder="https://example.com/article"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSummarize}
                disabled={loading || !url.trim()}
                className="flex-1 bg-blue-500/20 backdrop-blur-md border border-blue-300/30 text-blue-800 hover:bg-blue-600/30 hover:text-blue-900 px-6 py-3 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
              >
                {loading ? "Extracting..." : "Summarize"}
              </button>

              <button 
                onClick={handleClear}
                className="flex-1 sm:flex-none bg-gray-200 text-gray-800 hover:bg-gray-300 hover:text-black px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {content && (
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200 shadow-xl p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                  Extracted Content
                </h2>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <p className="text-gray-800 leading-relaxed">{content}</p>
                </div>
              </div>

              {articleId && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Article ID</h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-gray-700 font-mono text-sm break-all">{articleId}</p>
                  </div>
                </div>
              )}

              {summary && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-700 rounded-full"></span>
                    Summary
                  </h3>
                  <div className="bg-gray-100 rounded-xl p-6 border border-gray-300">
                    <p className="text-gray-800 leading-relaxed">{summary}</p>
                  </div>
                </div>
              )}

              {classification && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-black rounded-full"></span>
                    Classification
                  </h3>
                  <div className="bg-gray-100 rounded-xl p-4 border border-gray-300">
                    <span className="inline-block bg-gray-200 text-gray-900 px-4 py-2 rounded-full font-semibold text-sm border border-gray-400">
                      {classification}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UrlSum