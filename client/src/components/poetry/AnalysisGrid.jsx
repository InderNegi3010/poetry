import React from 'react';
import { motion } from 'framer-motion';

export default function AnalysisGrid({ analysis, detectedLanguage, hasInvalidLines }) {
  if (!analysis || analysis.length === 0) return null;

  return (
    <div className="space-y-6">
      {analysis.map((lineData, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="space-y-4"
        >
          {/* Line Text */}
          <div className="text-center">
            <p className={`text-lg mb-4 ${lineData.isInvalid ? 'text-red-600' : 'text-gray-700'}`}>
              {lineData.line}
            </p>
          </div>
          
          {/* Analysis Table - only show for valid lines */}
          {!lineData.isInvalid && lineData.sections && lineData.sections.length > 0 && (
            <div className="flex justify-center">
              <table className="border-collapse border border-gray-300 bg-white">
                <tbody>
                  {/* Syllables Row */}
                  <tr>
                    {lineData.sections.map((section, sectionIdx) => (
                      <React.Fragment key={`syllables-${sectionIdx}`}>
                        {section.syllables.map((syllable, syllableIdx) => {
                          const isError = typeof syllable === 'object' && syllable.isError;
                          const syllableText = typeof syllable === 'object' ? syllable.text : syllable;
                          const cellColor = isError ? 'bg-red-200' : section.color;
                          
                          return (
                            <td
                              key={`syl-${sectionIdx}-${syllableIdx}`}
                              className={`border border-gray-300 px-3 py-2 text-center font-medium ${cellColor} min-w-[50px]`}
                            >
                              {syllableText}
                            </td>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tr>
                  
                  {/* Weights Row */}
                  <tr>
                    {lineData.sections.map((section, sectionIdx) => (
                      <React.Fragment key={`weights-${sectionIdx}`}>
                        {section.weights.map((weight, weightIdx) => {
                          const isError = weight === 'x';
                          const cellColor = isError ? 'bg-red-200' : section.color;
                          
                          return (
                            <td
                              key={`weight-${sectionIdx}-${weightIdx}`}
                              className={`border border-gray-300 px-3 py-2 text-center font-bold ${cellColor}`}
                            >
                              {weight}
                            </td>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tr>
                  
                  {/* Pattern Names Row */}
                  <tr>
                    {lineData.sections.map((section, sectionIdx) => {
                      const hasErrorInSection = section.syllables.some(s => 
                        (typeof s === 'object' && s.isError) || section.weights.includes('x')
                      );
                      const cellColor = hasErrorInSection ? 'bg-red-200' : section.color;
                      
                      return (
                        <td
                          key={`pattern-${sectionIdx}`}
                          colSpan={section.syllables.length}
                          className={`border border-gray-300 px-3 py-2 text-center font-semibold text-sm ${cellColor}`}
                        >
                          {section.name}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          
          {/* Error indicator for invalid lines */}
          {lineData.isInvalid && (
            <div className="flex justify-center">
              <div className="bg-red-200 border border-red-400 px-4 py-2 rounded text-red-800 text-sm">
                Invalid characters detected in this line
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}