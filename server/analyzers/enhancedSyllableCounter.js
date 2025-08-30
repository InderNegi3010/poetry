// Enhanced syllable counting algorithm inspired by Rekhta's approach
// Provides more accurate syllable detection for Urdu/Hindi/Hinglish

// Advanced syllable patterns for different scripts
const SYLLABLE_PATTERNS = {
  urdu: /[अ-हक़-ग़ज़-फ़ड़-ढ़ऩ-ऱऴ-ॿa-zA-Z]+/g,
  hindi: /[अ-हक़-ग़ज़-फ़ड़-ढ़ऩ-ऱऴ-ॿ]+/g,
  hinglish: /[a-zA-Z]+/g,
  devanagari: /[\u0900-\u097F]+/g,
  roman: /[a-zA-ZḌḍṭṇṛṣśḥāīūēōḥṃṅñṭḍṇḷṛṣ]+/g
};

// Vowel patterns for accurate syllable counting
const VOWEL_PATTERNS = {
  devanagari: /[अआइईउऊएऐओऔऋॠऌॡ]/g,
  devanagariMatras: /[ािীুূেৈোৌৃৄৢৣ]/g,
  roman: /[aeiouAEIOUāīūēōḥ]/g,
  romanLong: /[āīūēōḥ]|aa|ii|uu|ee|oo|ai|au|oi|ou|ei|ay|ey/g
};

// Consonant clusters that affect syllable weight
const CONSONANT_CLUSTERS = {
  aspirated: /[kg]h|[td]h|[pb]h|[jc]h|bh|dh|gh|jh|kh|ph|th|ch/g,
  retroflex: /[ṭḍṇṛṣ]/g,
  conjuncts: /्[क-ह]/g
};

/**
 * Enhanced syllable counting with multiple algorithms
 */
export class EnhancedSyllableCounter {
  
  /**
   * Count syllables using Rekhta-inspired algorithm
   */
  static countSyllables(text, language = 'auto') {
    if (!text || typeof text !== 'string') return 0;
    
    const detectedLang = language === 'auto' ? this.detectLanguage(text) : language;
    
    switch (detectedLang) {
      case 'hindi':
      case 'urdu':
        return this.countDevanagariSyllables(text);
      case 'hinglish':
        return this.countRomanSyllables(text);
      case 'mixed':
        return this.countMixedSyllables(text);
      default:
        return this.countGenericSyllables(text);
    }
  }
  
  /**
   * Detect language of the text
   */
  static detectLanguage(text) {
    const hasDevanagari = /[\u0900-\u097F]/.test(text);
    const hasRoman = /[a-zA-Z]/.test(text);
    const hasNumbers = /[0-9०-९]/.test(text);
    
    if (hasNumbers) return 'invalid';
    if (hasDevanagari && hasRoman) return 'mixed';
    if (hasDevanagari) return 'hindi';
    if (hasRoman) return 'hinglish';
    return 'unknown';
  }
  
  /**
   * Count syllables in Devanagari text
   */
  static countDevanagariSyllables(text) {
    // Remove punctuation and normalize
    const cleanText = text.replace(/[^\u0900-\u097F\s]/g, '');
    const words = cleanText.match(SYLLABLE_PATTERNS.devanagari) || [];
    
    let totalSyllables = 0;
    
    for (const word of words) {
      totalSyllables += this.countWordSyllablesDevanagari(word);
    }
    
    return totalSyllables;
  }
  
  /**
   * Count syllables in a single Devanagari word
   */
  static countWordSyllablesDevanagari(word) {
    if (!word) return 0;
    
    let syllableCount = 0;
    let i = 0;
    
    while (i < word.length) {
      const char = word[i];
      
      // Skip non-Devanagari
      if (!/[\u0900-\u097F]/.test(char)) {
        i++;
        continue;
      }
      
      // Independent vowels count as one syllable
      if (/[\u0905-\u0914\u0960-\u0961]/.test(char)) {
        syllableCount++;
        i++;
        continue;
      }
      
      // Consonants
      if (/[\u0915-\u0939\u0958-\u095F]/.test(char)) {
        syllableCount++;
        i++;
        
        // Skip dependent vowels (matras) - they don't add syllables
        while (i < word.length && /[\u093E-\u094F\u0962-\u0963]/.test(word[i])) {
          i++;
        }
        
        // Handle conjuncts (halant + consonant)
        while (i < word.length && word[i] === '\u094D') {
          if (i + 1 < word.length && /[\u0915-\u0939\u0958-\u095F]/.test(word[i + 1])) {
            // This is a conjunct, don't count extra syllable
            i += 2;
            // Skip any matras after conjunct
            while (i < word.length && /[\u093E-\u094F\u0962-\u0963]/.test(word[i])) {
              i++;
            }
          } else {
            i++;
            break;
          }
        }
        
        // Skip modifiers
        while (i < word.length && /[\u0901-\u0903\u093C]/.test(word[i])) {
          i++;
        }
      } else {
        i++;
      }
    }
    
    return Math.max(syllableCount, 1); // At least one syllable per word
  }
  
  /**
   * Count syllables in Roman script text
   */
  static countRomanSyllables(text) {
    const words = text.match(SYLLABLE_PATTERNS.roman) || [];
    let totalSyllables = 0;
    
    for (const word of words) {
      totalSyllables += this.countWordSyllablesRoman(word.toLowerCase());
    }
    
    return totalSyllables;
  }
  
  /**
   * Count syllables in a single Roman word
   */
  static countWordSyllablesRoman(word) {
    if (!word) return 0;
    
    // Handle special cases
    if (word.length <= 2) return 1;
    
    // Count vowel groups
    let syllableCount = 0;
    let prevWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const isVowel = /[aeiouāīūēōḥ]/.test(char);
      
      if (isVowel && !prevWasVowel) {
        syllableCount++;
      }
      
      prevWasVowel = isVowel;
    }
    
    // Handle silent 'e' at the end
    if (word.endsWith('e') && syllableCount > 1) {
      syllableCount--;
    }
    
    // Handle double vowels
    const doubleVowels = word.match(/aa|ii|uu|ee|oo|ai|au|oi|ou|ei|ay|ey/g);
    if (doubleVowels) {
      // Each double vowel should count as one syllable, not two
      syllableCount -= doubleVowels.length;
    }
    
    return Math.max(syllableCount, 1);
  }
  
  /**
   * Count syllables in mixed script text
   */
  static countMixedSyllables(text) {
    // Split by script and count separately
    const devanagariParts = text.match(/[\u0900-\u097F\s]+/g) || [];
    const romanParts = text.match(/[a-zA-Z\s]+/g) || [];
    
    let totalSyllables = 0;
    
    for (const part of devanagariParts) {
      totalSyllables += this.countDevanagariSyllables(part);
    }
    
    for (const part of romanParts) {
      totalSyllables += this.countRomanSyllables(part);
    }
    
    return totalSyllables;
  }
  
  /**
   * Generic syllable counting fallback
   */
  static countGenericSyllables(text) {
    // Simple vowel-based counting as fallback
    const vowels = text.match(/[aeiouAEIOUअआइईउऊएऐओऔ]/g) || [];
    return Math.max(vowels.length, 1);
  }
  
  /**
   * Get detailed syllable analysis for a line
   */
  static analyzeLine(text, language = 'auto') {
    const words = text.split(/\s+/).filter(w => w.trim());
    const analysis = [];
    
    for (const word of words) {
      const syllableCount = this.countSyllables(word, language);
      const weight = this.calculateSyllableWeight(word);
      
      analysis.push({
        word: word,
        syllables: syllableCount,
        weight: weight,
        pattern: weight === 2 ? 'long' : 'short'
      });
    }
    
    return {
      words: analysis,
      totalSyllables: analysis.reduce((sum, w) => sum + w.syllables, 0),
      totalWeight: analysis.reduce((sum, w) => sum + w.weight, 0),
      pattern: analysis.map(w => w.weight).join('')
    };
  }
  
  /**
   * Calculate syllable weight (1 = short, 2 = long)
   */
  static calculateSyllableWeight(word) {
    if (!word) return 1;
    
    const w = word.toLowerCase();
    
    // Long patterns
    const longPatterns = [
      /[āīūēōḥ]/,                    // Long vowels
      /aa|ii|uu|ee|oo/,              // Double vowels
      /ai|au|oi|ou|ei|ay|ey/,        // Diphthongs
      /[aeiou][ṃṅñ]/,                // Nasalized
      /[aeiou]n$/,                   // Final nasal
      /[aeiou][bcdfghjklmnpqrstvwxyz]{2,}/, // Vowel + cluster
      /[aeiou][bcdfghjklmnpqrstvwxyz]$/,    // Final consonant
      /[kg]h|[td]h|[pb]h|[jc]h/,     // Aspirated
      /[Ḍḍṭṇṛṣśḥṃṅñṭḍṇḷṛṣ]/        // Retroflex/special
    ];
    
    for (const pattern of longPatterns) {
      if (pattern.test(w)) return 2;
    }
    
    // Check Devanagari patterns
    if (/[\u0900-\u097F]/.test(word)) {
      // Long vowel matras
      if (/[\u093E\u0940\u0942\u0947\u0948\u094B\u094C]/.test(word)) return 2;
      // Conjuncts
      if (/\u094D/.test(word)) return 2;
      // Nasalization
      if (/[\u0901\u0902\u0903]/.test(word)) return 2;
    }
    
    return 1; // Default short
  }
}
