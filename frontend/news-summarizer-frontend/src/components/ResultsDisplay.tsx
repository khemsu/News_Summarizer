import React from 'react';
import { FileText, Brain, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ResultsDisplayProps {
  summary?: string;
  classification?: string;
  confidence?: number;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  summary,
  classification,
  confidence,
}) => {
  if (!summary && !classification) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-success" />
              Document Summary
              <Badge variant="outline" className="ml-auto">
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground leading-relaxed">{summary}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {classification && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-info" />
              Document Classification
              <Badge variant="outline" className="ml-auto">
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{classification}</h3>
                <p className="text-muted-foreground">Classification result</p>
              </div>
              <Badge className="text-sm px-3 py-1">
                {Math.round((confidence || 0) * 100)}% confidence
              </Badge>
            </div>
            
            {confidence && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Confidence Score</span>
                  <span>{Math.round(confidence * 100)}%</span>
                </div>
                <Progress value={confidence * 100} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};