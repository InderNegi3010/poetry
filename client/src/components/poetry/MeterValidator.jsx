export default class MeterValidator {
  // Detect the dominant meter pattern from the first few correct lines
  static detectDominantMeter(allAnalysis) {
    if (!allAnalysis || allAnalysis.length === 0) return null;
    
    // Try to find a consistent pattern from lines that seem complete
    const patternCounts = {};
    
    for (let i = 0; i < Math.min(3, allAnalysis.length); i++) {
      const line = allAnalysis[i];
      if (line.sections && line.sections.length > 0) {
        // Create pattern based on total syllables and weight pattern
        const totalSyllables = line.syllables.length;
        const weightPattern = line.sections.map(s => s.weights.join('')).join('');
        const pattern = `${totalSyllables}-${weightPattern}`;
        patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
      }
    }
    
    // Find the most common pattern
    let dominantPattern = null;
    let maxCount = 0;
    
    for (const [pattern, count] of Object.entries(patternCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantPattern = pattern;
      }
    }
    
    return dominantPattern;
  }

  // Check if a line matches the expected meter pattern (like Rekhta logic)
  static validateLine(lineAnalysis, expectedPattern) {
    if (!lineAnalysis || !lineAnalysis.sections || !expectedPattern) {
      return { isValid: true, errors: [] }; // If no pattern established, assume valid
    }
    
    const [expectedSyllables, expectedWeightPattern] = expectedPattern.split('-');
    const lineSyllables = lineAnalysis.syllables.length;
    const lineWeightPattern = lineAnalysis.sections.map(s => s.weights.join('')).join('');
    
    // Check syllable count first (most important for Rekhta-style validation)
    if (lineSyllables < parseInt(expectedSyllables)) {
      return { isValid: false, errors: ['short'] };
    } else if (lineSyllables > parseInt(expectedSyllables)) {
      return { isValid: false, errors: ['long'] };
    }
    
    // Check weight pattern
    if (lineWeightPattern !== expectedWeightPattern) {
      return { isValid: false, errors: ['pattern'] };
    }
    
    return { isValid: true, errors: [] };
  }

  // Mark problematic syllables exactly like Rekhta website
  static markErrors(lineAnalysis, expectedPattern) {
    if (!lineAnalysis || !expectedPattern) return lineAnalysis;
    
    const validation = this.validateLine(lineAnalysis, expectedPattern);
    if (validation.isValid) return lineAnalysis;
    
    const [expectedSyllables] = expectedPattern.split('-');
    const expectedCount = parseInt(expectedSyllables);
    const actualCount = lineAnalysis.syllables.length;
    
    // Create a copy with error markings
    const errorAnalysis = { ...lineAnalysis };
    errorAnalysis.hasError = true;
    errorAnalysis.errorType = validation.errors[0];
    
    // Mark problematic sections based on Rekhta logic
    if (validation.errors.includes('short')) {
      // For short lines, mark the latter sections as errors
      const errorStartIndex = Math.max(0, Math.floor(lineAnalysis.sections.length * 0.6));
      
      errorAnalysis.sections = lineAnalysis.sections.map((section, sectionIndex) => {
        const newSection = { ...section };
        
        if (sectionIndex >= errorStartIndex) {
          // Mark syllables as errors
          newSection.syllables = section.syllables.map(syl => ({
            text: syl,
            isError: true
          }));
          newSection.weights = section.weights.map(() => 'x');
          newSection.color = 'bg-red-200';
          newSection.name = 'error';
        } else {
          newSection.syllables = section.syllables.map(syl => ({
            text: syl,
            isError: false
          }));
        }
        
        return newSection;
      });
    } else if (validation.errors.includes('long')) {
      // For long lines, mark extra syllables
      let syllableCount = 0;
      
      errorAnalysis.sections = lineAnalysis.sections.map(section => {
        const newSection = { ...section };
        const newSyllables = [];
        const newWeights = [];
        
        for (let i = 0; i < section.syllables.length; i++) {
          if (syllableCount < expectedCount) {
            newSyllables.push({
              text: section.syllables[i],
              isError: false
            });
            newWeights.push(section.weights[i]);
          } else {
            newSyllables.push({
              text: section.syllables[i],
              isError: true
            });
            newWeights.push('x');
          }
          syllableCount++;
        }
        
        newSection.syllables = newSyllables;
        newSection.weights = newWeights;
        
        // If any syllable in section is error, change section color
        if (newSyllables.some(s => s.isError)) {
          newSection.color = 'bg-red-200';
          newSection.name = 'error';
        }
        
        return newSection;
      });
    } else {
      // Pattern error - mark sections that don't match
      errorAnalysis.sections = lineAnalysis.sections.map((section, index) => {
        const newSection = { ...section };
        
        // Mark latter half as problematic for pattern errors
        if (index >= Math.floor(lineAnalysis.sections.length / 2)) {
          newSection.syllables = section.syllables.map(syl => ({
            text: syl,
            isError: true
          }));
          newSection.weights = section.weights.map(() => 'x');
          newSection.color = 'bg-red-200';
          newSection.name = 'error';
        } else {
          newSection.syllables = section.syllables.map(syl => ({
            text: syl,
            isError: false
          }));
        }
        
        return newSection;
      });
    }
    
    return errorAnalysis;
  }

  // Generate error message exactly like Rekhta
  static getErrorMessage(analysisResults, language) {
    const errorLines = analysisResults.filter(line => line.hasError);
    
    if (errorLines.length === 0) {
      return "";
    }

    // Rekhta uses simple, clear messages
    if (language === 'hinglish') {
      return "Line is short, error near red blocks";
    } else {
      return "पंक्ति छोटी है, लाल ब्लॉक के पास त्रुटि";
    }
  }

  // Simple analysis like Rekhta - just check if there are any errors
  static analyzePoetryQuality(allAnalysis, dominantPattern) {
    if (!allAnalysis || allAnalysis.length === 0) {
      return { hasErrors: false };
    }

    let hasAnyErrors = false;

    allAnalysis.forEach(lineAnalysis => {
      const validation = this.validateLine(lineAnalysis, dominantPattern);
      if (!validation.isValid) {
        hasAnyErrors = true;
      }
    });

    return { hasErrors: hasAnyErrors };
  }
}