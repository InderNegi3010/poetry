// Test HinglishAnalyzer to identify issues
import HinglishAnalyzer from './HinglishAnalyzer.js';

const testText = `mere kamre men ik aisi khiḌki hai
jo in ankhon ke khulne par khulti hai

aise tevar dushman hi ke hote hain
pata karo ye laḌki kis ki beTi hai`;

console.log("=== Testing HinglishAnalyzer ===\n");
console.log("Input text:");
console.log(testText);
console.log("\n" + "=".repeat(50));

try {
  const result = HinglishAnalyzer.analyze(testText);
  
  console.log("Analysis Result:");
  console.log("Status:", result.status);
  console.log("Message:", result.message);
  
  if (result.status === "error") {
    console.log("❌ ERROR:", result.errorMessage);
    console.log("Lines:", result.lines);
  } else {
    console.log("✅ SUCCESS");
    console.log("Bahr Type:", result.bahrType);
    console.log("Meter Description:", result.meterDescription);
    console.log("Pattern:", result.pattern);
    
    console.log("\n--- Line Analysis ---");
    result.syllableAnalysis?.forEach((line, index) => {
      console.log(`\nLine ${index + 1}: "${line.line}"`);
      console.log("Syllables:", line.syllables);
      console.log("Total Syllables:", line.totalSyllables);
      console.log("Has Errors:", line.hasErrors);
      
      if (line.syllableAnalysis) {
        console.log("Syllable Weights:", line.syllableAnalysis.map(s => s.weight).join(' '));
      }
      
      if (line.sections) {
        console.log("Sections:", line.sections.map(s => s.name).join(' '));
      }
    });
  }
  
} catch (error) {
  console.error("❌ ANALYZER ERROR:", error.message);
  console.error("Stack:", error.stack);
}

// Test individual methods
console.log("\n=== Testing Individual Methods ===");

// Test syllable extraction
console.log("\n--- Testing Syllable Extraction ---");
const testLines = [
  "mere kamre men ik aisi khiḌki hai",
  "jo in ankhon ke khulne par khulti hai"
];

testLines.forEach(line => {
  try {
    const syllables = HinglishAnalyzer.extractHinglishSyllables(line);
    console.log(`"${line}" -> [${syllables.join(', ')}]`);
  } catch (error) {
    console.error(`Error extracting syllables from "${line}":`, error.message);
  }
});

// Test weight calculation
console.log("\n--- Testing Weight Calculation ---");
const testSyllables = ['me', 're', 'kam', 're', 'men', 'ik', 'ai', 'si', 'khiḌki', 'hai'];
testSyllables.forEach(syl => {
  try {
    const weight = HinglishAnalyzer.calculateSyllableWeight(syl);
    console.log(`"${syl}" -> weight: ${weight}`);
  } catch (error) {
    console.error(`Error calculating weight for "${syl}":`, error.message);
  }
});

// Test language detection
console.log("\n--- Testing Language Detection ---");
const testTexts = [
  "mere kamre men ik aisi khiḌki hai",
  "मेरे कमरे में एक ऐसी खिड़की है",
  "mere कमरे men ik aisi खिड़की hai"
];

testTexts.forEach(text => {
  try {
    const lang = HinglishAnalyzer.detectLanguage(text);
    console.log(`"${text}" -> language: ${lang}`);
  } catch (error) {
    console.error(`Error detecting language for "${text}":`, error.message);
  }
});
