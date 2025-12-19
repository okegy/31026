import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Loader2, XCircle, Circle } from 'lucide-react';
import { AIProcessingStep } from '@/lib/aiAgent';

interface AIProcessingFlowProps {
  steps: AIProcessingStep[];
  className?: string;
}

export function AIProcessingFlow({ steps, className = '' }: AIProcessingFlowProps) {
  const getStepIcon = (status: AIProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'processing':
        return <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-400" />;
      default:
        return <Circle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStepColor = (status: AIProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-500/50 bg-green-500/10';
      case 'processing':
        return 'border-purple-500/50 bg-purple-500/10 animate-pulse';
      case 'error':
        return 'border-red-500/50 bg-red-500/10';
      default:
        return 'border-gray-700/50 bg-gray-900/20';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {steps.map((step, index) => (
        <Card
          key={step.id}
          className={`transition-all duration-300 ${getStepColor(step.status)} backdrop-blur-xl`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {getStepIcon(step.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-400">
                    Step {index + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-white">
                    {step.name}
                  </h3>
                </div>
                <p className="text-gray-300">{step.description}</p>
                {step.result && (
                  <div className="mt-2 p-2 bg-slate-900/50 rounded text-sm text-gray-400">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(step.result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
