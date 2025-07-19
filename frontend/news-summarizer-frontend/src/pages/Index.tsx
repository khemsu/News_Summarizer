import { useState } from 'react';
import FileUpload from '../components/FileUpload.tsx';
import SummarySection from '../components/SummarySection.tsx';

const Index = () => {
  const [articleId, setArticleId] = useState<string>('');
  const [uploadedContent, setUploadedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleUploadSuccess = (id: string, content: string) => {
    setArticleId(id);
    setUploadedContent(content);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📰</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">News Summarizer</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Home</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Features</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Pricing</a>
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Get Started
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">
                Great App that makes
              </h1>
              <span className="text-4xl">✨</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-600 mb-6">
              your life easier
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Meet News Summarizer. The simple, intuitive and powerful app to
              <br />
              analyze your documents. Upload PDFs and get AI-powered summaries
              <br />
              and become a part of community of like-minded users.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Start Using for Free
              </button>
              <button className="text-gray-600 hover:text-gray-900 px-8 py-3 font-semibold transition-colors">
                Explore Features
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FileUpload 
              onUploadSuccess={handleUploadSuccess}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
            <SummarySection 
              articleId={articleId}
              uploadedContent={uploadedContent}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>
        </div>
      </main>

      {/* What is News Summarizer Section */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What is News Summarizer?</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            An AI-powered tool that helps you quickly understand and analyze news articles 
            through intelligent summarization and classification.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2025 News Summarizer AI - Intelligent Document Processing
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
