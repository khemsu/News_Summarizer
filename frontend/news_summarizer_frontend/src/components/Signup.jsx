import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError("");
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case "email":
        // Check for exactly one @ symbol
        const atCount = (value.match(/@/g) || []).length;
        if (atCount === 0) {
          return "Email must contain @ symbol";
        }
        if (atCount > 1) {
          return "Email must contain only one @ symbol";
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return "Please enter a valid email address";
        }

        // More strict regex to ensure valid email characters only
        const strictEmailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!strictEmailRegex.test(value)) {
          return "Email contains invalid characters";
        }

        // Extract parts of the email
        const emailParts = value.split('@');
        if (emailParts.length !== 2) {
          return "Please enter a valid email address";
        }
        
        const [localPart, domainPart] = emailParts;
        
        // Check if email starts with a letter
        if (!/^[a-zA-Z]/.test(localPart)) {
          return "Email must start with a letter";
        }
        
        // Check if local part is empty or contains only allowed characters
        if (!localPart || !/^[a-zA-Z0-9._-]+$/.test(localPart)) {
          return "Email local part contains invalid characters";
        }

        // Check if local part (before @) contains only numbers
        if (/^\d+$/.test(localPart)) {
          return "Email cannot have only numbers before @ symbol";
        }

        // Ensure local part contains at least one letter
        if (!/[a-zA-Z]/.test(localPart)) {
          return "Email must contain at least one letter before @";
        }
        
        // Check if domain part is empty or contains valid characters
        if (!domainPart || !/^[a-zA-Z0-9.-]+$/.test(domainPart)) {
          return "Email domain contains invalid characters";
        }
        
        // Split domain part to check domain name and extensions
        const domainSections = domainPart.split('.');
        if (domainSections.length < 2) {
          return "Email must have a valid domain extension";
        }
        
        const domainName = domainSections[0];
        const domainExtensions = domainSections.slice(1);

        // Check if domain name is empty
        if (!domainName) {
          return "Email domain name cannot be empty";
        }

        // Check if domain name contains only numbers
        if (/^\d+$/.test(domainName)) {
          return "Email domain cannot be only numbers";
        }

        // Ensure domain name contains at least one letter
        if (!/[a-zA-Z]/.test(domainName)) {
          return "Email domain must contain at least one letter";
        }

        // Check domain extensions (com, org, etc.) - should contain only letters and be at least 2 chars
        for (let ext of domainExtensions) {
          if (!ext || ext.length < 2) {
            return "Domain extension must be at least 2 characters";
          }
          if (!/^[a-zA-Z]+$/.test(ext)) {
            return "Domain extension must contain only letters";
          }
        }
        
        // Additional validation: ensure local part doesn't start or end with special characters
        if (/^[._-]|[._-]$/.test(localPart)) {
          return "Email cannot start or end with special characters";
        }

        // Ensure no consecutive special characters in local part
        if (/[._-]{2,}/.test(localPart)) {
          return "Email cannot have consecutive special characters";
        }

        // Check for invalid symbols (only allow letters, numbers, dots, hyphens, underscores, and one @)
        if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/.test(value)) {
          return "Email contains invalid symbols";
        }
        
        // Comprehensive check: ensure the entire email contains letters
        if (!/[a-zA-Z]/.test(value)) {
          return "Email must contain letters";
        }

        return "";
      
      case "username":
        if (value.length < 3) {
          return "Username must be at least 3 characters long";
        }
        if (value.length > 20) {
          return "Username must be less than 20 characters";
        }
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          return "Username can only contain letters, numbers, and underscores";
        }
        // Ensure username starts with a letter
        if (!/^[a-zA-Z]/.test(value)) {
          return "Username must start with a letter";
        }
        // Ensure username contains at least one letter
        if (!/[a-zA-Z]/.test(value)) {
          return "Username must contain at least one letter";
        }
        return "";
      
      case "password":
        if (value.length < 6) {
          return "Password must be at least 6 characters long";
        }
        if (!/(?=.*[a-z])/.test(value)) {
          return "Password must contain at least one lowercase letter";
        }
        if (!/(?=.*[A-Z])/.test(value)) {
          return "Password must contain at least one uppercase letter";
        }
        if (!/(?=.*\d)/.test(value)) {
          return "Password must contain at least one number";
        }
        return "";
      
      case "confirmPassword":
        if (value !== formData.password) {
          return "Passwords do not match";
        }
        return "";
      
      default:
        return "";
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Check if fields are empty
    Object.keys(formData).forEach(field => {
      if (!formData[field].trim()) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        isValid = false;
      } else {
        const fieldError = validateField(field, formData[field]);
        if (fieldError) {
          errors[field] = fieldError;
          isValid = false;
        }
      }
    });

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    const result = await register(formData.email, formData.username, formData.password);
    
    if (result.success) {
      setShowSuccess(true);
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  // Real-time validation on blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (value.trim()) {
      const error = validateField(name, value);
      setFieldErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  // Success message component
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 font-['Noto_Sans'] flex items-center justify-center px-6 py-8">
        <div className="max-w-sm w-full">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200 shadow-xl p-8 text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* Success Message */}
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Created!</h2>
            <p className="text-gray-600 mb-4">
              Your account has been successfully created. You will be redirected to the login page shortly.
            </p>
            
            {/* Loading indicator */}
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              <span className="text-gray-600 text-sm">Redirecting...</span>
            </div>
            
            {/* Manual redirect link */}
            <div className="mt-4">
              <Link 
                to="/login" 
                className="text-gray-800 font-semibold hover:text-black transition-colors text-sm underline"
              >
                Click here if not redirected automatically
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 font-['Noto_Sans'] flex items-center justify-center px-6 py-8">
      <div className="max-w-sm w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-black/10 backdrop-blur-md rounded-full mb-3">
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-black via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight mb-1">
            Create Account
          </h1>
          <p className="text-gray-600 text-sm">Join us to access the news summarizer</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200 shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-gray-800 font-medium mb-2 text-sm">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
                className={`w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all duration-200 text-sm bg-white backdrop-blur-sm disabled:opacity-50 ${
                  fieldErrors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-300 focus:border-gray-600'
                }`}
                placeholder="Enter your email (user@example.com)"
                required
              />
              {fieldErrors.email && (
                <div className="mt-1 flex items-center text-red-600 text-xs">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {fieldErrors.email}
                </div>
              )}
              {/* Email validation help */}
              {formData.email && !fieldErrors.email && (
                <div className="mt-1 text-green-600 text-xs flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Valid email format
                </div>
              )}
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-gray-800 font-medium mb-2 text-sm">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
                className={`w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all duration-200 text-sm bg-white backdrop-blur-sm disabled:opacity-50 ${
                  fieldErrors.username 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-300 focus:border-gray-600'
                }`}
                placeholder="Choose a username (must start with letter)"
                required
              />
              {fieldErrors.username && (
                <div className="mt-1 flex items-center text-red-600 text-xs">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {fieldErrors.username}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-gray-800 font-medium mb-2 text-sm">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                  className={`w-full p-3 pr-10 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all duration-200 text-sm bg-white backdrop-blur-sm disabled:opacity-50 ${
                    fieldErrors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-300 focus:border-gray-600'
                  }`}
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
              {fieldErrors.password && (
                <div className="mt-1 flex items-center text-red-600 text-xs">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {fieldErrors.password}
                </div>
              )}
            </div>

            {/* Password Requirements */}
            {formData.password && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-xs font-medium mb-2">Password Requirements:</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="flex items-center">
                    <svg className={`w-3 h-3 mr-1 ${formData.password.length >= 6 ? 'text-green-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={formData.password.length >= 6 ? 'text-green-700' : 'text-gray-600'}>6+ chars</span>
                  </div>
                  <div className="flex items-center">
                    <svg className={`w-3 h-3 mr-1 ${/(?=.*[a-z])/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={/(?=.*[a-z])/.test(formData.password) ? 'text-green-700' : 'text-gray-600'}>Lowercase</span>
                  </div>
                  <div className="flex items-center">
                    <svg className={`w-3 h-3 mr-1 ${/(?=.*[A-Z])/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={/(?=.*[A-Z])/.test(formData.password) ? 'text-green-700' : 'text-gray-600'}>Uppercase</span>
                  </div>
                  <div className="flex items-center">
                    <svg className={`w-3 h-3 mr-1 ${/(?=.*\d)/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={/(?=.*\d)/.test(formData.password) ? 'text-green-700' : 'text-gray-600'}>Number</span>
                  </div>
                </div>
              </div>
            )}

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-800 font-medium mb-2 text-sm">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                  className={`w-full p-3 pr-10 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all duration-200 text-sm bg-white backdrop-blur-sm disabled:opacity-50 ${
                    fieldErrors.confirmPassword 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-300 focus:border-gray-600'
                  }`}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showConfirmPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <div className="mt-1 flex items-center text-red-600 text-xs">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {fieldErrors.confirmPassword}
                </div>
              )}
              {formData.confirmPassword && formData.password && formData.confirmPassword === formData.password && (
                <div className="mt-1 flex items-center text-green-600 text-xs">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Passwords match
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || Object.keys(fieldErrors).some(key => fieldErrors[key])}
              className="w-full bg-black/20 backdrop-blur-md border border-gray-800/30 text-black hover:bg-black/30 hover:text-gray-900 px-6 py-3 rounded-lg font-bold text-sm transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800 mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-4 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="text-gray-800 font-semibold hover:text-black transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;