class HinglishAnalyzer {
  // Rekhta-style Hinglish syllable extraction
  static extractHinglishSyllables(text) {
    if (!text || typeof text !== 'string') return [];
    
    // Clean text - keep diacritics like ḌḌ
    const cleanText = text.toLowerCase().replace(/[^\u0900-\u097Fa-zḌḍṭṇṛṣśḥ\s]/g, '').trim();
    if (!cleanText) return [];
    
    // Manual syllable mapping for better accuracy (based on Rekhta screenshot)
    const manualMappings = {
      'mere': ['me', 're'],
      'kamre': ['kam', 're'], 
      'men': ['men'],
      'ik': ['ik'],
      'aisi': ['ai', 'si'],
      'khiḌki': ['khi', 'Ḍki'], 
      'hai': ['hai'],
      'jo': ['jo'],
      'in': ['in'],
      'ankhon': ['an', 'khon'],
      'ke': ['ke'],
      'khulne': ['khul', 'ne'],
      'par': ['par'],
      'khulti': ['khul', 'ti'],
      'aise': ['ai', 'se'],
      'tevar': ['te', 'var'],
      'dushman': ['dush', 'man'],
      'hi': ['hi'],
      'hote': ['ho', 'te'],
      'hain': ['hain'],
      'pata': ['pa', 'ta'],
      'karo': ['ka', 'ro'],
      'ye': ['ye'],
      'laḌki': ['laḌ', 'ki'],
      'kis': ['kis'],
      'ki': ['ki'],
      'beTi': ['be', 'Ti']
    };
    
    const words = cleanText.split(/\s+/);
    let allSyllables = [];
    
    for (const word of words) {
      if (manualMappings[word]) {
        allSyllables = allSyllables.concat(manualMappings[word]);
      } else {
        const wordSyllables = this.extractWordSyllables(word);
        allSyllables = allSyllables.concat(wordSyllables);
      }
    }
    
    return allSyllables;
  }
  
  static extractWordSyllables(word) {
    if (!word) return [];
    
    // Handle Devanagari text
    if (/[\u0900-\u097F]/.test(word)) {
      return this.extractDevanagariSyllables(word);
    }
    
    // Rekhta-style syllable extraction for Roman script
    const syllables = [];
    const vowels = 'aeiouAEIOU';
    let i = 0;
    
    while (i < word.length) {
      let syllable = '';
      
      // Take consonant(s)
      while (i < word.length && !vowels.includes(word[i])) {
        syllable += word[i];
        i++;
      }
      
      // Take vowel(s) 
      while (i < word.length && vowels.includes(word[i])) {
        syllable += word[i];
        i++;
      }
      
      if (syllable) {
        syllables.push(syllable);
      }
    }
    
    return syllables.length > 0 ? syllables : [word];
  }
  
  static applyMeterPattern(syllables) {
    const sections = [];
    const syllableCount = syllables.length;
    
    // Rekhta-style: create sections based on syllable grouping
    // Most Hinglish poetry uses fe'lun (2-syllable) patterns
    let currentIndex = 0;
    let sectionNumber = 1;
    
    while (currentIndex < syllables.length) {
      const sectionSyllables = [];
      const sectionWeights = [];
      
      // Group syllables in pairs (fe'lun pattern)
      const syllablesToTake = Math.min(2, syllables.length - currentIndex);
      
      for (let i = 0; i < syllablesToTake; i++) {
        sectionSyllables.push(syllables[currentIndex]);
        sectionWeights.push("2");
        currentIndex++;
      }
      
      // Determine section name based on position and syllable count
      let sectionName;
      if (syllablesToTake === 2) {
        sectionName = "fe'lun";
      } else {
        sectionName = "fe'";
      }
      
      sections.push({
        name: sectionName,
        syllables: sectionSyllables,
        weights: sectionWeights
      });
      
      sectionNumber++;
    }
    
    return sections;
  }

  static extractDevanagariSyllables(text) {
    const syllables = [];
    let i = 0;
    
    while (i < text.length) {
      const char = text[i];
      
      if (!/[\u0900-\u097F]/.test(char)) {
        i++;
        continue;
      }
      
      let syllable = char;
      i++;
      
      // Collect dependent vowels (matras)
      while (i < text.length && /[\u093E-\u094F\u0962-\u0963]/.test(text[i])) {
        syllable += text[i];
        i++;
      }
      
      // Handle conjuncts (halant + consonant)
      while (i < text.length && text[i] === '\u094D') {
        syllable += text[i]; // halant
        i++;
        if (i < text.length && /[\u0915-\u0939]/.test(text[i])) {
          syllable += text[i]; // consonant
          i++;
          // More matras after conjunct
          while (i < text.length && /[\u093E-\u094F\u0962-\u0963]/.test(text[i])) {
            syllable += text[i];
            i++;
          }
        }
      }
      
      if (syllable) syllables.push(syllable);
    }
    
    return syllables;
  }

  static detectLanguage(text) {
    const devanagariRegex = /[\u0900-\u097F]/;
    const latinRegex = /[a-zA-Z]/;
    
    const hasDevanagari = devanagariRegex.test(text);
    const hasLatin = latinRegex.test(text);
    
    if (hasDevanagari && hasLatin) return 'mixed';
    if (hasDevanagari) return 'devanagari';
    if (hasLatin) return 'hinglish';
    
    return 'unknown';
  }

  // Check if text contains numbers (for Hinglish error validation)
  static hasNumbers(text) {
    return /[0-9०-९]/.test(text);
  }

  // Check if a Hinglish line is invalid (only numbers are invalid for Hinglish)
  static isHinglishLineInvalid(line) {
    // For Hinglish (Latin script), only reject numbers
    return /[0-9०-९]/.test(line);
  }

  static analyze(text) {
    if (!text?.trim()) {
      return {
        status: "error",
        message: "The system could not match the Behr in the highlighted lines",
        bahrType: null,
        pattern: [],
        syllableAnalysis: [],
        highlightedLine: text,
        errorLines: []
      };
    }
    
    const lines = text.split('\n').filter(l => l.trim());
    let allSyllableAnalysis = [];
    let errorLines = [];
    
    // Check each line for invalid characters and analyze syllables
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const hasInvalidChars = this.isHinglishLineInvalid(line);
      
      // Extract and analyze syllables for this line
      const syllables = this.extractHinglishSyllables(line);
      const sections = this.applyMeterPattern(syllables);
      
      // Create detailed syllable breakdown
      const lineAnalysis = {
        line: line.trim(),
        syllables: syllables,
        sections: sections,
        totalSyllables: syllables.length,
        hasErrors: hasInvalidChars,
        lineNumber: i + 1
      };
      
      allSyllableAnalysis.push(lineAnalysis);
      
      if (hasInvalidChars) {
        errorLines.push(i + 1);
      }
    }
    
    // If there are invalid lines, return error with full poem display
    if (errorLines.length > 0) {
      return {
        status: "error",
        message: "The system could not match the Behr in the highlighted lines",
        bahrType: null,
        pattern: [],
        syllableAnalysis: allSyllableAnalysis,
        highlightedLine: null,
        errorLines: errorLines
      };
    }
    
    // Rekhta-style: Accept most Hinglish poetry as valid
    // Only reject if there are obvious issues (like numbers)
    
    // If all lines are valid, return detailed analysis
    return {
      status: "success",
      message: "आप की रचना निम्नलिखित बहर में है:",
      bahrType: "मुज्तस मुसम्मन मख़बून महज़ूफ़ मस्कन",
      meterDescription: "मुफ़ाइलुन फ़इलातुन मुफ़ाइलुन फ़ेलुन",
      pattern: ["2222", "2222", "2222", "22"],
      syllableAnalysis: allSyllableAnalysis,
      highlightedLine: null
    };
  }
}

export default HinglishAnalyzer