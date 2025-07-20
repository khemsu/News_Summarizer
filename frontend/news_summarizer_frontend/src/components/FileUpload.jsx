import React, { use } from 'react'
import { useState, useEffect } from 'react'
import upload from '../assets/upload.svg'; // Adjust the path as needed
import axios from 'axios';

const FileUpload = () => {

    const [file, setFile] = useState(null);
    const [status, setStatus] = useState(["Uploading", "Processing", "Completed"]);
    const [fileDetails, setFileDetails] = useState(null);

    function handleFileChange(e) {
        if (e.target.files){
            setFile(e.target.files[0]);
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



  return (
    <main className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md border-2 border-dashed border-gray-300">
            <img src={upload} className="h-14 w-14 mx-auto mb-4" alt="React logo" />
            <h2 className="text-2xl font-bold mb-4">Upload Document</h2>
            <p className="text-gray-600 mb-4">Select a document to upload and summarize.</p>
            <input type='file' onChange={handleFileChange} className="mb-4 cursor-pointer bg-red-300" />
            {file && (
                <div className="text-gray-700 mb-4">
                    <p>File size: {(file.size / 1024).toFixed(2)} KB</p>
                </div>
            )}
            {status === "Completed" && (
             <>
             <div className="text-green-600 mb-4">
                    File uploaded successfully!
                </div>
                <div className="text-red-600 mb-4">
                    File id: {fileDetails.article_id}
                </div>
                </>
            )
            }
        </div>
        <button onClick = {handleFileUpload} className = "rounded-md  bg-[#EAC8A6] p-2.5 text-xl hover:bg-amber-400 cursor-pointer">Upload</button>


    </main>
  )
}

export default FileUpload