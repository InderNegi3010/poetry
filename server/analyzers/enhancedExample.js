// Enhanced Taqti Engine Example with Rekhta-inspired optimizations
import { EnhancedTaqtiEngine } from './enhancedTaqtiEngine.js';

// Test poems in different languages and meters
const testPoems = {
  urdu: `तुम्हारा हिज्र मना लूँ अगर इजाज़त हो
मैं दिल किसी से लगा लूँ अगर इजाज़त हो`,

  hinglish: `mere kamre men ik aisi khidki hai
jo in ankhon ke khulne par khulti hai`,

  ghazal: `हर एक बात पे कहते हो तुम कि तू क्या है
तुम्हीं कहो कि ये अंदाज़ ए गुफ़्तगू क्या है

और भी दुख हैं जमाने में मोहब्बत के सिवा
राहतें और भी हैं वस्ल की राहत के सिवा`,

  rubai: `दिल ही तो है न संग ओ खिश्त दुख से भर न आए क्यों
रोता हूं मैं इसी ग़म में कि क्यों जी उठ गया हूं
जब था मेरे पास तो मैंने न पूछा था उसे
अब जो नहीं है तो सुनाता हूं कि क्या खो दिया है`
};

async function runEnhancedTests() {
  console.log("=== Enhanced Taqti Engine Tests ===\n");

  for (const [type, poem] of Object.entries(testPoems)) {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`Testing ${type.toUpperCase()} Poetry:`);
    console.log(`${"=".repeat(50)}`);
    console.log(poem);
    console.log("\n--- Analysis Results ---");

    try {
      // Full analysis with all features
      const fullResult = await EnhancedTaqtiEngine.analyzePoem(poem, {
        language: 'auto',
        useAPI: false, // Set to true to test API integration
        includeWordSuggestions: true,
        expectedForm: type === 'ghazal' ? 'ghazal' : type === 'rubai' ? 'rubai' : 'auto'
      });

      console.log("Confidence:", fullResult.confidence + "%");
      console.log("Detected Language:", fullResult.analysis.enhanced.detectedLanguage);
      console.log("Meter:", fullResult.meterInfo.detectedMeter);
      console.log("Description:", fullResult.meterInfo.description);
      
      if (fullResult.assessment.technicalDetails) {
        const tech = fullResult.assessment.technicalDetails;
        console.log(`Technical: ${tech.totalLines} lines, ${tech.averageMatras} avg matras, ${tech.consistencyScore}% consistent`);
      }

      // Show line-by-line analysis
      console.log("\n--- Line Analysis ---");
      fullResult.analysis.enhanced.lines.forEach(line => {
        console.log(`Line ${line.lineNumber}: "${line.text}"`);
        console.log(`  Syllables: ${line.enhanced.totalSyllables}, Matras: ${line.enhanced.totalWeight}`);
        console.log(`  Pattern: ${line.enhanced.pattern}`);
        if (line.bestMatch) {
          console.log(`  Best Match: ${line.bestMatch.name || line.bestMatch.meter} (${Math.round(line.bestMatch.confidence * 100)}%)`);
        }
      });

      // Show suggestions
      if (fullResult.suggestions && fullResult.suggestions.length > 0) {
        console.log("\n--- Suggestions ---");
        fullResult.suggestions.forEach(suggestion => {
          console.log(`${suggestion.priority.toUpperCase()}: ${suggestion.message}`);
        });
      }

      // Show word suggestions if available
      if (fullResult.analysis.wordSuggestions && Object.keys(fullResult.analysis.wordSuggestions).length > 0) {
        console.log("\n--- Word Suggestions ---");
        for (const [word, suggestions] of Object.entries(fullResult.analysis.wordSuggestions)) {
          console.log(`"${word}": ${suggestions.map(s => s.original || s).join(', ')}`);
        }
      }

      // Quick analysis comparison
      console.log("\n--- Quick Analysis ---");
      const quickResult = await EnhancedTaqtiEngine.quickAnalyze(poem);
      console.log(`Quick Assessment: ${quickResult.assessment} (${quickResult.confidence}%)`);

    } catch (error) {
      console.error("Analysis failed:", error.message);
    }
  }

  // Test real-time validation
  console.log(`\n${"=".repeat(50)}`);
  console.log("Testing Real-time Validation:");
  console.log(`${"=".repeat(50)}`);

  const partialTexts = [
    "दिल",
    "दिल ही तो है",
    "दिल ही तो है न संग ओ खिश्त",
    "दिल ही तो है न संग ओ खिश्त दुख से भर न आए क्यों"
  ];

  partialTexts.forEach(text => {
    const liveResult = EnhancedTaqtiEngine.validateLive(text);
    console.log(`"${text}" -> Valid: ${liveResult.valid}, Confidence: ${liveResult.confidence || 'N/A'}%, Feedback: ${liveResult.quickFeedback || 'none'}`);
  });
}

// Run the tests
runEnhancedTests().catch(console.error);
