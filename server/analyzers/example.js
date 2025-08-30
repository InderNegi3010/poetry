// Example usage of the Taqti Engine
import { analyzePoem, quickAnalyze, runExample } from "./taqtiEngine.js";

// Test with the example you provided
const poem = `तुम्हारा हिज्र मना लूँ अगर इजाज़त हो
मैं दिल किसी से लगा लूँ अगर इजाज़त हो`;

console.log("=== Taqti Engine Demo ===");
console.log("Analyzing poem:");
console.log(poem);
console.log("\n" + "=".repeat(50));

const result = quickAnalyze(poem);
console.log(JSON.stringify(result, null, 2));

// Run the built-in example
console.log("\n" + "=".repeat(50));
console.log("Running built-in example:");
runExample();
