// Classical Urdu/Hindi Bahr patterns
// Each bahr is a repeating pattern of 1 (short syllable) and 2 (long syllable)

export const BAHR_PATTERNS = {
  // Classical Arabic/Persian meters adapted for Hindi/Urdu
  "मुतकारिब": "21",           // fa'ilun
  "रमल": "212",              // fa'ilatun  
  "हज़ज": "212",             // maf'ulun fa'ilun
  "रजज़": "1221",            // mustaf'ilun
  "कामिल": "2122",           // mutafa'ilun
  "वाफ़िर": "1212",          // mufa'alatun
  "सरी": "2212",             // maf'ulatu mafa'ilun
  "मुंसरिह": "12212",        // mustaf'ilun maf'ulatu
  "खफ़ीफ़": "12122",         // fa'ilatun mustaf'ilun fa'ilun
  "मुज़ारि": "1212122",      // maf'ulun fa'ilatun maf'ulun fa'ilun
  "मुकतज़ब": "12221",        // maf'ulatu mustaf'ilun
  "मुजतस": "121221",        // mustaf'ilun fa'ilatun
  
  // Common Hindi/Urdu variations
  "मुतकारिब_महज़ूफ़": "21212121",        // fa'ilun fa'ilun fa'ilun fa'ilun
  "रमल_महज़ूफ़": "212121212",           // fa'ilatun fa'ilatun fa'ilun
  "रमल_सालिम": "21212121212",          // fa'ilatun fa'ilatun fa'ilatun
  "हज़ज_अख़रब": "212212212212",         // maf'ailun maf'ailun maf'ailun maf'ailun
  "कामिल_सालिम": "2122212221222122",   // mutafa'ilun mutafa'ilun mutafa'ilun mutafa'ilun
  
  // Popular Ghazal meters
  "बहर_ए_हज़ज_मुसम्मन": "212122212122",     // maf'ulun fa'ilatun maf'ulun fa'ilun
  "बहर_ए_रमल_मुसम्मन": "212121221212122",   // fa'ilatun maf'ailun fa'ilatun maf'ailun
  "बहर_ए_कामिल": "212221222122",           // mutafa'ilun mutafa'ilun
  
  // Modern Hindi adaptations
  "१६_मात्रिक": "2222222222222222",        // 16-matra meter
  "१८_मात्रिक": "222222222222222222",      // 18-matra meter  
  "२०_मात्रिक": "22222222222222222222",    // 20-matra meter
  "२२_मात्रिक": "2222222222222222222222",  // 22-matra meter
  
  // Flexible patterns for mixed meters
  "मिश्रित_छोटा": "2121",               // Short mixed pattern
  "मिश्रित_मध्यम": "212122",            // Medium mixed pattern  
  "मिश्रित_लंबा": "21212122212",        // Long mixed pattern
};

// Pattern descriptions in Urdu prosody terms
export const BAHR_DESCRIPTIONS = {
  "मुतकारिब": "फ़इलुन",
  "रमल": "फ़ाइलातुन", 
  "हज़ज": "मफ़ऊलुन फ़ाइलुन",
  "रजज़": "मुस्तफ़इलुन",
  "कामिल": "मुतफ़ाइलुन",
  "वाफ़िर": "मुफ़ाअलातुन",
  "सरी": "मफ़ऊलातु मफ़ाइलुन",
  "मुंसरिह": "मुस्तफ़इलुन मफ़ऊलातु",
  "खफ़ीफ़": "फ़ाइलातुन मुस्तफ़इलुन फ़इलुन",
  "मुज़ारि": "मफ़ऊलुन फ़ाइलातुन मफ़ऊलुन फ़इलुन",
  "मुकतज़ब": "मफ़ऊलातु मुस्तफ़इलुन",
  "मुजतस": "मुस्तफ़इलुन फ़ाइलातुन",
  
  "मुतकारिब_महज़ूफ़": "फ़इलुन फ़इलुन फ़इलुन फ़इलुन",
  "रमल_महज़ूफ़": "फ़ाइलातुन फ़ाइलातुन फ़इलुन", 
  "रमल_सालिम": "फ़ाइलातुन फ़ाइलातुन फ़ाइलातुन",
  "हज़ज_अख़रब": "मफ़ाइलुन मफ़ाइलुन मफ़ाइलुन मफ़ाइलुन",
  "कामिल_सालिम": "मुतफ़ाइलुन मुतफ़ाइलुन मुतफ़ाइलुन मुतफ़ाइलुन",
  
  "बहर_ए_हज़ज_मुसम्मन": "मफ़ऊलुन फ़ाइलातुन मफ़ऊलुन फ़इलुन",
  "बहर_ए_रमल_मुसम्मन": "फ़ाइलातुन मफ़ाइलुन फ़ाइलातुन मफ़ाइलुन",
  "बहर_ए_कामिल": "मुतफ़ाइलुन मुतफ़ाइलुन",
  
  "१६_मात्रिक": "सोलह मात्रा का छंद",
  "१८_मात्रिक": "अठारह मात्रा का छंद",
  "२०_मात्रिक": "बीस मात्रा का छंद", 
  "२२_मात्रिक": "बाईस मात्रा का छंद",
  
  "मिश्रित_छोटा": "छोटा मिश्रित छंद",
  "मिश्रित_मध्यम": "मध्यम मिश्रित छंद",
  "मिश्रित_लंबा": "लंबा मिश्रित छंद"
};

// Helper function to get pattern by matra count
export function getPatternsByMatraCount(matraCount) {
  const patterns = {};
  
  for (const [name, pattern] of Object.entries(BAHR_PATTERNS)) {
    const patternMatraCount = pattern.split('').reduce((sum, char) => sum + parseInt(char), 0);
    if (patternMatraCount === matraCount) {
      patterns[name] = {
        pattern: pattern,
        description: BAHR_DESCRIPTIONS[name] || "विशेष पैटर्न"
      };
    }
  }
  
  return patterns;
}

// Helper function to find closest patterns
export function findClosestPatterns(targetPattern, maxResults = 5) {
  const results = [];
  
  for (const [name, pattern] of Object.entries(BAHR_PATTERNS)) {
    const similarity = calculatePatternSimilarity(targetPattern, pattern);
    results.push({
      name,
      pattern,
      description: BAHR_DESCRIPTIONS[name] || "विशेष पैटर्न",
      similarity
    });
  }
  
  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxResults);
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
