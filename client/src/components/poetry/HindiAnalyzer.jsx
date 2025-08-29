export default class HindiAnalyzer {
  // Extract Devanagari syllables with proper segmentation
  static extractHindiSyllables(text) {
    if (!text || typeof text !== 'string') return [];
    
    // Remove punctuation but keep Devanagari characters
    const cleanText = text.replace(/[^\u0900-\u097F\s]/g, '').trim();
    if (!cleanText) return [];
    
    const syllables = [];
    let i = 0;
    
    while (i < cleanText.length) {
      const char = cleanText[i];
      
      // Skip spaces
      if (char === ' ') {
        i++;
        continue;
      }
      
      // Skip if not Devanagari
      if (!/[\u0900-\u097F]/.test(char)) {
        i++;
        continue;
      }
      
      let syllable = char;
      i++;
      
      // Collect dependent vowels (matras)
      while (i < cleanText.length && /[\u093E-\u094F\u0962-\u0963]/.test(cleanText[i])) {
        syllable += cleanText[i];
        i++;
      }
      
      // Handle conjuncts (halant + consonant)
      while (i < cleanText.length && cleanText[i] === '\u094D') {
        syllable += cleanText[i]; // halant
        i++;
        if (i < cleanText.length && /[\u0915-\u0939]/.test(cleanText[i])) {
          syllable += cleanText[i]; // consonant
          i++;
          // More matras after conjunct
          while (i < cleanText.length && /[\u093E-\u094F\u0962-\u0963]/.test(cleanText[i])) {
            syllable += cleanText[i];
            i++;
          }
        }
      }
      
      if (syllable.trim()) syllables.push(syllable);
    }
    
    return syllables;
  }

  // Check if text contains English letters or numbers
  static hasEnglishOrNumbers(text) {
    return /[a-zA-Z0-9]/.test(text);
  }

  // Check if a line contains invalid characters
  static isLineInvalid(line) {
    return this.hasEnglishOrNumbers(line);
  }

  // Apply the specific meter pattern: 1 2 1 2   1 1 2 2   1 2 1 2   2 2
  static applyMeterPattern(syllables) {
    const sections = [];
    let currentIndex = 0;

    // Section definitions with Hindi names and exact pattern
    const sectionDefinitions = [
      { name: "मुफ़ाइलुन", pattern: [1, 2, 1, 2], color: "bg-blue-100" },
      { name: "फ़इलातुन", pattern: [1, 1, 2, 2], color: "bg-pink-100" },
      { name: "मुफ़ाइलुन", pattern: [1, 2, 1, 2], color: "bg-green-100" },
      { name: "फ़ेलुन", pattern: [2, 2], color: "bg-yellow-100" }
    ];

    for (const sectionDef of sectionDefinitions) {
      if (currentIndex >= syllables.length) break;

      const sectionSyllables = [];
      const sectionWeights = [];

      for (let i = 0; i < sectionDef.pattern.length && currentIndex < syllables.length; i++) {
        const patternValue = sectionDef.pattern[i];
        
        if (patternValue === 1) {
          // Single syllable
          sectionSyllables.push(syllables[currentIndex]);
          sectionWeights.push("1");
          currentIndex++;
        } else if (patternValue === 2) {
          // Two syllables together
          if (currentIndex + 1 < syllables.length) {
            sectionSyllables.push(syllables[currentIndex] + syllables[currentIndex + 1]);
            sectionWeights.push("2");
            currentIndex += 2;
          } else if (currentIndex < syllables.length) {
            // Only one syllable left, treat as single
            sectionSyllables.push(syllables[currentIndex]);
            sectionWeights.push("1");
            currentIndex++;
          }
        }
      }

      if (sectionSyllables.length > 0) {
        sections.push({
          name: sectionDef.name,
          syllables: sectionSyllables,
          weights: sectionWeights,
          color: sectionDef.color
        });
      }
    }

    return sections;
  }

  static analyzeLine(line) {
    if (!line?.trim()) return null;
    
    // Check if line is invalid (contains English/numbers)
    if (this.isLineInvalid(line)) {
      return {
        line: line.trim(),
        isInvalid: true,
        sections: [],
        syllables: []
      };
    }
    
    const syllables = this.extractHindiSyllables(line);
    if (!syllables || syllables.length === 0) return null;

    const sections = this.applyMeterPattern(syllables);

    return {
      line: line.trim(),
      isInvalid: false,
      sections,
      syllables
    };
  }
}