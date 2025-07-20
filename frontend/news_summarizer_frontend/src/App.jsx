import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import NavBar from './components/NavBar'
import FileUpload from './components/FileUpload'

function App() {

  return (
    <>
    <NavBar />
    <div className="min-h-screen bg-background">
      {/* <Header /> */}
      
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-primary-glow bg-clip-text text-transparent">
            AI-Powered Document Processing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your documents and let AI analyze, summarize, and classify them with cutting-edge machine learning.
          </p>
        </div>

        {/* <UploadArea
          onFileUpload={handleFileUpload}
          onSummarize={handleSummarize}
          onClassify={handleClassify}
        /> */}
        <FileUpload/>
      </main>
    </div>


    </>
  )
}

export default App
