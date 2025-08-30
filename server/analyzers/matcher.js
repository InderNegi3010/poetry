// Pattern matching logic for Taqti analysis
import { BAHR_PATTERNS, BAHR_DESCRIPTIONS, findClosestPatterns, getPatternsByMatraCount } from "./bahrPatterns.js";

// Match a line pattern against known Bahr patterns
export function matchPattern(linePattern) {
  if (!linePattern || linePattern.length === 0) {
    return ["No pattern found"];
  }
  
  const patternString = Array.isArray(linePattern) ? linePattern.join("") : linePattern;
  const matraCount = patternString.split('').reduce((sum, char) => sum + parseInt(char), 0);
  
  let matches = [];
  
  // 1. Try exact pattern match
  const exactMatches = findExactMatches(patternString);
  if (exactMatches.length > 0) {
    matches = exactMatches;
  }
  
  // 2. Try repeating pattern match (e.g., "2121" might repeat as "21212121")
  else {
    const repeatingMatches = findRepeatingMatches(patternString);
    if (repeatingMatches.length > 0) {
      matches = repeatingMatches;
    }
  }
  
  // 3. Try partial pattern match (pattern contains the line pattern)
  if (matches.length === 0) {
    const partialMatches = findPartialMatches(patternString);
    if (partialMatches.length > 0) {
      matches = partialMatches;
    }
  }
  
  // 4. Try matra-based matching
  if (matches.length === 0) {
    const matraMatches = findMatraBasedMatches(matraCount, patternString);
    if (matraMatches.length > 0) {
      matches = matraMatches;
    }
  }
  
  // 5. Try fuzzy matching for close patterns
  if (matches.length === 0) {
    const fuzzyMatches = findFuzzyMatches(patternString);
    if (fuzzyMatches.length > 0) {
      matches = fuzzyMatches;
    }
  }
  
  // 6. Fallback to generic classification
  if (matches.length === 0) {
    matches = [getGenericClassification(matraCount, patternString)];
  }
  
  return matches;
}

// Find exact pattern matches
function findExactMatches(patternString) {
  const matches = [];
  
  for (const [bahrName, bahrPattern] of Object.entries(BAHR_PATTERNS)) {
    if (bahrPattern === patternString) {
      matches.push({
        name: bahrName,
        pattern: bahrPattern,
        description: BAHR_DESCRIPTIONS[bahrName] || "विशेष पैटर्न",
        matchType: "exact",
        confidence: 1.0
      });
    }
  }
  
  return matches;
}

// Find repeating pattern matches
function findRepeatingMatches(patternString) {
  const matches = [];
  
  for (const [bahrName, bahrPattern] of Object.entries(BAHR_PATTERNS)) {
    // Check if the line pattern is a repetition of the bahr pattern
    if (isRepeatingPattern(patternString, bahrPattern)) {
      matches.push({
        name: bahrName + " (पुनरावृत्ति)",
        pattern: bahrPattern,
        description: BAHR_DESCRIPTIONS[bahrName] || "विशेष पैटर्न",
        matchType: "repeating",
        confidence: 0.9
      });
    }
    
    // Check if the bahr pattern contains the line pattern as repetition
    if (isRepeatingPattern(bahrPattern, patternString)) {
      matches.push({
        name: bahrName + " (आंशिक)",
        pattern: bahrPattern,
        description: BAHR_DESCRIPTIONS[bahrName] || "विशेष पैटर्न",
        matchType: "partial_repeating",
        confidence: 0.85
      });
    }
  }
  
  return matches;
}

// Check if pattern1 is made by repeating pattern2
function isRepeatingPattern(pattern1, pattern2) {
  if (pattern1.length <= pattern2.length) return false;
  if (pattern1.length % pattern2.length !== 0) return false;
  
  const repetitions = pattern1.length / pattern2.length;
  const expectedPattern = pattern2.repeat(repetitions);
  
  return pattern1 === expectedPattern;
}

// Find partial pattern matches (bahr pattern contains line pattern)
function findPartialMatches(patternString) {
  const matches = [];
  
  for (const [bahrName, bahrPattern] of Object.entries(BAHR_PATTERNS)) {
    if (bahrPattern.includes(patternString)) {
      const confidence = patternString.length / bahrPattern.length;
      matches.push({
        name: bahrName + " (आंशिक मिलान)",
        pattern: bahrPattern,
        description: BAHR_DESCRIPTIONS[bahrName] || "विशेष पैटर्न",
        matchType: "partial",
        confidence: confidence * 0.8
      });
    }
  }
  
  return matches.sort((a, b) => b.confidence - a.confidence);
}

// Find matches based on matra count
function findMatraBasedMatches(matraCount, patternString) {
  const matches = [];
  const patternsWithSameMatras = getPatternsByMatraCount(matraCount);
  
  for (const [name, info] of Object.entries(patternsWithSameMatras)) {
    const similarity = calculatePatternSimilarity(patternString, info.pattern);
    if (similarity > 0.6) {
      matches.push({
        name: name + " (मात्रा आधारित)",
        pattern: info.pattern,
        description: info.description,
        matchType: "matra_based",
        confidence: similarity * 0.7
      });
    }
  }
  
  return matches.sort((a, b) => b.confidence - a.confidence);
}

// Find fuzzy matches using similarity
function findFuzzyMatches(patternString, threshold = 0.7) {
  const matches = [];
  
  for (const [bahrName, bahrPattern] of Object.entries(BAHR_PATTERNS)) {
    const similarity = calculatePatternSimilarity(patternString, bahrPattern);
    if (similarity >= threshold) {
      matches.push({
        name: bahrName + " (समान पैटर्न)",
        pattern: bahrPattern,
        description: BAHR_DESCRIPTIONS[bahrName] || "विशेष पैटर्न",
        matchType: "fuzzy",
        confidence: similarity * 0.6
      });
    }
  }
  
  return matches.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
}

// Calculate similarity between two patterns
function calculatePatternSimilarity(pattern1, pattern2) {
  const minLen = Math.min(pattern1.length, pattern2.length);
  const maxLen = Math.max(pattern1.length, pattern2.length);
  let matches = 0;
  
  for (let i = 0; i < minLen; i++) {
    if (pattern1[i] === pattern2[i]) {
      matches++;
    }
  }
  
  // Penalize length differences
  const lengthPenalty = (maxLen - minLen) / maxLen;
  return (matches / maxLen) * (1 - lengthPenalty);
}

// Get generic classification when no specific match found
function getGenericClassification(matraCount, patternString) {
  let classification = "";
  let description = "";
  
  if (matraCount <= 8) {
    classification = "लघु छंद";
    description = "छोटा छंद पैटर्न";
  } else if (matraCount <= 16) {
    classification = "मध्यम छंद";
    description = "मध्यम लंबाई का छंद";
  } else if (matraCount <= 24) {
    classification = "दीर्घ छंद";
    description = "लंबा छंद पैटर्न";
  } else {
    classification = "अति दीर्घ छंद";
    description = "बहुत लंबा छंद पैटर्न";
  }
  
  return {
    name: `${classification} (${matraCount} मात्रा)`,
    pattern: patternString,
    description: description,
    matchType: "generic",
    confidence: 0.5
  };
}

// Analyze consistency across multiple lines
export function analyzeConsistency(linePatterns) {
  if (!linePatterns || linePatterns.length === 0) {
    return {
      isConsistent: false,
      commonPattern: null,
      variations: []
    };
  }
  
  if (linePatterns.length === 1) {
    return {
      isConsistent: true,
      commonPattern: linePatterns[0],
      variations: []
    };
  }
  
  // Count pattern frequencies
  const patternCounts = {};
  const matraCounts = {};
  
  for (const pattern of linePatterns) {
    const patternStr = Array.isArray(pattern) ? pattern.join("") : pattern;
    const matraCount = patternStr.split('').reduce((sum, char) => sum + parseInt(char), 0);
    
    patternCounts[patternStr] = (patternCounts[patternStr] || 0) + 1;
    matraCounts[matraCount] = (matraCounts[matraCount] || 0) + 1;
  }
  
  // Find most common pattern and matra count
  const mostCommonPattern = Object.keys(patternCounts).reduce((a, b) => 
    patternCounts[a] > patternCounts[b] ? a : b
  );
  
  const mostCommonMatraCount = Object.keys(matraCounts).reduce((a, b) => 
    matraCounts[a] > matraCounts[b] ? a : b
  );
  
  // Check if all patterns are the same
  const isExactlyConsistent = Object.keys(patternCounts).length === 1;
  
  // Check if all have same matra count
  const isMatraConsistent = Object.keys(matraCounts).length === 1;
  
  return {
    isConsistent: isExactlyConsistent,
    isMatraConsistent: isMatraConsistent,
    commonPattern: mostCommonPattern,
    commonMatraCount: parseInt(mostCommonMatraCount),
    patternFrequency: patternCounts,
    variations: Object.keys(patternCounts).filter(p => p !== mostCommonPattern)
  };
}
