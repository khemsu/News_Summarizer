import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Signup from './components/Signup';
import Navbar from './pages/Navbar';
import Home from './pages/Home';
import UrlSum from './components/UrlSum';
import Summarize from './components/Summarize';
import TextSummarize from './components/TextSummarize';
import FileUpload from './components/FileUpload';
import NewsPortal from './components/NewsPortal';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Navbar />
                <Home />
              </ProtectedRoute>
            } />
            
            <Route path="/url-summarizer" element={
              <ProtectedRoute>
                <Navbar />
                <UrlSum />
              </ProtectedRoute>
            } />
            
            <Route path="/summarize" element={
              <ProtectedRoute>
                <Navbar />
                <FileUpload />
                <Summarize />
              </ProtectedRoute>
            } />
            
            <Route path="/text-summarize" element={
              <ProtectedRoute>
                <Navbar />
                <TextSummarize />
              </ProtectedRoute>
            } />

            <Route path="/news-portal" element={
              <ProtectedRoute>
                <Navbar />
                <NewsPortal />
              </ProtectedRoute>
            } />

            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
