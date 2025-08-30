// Client-side meter validation inspired by Rekhta's approach
// Provides instant feedback without API calls

import { EnhancedSyllableCounter } from './enhancedSyllableCounter.js';

// Enhanced meter patterns database with confidence scoring
const METER_PATTERNS = {
  "bahr-e-hazaj": {
    patterns: [
      "212122212122",     // maf'ulun fa'ilatun maf'ulun fa'ilun
      "2121222121",       // maf'ulun fa'ilatun maf'ulun
      "21212221212212"    // extended version
    ],
    description: "मफ़ऊलुन फ़ाइलातुन मफ़ऊलुन फ़इलुन",
    confidence: 0.95,
    commonMatras: [14, 16, 18]
  },
  
  "bahr-e-rajaz": {
    patterns: [
      "1221122112211221",  // mustaf'ilun mustaf'ilun mustaf'ilun
      "122112211221",      // mustaf'ilun mustaf'ilun
      "12211221122112211221" // extended
    ],
    description: "मुस्तफ़इलुन मुस्तफ़इलुन मुस्तफ़इलुन",
    confidence: 0.92,
    commonMatras: [12, 16, 20]
  },
  
  "bahr-e-ramal": {
    patterns: [
      "212121212",        // fa'ilatun fa'ilatun fa'ilun
      "21212121212",      // fa'ilatun fa'ilatun fa'ilatun
      "2121212121212"     // extended
    ],
    description: "फ़ाइलातुन फ़ाइलातुन फ़इलुन",
    confidence: 0.94,
    commonMatras: [18, 20, 22]
  },
  
  "bahr-e-mutaqarib": {
    patterns: [
      "21212121",         // fa'ilun fa'ilun fa'ilun fa'ilun
      "2121212121",       // extended
      "212121212121"      // longer
    ],
    description: "फ़इलुन फ़इलुन फ़इलुन फ़इलुन",
    confidence: 0.96,
    commonMatras: [16, 20, 24]
  },
  
  "bahr-e-kamil": {
    patterns: [
      "2122212221222122", // mutafa'ilun mutafa'ilun mutafa'ilun mutafa'ilun
      "212221222122",     // mutafa'ilun mutafa'ilun
      "21222122"          // single foot
    ],
    description: "मुतफ़ाइलुन मुतफ़ाइलुन मुतफ़ाइलुन मुतफ़ाइलुन",
    confidence: 0.93,
    commonMatras: [28, 14, 7]
  }
};

// Structure validation rules
const STRUCTURE_RULES = {
  ghazal: {
    minLines: 4,
    maxLines: 15,
    evenLines: true,
    consistentMeter: true,
    rhymeScheme: "AA BA CA DA..."
  },
  
  nazm: {
    minLines: 2,
    maxLines: 50,
    evenLines: false,
    consistentMeter: false,
    rhymeScheme: "flexible"
  },
  
  rubai: {
    minLines: 4,
    maxLines: 4,
    evenLines: true,
    consistentMeter: true,
    rhymeScheme: "AABA"
  }
};

/**
 * Enhanced client-side meter validator
 */
export class ClientSideMeterValidator {
  
  /**
   * Perform comprehensive meter validation
   */
  static validateMeter(text, options = {}) {
    const {
      language = 'auto',
      strictMode = false,
      expectedForm = 'auto'
    } = options;
    
    if (!text || typeof text !== 'string') {
      return this.createErrorResult('Invalid input text');
    }
    
    // Basic preprocessing
    const lines = this.preprocessText(text);
    if (lines.length === 0) {
      return this.createErrorResult('No valid lines found');
    }
    
    // Analyze each line
    const lineAnalyses = this.analyzeLines(lines, language);
    
    // Check overall structure
    const structureAnalysis = this.analyzeStructure(lineAnalyses, expectedForm);
    
    // Pattern matching
    const patternAnalysis = this.analyzePatterns(lineAnalyses);
    
    // Confidence scoring
    const confidence = this.calculateConfidence(lineAnalyses, structureAnalysis, patternAnalysis);
    
    // Generate suggestions
    const suggestions = this.generateSuggestions(lineAnalyses, structureAnalysis, patternAnalysis);
    
    return {
      success: true,
      confidence: confidence,
      lines: lineAnalyses,
      structure: structureAnalysis,
      patterns: patternAnalysis,
      suggestions: suggestions,
      overall: this.generateOverallAssessment(confidence, patternAnalysis)
    };
  }
  
  /**
   * Preprocess text into clean lines
   */
  static preprocessText(text) {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => !/^[0-9\s\-_=]+$/.test(line)); // Remove line numbers/separators
  }
  
  /**
   * Analyze individual lines
   */
  static analyzeLines(lines, language) {
    return lines.map((line, index) => {
      const analysis = EnhancedSyllableCounter.analyzeLine(line, language);
      const validation = this.validateLine(line, language);
      
      return {
        lineNumber: index + 1,
        text: line,
        syllables: analysis.totalSyllables,
        matras: analysis.totalWeight,
        pattern: analysis.pattern,
        words: analysis.words,
        isValid: validation.isValid,
        errors: validation.errors,
        language: EnhancedSyllableCounter.detectLanguage(line)
      };
    });
  }
  
  /**
   * Validate individual line
   */
  static validateLine(line, language) {
    const errors = [];
    
    // Check for invalid characters
    if (/[0-9]/.test(line)) {
      errors.push('Contains numbers');
    }
    
    // Check for excessive punctuation
    if (/[!@#$%^&*()+=\[\]{}|\\:";'<>?,./]{3,}/.test(line)) {
      errors.push('Excessive punctuation');
    }
    
    // Check minimum length
    if (line.length < 3) {
      errors.push('Line too short');
    }
    
    // Check maximum length
    if (line.length > 100) {
      errors.push('Line too long');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
  
  /**
   * Analyze overall structure
   */
  static analyzeStructure(lineAnalyses, expectedForm) {
    const lineCount = lineAnalyses.length;
    const matraCounts = lineAnalyses.map(l => l.matras);
    const syllableCounts = lineAnalyses.map(l => l.syllables);
    
    // Check consistency
    const isMatraConsistent = new Set(matraCounts).size <= 2;
    const isSyllableConsistent = new Set(syllableCounts).size <= 2;
    const isEvenLines = lineCount % 2 === 0;
    
    // Determine likely form
    let likelyForm = 'nazm'; // default
    
    if (lineCount === 4 && isMatraConsistent) {
      likelyForm = 'rubai';
    } else if (isEvenLines && lineCount >= 4 && lineCount <= 15 && isMatraConsistent) {
      likelyForm = 'ghazal';
    }
    
    // Check against rules
    const formRules = STRUCTURE_RULES[likelyForm] || STRUCTURE_RULES.nazm;
    const structureScore = this.calculateStructureScore(lineAnalyses, formRules);
    
    return {
      lineCount: lineCount,
      isEvenLines: isEvenLines,
      isMatraConsistent: isMatraConsistent,
      isSyllableConsistent: isSyllableConsistent,
      likelyForm: likelyForm,
      structureScore: structureScore,
      matraCounts: matraCounts,
      syllableCounts: syllableCounts
    };
  }
  
  /**
   * Calculate structure score
   */
  static calculateStructureScore(lineAnalyses, rules) {
    let score = 0;
    let maxScore = 0;
    
    // Line count check
    maxScore += 20;
    if (lineAnalyses.length >= rules.minLines && lineAnalyses.length <= rules.maxLines) {
      score += 20;
    }
    
    // Even lines check
    if (rules.evenLines !== undefined) {
      maxScore += 15;
      const isEven = lineAnalyses.length % 2 === 0;
      if (isEven === rules.evenLines) {
        score += 15;
      }
    }
    
    // Meter consistency check
    if (rules.consistentMeter) {
      maxScore += 25;
      const matras = lineAnalyses.map(l => l.matras);
      const uniqueMatras = new Set(matras);
      if (uniqueMatras.size === 1) {
        score += 25;
      } else if (uniqueMatras.size === 2) {
        score += 15;
      }
    }
    
    return Math.round((score / maxScore) * 100);
  }
  
  /**
   * Analyze meter patterns
   */
  static analyzePatterns(lineAnalyses) {
    const patterns = lineAnalyses.map(l => l.pattern);
    const matches = [];
    
    // Check against known meters
    for (const [meterName, meterData] of Object.entries(METER_PATTERNS)) {
      for (const pattern of patterns) {
        const matchResult = this.matchPattern(pattern, meterData);
        if (matchResult.confidence > 0.6) {
          matches.push({
            meter: meterName,
            pattern: pattern,
            confidence: matchResult.confidence,
            description: meterData.description,
            matchType: matchResult.type
          });
        }
      }
    }
    
    // Sort by confidence
    matches.sort((a, b) => b.confidence - a.confidence);
    
    // Find most common pattern
    const patternFreq = {};
    patterns.forEach(p => {
      patternFreq[p] = (patternFreq[p] || 0) + 1;
    });
    
    const mostCommonPattern = Object.keys(patternFreq).reduce((a, b) => 
      patternFreq[a] > patternFreq[b] ? a : b
    );
    
    return {
      matches: matches.slice(0, 5), // Top 5 matches
      mostCommonPattern: mostCommonPattern,
      patternConsistency: patterns.every(p => p === patterns[0]) ? 100 : 
                         Math.round((patternFreq[mostCommonPattern] / patterns.length) * 100),
      uniquePatterns: Object.keys(patternFreq).length
    };
  }
  
  /**
   * Match pattern against meter data
   */
  static matchPattern(pattern, meterData) {
    let bestMatch = { confidence: 0, type: 'none' };
    
    for (const meterPattern of meterData.patterns) {
      // Exact match
      if (pattern === meterPattern) {
        return { confidence: 1.0, type: 'exact' };
      }
      
      // Partial match
      if (meterPattern.includes(pattern) || pattern.includes(meterPattern)) {
        const confidence = Math.min(pattern.length, meterPattern.length) / 
                          Math.max(pattern.length, meterPattern.length);
        if (confidence > bestMatch.confidence) {
          bestMatch = { confidence: confidence * 0.8, type: 'partial' };
        }
      }
      
      // Similarity match
      const similarity = this.calculatePatternSimilarity(pattern, meterPattern);
      if (similarity > bestMatch.confidence) {
        bestMatch = { confidence: similarity * 0.7, type: 'similar' };
      }
    }
    
    return bestMatch;
  }
  
  /**
   * Calculate pattern similarity
   */
  static calculatePatternSimilarity(pattern1, pattern2) {
    const minLen = Math.min(pattern1.length, pattern2.length);
    const maxLen = Math.max(pattern1.length, pattern2.length);
    let matches = 0;
    
    for (let i = 0; i < minLen; i++) {
      if (pattern1[i] === pattern2[i]) {
        matches++;
      }
    }
    
    return (matches / maxLen) * (1 - (maxLen - minLen) / maxLen);
  }
  
  /**
   * Calculate overall confidence
   */
  static calculateConfidence(lineAnalyses, structureAnalysis, patternAnalysis) {
    let confidence = 0;
    
    // Structure confidence (40%)
    confidence += (structureAnalysis.structureScore / 100) * 0.4;
    
    // Pattern confidence (40%)
    const bestPatternMatch = patternAnalysis.matches[0];
    if (bestPatternMatch) {
      confidence += bestPatternMatch.confidence * 0.4;
    }
    
    // Consistency confidence (20%)
    confidence += (patternAnalysis.patternConsistency / 100) * 0.2;
    
    return Math.round(confidence * 100);
  }
  
  /**
   * Generate improvement suggestions
   */
  static generateSuggestions(lineAnalyses, structureAnalysis, patternAnalysis) {
    const suggestions = [];
    
    // Structure suggestions
    if (!structureAnalysis.isMatraConsistent) {
      const targetMatra = this.getMostCommonMatra(lineAnalyses);
      suggestions.push({
        type: 'structure',
        priority: 'high',
        message: `Try to maintain consistent matra count of ${targetMatra} across all lines`,
        lines: lineAnalyses.filter(l => l.matras !== targetMatra).map(l => l.lineNumber)
      });
    }
    
    // Pattern suggestions
    if (patternAnalysis.uniquePatterns > 2) {
      suggestions.push({
        type: 'pattern',
        priority: 'medium',
        message: 'Consider using a more consistent meter pattern',
        suggestion: `Try following the pattern: ${patternAnalysis.mostCommonPattern}`
      });
    }
    
    // Line-specific suggestions
    lineAnalyses.forEach(line => {
      if (line.errors.length > 0) {
        suggestions.push({
          type: 'line',
          priority: 'high',
          message: `Line ${line.lineNumber}: ${line.errors.join(', ')}`,
          lineNumber: line.lineNumber
        });
      }
    });
    
    return suggestions;
  }
  
  /**
   * Get most common matra count
   */
  static getMostCommonMatra(lineAnalyses) {
    const matraCounts = {};
    lineAnalyses.forEach(line => {
      matraCounts[line.matras] = (matraCounts[line.matras] || 0) + 1;
    });
    
    return Object.keys(matraCounts).reduce((a, b) => 
      matraCounts[a] > matraCounts[b] ? a : b
    );
  }
  
  /**
   * Generate overall assessment
   */
  static generateOverallAssessment(confidence, patternAnalysis) {
    let assessment = '';
    let level = '';
    
    if (confidence >= 85) {
      level = 'excellent';
      assessment = 'Your poetry follows traditional meter patterns very well!';
    } else if (confidence >= 70) {
      level = 'good';
      assessment = 'Your poetry has good meter structure with minor improvements needed.';
    } else if (confidence >= 50) {
      level = 'fair';
      assessment = 'Your poetry shows some meter patterns but needs refinement.';
    } else {
      level = 'needs-work';
      assessment = 'Consider reviewing traditional meter patterns for better structure.';
    }
    
    const bestMatch = patternAnalysis.matches[0];
    if (bestMatch) {
      assessment += ` Closest match: ${bestMatch.meter} (${bestMatch.description})`;
    }
    
    return {
      level: level,
      message: assessment,
      confidence: confidence
    };
  }
  
  /**
   * Create error result
   */
  static createErrorResult(message) {
    return {
      success: false,
      error: message,
      confidence: 0,
      suggestions: [{
        type: 'error',
        priority: 'high',
        message: message
      }]
    };
  }
}
