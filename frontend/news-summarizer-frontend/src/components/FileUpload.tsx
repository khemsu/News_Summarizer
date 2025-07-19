import type { FC } from 'react'
import { useState, useRef } from 'react'

interface FileUploadProps {
  onUploadSuccess: (articleId: string, content: string) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const FileUpload: FC<FileUploadProps> = ({ onUploadSuccess, isLoading, setIsLoading }) => {
  const [dragActive, setDragActive] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [error, setError] = useState<string>('')
  const [isUploaded, setIsUploaded] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file only')
      return
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB')
      return
    }
    
    setSelectedFile(file)
    setError('')
    setIsUploaded(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const uploadFile = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    setUploadProgress(30)
    setError('')

    try {
      // Simulate upload progress
      setTimeout(() => setUploadProgress(60), 500)
      
      setIsUploaded(true)
      setUploadProgress(100)
      
      // Show success message but don't call analyze yet
      setTimeout(() => {
        setUploadProgress(0)
      }, 2000)

    } catch (error) {
      setError('Failed to upload file. Please try again.')
      console.error('Upload error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeFile = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('http://localhost:8000/analyze/', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        onUploadSuccess(data.article_id, data.content)
        // Reset the form after successful analysis
        setSelectedFile(null)
        setIsUploaded(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (error) {
      setError('Failed to analyze file. Please try again.')
      console.error('Analysis error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📄 Upload Document
        </h2>
        <p className="text-gray-600">Upload your PDF article and then analyze it to extract content</p>
      </div>

      <div 
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
          ${dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : selectedFile 
              ? 'border-green-400 bg-green-50' 
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {selectedFile ? (
          <div className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 text-xl">📄</span>
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 text-sm">{selectedFile.name}</h3>
              <p className="text-gray-500 text-xs">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              {isUploaded && (
                <p className="text-green-600 text-xs font-medium mt-1">✅ File uploaded successfully</p>
              )}
            </div>
            <button 
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-colors text-sm"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedFile(null)
                setIsUploaded(false)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="py-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">📁</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Drop your PDF here or click to browse</h3>
            <p className="text-gray-500 text-sm">Supports PDF files up to 10MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 text-sm">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {selectedFile && (
        <div className="mt-6 space-y-3">
          {!isUploaded ? (
            <button 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              onClick={uploadFile}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <span>📤</span>
                  Upload File
                </>
              )}
            </button>
          ) : (
            <button 
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              onClick={analyzeFile}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <span>🔍</span>
                  Analyze Content
                </>
              )}
            </button>
          )}
        </div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      <div className="mt-8 p-6 bg-gray-50 rounded-xl">
        <h4 className="font-semibold text-gray-900 mb-4">
          📋 How it works
        </h4>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 text-sm text-gray-600">
            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-blue-600 text-xs">1</span>
            </div>
            <span><strong>Upload:</strong> Select and upload your PDF file</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-gray-600">
            <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-red-600 text-xs">2</span>
            </div>
            <span><strong>Analyze:</strong> Extract and process PDF content</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-gray-600">
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-green-600 text-xs">3</span>
            </div>
            <span><strong>Summarize:</strong> Generate AI-powered summaries and classifications</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default FileUpload