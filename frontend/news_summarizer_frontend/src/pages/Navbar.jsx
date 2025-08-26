import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // close dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm font-['Noto_Sans']">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* LEFT: Logo + Nav Links */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">📰</span>
              </div>
              <span className="text-gray-900 font-bold text-xl">
                News Summarizer
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/summarize" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md font-medium transition-colors duration-200">
                Upload
              </Link>
              <Link to="/text-summarize" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md font-medium transition-colors duration-200">
                Text Summarize
              </Link>
              <Link to="/url-summarizer" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md font-medium transition-colors duration-200">
                URL Summarize
              </Link>
            </div>
          </div>

          {/* RIGHT: User Menu */}
          <div className="flex items-center space-x-4">
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setIsDropdownOpen(prev => !prev)}
                aria-expanded={isDropdownOpen}
                className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors duration-150"
              >
                <div className="w-7 h-7 bg-gray-600 rounded-full flex items-center justify-center text-sm font-semibold text-white">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-gray-800 font-medium text-sm hidden sm:block">
                  {user?.username || 'User'}
                </span>
                <svg className={`w-4 h-4 text-gray-600 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.username || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileOpen(prev => !prev)}
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu content */}
        {isMobileOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="bg-gray-50 rounded-lg p-2 space-y-1">
              <Link 
                to="/" 
                className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-white rounded-md font-medium transition-colors duration-200" 
                onClick={() => setIsMobileOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/summarize" 
                className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-white rounded-md font-medium transition-colors duration-200" 
                onClick={() => setIsMobileOpen(false)}
              >
                Upload
              </Link>
              <Link 
                to="/text-summarize" 
                className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-white rounded-md font-medium transition-colors duration-200" 
                onClick={() => setIsMobileOpen(false)}
              >
                Text Summarize
              </Link>
              <Link 
                to="/url-summarizer" 
                className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-white rounded-md font-medium transition-colors duration-200" 
                onClick={() => setIsMobileOpen(false)}
              >
                URL Summarize
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar