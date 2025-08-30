// Main Taqti (meter analysis) engine
// Combines syllable parsing and pattern matching for comprehensive poetry analysis

import { parseLine, getSyllablePattern, getSyllableWeight } from "./syllableParser.js";
import { matchPattern, analyzeConsistency } from "./matcher.js";

// Analyze a complete poem
export function analyzePoem(poem) {
  if (!poem || typeof poem !== 'string') {
    return {
      error: "Invalid input: poem must be a non-empty string",
      lines: []
    };
  }

  const lines = poem.split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    return {
      error: "No valid lines found in the poem",
      lines: []
    };
  }

  const lineAnalyses = [];
  const allPatterns = [];

  // Analyze each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const analysis = analyzeLine(line, i + 1);
    lineAnalyses.push(analysis);
    
    if (analysis.syllablePattern) {
      allPatterns.push(analysis.syllablePattern);
    }
  }

  // Analyze overall consistency
  const consistencyAnalysis = analyzeConsistency(allPatterns);
  
  // Find the best overall meter match
  const overallMeter = findOverallMeter(lineAnalyses, consistencyAnalysis);

  return {
    lines: lineAnalyses,
    overallMeter: overallMeter,
    consistency: consistencyAnalysis,
    totalLines: lines.length,
    averageMatras: calculateAverageMatras(lineAnalyses),
    isConsistent: consistencyAnalysis.isConsistent
  };
}

// Analyze a single line
export function analyzeLine(line, lineNumber = 1) {
  if (!line || typeof line !== 'string') {
    return {
      error: "Invalid line input",
      lineNumber: lineNumber
    };
  }

  const cleanLine = line.trim();
  if (cleanLine.length === 0) {
    return {
      error: "Empty line",
      lineNumber: lineNumber
    };
  }

  // Parse syllables
  const syllables = parseLine(cleanLine);
  
  if (syllables.length === 0) {
    return {
      line: cleanLine,
      lineNumber: lineNumber,
      error: "Could not extract syllables",
      syllables: [],
      syllableWeights: [],
      syllablePattern: "",
      totalMatras: 0,
      matches: []
    };
  }

  // Calculate weights and pattern
  const syllableWeights = syllables.map(getSyllableWeight);
  const syllablePattern = getSyllablePattern(syllables);
  const totalMatras = syllableWeights.reduce((sum, weight) => sum + weight, 0);

  // Find pattern matches
  const matches = matchPattern(syllablePattern);

  // Create detailed syllable analysis
  const syllableAnalysis = syllables.map((syllable, index) => ({
    syllable: syllable,
    weight: syllableWeights[index],
    position: index + 1
  }));

  return {
    line: cleanLine,
    lineNumber: lineNumber,
    syllables: syllables,
    syllableAnalysis: syllableAnalysis,
    syllableWeights: syllableWeights,
    syllablePattern: syllablePattern,
    totalSyllables: syllables.length,
    totalMatras: totalMatras,
    matches: matches,
    bestMatch: matches.length > 0 ? matches[0] : null
  };
}

// Find the best overall meter for the entire poem
function findOverallMeter(lineAnalyses, consistencyAnalysis) {
  if (lineAnalyses.length === 0) {
    return null;
  }

  // If perfectly consistent, use the common pattern
  if (consistencyAnalysis.isConsistent && consistencyAnalysis.commonPattern) {
    const matches = matchPattern(consistencyAnalysis.commonPattern);
    return {
      type: "consistent",
      pattern: consistencyAnalysis.commonPattern,
      matches: matches,
      bestMatch: matches.length > 0 ? matches[0] : null,
      confidence: matches.length > 0 ? matches[0].confidence : 0.5
    };
  }

  // If matra-consistent but pattern varies
  if (consistencyAnalysis.isMatraConsistent) {
    const matches = matchPattern(consistencyAnalysis.commonPattern);
    return {
      type: "matra_consistent",
      pattern: consistencyAnalysis.commonPattern,
      commonMatraCount: consistencyAnalysis.commonMatraCount,
      matches: matches,
      bestMatch: matches.length > 0 ? matches[0] : null,
      confidence: matches.length > 0 ? matches[0].confidence * 0.8 : 0.4,
      variations: consistencyAnalysis.variations
    };
  }

  // Mixed meter - find most common pattern
  const patternFrequencies = consistencyAnalysis.patternFrequency;
  const mostCommonPattern = Object.keys(patternFrequencies).reduce((a, b) => 
    patternFrequencies[a] > patternFrequencies[b] ? a : b
  );

  const matches = matchPattern(mostCommonPattern);
  
  return {
    type: "mixed",
    pattern: mostCommonPattern,
    frequency: patternFrequencies[mostCommonPattern],
    totalLines: lineAnalyses.length,
    matches: matches,
    bestMatch: matches.length > 0 ? matches[0] : null,
    confidence: matches.length > 0 ? matches[0].confidence * 0.6 : 0.3,
    allPatterns: Object.keys(patternFrequencies)
  };
}

// Calculate average matras across all lines
function calculateAverageMatras(lineAnalyses) {
  if (lineAnalyses.length === 0) return 0;
  
  const validLines = lineAnalyses.filter(analysis => !analysis.error && analysis.totalMatras);
  if (validLines.length === 0) return 0;
  
  const totalMatras = validLines.reduce((sum, analysis) => sum + analysis.totalMatras, 0);
  return Math.round((totalMatras / validLines.length) * 10) / 10; // Round to 1 decimal
}

// Quick analysis for simple use cases
export function quickAnalyze(text) {
  const result = analyzePoem(text);
  
  if (result.error) {
    return {
      status: "error",
      message: result.error
    };
  }

  const summary = {
    status: "success",
    totalLines: result.totalLines,
    averageMatras: result.averageMatras,
    isConsistent: result.isConsistent,
    lines: result.lines.map(line => ({
      text: line.line,
      syllables: line.syllables?.join(" ") || "",
      pattern: line.syllablePattern || "",
      matras: line.totalMatras || 0,
      bestMatch: line.bestMatch?.name || "अज्ञात पैटर्न"
    }))
  };

  if (result.overallMeter && result.overallMeter.bestMatch) {
    summary.overallMeter = {
      name: result.overallMeter.bestMatch.name,
      description: result.overallMeter.bestMatch.description,
      confidence: result.overallMeter.confidence,
      type: result.overallMeter.type
    };
  }

  return summary;
}

// Example usage function
export function runExample() {
  const poem = `तुम्हारा हिज्र मना लूँ अगर इजाज़त हो
मैं दिल किसी से लगा लूँ अगर इजाज़त हो`;

  console.log("=== Taqti Engine Example ===");
  console.log("Input poem:");
  console.log(poem);
  console.log("\n=== Analysis Result ===");
  
  const result = quickAnalyze(poem);
  console.log(JSON.stringify(result, null, 2));
  
  return result;
}
