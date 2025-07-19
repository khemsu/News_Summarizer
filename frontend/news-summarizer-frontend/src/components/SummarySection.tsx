import { useState } from 'react';

interface SummarySectionProps {
  articleId: string;
  uploadedContent: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const SummarySection: React.FC<SummarySectionProps> = ({ articleId, uploadedContent, isLoading, setIsLoading }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'classification'>('summary');
  const [summary, setSummary] = useState<string>('');
  const [classification, setClassification] = useState<{ classification: string; confidence: number } | null>(null);
  const [error, setError] = useState<string>('');
  const [manualId, setManualId] = useState<string>('');

  const handleSummarize = async () => {
    const idToUse = articleId || manualId;
    if (!idToUse) {
      setError('Please provide an article ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/summarize/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ article_id: idToUse }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setSummary(data.summary);
      }
    } catch (error) {
      setError('Failed to generate summary. Please try again.');
      console.error('Summary error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassify = async () => {
    const idToUse = articleId || manualId;
    if (!idToUse) {
      setError('Please provide an article ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/classify/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ article_id: idToUse }),
      });

      if (!response.ok) {
        throw new Error('Failed to classify article');
      }

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setClassification(data);
      }
    } catch (error) {
      setError('Failed to classify article. Please try again.');
      console.error('Classification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🤖 AI Analysis
        </h2>
        <p className="text-gray-600">Generate summaries and classify your articles with AI</p>
      </div>

      {!articleId && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Article ID
          </label>
          <input
            type="text"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            placeholder="Enter article ID manually"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {articleId && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 text-sm">
            <span>✅</span>
            <span>Article ID: <strong>{articleId}</strong></span>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'summary'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('summary')}
          >
            📄 Summary
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'classification'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('classification')}
          >
            🏷️ Classification
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 text-sm">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="space-y-6">
          <button
            onClick={handleSummarize}
            disabled={isLoading || (!articleId && !manualId)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Generating Summary...
              </>
            ) : (
              <>
                <span>📝</span>
                Generate Summary
              </>
            )}
          </button>

          {summary && (
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">📄 Article Summary</h3>
              <p className="text-blue-800 leading-relaxed">{summary}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'classification' && (
        <div className="space-y-6">
          <button
            onClick={handleClassify}
            disabled={isLoading || (!articleId && !manualId)}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Classifying Article...
              </>
            ) : (
              <>
                <span>🔍</span>
                Classify Article
              </>
            )}
          </button>

          {classification && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-3">🏷️ Article Classification</h3>
              <div className="space-y-2">
                <p className="text-red-800">
                  <strong>Category:</strong> {classification.classification}
                </p>
                <p className="text-red-800">
                  <strong>Confidence:</strong> {(classification.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-6 bg-gray-50 rounded-xl">
        <h4 className="font-semibold text-gray-900 mb-4">
          💡 Tips
        </h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Use the Summary tab to get a concise overview of your article</li>
          <li>• Use the Classification tab to categorize your article by topic</li>
          <li>• Make sure your article has been analyzed first</li>
        </ul>
      </div>
    </div>
  );
};

export default SummarySection;