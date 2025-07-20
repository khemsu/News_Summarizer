import React from 'react'
import { useState } from 'react'
import axios from 'axios';

const Summarize = () => {
    const [documentId, setDocumentId] = useState("");
    const [summary, setSummary] = useState("");

    function handleInputChange(e) {
        setDocumentId(e.target.value);
    }

    async function handleSummarize() {
        if (!documentId) {
            alert("Please enter a document ID to summarize.");
            return;
        }
        try{
            await axios.get(`http://localhost:8000/summarize/?article_id=${documentId}`)
            .then((response) => {
                setSummary(response.data.summary);
                console.log(response.data);
            })
        }catch{
            console.error("Error fetching summary:");
        }
    }

    function handleClearSummary() {
        setSummary("");
        setDocumentId("");
    }

    return (
        <div className="container mx-auto px-6 py-12">
            Summarize
            <input type="text" placeholder="Enter uploaded doucment id" onChange={handleInputChange} className='border border-gray-600'/>
            <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4 cursor-pointer" onClick={handleSummarize}>
                Summarize
            </button>
            <button className="bg-gray-500 text-white px-4 py-2 rounded mt-4 ml-2 cursor-pointer" onClick={handleClearSummary}>
                Clear Summary
            </button>
            {summary && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <h3 className="text-lg font-semibold">Summary:</h3>
                    <p>{summary}</p>
                </div>          
            )}
        </div>

  )
}

export default Summarize