export default class MeterPatterns {
  static commonPatterns = {
    // Common Urdu/Hindi meter patterns with both scripts
    mufailun: {
      name: "मुफ़ाइलुन",
      nameRoman: "mafa'ilun",
      pattern: [1, 2, 1, 2],
      weight: 6
    },
    failatun: {
      name: "फ़इलातुन", 
      nameRoman: "fai'latun",
      pattern: [1, 1, 2, 2],
      weight: 6
    },
    felun: {
      name: "फ़ेलुन",
      nameRoman: "fe'lun", 
      pattern: [2, 2],
      weight: 4
    },
    failun: {
      name: "फ़ाइलुन",
      nameRoman: "fa'ilun",
      pattern: [2, 1, 2],
      weight: 5
    },
    fe: {
      name: "फे़",
      nameRoman: "fe'",
      pattern: [2],
      weight: 2
    },
    mustafailun: {
      name: "मुस्तफ़ाइलुन",
      nameRoman: "mustafa'ilun", 
      pattern: [2, 1, 2, 1, 2],
      weight: 8
    }
  };

  // Get pattern name based on detected language
  static getPatternName(patternKey, language) {
    const pattern = this.commonPatterns[patternKey];
    if (!pattern) return patternKey;
    
    return (language === 'hinglish') ? pattern.nameRoman : pattern.name;
  }

  // Flexible pattern matching - allows for variations
  static matchPattern(weights, targetPattern, startIndex = 0) {
    if (startIndex + targetPattern.length > weights.length) return false;
    
    for (let i = 0; i < targetPattern.length; i++) {
      const actual = weights[startIndex + i];
      const expected = targetPattern[i];
      
      // Exact match preferred
      if (actual !== expected) {
        // Allow some flexibility for common variations
        if (expected === 2 && actual === 1) {
          // Check if we can combine with next syllable
          if (i + 1 < targetPattern.length && 
              startIndex + i + 1 < weights.length && 
              weights[startIndex + i + 1] === 1) {
            // Skip this check, will be handled in syllable combination
            continue;
          }
        }
        return false;
      }
    }
    return true;
  }

  // Create sections based on common meter patterns
  static createSections(syllables, weights, language = 'devanagari') {
    const sections = [];
    let currentIndex = 0;
    
    while (currentIndex < syllables.length) {
      let bestMatch = null;
      let bestLength = 0;
      let bestKey = null;
      
      // Try to find the longest matching pattern
      for (const [key, pattern] of Object.entries(this.commonPatterns)) {
        if (currentIndex + pattern.pattern.length <= weights.length) {
          if (this.matchPattern(weights, pattern.pattern, currentIndex)) {
            if (pattern.pattern.length > bestLength) {
              bestMatch = pattern;
              bestLength = pattern.pattern.length;
              bestKey = key;
            }
          }
        }
      }
      
      if (bestMatch) {
        // Found a matching pattern
        const sectionSyllables = [];
        const sectionWeights = [];
        
        for (let i = 0; i < bestMatch.pattern.length; i++) {
          sectionSyllables.push(syllables[currentIndex + i]);
          sectionWeights.push(weights[currentIndex + i]);
        }
        
        sections.push({
          name: this.getPatternName(bestKey, language),
          syllables: sectionSyllables,
          weights: sectionWeights,
          color: this.getColorForPattern(bestKey),
          isError: false
        });
        
        currentIndex += bestMatch.pattern.length;
      } else {
        // No pattern found - try to group remaining syllables sensibly
        let remainingCount = Math.min(2, syllables.length - currentIndex);
        const defaultPattern = remainingCount === 2 ? 'felun' : 'fe';
        
        const sectionSyllables = [];
        const sectionWeights = [];
        
        for (let i = 0; i < remainingCount; i++) {
          sectionSyllables.push(syllables[currentIndex + i]);
          sectionWeights.push(weights[currentIndex + i]);
        }
        
        sections.push({
          name: this.getPatternName(defaultPattern, language),
          syllables: sectionSyllables,
          weights: sectionWeights,
          color: this.getColorForPattern(defaultPattern),
          isError: false
        });
        
        currentIndex += remainingCount;
      }
    }
    
    return sections;
  }
  
  static getColorForPattern(patternKey) {
    const colors = {
      mufailun: "bg-blue-100",
      failatun: "bg-pink-100", 
      felun: "bg-gray-100",
      failun: "bg-green-100",
      fe: "bg-purple-100",
      mustafailun: "bg-yellow-100"
    };
    return colors[patternKey] || "bg-gray-100";
  }

  // Generate meter description
  static getMeterDescription(sections, language) {
    const patternNames = sections.map(section => section.name);
    const patternString = patternNames.join(' ');
    const weightPattern = sections.map(section => 
      section.weights.join('')
    ).join(' ');

    return {
      patternString,
      weightPattern,
      title: language === 'hinglish' ? 
        'Your composition follows this meter:' : 
        'आप की रचना निम्नलिखित बहर में है:'
    };
  }
}