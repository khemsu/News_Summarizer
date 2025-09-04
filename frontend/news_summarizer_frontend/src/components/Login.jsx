import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const { login } = useAuth();
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
      case "username":
        // Check if it's an email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(value)) {
          // Email validation
          const emailParts = value.split('@');
          if (emailParts.length !== 2) {
            return "Please enter a valid email address";
          }
          
          const [localPart, domainPart] = emailParts;
          
          // Check if local part (before @) is only numbers
          if (/^\d+$/.test(localPart)) {
            return "Email cannot have only numbers before @ symbol";
          }
          
          // Check if local part contains at least one letter
          if (!/[a-zA-Z]/.test(localPart)) {
            return "Email must contain at least one letter before @";
          }
          
          // Split domain part to check domain name and extensions
          const domainSections = domainPart.split('.');
          if (domainSections.length < 2) {
            return "Please enter a valid email address";
          }
          
          const domainName = domainSections[0];
          const domainExtensions = domainSections.slice(1);
          
          // Check if domain name (after @ and before first .) is only numbers
          if (/^\d+$/.test(domainName)) {
            return "Email domain cannot be only numbers";
          }
          
          // Check if domain name contains at least one letter
          if (!/[a-zA-Z]/.test(domainName)) {
            return "Email domain must contain at least one letter";
          }
          
          // Check domain extensions - should contain only letters
          for (let ext of domainExtensions) {
            if (!/^[a-zA-Z]+$/.test(ext)) {
              return "Email domain extension must contain only letters";
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
          
          // Comprehensive check: ensure the entire email contains letters
          if (!/[a-zA-Z]/.test(value)) {
            return "Email must contain letters";
          }
          
          return ""; // Valid email
        } else {
          // Username validation
          if (value.length < 3) {
            return "Username must be at least 3 characters long";
          } 
          if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            return "Username can only contain letters, numbers, and underscores";
          }
          // Ensure username contains at least one letter
          if (!/[a-zA-Z]/.test(value)) {
            return "Username must contain at least one letter";
          }
          // Ensure username doesn't start with underscore or number
          if (/^[_0-9]/.test(value)) {
            return "Username must start with a letter";
          }
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
      
      default:
        return "";
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Check if fields are empty
    if (!formData.username.trim()) {
      errors.username = "Username or email is required";
      isValid = false;
    } else {
      const usernameError = validateField("username", formData.username);
      if (usernameError) {
        errors.username = usernameError;
        isValid = false;
      }
    }

    if (!formData.password) {
      errors.password = "Password is required";
      isValid = false;
    } else {
      const passwordError = validateField("password", formData.password);
      if (passwordError) {
        errors.password = passwordError;
        isValid = false;
      }
    }

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

    const result = await login(formData.username, formData.password);
    
    if (result.success) {
      navigate("/"); // Redirect to home page
    } else {
      setError(result.error || "Login failed. Please check your credentials.");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 font-['Noto_Sans'] flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black/10 backdrop-blur-md rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-black via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight mb-2">
            Welcome
          </h1>
          <p className="text-gray-600">Sign in to access your news summarizer</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200 shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Username/Email Field */}
            <div>
              <label htmlFor="username" className="block text-gray-800 font-semibold mb-3 text-lg">
                Username or Email
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
                className={`w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-200 text-lg bg-white backdrop-blur-sm disabled:opacity-50 ${
                  fieldErrors.username 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-300 focus:border-gray-600'
                }`}
                placeholder="Enter your username or email"
                required
              />
              {fieldErrors.username && (
                <div className="mt-2 flex items-center text-red-600 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {fieldErrors.username}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-gray-800 font-semibold mb-3 text-lg">
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
                  className={`w-full p-4 pr-12 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-200 text-lg bg-white backdrop-blur-sm disabled:opacity-50 ${
                    fieldErrors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-300 focus:border-gray-600'
                  }`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <div className="mt-2 flex items-center text-red-600 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {fieldErrors.password}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || Object.keys(fieldErrors).some(key => fieldErrors[key])}
              className="w-full bg-black/20 backdrop-blur-md border border-gray-800/30 text-black hover:bg-black/30 hover:text-gray-900 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800 mr-2"></div>
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                className="text-gray-800 font-semibold hover:text-black transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;