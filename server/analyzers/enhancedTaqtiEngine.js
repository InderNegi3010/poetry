// Enhanced Taqti Engine with Rekhta-inspired optimizations
// Comprehensive meter analysis with client-side validation and API integration

import { EnhancedSyllableCounter } from './enhancedSyllableCounter.js';
import { ClientSideMeterValidator } from './clientSideMeterValidator.js';
import { parseLine, getSyllablePattern, getSyllableWeight } from './syllableParser.js';
import { matchPattern, analyzeConsistency } from './matcher.js';

// API Configuration
const API_CONFIG = {
  TAQTI_ENDPOINT: "https://taqti-api.rekhta.org/api/taqti/v2/metermatch",
  WORD_SUGGESTIONS_ENDPOINT: "https://taqti-api.rekhta.org/word_suggestions",
  TIMEOUT: 5000,
  MAX_RETRIES: 2
};

// Word dictionary for suggestions (expandable)
let WORD_DICTIONARY = {
  urdu: {
    'dil': ['दिल', 'دل'],
    'ishq': ['इश्क़', 'عشق'],
    'mohabbat': ['मोहब्बत', 'محبت'],
    'gham': ['ग़म', 'غم'],
    'khushi': ['खुशी', 'خوشی'],
    'zindagi': ['ज़िंदगी', 'زندگی'],
    'duniya': ['दुनिया', 'دنیا'],
    'pyaar': ['प्यार', 'پیار'],
    'aansu': ['आंसू', 'آنسو'],
    'muskaan': ['मुस्कान', 'مسکان']
  },
  hindi: {
    'प्रेम': ['प्रेम', 'پریم'],
    'हृदय': ['हृदय', 'ہردے'],
    'आँख': ['आँख', 'آنکھ'],
    'जीवन': ['जीवन', 'جیون'],
    'संसार': ['संसार', 'سنسار'],
    'सुख': ['सुख', 'سکھ'],
    'दुःख': ['दुःख', 'دکھ']
  },
  hinglish: {
    'dil': ['दिल', 'دل'],
    'pyaar': ['प्यार', 'پیار'],
    'aankh': ['आँख', 'آنکھ'],
    'zindagi': ['ज़िंदगी', 'زندگی'],
    'khushi': ['खुशी', 'خوشی'],
    'gham': ['ग़म', 'غم']
  }
};

/**
 * Enhanced Taqti Engine with comprehensive analysis capabilities
 */
export class EnhancedTaqtiEngine {
  
  /**
   * Comprehensive poem analysis with multiple validation layers
   */
  static async analyzePoem(poem, options = {}) {
    const {
      language = 'auto',
      useAPI = true,
      strictMode = false,
      includeWordSuggestions = false,
      expectedForm = 'auto'
    } = options;
    
    if (!poem || typeof poem !== 'string') {
      return this.createErrorResult('Invalid input: poem must be a non-empty string');
    }
    
    try {
      // Step 1: Client-side validation (always runs)
      const clientValidation = ClientSideMeterValidator.validateMeter(poem, {
        language,
        strictMode,
        expectedForm
      });
      
      // Step 2: Enhanced syllable analysis
      const enhancedAnalysis = this.performEnhancedAnalysis(poem, language);
      
      // Step 3: API analysis (if enabled and available)
      let apiResult = null;
      if (useAPI) {
        apiResult = await this.callTaqtiAPI(poem, language);
      }
      
      // Step 4: Word suggestions (if requested)
      let wordSuggestions = null;
      if (includeWordSuggestions) {
        wordSuggestions = await this.getWordSuggestions(poem, language);
      }
      
      // Step 5: Combine results
      const combinedResult = this.combineAnalysisResults(
        clientValidation,
        enhancedAnalysis,
        apiResult,
        wordSuggestions
      );
      
      return combinedResult;
      
    } catch (error) {
      console.error('Enhanced Taqti Engine error:', error);
      return this.createErrorResult(`Analysis failed: ${error.message}`);
    }
  }
  
  /**
   * Perform enhanced syllable and pattern analysis
   */
  static performEnhancedAnalysis(poem, language) {
    const lines = poem.split('\n').map(l => l.trim()).filter(l => l);
    const lineAnalyses = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Enhanced syllable analysis
      const syllableAnalysis = EnhancedSyllableCounter.analyzeLine(line, language);
      
      // Original Taqti analysis for comparison
      const originalSyllables = parseLine(line);
      const originalPattern = getSyllablePattern(originalSyllables);
      
      // Pattern matching
      const patternMatches = matchPattern(syllableAnalysis.pattern);
      
      lineAnalyses.push({
        lineNumber: i + 1,
        text: line,
        enhanced: syllableAnalysis,
        original: {
          syllables: originalSyllables,
          pattern: originalPattern,
          totalSyllables: originalSyllables.length
        },
        matches: patternMatches,
        bestMatch: patternMatches.length > 0 ? patternMatches[0] : null
      });
    }
    
    // Overall consistency analysis
    const patterns = lineAnalyses.map(l => l.enhanced.pattern);
    const consistency = analyzeConsistency(patterns);
    
    return {
      lines: lineAnalyses,
      consistency: consistency,
      totalLines: lines.length,
      averageMatras: this.calculateAverageMatras(lineAnalyses),
      detectedLanguage: EnhancedSyllableCounter.detectLanguage(poem)
    };
  }
  
  /**
   * Call Taqti API with fallback mechanisms
   */
  static async callTaqtiAPI(poem, language, retryCount = 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
      const formData = {
        'text-input': poem,
        language: language === 'auto' ? 'urdu' : language
      };
      
      const response = await fetch(API_CONFIG.TAQTI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TaqtiEngine/1.0'
        },
        body: JSON.stringify(formData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data,
        source: 'api'
      };
      
    } catch (error) {
      console.warn(`API call failed (attempt ${retryCount + 1}):`, error.message);
      
      // Retry logic
      if (retryCount < API_CONFIG.MAX_RETRIES && !error.name === 'AbortError') {
        await this.delay(1000 * (retryCount + 1)); // Exponential backoff
        return this.callTaqtiAPI(poem, language, retryCount + 1);
      }
      
      return {
        success: false,
        error: error.message,
        source: 'api'
      };
    }
  }
  
  /**
   * Get word suggestions for poetry writing
   */
  static async getWordSuggestions(poem, language) {
    const words = poem.split(/\s+/).filter(w => w.trim());
    const suggestions = {};
    
    // Get suggestions for each unique word
    const uniqueWords = [...new Set(words)];
    
    for (const word of uniqueWords.slice(0, 10)) { // Limit to 10 words
      try {
        const wordSuggestions = await this.getSuggestionsForWord(word, language);
        if (wordSuggestions.length > 0) {
          suggestions[word] = wordSuggestions;
        }
      } catch (error) {
        // Fallback to local dictionary
        const localSuggestions = this.getLocalWordSuggestions(word, language);
        if (localSuggestions.length > 0) {
          suggestions[word] = localSuggestions;
        }
      }
    }
    
    return suggestions;
  }
  
  /**
   * Get suggestions for a single word from API
   */
  static async getSuggestionsForWord(word, language) {
    try {
      const response = await fetch(
        `${API_CONFIG.WORD_SUGGESTIONS_ENDPOINT}?ro=${encodeURIComponent(word)}&lang=${language}`,
        { timeout: 3000 }
      );
      
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data.slice(0, 5) : [];
      }
    } catch (error) {
      console.warn('Word suggestion API failed:', error.message);
    }
    
    return [];
  }
  
  /**
   * Get local word suggestions from dictionary
   */
  static getLocalWordSuggestions(word, language) {
    const dict = WORD_DICTIONARY[language] || WORD_DICTIONARY.hinglish;
    const suggestions = [];
    
    for (const [key, value] of Object.entries(dict)) {
      if (key.toLowerCase().includes(word.toLowerCase()) || 
          value.some(v => v.includes(word))) {
        suggestions.push({
          original: key,
          transliterations: value,
          source: 'local'
        });
      }
    }
    
    return suggestions.slice(0, 5);
  }
  
  /**
   * Combine all analysis results into comprehensive output
   */
  static combineAnalysisResults(clientValidation, enhancedAnalysis, apiResult, wordSuggestions) {
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      analysis: {
        client: clientValidation,
        enhanced: enhancedAnalysis,
        api: apiResult,
        wordSuggestions: wordSuggestions
      }
    };
    
    // Determine primary result source
    if (apiResult && apiResult.success) {
      result.primarySource = 'api';
      result.confidence = Math.min(clientValidation.confidence + 10, 100);
    } else {
      result.primarySource = 'client';
      result.confidence = clientValidation.confidence;
    }
    
    // Generate comprehensive assessment
    result.assessment = this.generateComprehensiveAssessment(
      clientValidation,
      enhancedAnalysis,
      apiResult
    );
    
    // Combine suggestions
    result.suggestions = this.combineSuggestions(
      clientValidation.suggestions || [],
      enhancedAnalysis,
      apiResult
    );
    
    // Generate meter information
    result.meterInfo = this.generateMeterInfo(clientValidation, enhancedAnalysis);
    
    return result;
  }
  
  /**
   * Generate comprehensive assessment
   */
  static generateComprehensiveAssessment(clientValidation, enhancedAnalysis, apiResult) {
    let assessment = clientValidation.overall || {};
    
    // Enhance with API results if available
    if (apiResult && apiResult.success && apiResult.data) {
      if (apiResult.data.top_msg && !apiResult.data.top_msg_is_error) {
        assessment.apiMessage = apiResult.data.top_msg;
      }
    }
    
    // Add technical details
    assessment.technicalDetails = {
      totalLines: enhancedAnalysis.totalLines,
      averageMatras: enhancedAnalysis.averageMatras,
      detectedLanguage: enhancedAnalysis.detectedLanguage,
      consistencyScore: enhancedAnalysis.consistency?.isConsistent ? 100 : 
                      Math.round((1 - (enhancedAnalysis.consistency?.variations?.length || 0) / enhancedAnalysis.totalLines) * 100)
    };
    
    return assessment;
  }
  
  /**
   * Combine suggestions from different sources
   */
  static combineSuggestions(clientSuggestions, enhancedAnalysis, apiResult) {
    const suggestions = [...clientSuggestions];
    
    // Add enhanced analysis suggestions
    if (enhancedAnalysis.consistency && !enhancedAnalysis.consistency.isConsistent) {
      suggestions.push({
        type: 'consistency',
        priority: 'high',
        message: 'Consider maintaining consistent meter patterns across all lines',
        details: `Found ${enhancedAnalysis.consistency.variations?.length || 0} different patterns`
      });
    }
    
    // Add API-based suggestions if available
    if (apiResult && apiResult.success && apiResult.data && apiResult.data.examples) {
      suggestions.push({
        type: 'examples',
        priority: 'low',
        message: 'Study these similar examples for reference',
        examples: apiResult.data.examples
      });
    }
    
    return suggestions;
  }
  
  /**
   * Generate meter information
   */
  static generateMeterInfo(clientValidation, enhancedAnalysis) {
    const bestMatch = clientValidation.patterns?.matches?.[0];
    
    return {
      detectedMeter: bestMatch?.meter || 'Mixed/Unknown',
      description: bestMatch?.description || 'विशेष पैटर्न',
      confidence: bestMatch?.confidence || 0,
      commonPattern: clientValidation.patterns?.mostCommonPattern || '',
      alternatives: clientValidation.patterns?.matches?.slice(1, 4) || []
    };
  }
  
  /**
   * Calculate average matras
   */
  static calculateAverageMatras(lineAnalyses) {
    if (lineAnalyses.length === 0) return 0;
    
    const totalMatras = lineAnalyses.reduce((sum, line) => 
      sum + (line.enhanced?.totalWeight || 0), 0
    );
    
    return Math.round((totalMatras / lineAnalyses.length) * 10) / 10;
  }
  
  /**
   * Quick analysis for simple use cases
   */
  static async quickAnalyze(text, options = {}) {
    const result = await this.analyzePoem(text, { ...options, useAPI: false });
    
    if (!result.success) {
      return result;
    }
    
    return {
      success: true,
      confidence: result.confidence,
      meter: result.meterInfo.detectedMeter,
      description: result.meterInfo.description,
      suggestions: result.suggestions.filter(s => s.priority === 'high'),
      assessment: result.assessment.message || 'Analysis completed'
    };
  }
  
  /**
   * Real-time validation for live editing
   */
  static validateLive(text, language = 'auto') {
    if (!text || text.length < 3) {
      return { valid: true, suggestions: [] };
    }
    
    try {
      const validation = ClientSideMeterValidator.validateMeter(text, { language });
      
      return {
        valid: validation.confidence > 50,
        confidence: validation.confidence,
        suggestions: validation.suggestions.filter(s => s.priority === 'high').slice(0, 3),
        quickFeedback: validation.overall?.level || 'unknown'
      };
    } catch (error) {
      return { valid: true, suggestions: [], error: error.message };
    }
  }
  
  /**
   * Utility functions
   */
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  static createErrorResult(message) {
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
      suggestions: [{
        type: 'error',
        priority: 'high',
        message: message
      }]
    };
  }
  
  /**
   * Add word to local dictionary
   */
  static addWordToDictionary(word, transliterations, language) {
    if (!WORD_DICTIONARY[language]) {
      WORD_DICTIONARY[language] = {};
    }
    WORD_DICTIONARY[language][word] = transliterations;
  }
  
  /**
   * Get supported languages
   */
  static getSupportedLanguages() {
    return ['urdu', 'hindi', 'hinglish', 'auto'];
  }
  
  /**
   * Get available meter patterns
   */
  static getAvailableMeters() {
    return Object.keys(ClientSideMeterValidator.METER_PATTERNS || {});
  }
}
