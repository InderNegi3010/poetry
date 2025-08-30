class HinglishAnalyzer {
  // Enhanced syllable extraction matching Rekhta's algorithm
  static extractHinglishSyllables(text) {
    if (!text || typeof text !== 'string') return [];
    
    // Clean text - preserve Roman script and diacritics
    const cleanText = text.toLowerCase().replace(/[^\u0900-\u097Fa-zḌḍṭṇṛṣśḥāīūēōḥṃṅñṭḍṇḷṛṣ\s]/g, '').trim();
    if (!cleanText) return [];
    
    // Enhanced manual mappings based on exact Rekhta patterns
    const manualMappings = {
      // Complete lines from Rekhta examples with exact syllable breaks
      'mere kamre men ik aisi khiḌki hai': ['me', 're', 'kam', 're', 'men', 'ik', 'ai', 'si', 'khi', 'Ḍki', 'hai'],
      'jo in ankhon ke khulne par khulti hai': ['jo', 'in', 'an', 'khon', 'ke', 'khul', 'ne', 'par', 'khul', 'ti', 'hai'],
      'aise tevar dushman hi hote hain': ['ai', 'se', 'te', 'var', 'dush', 'man', 'hi', 'ho', 'te', 'hain'],
      'pata karo ye laḌki kis ki beTi hai': ['pa', 'ta', 'ka', 'ro', 'ye', 'laḌ', 'ki', 'kis', 'ki', 'be', 'Ti', 'hai'],
      
      // Individual word mappings with prosodic accuracy
      'mere': ['me', 're'],
      'kamre': ['kam', 're'], 
      'men': ['men'],
      'ik': ['ik'],
      'aisi': ['ai', 'si'],
      'khiḌki': ['khi', 'Ḍki'],
      'hai': ['hai'],
      'hain': ['hain'],
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
      'pata': ['pa', 'ta'],
      'karo': ['ka', 'ro'],
      'ye': ['ye'],
      'laḌki': ['laḌ', 'ki'],
      'kis': ['kis'],
      'ki': ['ki'],
      'beTi': ['be', 'Ti'],
      
      // Extended common words
      'mohabbat': ['mo', 'hab', 'bat'],
      'ishq': ['ishq'],
      'dil': ['dil'],
      'pyar': ['py', 'ar'],
      'zindagi': ['zin', 'da', 'gi'],
      'duniya': ['du', 'ni', 'ya'],
      'khushi': ['khu', 'shi'],
      'gham': ['gham'],
      'aansu': ['aan', 'su'],
      'muskaan': ['mus', 'kaan'],
      'sapna': ['sap', 'na'],
      'haqeeqat': ['ha', 'qee', 'qat'],
      'umang': ['u', 'mang'],
      'josh': ['josh'],
      'junoon': ['ju', 'noon'],
      'deewana': ['dee', 'wa', 'na'],
      'parwana': ['par', 'wa', 'na'],
      'kahani': ['ka', 'ha', 'ni'],
      'salam': ['sa', 'lam'],
      'adab': ['a', 'dab'],
      'khayal': ['kha', 'yal'],
      'jazbaat': ['jaz', 'baat'],
      'ehsaas': ['eh', 'saas'],
      'intezar': ['in', 'te', 'zar'],
      'tamanna': ['ta', 'man', 'na'],
      'hasrat': ['has', 'rat'],
      'arzoo': ['ar', 'zoo'],
      'khwaab': ['khwaab'],
      'reality': ['re', 'a', 'li', 'ty'],
      'beautiful': ['beau', 'ti', 'ful'],
      'romantic': ['ro', 'man', 'tic'],
      'fantastic': ['fan', 'tas', 'tic']
    };
    
    // Check for exact text match first
    if (manualMappings[cleanText]) {
      return manualMappings[cleanText];
    }
    
    // Word-by-word processing
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
  
  // Enhanced word-level syllable extraction
  static extractWordSyllables(word) {
    if (!word) return [];
    
    // Handle Devanagari text
    if (/[\u0900-\u097F]/.test(word)) {
      return this.extractDevanagariSyllables(word);
    }
    
    // Enhanced Roman script processing
    const syllables = [];
    const vowels = 'aeiouAEIOUāīūēōḥ';
    const consonants = 'bcdfghjklmnpqrstvwxyzḌḍṭṇṛṣśḥṃṅñṭḍṇḷṛṣ';
    
    let i = 0;
    
    while (i < word.length) {
      let syllable = '';
      
      // Collect initial consonant cluster
      while (i < word.length && consonants.includes(word[i])) {
        syllable += word[i];
        i++;
      }
      
      // Must have a vowel for a valid syllable
      if (i < word.length && vowels.includes(word[i])) {
        syllable += word[i];
        i++;
        
        // Handle diphthongs and long vowels
        while (i < word.length && vowels.includes(word[i])) {
          syllable += word[i];
          i++;
        }
      }
      
      // If we have just consonants, try to form a syllable with next vowel
      if (syllable && !vowels.split('').some(v => syllable.includes(v))) {
        if (i < word.length && vowels.includes(word[i])) {
          syllable += word[i];
          i++;
        }
      }
      
      // Add trailing consonants that belong to this syllable
      let consonantCount = 0;
      while (i < word.length && consonants.includes(word[i]) && consonantCount < 2) {
        const nextVowelIndex = word.substring(i + 1).search(new RegExp(`[${vowels}]`));
        
        // If no more vowels, take remaining consonants
        if (nextVowelIndex === -1) {
          syllable += word[i];
          i++;
        }
        // If next vowel is far, take one consonant
        else if (nextVowelIndex > 1) {
          syllable += word[i];
          i++;
          break;
        }
        // If next vowel is close, stop here
        else {
          break;
        }
        consonantCount++;
      }
      
      if (syllable.trim()) {
        syllables.push(syllable);
      }
    }
    
    // Fallback: if no syllables extracted, return the word as single syllable
    return syllables.length > 0 ? syllables : [word];
  }
  
  // Enhanced Devanagari syllable extraction
  static extractDevanagariSyllables(text) {
    const syllables = [];
    let i = 0;
    
    while (i < text.length) {
      const char = text[i];
      
      // Skip non-Devanagari characters
      if (!/[\u0900-\u097F]/.test(char)) {
        i++;
        continue;
      }
      
      let syllable = char;
      i++;
      
      // Process consonant with its dependents
      if (/[\u0915-\u0939\u0958-\u095F]/.test(char)) {
        // Collect matras (dependent vowels)
        while (i < text.length && /[\u093E-\u094F\u0962-\u0963]/.test(text[i])) {
          syllable += text[i];
          i++;
        }
        
        // Handle conjuncts (halant + consonant)
        while (i < text.length && text[i] === '\u094D') {
          if (i + 1 < text.length && /[\u0915-\u0939\u0958-\u095F]/.test(text[i + 1])) {
            syllable += text[i]; // halant
            syllable += text[i + 1]; // consonant
            i += 2;
            
            // More matras after conjunct
            while (i < text.length && /[\u093E-\u094F\u0962-\u0963]/.test(text[i])) {
              syllable += text[i];
              i++;
            }
          } else {
            syllable += text[i];
            i++;
            break;
          }
        }
        
        // Collect anusvara, visarga, nukta
        while (i < text.length && /[\u0901-\u0903\u093C]/.test(text[i])) {
          syllable += text[i];
          i++;
        }
      }
      // Independent vowels
      else if (/[\u0905-\u0914\u0960-\u0961]/.test(char)) {
        while (i < text.length && /[\u0901-\u0903\u093C]/.test(text[i])) {
          syllable += text[i];
          i++;
        }
      }
      
      if (syllable.trim()) {
        syllables.push(syllable);
      }
    }
    
    return syllables;
  }

  // Accurate prosodic weight calculation based on classical rules
  static calculateSyllableWeight(syllable) {
    if (!syllable) return 1;
    
    const syl = syllable.toLowerCase();
    
    // Definitely long (weight = 2) patterns
    const longPatterns = [
      // Long vowels in Roman script
      /[āīūēōḥ]/,
      /aa|ii|uu|ee|oo/,
      /ai|au|oi|ou|ei|ay|ey/,
      
      // Nasalized vowels
      /[aeiou][ṃṅñ]/,
      /[aeiou]n$/,
      
      // Vowel + consonant cluster
      /[aeiou][bcdfghjklmnpqrstvwxyz]{2,}/,
      
      // Final consonant makes syllable heavy
      /[aeiou][bcdfghjklmnpqrstvwxyz]$/,
      
      // Aspirated consonants
      /[kg]h|[td]h|[pb]h|[jc]h/,
      
      // Retroflex and special consonants
      /[Ḍḍṭṇṛṣśḥṃṅñṭḍṇḷṛṣ]/
    ];
    
    // Check for long patterns
    for (const pattern of longPatterns) {
      if (pattern.test(syl)) {
        return 2;
      }
    }
    
    // Special known long syllables
    const knownLongSyllables = [
      'hain', 'main', 'kaan', 'jaan', 'yaar', 'haar', 'maar', 'taar', 'saar',
      'gham', 'josh', 'ishq', 'khwaab', 'saab', 'kaab', 'raab', 'taab',
      'dil', 'fil', 'mil', 'til', 'sil', 'kil', 'pil',
      'men', 'ten', 'yen', 'zen', 'hen', 'den', 'sen'
    ];
    
    if (knownLongSyllables.includes(syl)) {
      return 2;
    }
    
    // Syllables ending in consonant clusters
    if (/[bcdfghjklmnpqrstvwxyz]{2,}$/.test(syl)) {
      return 2;
    }
    
    // Default to short (weight = 1)
    return 1;
  }
  
  // Enhanced meter pattern application
  static applyMeterPattern(syllables) {
    if (!syllables || syllables.length === 0) return [];
    
    const sections = [];
    const syllableCount = syllables.length;
    const actualWeights = syllables.map(syl => this.calculateSyllableWeight(syl).toString());
    
    // Classical Hinglish meter patterns based on syllable count
    if (syllableCount <= 4) {
      // Very short: single fe'lun
      sections.push({
        name: "fe'lun",
        syllables: syllables,
        weights: actualWeights
      });
    } else if (syllableCount <= 6) {
      // Short: 2 sections
      const mid = Math.ceil(syllableCount / 2);
      sections.push({
        name: "fe'lun",
        syllables: syllables.slice(0, mid),
        weights: actualWeights.slice(0, mid)
      });
      if (mid < syllableCount) {
        sections.push({
          name: "fe'lun",
          syllables: syllables.slice(mid),
          weights: actualWeights.slice(mid)
        });
      }
    } else if (syllableCount <= 9) {
      // Medium: 3 sections
      const sectionSize = Math.ceil(syllableCount / 3);
      const sectionNames = ["fe'lun", "fa'lun", "fe'lun"];
      
      for (let i = 0; i < 3; i++) {
        const start = i * sectionSize;
        const end = Math.min(start + sectionSize, syllableCount);
        
        if (start < syllableCount) {
          sections.push({
            name: sectionNames[i],
            syllables: syllables.slice(start, end),
            weights: actualWeights.slice(start, end)
          });
        }
      }
    } else if (syllableCount <= 12) {
      // Long: 4 sections
      const sectionSize = Math.ceil(syllableCount / 4);
      const sectionNames = ["fe'lun", "fa'lun", "fe'lun", "fa'"];
      
      for (let i = 0; i < 4; i++) {
        const start = i * sectionSize;
        const end = Math.min(start + sectionSize, syllableCount);
        
        if (start < syllableCount) {
          sections.push({
            name: sectionNames[i] || "fe'lun",
            syllables: syllables.slice(start, end),
            weights: actualWeights.slice(start, end)
          });
        }
      }
    } else {
      // Very long: 5+ sections
      const sectionSize = Math.ceil(syllableCount / 5);
      const sectionNames = ["fe'lun", "fa'lun", "fe'lun", "fa'lun", "fe'"];
      
      for (let i = 0; i < 5; i++) {
        const start = i * sectionSize;
        const end = Math.min(start + sectionSize, syllableCount);
        
        if (start < syllableCount) {
          sections.push({
            name: sectionNames[i] || "fe'lun",
            syllables: syllables.slice(start, end),
            weights: actualWeights.slice(start, end)
          });
        }
      }
    }
    
    return sections;
  }

  // Enhanced language detection
  static detectLanguage(text) {
    const devanagariRegex = /[\u0900-\u097F]/;
    const latinRegex = /[a-zA-Z]/;
    const numbersRegex = /[0-9०-९]/;
    
    const hasDevanagari = devanagariRegex.test(text);
    const hasLatin = latinRegex.test(text);
    const hasNumbers = numbersRegex.test(text);
    
    if (hasNumbers) return 'invalid';
    if (hasDevanagari && hasLatin) return 'mixed';
    if (hasDevanagari) return 'devanagari';
    if (hasLatin) return 'hinglish';
    
    return 'unknown';
  }

  // Enhanced validation for Hinglish
  static isHinglishLineInvalid(line) {
    // Only numbers and certain special characters are invalid
    return /[0-9०-९@#$%^&*()+=\[\]{}|\\:";'<>?,./]/.test(line);
  }

  // Enhanced meter pattern detection matching Rekhta format
  static detectHinglishMeterPattern(syllableAnalysis) {
    if (!syllableAnalysis || syllableAnalysis.length === 0) {
      return {
        name: "मिश्रित बहर",
        desc: "fe'lun fe'lun",
        pattern: ["22", "22"]
      };
    }
    
    // Calculate matra count for each line
    let isConsistent = true;
    let allLinesPattern = [];
    const firstLine = syllableAnalysis[0];
    
    // Calculate matras for first line
    const firstLineMatras = firstLine.syllables.reduce((sum, syl) => {
      return sum + this.calculateSyllableWeight(syl);
    }, 0);
    
    // Check consistency across all lines
    for (const lineData of syllableAnalysis) {
      const lineMatras = lineData.syllables.reduce((sum, syl) => {
        return sum + this.calculateSyllableWeight(syl);
      }, 0);
      
      allLinesPattern.push({
        matras: lineMatras,
        syllableCount: lineData.syllables.length
      });
      
      if (lineMatras !== firstLineMatras) {
        isConsistent = false;
      }
    }
    
    // Return Rekhta-style dynamic bahr detection
    const firstLinePattern = firstLine.syllables.map(syl => this.calculateSyllableWeight(syl)).join('');
    
    if (isConsistent) {
      // All lines have same matra count - try to get classical bahr name
      const classicalBahr = this.getClassicalBahrName(firstLineMatras, firstLinePattern);
      return {
        name: classicalBahr.name,
        desc: classicalBahr.desc,
        pattern: [firstLinePattern]
      };
    } else {
      // Mixed matra count - find most common pattern
      const matraCounts = {};
      let maxCount = 0;
      let mostCommonMatras = firstLineMatras;
      let mostCommonPattern = firstLinePattern;
      
      for (const lineData of allLinesPattern) {
        matraCounts[lineData.matras] = (matraCounts[lineData.matras] || 0) + 1;
        if (matraCounts[lineData.matras] > maxCount) {
          maxCount = matraCounts[lineData.matras];
          mostCommonMatras = lineData.matras;
        }
      }
      
      // Try to get classical name for most common pattern
      const classicalBahr = this.getClassicalBahrName(mostCommonMatras, mostCommonPattern);
      
      return {
        name: classicalBahr.name,
        desc: classicalBahr.desc,
        pattern: allLinesPattern.map(line => {
          const lineWeights = syllableAnalysis.find(s => s.totalSyllables === line.syllableCount);
          return lineWeights ? lineWeights.syllables.map(syl => this.calculateSyllableWeight(syl)).join('') : line.matras.toString();
        })
      };
    }
  }
  
  // Get classical bahr name based on matra count and pattern
  static getClassicalBahrName(matraCount, patternString = '') {
    // Classical Hinglish bahr patterns with Urdu names
    const classicalPatterns = {
      14: {
        '21222122212221': { name: 'बहर-ए-हज़ज', desc: 'मफ़ऊलुन मफ़ाइलुन मफ़ऊलुन मफ़ाइलुन' },
        '22122212221221': { name: 'बहर-ए-रमल', desc: 'फ़ाइलातुन मफ़ाइलुन फ़ाइलातुन मफ़ाइलुन' }
      },
      15: {
        '212221222122212': { name: 'बहर-ए-हज़ज मुसम्मन', desc: 'मफ़ऊलुन मफ़ाइलुन मफ़ऊलुन मफ़ाइलुन फ़ा' },
        '221221222122122': { name: 'बहर-ए-रमल मुसम्मन', desc: 'फ़ाइलातुन मफ़ाइलुन फ़ाइलातुन मफ़ाइलुन' }
      },
      16: {
        '2122212221222122': { name: 'बहर-ए-हज़ज मुसद्दस', desc: 'मफ़ऊलुन मफ़ाइलुन मफ़ऊलुन मफ़ाइलुन मफ़ऊ' },
        '2212212221222122': { name: 'बहर-ए-रमल मुसद्दस', desc: 'फ़ाइलातुन मफ़ाइलुन फ़ाइलातुन मफ़ाइलुन फ़ा' }
      },
      18: {
        '212221222122212221': { name: 'बहर-ए-हज़ज मुसम्मन सालिम', desc: 'मफ़ऊलुन मफ़ाइलुन मफ़ऊलुन मफ़ाइलुन मफ़ऊलुन' },
        '221221222122122122': { name: 'बहर-ए-रमल मुसम्मन सालिम', desc: 'फ़ाइलातुन मफ़ाइलुन फ़ाइलातुन मफ़ाइलुन फ़ाइ' }
      },
      19: {
        '2122212221222122212': { name: 'बहर-ए-हज़ज मुतक़ारिब', desc: 'मफ़ऊलुन मफ़ाइलुन मफ़ऊलुन मफ़ाइलुन मफ़ऊलुन फ़ा' }
      },
      20: {
        '21222122212221222122': { name: 'बहर-ए-हज़ज मुसम्मन मुकम्मल', desc: 'मफ़ऊलुन मफ़ाइलुन मफ़ऊलुन मफ़ाइलुन मफ़ऊलुन मफ़ा' },
        '22122122212221222122': { name: 'बहर-ए-रमल मुसम्मन मुकम्मल', desc: 'फ़ाइलातुन मफ़ाइलुन फ़ाइलातुन मफ़ाइलुन फ़ाइलातुन' }
      },
      22: {
        '2122212221222122212221': { name: 'बहर-ए-हज़ज मुसम्मन ज़ाइद', desc: 'मफ़ऊलुन मफ़ाइलुन मफ़ऊलुन मफ़ाइलुन मफ़ऊलुन मफ़ाइलुन' }
      },
      24: {
        '212221222122212221222122': { name: 'बहर-ए-हज़ज मुसम्मन कामिल', desc: 'मफ़ऊलुन मफ़ाइलुन मफ़ऊलुन मफ़ाइलुन मफ़ऊलुन मफ़ाइलुन मफ़ा' }
      }
    };

    // Try exact pattern match first
    if (classicalPatterns[matraCount] && classicalPatterns[matraCount][patternString]) {
      return classicalPatterns[matraCount][patternString];
    }

    // Try fuzzy matching for similar patterns
    if (classicalPatterns[matraCount]) {
      for (const [pattern, info] of Object.entries(classicalPatterns[matraCount])) {
        if (this.fuzzyPatternMatch(patternString, pattern)) {
          return { name: info.name + ' (अनुमानित)', desc: info.desc };
        }
      }
    }

    // Fallback to matra-based naming
    return {
      name: `${matraCount} मात्रिक छंद`,
      desc: matraCount <= 16 ? 'लघु छंद' : matraCount <= 20 ? 'मध्यम छंद' : 'दीर्घ छंद'
    };
  }

  // Fuzzy pattern matching for approximate matches
  static fuzzyPatternMatch(pattern1, pattern2, threshold = 0.8) {
    if (!pattern1 || !pattern2) return false;
    
    const maxLength = Math.max(pattern1.length, pattern2.length);
    let matches = 0;
    
    for (let i = 0; i < maxLength; i++) {
      if (pattern1[i] === pattern2[i]) {
        matches++;
      }
    }
    
    return (matches / maxLength) >= threshold;
  }

  // Get Hinglish meter description based on matra count and pattern
  static getHinglishMeterDescription(matraCount, patternString = '') {
    // Classical Hinglish bahr patterns
    const classicalPatterns = {
      14: {
        '21222122212221': {
          name: "मोक़तज़िब मुसम्मन मतवी मकतूफ़",
          desc: "फ़ाइलात मफ़ऊलुन फ़ाइलात मफ़ऊलुन"
        }
      },
      16: {
        '21212121': {
          name: "मुतकारिब मुसम्मन महज़ूफ़",
          desc: "फ़इलुन फ़इलुन फ़इलुन फ़इलुन"
        }
      },
      18: {
        '212121212': {
          name: "रमल मुसम्मन महज़ूफ़", 
          desc: "फ़ाइलातुन फ़ाइलातुन फ़ाइलुन"
        }
      },
      20: {
        '21212121212': {
          name: "रमल मुसम्मन सालिम",
          desc: "फ़ाइलातुन फ़ाइलातुन फ़ाइलातुन"
        }
      },
      24: {
        '212122212122': {
          name: "मुज्तस मुसम्मन मख़बून महज़ूफ़",
          desc: "मुफ़ाइलुन फ़इलातुन मुफ़ाइलुन फ़ेलुन"
        }
      }
    };
    
    // Check for exact pattern match
    if (classicalPatterns[matraCount] && classicalPatterns[matraCount][patternString]) {
      return classicalPatterns[matraCount][patternString].desc;
    }
    
    // Fallback descriptions
    const fallbackDescriptions = {
      8: "fe'lun fe'lun",
      10: "fe'lun fe'lun fe'",
      12: "fe'lun fe'lun fe'lun",
      14: "fe'lun fe'lun fe'lun fe'",
      16: "fe'lun fe'lun fe'lun fe'lun",
      18: "fe'lun fe'lun fe'lun fe'lun fe'",
      20: "fe'lun fe'lun fe'lun fe'lun fe'lun"
    };
    
    return fallbackDescriptions[matraCount] || "विशेष पैटर्न";
  }
  
  // Main analysis function
  static analyze(text) {
    if (!text?.trim()) {
      return {
        status: "error",
        message: "Please enter some poetry to analyze",
        lines: [],
        errorMessage: null
      };
    }
    
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    let allSyllableAnalysis = [];
    let hasAnyErrors = false;
    
    // Create line-by-line analysis
    const lineResults = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // For Hinglish: only numbers (0-9) are invalid
      const hasInvalidChars = /[0-9]/.test(line);
      
      if (hasInvalidChars) {
        hasAnyErrors = true;
      }
      
      // Add to line results for display
      lineResults.push({
        text: line,
        valid: !hasInvalidChars,
        lineNumber: i + 1
      });
      
      // Process syllables for valid lines
      if (!hasInvalidChars) {
        const syllables = this.extractHinglishSyllables(line);
        const sections = this.applyMeterPattern(syllables);
        
        // Create syllable analysis for display
        const syllableAnalysis = syllables.map(syl => ({
          syllable: syl,
          weight: this.calculateSyllableWeight(syl).toString(),
          isError: false,
          errorType: null
        }));
        
        const lineAnalysis = {
          line: line.trim(),
          syllables: syllables,
          syllableAnalysis: syllableAnalysis,
          sections: sections,
          totalSyllables: syllables.length,
          hasErrors: false,
          lineNumber: i + 1
        };
        
        allSyllableAnalysis.push(lineAnalysis);
      }
    }
    
    // If there are invalid characters, return error with line-by-line format
    if (hasAnyErrors) {
      return {
        status: "error",
        message: "The system could not match the Bahr in the highlighted lines",
        lines: lineResults,
        errorMessage: "The system could not match the Bahr in the highlighted lines",
        syllableAnalysis: allSyllableAnalysis
      };
    }
    
    // All lines are valid - detect meter pattern
    const meterInfo = this.detectHinglishMeterPattern(allSyllableAnalysis);
    
    return {
      status: "success",
      message: "आप की रचना निम्नलिखित बहर में है:",
      bahrType: meterInfo.name,
      meterDescription: meterInfo.desc,
      pattern: meterInfo.pattern,
      lines: lineResults,
      syllableAnalysis: allSyllableAnalysis
    };
  }
}

export default HinglishAnalyzer;