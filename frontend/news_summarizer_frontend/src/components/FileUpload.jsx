import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios';

const FileUpload = () => {

    const [file, setFile] = useState(null);
    const [status, setStatus] = useState(null);
    const [fileDetails, setFileDetails] = useState(null);
    const [copying, setCopying] = useState(false);

    function handleFileChange(e) {
        if (e.target.files){
            setFile(e.target.files[0]);
            setStatus(null); // Reset status when new file is selected
        } 
    }

    async function handleFileUpload(){
        if(!file) {
            alert("Please select a file to upload.");
            return;
        }
        setStatus("Uploading");
        const formData = new FormData();
        formData.append('file', file);

        try{
            await axios.post('http://localhost:8000/analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then((response) => {
                setStatus("Completed");
                setFileDetails(response.data);
                console.log(response.data);
            })
        }catch{
            setStatus("Error")
        };
    }

    async function handleCopyFileId() {
        if (fileDetails?.article_id) {
            setCopying(true);
            try {
                await navigator.clipboard.writeText(fileDetails.article_id);
                setTimeout(() => setCopying(false), 2000); // Reset after 2 seconds
            } catch (err) {
                console.error('Failed to copy text: ', err);
                setCopying(false);
            }
        }
    }

    const getStatusColor = () => {
        switch(status) {
            case "Uploading": return "text-blue-600";
            case "Processing": return "text-yellow-600";
            case "Completed": return "text-green-600";
            case "Error": return "text-red-600";
            default: return "text-black";
        }
    }



  return (
    <div className="min-h-screen bg-white pt-20 font-['Noto_Sans']">
        <div className="max-w-4xl mx-auto px-6 py-12">
            {/* Header Section */}
            <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-black text-black leading-tight mb-4">
                    Upload Documents
                </h1>
                <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
                    Upload your documents to analyze, summarize, and classify them 
                </p>
            </div>

            {/* Upload Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-lg p-8 mb-8">
                <div className="max-w-2xl mx-auto">
                    {/* Upload Area */}
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6 hover:border-gray-400 transition-all duration-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-black mb-2">Choose Document</h3>
                        <p className="text-gray-600 mb-4">Select a PDF or document file to upload</p>
                        
                        <input 
                            type='file' 
                            onChange={handleFileChange} 
                            className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 file:cursor-pointer cursor-pointer"
                            accept=".pdf,.doc,.docx,.txt"
                        />
                    </div>

                    {/* File Info */}
                    {file && (
                        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <span className="text-gray-700 font-bold">📄</span>
                                    </div>
                                    <div>
                                        <p className="text-black font-semibold">{file.name}</p>
                                        <p className="text-gray-600 text-sm">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                </div>
                                {status && (
                                    <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
                                        {status === "Uploading" && (
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                        <span className="font-semibold">{status}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Upload Button */}
                    <button 
                        onClick={handleFileUpload}
                        disabled={!file || status === "Uploading"}
                        className="w-full bg-black/20 backdrop-blur-md border border-gray-300/30 text-black hover:bg-black/30 hover:text-gray-900 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
                    >
                        {status === "Uploading" ? "Uploading..." : "Upload Document"}
                    </button>
                </div>
            </div>

            {/* Success Section */}
            {status === "Completed" && fileDetails && (
                <div className="bg-green-50 border border-green-200 rounded-2xl shadow-lg p-8 animate-fadeIn">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-black mb-2">Upload Successful!</h3>
                        <p className="text-gray-700 mb-6">Your document has been processed and is ready for analysis.</p>
                        
                        {/* File ID Section */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-md mx-auto">
                            <label className="block text-black font-semibold mb-3">Document ID:</label>
                            <div className="flex items-center space-x-3">
                                <input 
                                    type="text" 
                                    value={fileDetails.article_id} 
                                    readOnly 
                                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-black text-center font-mono text-sm focus:outline-none"
                                />
                                <button
                                    onClick={handleCopyFileId}
                                    className="bg-gray-400/20 backdrop-blur-md border border-gray-300/30 text-gray-800 hover:bg-gray-500/30 hover:text-gray-900 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center space-x-2"
                                >
                                    {copying ? (
                                        <>
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-green-600">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <p className="text-gray-600 text-xs mt-2">Save this ID to summarize or classify your document later.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Section */}
            {status === "Error" && (
                <div className="bg-red-50 border border-red-200 rounded-2xl shadow-lg p-8 animate-fadeIn">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-black mb-2">Upload Failed</h3>
                        <p className="text-gray-700">There was an error uploading your document. Please try again.</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  )
}

export default FileUpload