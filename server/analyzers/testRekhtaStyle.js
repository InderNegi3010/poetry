// Test the Rekhta-style analyzer with the provided example
import { RekhtaStyleAnalyzer } from './rekhtaStyleAnalyzer.js';

const testText = `mere kamre men ik aisi khiḌki hai
jo in ankhon ke khulne par khulti hai

aise tevar dushman hi ke hote hain
pata karo ye laḌki kis ki beTi hai`;

console.log("=== Rekhta-Style Analysis Test ===\n");
console.log("Input text:");
console.log(testText);
console.log("\n" + "=".repeat(50));

// Test the analyzer
const result = RekhtaStyleAnalyzer.analyze(testText);

console.log("Analysis Result:");
console.log("Success:", result.success);
console.log("Has Errors:", result.hasErrors);
if (result.errorMessage) {
  console.log("Error Message:", result.errorMessage);
}

console.log("\n--- Line-by-Line Analysis ---");
result.lines.forEach(line => {
  console.log(`\nLine ${line.lineNumber}: "${line.text}"`);
  console.log("Syllables:", line.syllables.join(' | '));
  console.log("Weights:  ", line.weights.join(' | '));
  console.log("Patterns: ", line.patterns.join(' '));
  console.log("Meter Type:", line.meterType);
  
  if (line.hasErrors) {
    console.log("❌ ERRORS:", line.errorMessage);
  } else {
    console.log("✅ No errors detected");
  }
});

console.log("\n--- Meter Analysis ---");
if (result.meterAnalysis) {
  console.log("Consistent:", result.meterAnalysis.isConsistent);
  console.log("Syllable Consistent:", result.meterAnalysis.isSyllableConsistent);
  console.log("Common Meter:", result.meterAnalysis.commonMeter);
  console.log("Syllable Range:", result.meterAnalysis.syllableRange);
}

console.log("\n--- Overall Assessment ---");
if (result.overallAssessment) {
  console.log("Level:", result.overallAssessment.level);
  console.log("Message:", result.overallAssessment.message);
  console.log("Confidence:", result.overallAssessment.confidence + "%");
}

// Test Rekhta-style formatting
console.log("\n--- Rekhta-Style HTML Output ---");
const formatted = RekhtaStyleAnalyzer.formatRekhtaStyle(result);
console.log(formatted.html);

// Test individual lines
console.log("\n--- Individual Line Tests ---");
const testLines = [
  "mere kamre men ik aisi khiḌki hai",
  "jo in ankhon ke khulne par khulti hai",
  "aise tevar dushman hi ke hote hain", 
  "pata karo ye laḌki kis ki beTi hai"
];

testLines.forEach((line, index) => {
  console.log(`\nTesting: "${line}"`);
  const lineResult = RekhtaStyleAnalyzer.analyzeLine(line, index + 1);
  console.log("Syllables:", lineResult.syllables);
  console.log("Weights:", lineResult.weights);
  console.log("Patterns:", lineResult.patterns);
  console.log("Has Errors:", lineResult.hasErrors);
  if (lineResult.errorMessage) {
    console.log("Error:", lineResult.errorMessage);
  }
});
