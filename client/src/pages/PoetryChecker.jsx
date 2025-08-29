import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "../components/poetry/Sidebar";
import { bahrAPI } from "../services/api";

export default function PoetryChecker() {
  const [poetry, setPoetry] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

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
    <div className="grid lg:grid-cols-[1fr_auto] gap-8">
      <div className="flex-grow">
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <Textarea
            className="w-full h-40 p-4 border-gray-300 rounded-md text-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="यहाँ अपनी कविता लिखें..."
            value={poetry}
            onChange={(e) => setPoetry(e.target.value)}
          />
          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !poetry.trim()}
              className="px-8 py-2 bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:bg-gray-400"
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
                className="px-6 py-2"
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
              className="mt-8"
            >
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">{error}</span>
              </div>
            </motion.div>
          )}

          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              {/* Show full poem with line-by-line highlighting for errors */}
              {analysis.status === 'error' && analysis.errorLines && analysis.errorLines.length > 0 ? (
                // Error case: Show full poem with highlighted error lines
                <div className="space-y-2">
                  {analysis.syllableAnalysis.map((lineData, lineIndex) => (
                    <div key={lineIndex} className={`p-4 rounded-lg border ${
                      lineData.hasErrors 
                        ? 'bg-red-100 border-red-300 text-red-800' 
                        : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}>
                      <div className="text-center font-medium">
                        {lineData.line}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Success case: Show detailed syllable analysis
                analysis.syllableAnalysis && analysis.syllableAnalysis.map((lineData, lineIndex) => (
                  <div key={lineIndex} className="border p-6 mb-4 rounded-lg bg-white border-gray-300">
                    <div className="text-center mb-4">
                      <div className="text-lg font-semibold mb-2 text-gray-800">
                        {lineData.line}
                      </div>
                    </div>
                    
                    {/* Syllable breakdown table */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <tbody>
                          {/* Syllables row */}
                          <tr>
                            {lineData.syllables.map((syllable, index) => (
                              <td key={index} className="border border-gray-300 px-2 py-1 text-center text-sm bg-white">
                                {syllable}
                              </td>
                            ))}
                          </tr>
                          {/* Meter pattern row */}
                          <tr>
                            {lineData.syllableAnalysis ? (
                              lineData.syllableAnalysis.map((syllableData, index) => (
                                <td key={index} className="border border-gray-300 px-2 py-1 text-center text-xs font-mono bg-white">
                                  {syllableData.weight}
                                </td>
                              ))
                            ) : (
                              lineData.sections?.map((section, sectionIndex) => 
                                section.weights.map((weight, weightIndex) => (
                                  <td key={`${sectionIndex}-${weightIndex}`} className="border border-gray-300 px-2 py-1 text-center text-xs font-mono bg-white">
                                    {weight}
                                  </td>
                                ))
                              )
                            )}
                          </tr>
                          {/* Section names row - only for success cases */}
                          {analysis.status === 'success' && lineData.sections && (
                            <tr>
                              {lineData.sections.map((section, sectionIndex) => (
                                <td key={sectionIndex} 
                                    colSpan={section.weights.length} 
                                    className="border border-gray-300 px-2 py-1 text-center text-xs bg-gray-50 font-semibold">
                                  {section.name}
                                </td>
                              ))}
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
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Great! Your poetry is in Bahr. Keep up the good work!</span>
                </div>
              )}
              
              {analysis.status === 'error' && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Some lines have errors in meter. Check highlighted lines below.</span>
                </div>
              )}
              
              {/* Dynamic Bahr Information Footer */}
              <div className="bg-white border border-gray-300 p-6 text-center space-y-4 rounded-lg mt-4">
                <div className="space-y-3">
                  <div className="text-lg font-medium text-gray-800">
                    आप की रचना निम्नलिखित बहर में है:
                  </div>
                  <div className="text-base font-semibold text-gray-700">
                    {analysis.bahrType || "मुज्तस मुसम्मन मख़बून महज़ूफ़ मस्कन"}
                  </div>
                  <div className="text-base font-medium text-gray-600">
                    {analysis.meterDescription || "मुफ़ाइलुन फ़इलातुन मुफ़ाइलुन फ़ेलुन"}
                  </div>
                  <div className="flex justify-center space-x-2 mt-4">
                    {(analysis.pattern || ["2121", "2122", "2121", "222"]).map((pattern, i) => (
                      <div key={i} className="bg-gray-100 border border-gray-300 px-3 py-1 rounded text-sm font-mono">
                        {pattern}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="hidden lg:block">
        <Sidebar />
      </div>
    </div>
  );
}