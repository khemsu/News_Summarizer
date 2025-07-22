import React from 'react'
import { useState } from 'react'
import axios from 'axios';

const Summarize = () => {
    const [documentId, setDocumentId] = useState("");
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);
    const [classification, setClassification] = useState("");

    function handleInputChange(e) {
        setDocumentId(e.target.value);
    }

    async function handleSummarize() {
        if (!documentId) {
            alert("Please enter a document ID to summarize.");
            return;
        }
        setLoading(true);
        try{
            await axios.get(`http://localhost:8000/summarize/?article_id=${documentId}`)
            .then((response) => {
                setSummary(response.data.summary);
                setClassification(response.data.category);
                console.log(response.data);
            })
        }catch{
            console.error("Error fetching summary:");
        } finally {
            setLoading(false);
        }
    }

    function handleClearSummary() {
        setSummary("");
        setDocumentId("");
    }

    return (
        <div className="min-h-screen bg-white font-['Noto_Sans'] pt-20">
            {/* Main Content Container */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-black text-black leading-tight mb-4">
                        Document Summarizer
                    </h1>
                    <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
                        Enter your document ID to get summary of your uploaded content.
                    </p>
                </div>

                {/* Input Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 mb-8">
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="documentId" className="block text-black font-semibold text-lg mb-3">
                                Document ID
                            </label>
                            <input 
                                id="documentId"
                                type="text" 
                                placeholder="Enter uploaded document ID" 
                                value={documentId}
                                onChange={handleInputChange} 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                        
                        {/* Button Section */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                className="flex-1 bg-blue-500/20 backdrop-blur-md border border-blue-300/30 text-blue-800 hover:bg-blue-600/30 hover:text-blue-900 px-6 py-3 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
                                onClick={handleSummarize}
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                                className="flex-1 sm:flex-none bg-gray-400/20 backdrop-blur-md border border-gray-300/30 text-gray-800 hover:bg-gray-500/30 hover:text-gray-900 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl"
                                onClick={handleClearSummary}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Display Section */}
                {summary && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 animate-fadeIn">
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-blue-600 font-bold">📄</span>
                            </div>
                            <h3 className="text-2xl font-bold text-black">Summary</h3>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-4">
                            <p className="text-black leading-relaxed text-lg">{summary}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <h4 className="text-lg font-semibold text-black mb-2">Classification</h4>
                            <p className="text-black leading-relaxed text-lg">{classification}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

  )
}

export default Summarize