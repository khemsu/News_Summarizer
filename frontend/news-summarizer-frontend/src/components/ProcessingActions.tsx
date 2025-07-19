import React, { useState } from 'react';
import { FileText, Brain, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProcessingActionsProps {
  fileContent: string;
  filename: string;
  onSummaryGenerated: (summary: string) => void;
  onClassificationGenerated: (classification: string, confidence: number) => void;
}

export const ProcessingActions: React.FC<ProcessingActionsProps> = ({
  fileContent,
  filename,
  onSummaryGenerated,
  onClassificationGenerated,
}) => {
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);

  const generateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simple text summarization (in a real app, you'd use an AI service)
      const sentences = fileContent.split(/[.!?]+/).filter(s => s.trim().length > 10);
      const keyPoints = sentences.slice(0, Math.min(5, Math.ceil(sentences.length * 0.3)));
      const summary = keyPoints.join('. ') + '.';
      
      onSummaryGenerated(summary);
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const classifyDocument = async () => {
    setIsClassifying(true);
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simple classification based on keywords (in a real app, you'd use an AI service)
      const content = fileContent.toLowerCase();
      let classification = 'General Document';
      let confidence = 0.75;
      
      if (content.includes('contract') || content.includes('agreement') || content.includes('terms')) {
        classification = 'Legal Document';
        confidence = 0.92;
      } else if (content.includes('research') || content.includes('study') || content.includes('analysis')) {
        classification = 'Research Paper';
        confidence = 0.88;
      } else if (content.includes('report') || content.includes('summary') || content.includes('findings')) {
        classification = 'Business Report';
        confidence = 0.85;
      } else if (content.includes('technical') || content.includes('specification') || content.includes('documentation')) {
        classification = 'Technical Documentation';
        confidence = 0.90;
      }
      
      onClassificationGenerated(classification, confidence);
    } catch (error) {
      console.error('Error classifying document:', error);
    } finally {
      setIsClassifying(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Document Processing
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{filename}</Badge>
          <Badge variant="outline">{fileContent.length} characters</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={generateSummary}
            disabled={isGeneratingSummary || isClassifying}
            className="h-20 flex-col gap-2"
            size="lg"
          >
            {isGeneratingSummary ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <FileText className="h-6 w-6" />
            )}
            <span>{isGeneratingSummary ? 'Generating...' : 'Generate Summary'}</span>
          </Button>

          <Button
            onClick={classifyDocument}
            disabled={isGeneratingSummary || isClassifying}
            variant="secondary"
            className="h-20 flex-col gap-2"
            size="lg"
          >
            {isClassifying ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Brain className="h-6 w-6" />
            )}
            <span>{isClassifying ? 'Classifying...' : 'Classify Document'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};