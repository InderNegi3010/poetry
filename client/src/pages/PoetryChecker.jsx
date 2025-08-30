import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { RefreshCw, AlertCircle, CheckCircle, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "../components/poetry/Sidebar";
import { bahrAPI } from "../services/api";

export default function PoetryChecker() {
  const [poetry, setPoetry] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleAnalyze = async () => {
    if (!poetry.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysis(null);
    setError(null);
    
    try {
      const result = await bahrAPI.checkBahr(poetry.trim());
      setAnalysis(result);
    } catch (err) {
      setError('Failed to analyze poetry. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setPoetry("");
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Poetry Checker</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-4 sm:p-6 border border-gray-200 rounded-lg shadow-sm">
              <Textarea
                className="w-full h-32 sm:h-40 p-3 sm:p-4 border-gray-300 rounded-md text-base sm:text-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="यहाँ अपनी कविता लिखें..."
                value={poetry}
                onChange={(e) => setPoetry(e.target.value)}
              />
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !poetry.trim()}
                  className="px-6 sm:px-8 py-2 bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "CHECK BAHR"
                  )}
                </Button>
                
                {(poetry || analysis) && (
                  <Button
                    variant="outline"
                    onClick={handleClear}
                    className="px-4 sm:px-6 py-2"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 sm:mt-8"
                >
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">{error}</span>
                  </div>
                </motion.div>
              )}

              {analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 sm:mt-8"
                >
                  {/* Show line-by-line format with error highlighting */}
                  {analysis.status === 'error' && analysis.lines ? (
                    // Error case: Show all lines with highlighting for invalid ones
                    <div className="space-y-2">
                      {analysis.lines.map((lineData, lineIndex) => (
                        <div key={lineIndex} className={`p-3 sm:p-4 rounded-lg border flex items-center ${
                          !lineData.valid 
                            ? 'bg-red-100 border-red-300 text-red-800' 
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}>
                          {!lineData.valid && (
                            <div className="mr-3 flex-shrink-0">
                              <AlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                          )}
                          <div className="text-center font-medium text-sm sm:text-base flex-1">
                            {lineData.text}
                          </div>
                        </div>
                      ))}
                      
                      {/* Error message */}
                      {analysis.errorMessage && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                            <span className="text-red-800 font-medium text-sm sm:text-base">
                              👉 {analysis.errorMessage}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Success case: Show Rekhta-style syllable analysis
                    analysis.syllableAnalysis && analysis.syllableAnalysis.map((lineData, lineIndex) => (
                      <div key={lineIndex} className="mb-6">
                        {/* Line text centered */}
                        <div className="text-center mb-4">
                          <div className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                            {lineData.line}
                          </div>
                        </div>

                        {/* Rekhta-style syllable table */}
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <tbody>
                              {/* Syllables row */}
                              <tr>
                                {lineData.syllables && lineData.syllables.map((syllable, syllableIndex) => {
                                  const sectionIndex = Math.floor(syllableIndex / Math.ceil(lineData.syllables.length / (lineData.sections?.length || 1)));
                                  const sectionColors = [
                                    'bg-blue-100 border-blue-200',
                                    'bg-purple-100 border-purple-200', 
                                    'bg-green-100 border-green-200',
                                    'bg-yellow-100 border-yellow-200',
                                    'bg-pink-100 border-pink-200'
                                  ];
                                  const colorClass = sectionColors[sectionIndex % sectionColors.length];
                                  
                                  return (
                                    <td key={syllableIndex} className={`border-2 ${colorClass} text-center p-3 font-medium text-gray-800`}>
                                      {syllable}
                                    </td>
                                  );
                                })}
                              </tr>
                              
                              {/* Weights row */}
                              <tr>
                                {lineData.syllables && lineData.syllables.map((syllable, syllableIndex) => {
                                  const sectionIndex = Math.floor(syllableIndex / Math.ceil(lineData.syllables.length / (lineData.sections?.length || 1)));
                                  const sectionColors = [
                                    'bg-blue-100 border-blue-200',
                                    'bg-purple-100 border-purple-200',
                                    'bg-green-100 border-green-200', 
                                    'bg-yellow-100 border-yellow-200',
                                    'bg-pink-100 border-pink-200'
                                  ];
                                  const colorClass = sectionColors[sectionIndex % sectionColors.length];
                                  const weight = lineData.syllableAnalysis && lineData.syllableAnalysis[syllableIndex] 
                                    ? lineData.syllableAnalysis[syllableIndex].weight 
                                    : '1';
                                  
                                  return (
                                    <td key={syllableIndex} className={`border-2 ${colorClass} text-center p-2 font-bold text-lg text-gray-700`}>
                                      {weight}
                                    </td>
                                  );
                                })}
                              </tr>
                              
                              {/* Section names row */}
                              {lineData.sections && lineData.sections.length > 0 && (
                                <tr>
                                  {lineData.sections.map((section, sectionIndex) => {
                                    const sectionColors = [
                                      'bg-blue-50 border-blue-200',
                                      'bg-purple-50 border-purple-200',
                                      'bg-green-50 border-green-200',
                                      'bg-yellow-50 border-yellow-200', 
                                      'bg-pink-50 border-pink-200'
                                    ];
                                    const colorClass = sectionColors[sectionIndex % sectionColors.length];
                                    
                                    return (
                                      <td key={sectionIndex} 
                                          colSpan={section.syllables.length} 
                                          className={`border-2 ${colorClass} text-center p-2 font-medium text-sm text-gray-600`}>
                                        {section.name}
                                      </td>
                                    );
                                  })}
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {/* Dynamic Success/Error Message */}
                  {analysis.status === 'success' && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-6 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span className="font-semibold text-sm sm:text-base">Great! Your poetry is in Bahr. Keep up the good work!</span>
                    </div>
                  )}
                  
                  {analysis.status === 'error' && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base">Some lines have errors in meter. Check highlighted lines below.</span>
                    </div>
                  )}
                  
                  {/* Dynamic Bahr Information Footer - Rekhta Style */}
                  {analysis.status === 'success' && (
                    <div className="bg-white border border-gray-300 p-4 sm:p-6 text-center space-y-4 rounded-lg mt-4 shadow-sm">
                      <div className="space-y-3">
                        <div className="text-base sm:text-lg font-medium text-gray-800">
                          {analysis.message || "आप की रचना निम्नलिखित बहर में है:"}
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-gray-800">
                          {analysis.bahrType}
                        </div>
                        <div className="text-base sm:text-lg font-medium text-gray-600">
                          {analysis.meterDescription}
                        </div>
                        <div className="space-y-2 mt-4">
                          {analysis.pattern && analysis.pattern.map((pattern, i) => (
                            <div key={i} className="font-mono text-sm sm:text-base text-gray-700 tracking-wider">
                              {pattern}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 right-0 z-50 w-80 bg-white border-l border-gray-200 transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:w-auto lg:flex-shrink-0
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="lg:hidden p-4 border-b border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
              className="p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="overflow-y-auto h-full">
            <Sidebar />
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}