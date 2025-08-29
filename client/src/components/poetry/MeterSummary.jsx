import React from 'react';
import { Card, CardContent } from '../ui/card';

export default function MeterSummary({ sections, language, hasErrors }) {
  // Don't show meter summary if there are errors
  if (!sections || sections.length === 0 || hasErrors) return null;

  const patternNames = sections[0]?.map(section => section.name) || [];
  const weightPatterns = sections[0]?.map(section => section.weights.join('')) || [];
  
  const title = language === 'hinglish' 
    ? 'Your composition follows this meter:'
    : 'आप की रचना निम्नलिखित बहर में है:';

  return (
    <Card className="mt-8 bg-white border border-gray-300">
      <CardContent className="p-6 text-center space-y-4">
        <h4 className="font-bold text-gray-800 text-base">
          {title}
        </h4>
        
        <div className="space-y-2">
          <div className="text-base font-semibold">
            {patternNames.join(' ')}
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-4">
          {weightPatterns.map((pattern, i) => (
            <div key={i} className="bg-gray-100 border border-gray-300 px-4 py-2 rounded">
              <div className="font-mono text-sm font-bold">{pattern}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}