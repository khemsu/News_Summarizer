import React from 'react'
import { useState } from 'react'
import axios from 'axios';

const TextSummarize = () => {
    const [text, setText] = useState("");
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);
    const [classification, setClassification] = useState("");

    const handleInputChange = (e) => {
        setText(e.target.value);
    }

    function handleClear() {
        setText("");
        setSummary("");
        setClassification("");
    }

    async function handleSummarize() {
        if (!text.trim()) {
            alert("Please enter some text to summarize.");
            return;
        }
        
        setLoading(true);
        const formData = new FormData();
        formData.append("article_text", text);
        
        try {
            await axios.post('http://localhost:8000/text-summarize',
                formData,{
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            ).then((response) => {
            setSummary(response.data.summary);
            setClassification(response.data.category);
            console.log(response.data);
            })
        } catch (error) {
            console.error("Error fetching summary:", error);
            console.error("Error details:", error.response?.data);
            alert("Failed to fetch summary. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-white font-['Noto_Sans'] pt-20">
            {/* Main Content Container */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-black text-black leading-tight mb-4">
                        Text Summarizer
                    </h1>
                    <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
                        Enter or paste your text to get summary and classification of the news article of your choice.
                    </p>
                </div>

                {/* Input Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 mb-8">
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="textInput" className="block text-black font-semibold text-lg mb-3">
                                Article Text
                            </label>
                            <textarea
                                id="textInput"
                                value={text}
                                onChange={handleInputChange}
                                placeholder="Type or paste your article text here..."
                                rows={8}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical min-h-[200px]"
                            />
                        </div>
                        
                        {/* Button Section */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                className="flex-1 bg-blue-500/20 backdrop-blur-md border border-blue-300/30 text-blue-800 hover:bg-blue-600/30 hover:text-blue-900 px-6 py-3 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 cursor-pointer"
                                onClick={handleSummarize}
                                disabled={loading || !text.trim()}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Analyzing...
                                    </div>
                                ) : (
                                    "Summarize Text"
                                )}
                            </button>
                            <button 
                                className="flex-1 sm:flex-none bg-gray-400/20 backdrop-blur-md border border-gray-300/30 text-gray-800 hover:bg-gray-500/30 hover:text-gray-900 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl cursor-pointer"
                                onClick={handleClear}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Display Section */}
                {(summary || classification) && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 animate-fadeIn">
                        <div className="flex items-center mb-6">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-green-600 font-bold">✨</span>
                            </div>
                            <h3 className="text-2xl font-bold text-black">Analysis Results</h3>
                        </div>
                        
                        {summary && (
                            <div className="mb-6">
                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                    <h4 className="text-lg font-semibold text-black mb-3 flex items-center">
                                        <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-xs">📄</span>
                                        Summary
                                    </h4>
                                    <p className="text-black leading-relaxed text-lg">{summary}</p>
                                </div>
                            </div>
                        )}
                        
                        {classification && (
                            <div>
                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                    <h4 className="text-lg font-semibold text-black mb-3 flex items-center">
                                        <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mr-2 text-xs">🏷️</span>
                                        Classification
                                    </h4>
                                    <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {classification}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default TextSummarize