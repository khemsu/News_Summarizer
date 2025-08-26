import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios';

const Summarize = ({ prefillDocumentId = "" }) => {
    const [documentId, setDocumentId] = useState("");
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);
    const [classification, setClassification] = useState("");

    useEffect(() => {
        if (prefillDocumentId) {
            setDocumentId(prefillDocumentId);
            // optionally auto-run summary when a new id arrives
            // handleSummarize(); // uncomment if you want auto-run
        }
    }, [prefillDocumentId]);

    function handleInputChange(e) {
        setDocumentId(e.target.value);
    }

    async function handleSummarize() {
        if (!documentId.trim()) {
            alert("Please enter a document ID to summarize.");
            return;
        }
        
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/summarize/?article_id=${documentId}`);
            setSummary(response.data.summary);
            setClassification(response.data.category);
            console.log(response.data);
        } catch (error) {
            console.error("Error fetching summary:", error);
            console.error("Error details:", error.response?.data);
            alert("Failed to fetch summary. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function handleClearSummary() {
        setDocumentId("");
        setSummary("");
        setClassification("");
    }

    return (
        <div className="min-h-screen bg-white font-['Noto_Sans'] pt-4">
            {/* Main Content Container */}
            <div className="max-w-4xl mx-auto px-6 py-6">
                {/* Header Section */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-black text-black leading-tight mb-2">
                        Document Summarizer
                    </h1>
                    <p className="text-sm md:text-base text-gray-700 max-w-2xl mx-auto leading-relaxed">
                        Enter a document ID to get summary and classification of previously uploaded articles.
                    </p>
                </div>

                {/* Input Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 mb-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="documentIdInput" className="block text-black font-semibold text-sm mb-2">
                                Document ID
                            </label>
                            <input
                                id="documentIdInput"
                                type="text"
                                value={documentId}
                                onChange={handleInputChange}
                                placeholder="Enter document ID (e.g., 507f1f77bcf86cd799439011)"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                        
                        {/* Button Section */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button 
                                className="flex-1 bg-blue-500/20 backdrop-blur-md border border-blue-300/30 text-blue-800 hover:bg-blue-600/30 hover:text-blue-900 px-4 py-2 rounded-xl font-bold text-base transition-all duration-200 transform hover:scale-105 hover:-translate-y-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleSummarize}
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Summarizing...
                                    </div>
                                ) : (
                                    "Generate Summary"
                                )}
                            </button>
                            <button 
                                className="flex-1 sm:flex-none bg-gray-100 border border-gray-200 text-gray-800 hover:bg-gray-200 px-4 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 hover:-translate-y-1 shadow-sm"
                                onClick={handleClearSummary}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Display Section */}
                {summary && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 animate-fadeIn">
                        <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-blue-600 font-bold">📄</span>
                            </div>
                            <h3 className="text-xl font-bold text-black">Summary</h3>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
                            <p className="text-black leading-relaxed text-base text-justify">{summary}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <h4 className="text-lg font-semibold text-black mb-2">Classification</h4>
                            <p className="text-black leading-relaxed text-base">{classification}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Summarize