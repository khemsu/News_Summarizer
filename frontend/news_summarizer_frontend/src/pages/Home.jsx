import React from 'react'
import FileUpload from '../components/FileUpload'
import Summarize from '../components/Summarize'
import { Link } from 'react-router-dom'

const Home = () => {
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

        {/* Components sections can be added here */}
        <div className="hidden">
            <FileUpload/>
            <Summarize />
        </div>
    </div>
  )
}

export default Home