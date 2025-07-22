import React, { useState } from 'react'
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-lg font-['Noto_Sans']">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section with Enhanced Design */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gray-50  rounded-xl flex items-center justify-center shadow-sm transform hover:scale-105 transition-transform duration-200">
                <Link to="/" className="text-white font-bold text-xl">📰</Link>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur opacity-20"></div>
            </div>
            <div className="flex flex-col">
              <Link to="/" className="text-black font-bold text-xl hover:text-gray-700 transition-colors duration-200" style={{color: '#000000'}}>
                News Summarizer
              </Link>
            </div>
          </div>
          
          {/* Desktop Navigation with Enhanced Design */}
          <div className="hidden md:flex items-center space-x-1">
            <div className="flex items-center space-x-1 bg-gray-50 rounded-full p-1 shadow-inner">
              <Link 
                to="/" 
                className="px-4 py-2 rounded-full text-black font-medium transition-all duration-200 hover:bg-white hover:shadow-sm transform hover:scale-105"
                style={{color: '#000000'}}
              >
                Home
              </Link>
              <Link 
                to="/summarize" 
                className="px-4 py-2 rounded-full text-black font-medium transition-all duration-200 hover:bg-white hover:shadow-sm transform hover:scale-105"
                style={{color: '#000000'}}
              >
                Upload
              </Link>
              <Link 
                to="/text-summarize" 
                className="px-4 py-2 rounded-full text-black font-medium transition-all duration-200 hover:bg-white hover:shadow-sm transform hover:scale-105"
                style={{color: '#000000'}}
              >
                Summarize
              </Link>
              <Link 
                to="/contact" 
                className="px-4 py-2 rounded-full text-black font-medium transition-all duration-200 hover:bg-white hover:shadow-sm transform hover:scale-105"
                style={{color: '#000000'}}
              >
                Contact
              </Link>
            </div>
            
            {/* CTA Button with Glass Effect */}
            <div className="ml-6">
              <button className="relative overflow-hidden bg-white/20 backdrop-blur-md border border-white/30 text-black px-6 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:bg-white/30">
                <Link to="/summarize" className="relative z-10">Get Started</Link>
              </button>
            </div>
          </div>

          {/* Mobile menu button with enhanced design */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-black hover:bg-gray-200 focus:outline-none transition-all duration-200 transform hover:scale-105"
              style={{color: '#000000'}}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 animate-fadeIn">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-1 space-y-1">
              <Link 
                to="/" 
                className="flex items-center space-x-3 text-black hover:text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-xl font-medium transition-all duration-200"
                style={{color: '#000000'}}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-sm">🏠</span>
                <span>Home</span>
              </Link>
              <Link 
                to="/upload" 
                className="flex items-center space-x-3 text-black hover:text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-xl font-medium transition-all duration-200"
                style={{color: '#000000'}}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-sm">📤</span>
                <span>Upload</span>
              </Link>
              <Link 
                to="/summarize/text-summarize" 
                className="flex items-center space-x-3 text-black hover:text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-xl font-medium transition-all duration-200"
                style={{color: '#000000'}}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-sm">📋</span>
                <span>Summarize</span>
              </Link>
              <a 
                href="#contact" 
                className="flex items-center space-x-3 text-black hover:text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-xl font-medium transition-all duration-200"
                style={{color: '#000000'}}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-sm">📞</span>
                <span>Contact</span>
              </a>
              
              {/* Mobile CTA Button with Glass Effect */}
              <div className="pt-2 mt-2 border-t border-gray-100">
                <button className="w-full bg-white/20 backdrop-blur-md border border-white/30 text-black px-4 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 transform hover:scale-105 shadow-lg">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar