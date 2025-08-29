/**
 * Language detection utilities for poetry analysis
 */

export const detectLanguage = (text) => {
  const devanagariRegex = /[\u0900-\u097F]/;
  const latinRegex = /[a-zA-Z]/;
  
  const hasDevanagari = devanagariRegex.test(text);
  const hasLatin = latinRegex.test(text);
  
  // Pure Devanagari text (no English letters)
  if (hasDevanagari && !hasLatin) return 'devanagari';
  
  // Pure Latin script (no Devanagari)
  if (hasLatin && !hasDevanagari) return 'hinglish';
  
  // Mixed content - treat as invalid for proper error handling
  if (hasDevanagari && hasLatin) return 'mixed_invalid';
  
  // Neither - also invalid
  return 'unknown';
};

export const validateText = (text) => {
  if (!text || !text.trim()) {
    return {
      isValid: false,
      error: 'Text is required'
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};
