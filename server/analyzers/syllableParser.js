// Unified syllable parser for Hindi, Urdu, and Hinglish text
// Combines logic from HindiAnalyzer and HinglishAnalyzer

// Syllable weight rules for Hindi/Urdu/Hinglish
const SHORT_VOWELS = ["a", "i", "u", "अ", "इ", "उ"];
const LONG_VOWELS = ["aa", "ee", "oo", "ai", "au", "आ", "ई", "ऊ", "ए", "ओ", "औ"];
const LONG_VOWEL_MATRAS = ['\u093E', '\u0940', '\u0942', '\u0947', '\u0948', '\u094B', '\u094C']; // ा ी ू े ै ो ौ

// Enhanced word mappings combining both analyzers
const MANUAL_SYLLABLE_MAPPINGS = {
  // Hindi words
  'मोहब्बत': ['मो', 'हब्', 'बत'],
  'इश्क़': ['इश्क़'],
  'दिलबर': ['दिल', 'बर'],
  'गुलशन': ['गुल', 'शन'],
  'बुलबुल': ['बुल', 'बुल'],
  'तकदीर': ['तक', 'दीर'],
  'नसीब': ['न', 'सीब'],
  'परवाना': ['पर', 'वा', 'ना'],
  'शमामा': ['श', 'मा', 'मा'],
  'दीवाना': ['दी', 'वा', 'ना'],
  'हरदम': ['हर', 'दम'],
  'जमाना': ['ज', 'मा', 'ना'],
  'अफ़साना': ['अफ़', 'सा', 'ना'],
  'कहानी': ['क', 'हा', 'नी'],
  'गुफ़्तगू': ['गुफ़्त', 'गू'],
  'बातचीत': ['बात', 'ची', 'त'],
  'हकीकत': ['ह', 'की', 'कत'],
  'हसरत': ['हस', 'रत'],
  'आरज़ू': ['आर', 'ज़ू'],
  'तमन्ना': ['त', 'मन्', 'ना'],
  'ख्वाहिश': ['ख्वा', 'हिश'],
  'फ़रियाद': ['फ़', 'रि', 'याद'],
  
  // Hinglish words
  'mohabbat': ['mo', 'hab', 'bat'],
  'ishq': ['ishq'],
  'dil': ['dil'],
  'pyar': ['py', 'ar'],
  'zindagi': ['zin', 'da', 'gi'],
  'duniya': ['du', 'ni', 'ya'],
  'khushi': ['khu', 'shi'],
  'gham': ['gham'],
  'aansu': ['aan', 'su'],
  'muskaan': ['mus', 'kaan'],
  'sapna': ['sap', 'na'],
  'haqeeqat': ['ha', 'qee', 'qat'],
  'umang': ['u', 'mang'],
  'josh': ['josh'],
  'junoon': ['ju', 'noon'],
  'deewana': ['dee', 'wa', 'na'],
  'parwana': ['par', 'wa', 'na'],
  'kahani': ['ka', 'ha', 'ni'],
  
  // Common words
  'hai': ['hai'],
  'hain': ['hain'],
  'main': ['main'],
  'men': ['men'],
  'ke': ['ke'],
  'ki': ['ki'],
  'ka': ['ka'],
  'se': ['se'],
  'ko': ['ko'],
  'par': ['par'],
  'और': ['और'],
  'या': ['या'],
  'न': ['न'],
  'ना': ['ना'],
  'नहीं': ['न', 'हीं']
};

// Parse a single word into syllables
export function parseWord(word) {
  if (!word) return [];
  
  const cleanWord = word.toLowerCase().trim();
  
  // Check manual mappings first
  if (MANUAL_SYLLABLE_MAPPINGS[cleanWord]) {
    return MANUAL_SYLLABLE_MAPPINGS[cleanWord];
  }
  
  // Detect script and use appropriate parser
  if (/[\u0900-\u097F]/.test(word)) {
    return parseDevanagariWord(word);
  } else if (/[a-zA-ZḌḍṭṇṛṣśḥāīūēōḥṃṅñṭḍṇḷṛṣ]/.test(word)) {
    return parseRomanWord(word);
  }
  
  return [word]; // fallback
}

// Parse Devanagari word into syllables
function parseDevanagariWord(word) {
  const syllables = [];
  let i = 0;
  
  while (i < word.length) {
    const char = word[i];
    
    // Skip non-Devanagari characters
    if (!/[\u0900-\u097F]/.test(char)) {
      i++;
      continue;
    }
    
    let syllable = char;
    i++;
    
    // Process consonant with all its dependents
    if (/[\u0915-\u0939\u0958-\u095F]/.test(char)) {
      // Collect all matras (dependent vowels)
      while (i < word.length && /[\u093E-\u094F\u0962-\u0963]/.test(word[i])) {
        syllable += word[i];
        i++;
      }
      
      // Handle conjuncts properly (halant + consonant sequences)
      while (i < word.length && word[i] === '\u094D') {
        if (i + 1 < word.length && /[\u0915-\u0939\u0958-\u095F]/.test(word[i + 1])) {
          syllable += word[i]; // halant
          syllable += word[i + 1]; // consonant
          i += 2;
          
          // Collect any matras after the conjunct consonant
          while (i < word.length && /[\u093E-\u094F\u0962-\u0963]/.test(word[i])) {
            syllable += word[i];
            i++;
          }
        } else {
          // Final halant or before non-consonant
          syllable += word[i];
          i++;
          break;
        }
      }
      
      // Collect modifiers (anusvara, visarga, nukta)
      while (i < word.length && /[\u0901-\u0903\u093C\u0951-\u0954]/.test(word[i])) {
        syllable += word[i];
        i++;
      }
    }
    // Independent vowels
    else if (/[\u0905-\u0914\u0960-\u0961]/.test(char)) {
      // Collect any modifiers after independent vowel
      while (i < word.length && /[\u0901-\u0903\u093C\u0951-\u0954]/.test(word[i])) {
        syllable += word[i];
        i++;
      }
    }
    
    if (syllable.trim()) {
      syllables.push(syllable);
    }
  }
  
  return syllables.length > 0 ? syllables : [word];
}

// Parse Roman script word into syllables
function parseRomanWord(word) {
  const syllables = [];
  const vowels = 'aeiouAEIOUāīūēōḥ';
  const consonants = 'bcdfghjklmnpqrstvwxyzḌḍṭṇṛṣśḥṃṅñṭḍṇḷṛṣ';
  
  let i = 0;
  
  while (i < word.length) {
    let syllable = '';
    
    // Collect initial consonant cluster
    while (i < word.length && consonants.includes(word[i])) {
      syllable += word[i];
      i++;
    }
    
    // Must have a vowel for a valid syllable
    if (i < word.length && vowels.includes(word[i])) {
      syllable += word[i];
      i++;
      
      // Handle diphthongs and long vowels
      while (i < word.length && vowels.includes(word[i])) {
        syllable += word[i];
        i++;
      }
    }
    
    // If we have just consonants, try to form a syllable with next vowel
    if (syllable && !vowels.split('').some(v => syllable.includes(v))) {
      if (i < word.length && vowels.includes(word[i])) {
        syllable += word[i];
        i++;
      }
    }
    
    // Add trailing consonants that belong to this syllable
    let consonantCount = 0;
    while (i < word.length && consonants.includes(word[i]) && consonantCount < 2) {
      const nextVowelIndex = word.substring(i + 1).search(new RegExp(`[${vowels}]`));
      
      // If no more vowels, take remaining consonants
      if (nextVowelIndex === -1) {
        syllable += word[i];
        i++;
      }
      // If next vowel is far, take one consonant
      else if (nextVowelIndex > 1) {
        syllable += word[i];
        i++;
        break;
      }
      // If next vowel is close, stop here
      else {
        break;
      }
      consonantCount++;
    }
    
    if (syllable.trim()) {
      syllables.push(syllable);
    }
  }
  
  // Fallback: if no syllables extracted, return the word as single syllable
  return syllables.length > 0 ? syllables : [word];
}

// Parse entire line into syllables
export function parseLine(line) {
  if (!line || typeof line !== 'string') return [];
  
  const words = line.split(/\s+/).filter(word => word.trim());
  return words.flatMap(parseWord);
}

// Calculate syllable weight (1 = short, 2 = long)
export function getSyllableWeight(syllable) {
  if (!syllable) return 1;
  
  const syl = syllable.toLowerCase();
  
  // Devanagari syllable weight calculation
  if (/[\u0900-\u097F]/.test(syllable)) {
    return calculateDevanagariWeight(syllable);
  }
  
  // Roman script syllable weight calculation
  return calculateRomanWeight(syl);
}

// Calculate weight for Devanagari syllables
function calculateDevanagariWeight(syllable) {
  // Definitely heavy syllables (weight = 2)
  
  // 1. Long vowel matras
  const hasLongVowel = LONG_VOWEL_MATRAS.some(matra => syllable.includes(matra));
  
  // 2. Independent long vowels
  const longIndependentVowels = ['\u0906', '\u0908', '\u090A', '\u090F', '\u0910', '\u0913', '\u0914']; // आ ई ऊ ए ऐ ओ औ
  const hasLongIndependent = longIndependentVowels.some(vowel => syllable.includes(vowel));
  
  // 3. Syllables with conjuncts (consonant clusters)
  const hasConjunct = syllable.includes('\u094D');
  
  // 4. Syllables with anusvara or visarga
  const hasNasalization = syllable.includes('\u0901') || syllable.includes('\u0902') || syllable.includes('\u0903');
  
  // 5. Syllables with nukta (Urdu sounds)
  const hasNukta = syllable.includes('\u093C');
  
  // Check conditions for heavy syllables
  if (hasLongVowel || hasLongIndependent || hasConjunct || hasNasalization || hasNukta) {
    return 2;
  }
  
  // Special known heavy syllables
  const knownHeavySyllables = ['हैं', 'में', 'तुम', 'हम', 'क्या', 'क्यों', 'कहां', 'जहां', 'वहां', 'यहां'];
  if (knownHeavySyllables.includes(syllable)) {
    return 2;
  }
  
  return 1; // Default to light
}

// Calculate weight for Roman script syllables
function calculateRomanWeight(syllable) {
  // Definitely long (weight = 2) patterns
  const longPatterns = [
    // Long vowels in Roman script
    /[āīūēōḥ]/,
    /aa|ii|uu|ee|oo/,
    /ai|au|oi|ou|ei|ay|ey/,
    
    // Nasalized vowels
    /[aeiou][ṃṅñ]/,
    /[aeiou]n$/,
    
    // Vowel + consonant cluster
    /[aeiou][bcdfghjklmnpqrstvwxyz]{2,}/,
    
    // Final consonant makes syllable heavy
    /[aeiou][bcdfghjklmnpqrstvwxyz]$/,
    
    // Aspirated consonants
    /[kg]h|[td]h|[pb]h|[jc]h/,
    
    // Retroflex and special consonants
    /[Ḍḍṭṇṛṣśḥṃṅñṭḍṇḷṛṣ]/
  ];
  
  // Check for long patterns
  for (const pattern of longPatterns) {
    if (pattern.test(syllable)) {
      return 2;
    }
  }
  
  // Special known long syllables
  const knownLongSyllables = [
    'hain', 'main', 'kaan', 'jaan', 'yaar', 'haar', 'maar', 'taar', 'saar',
    'gham', 'josh', 'ishq', 'khwaab', 'saab', 'kaab', 'raab', 'taab',
    'dil', 'fil', 'mil', 'til', 'sil', 'kil', 'pil',
    'men', 'ten', 'yen', 'zen', 'hen', 'den', 'sen'
  ];
  
  if (knownLongSyllables.includes(syllable)) {
    return 2;
  }
  
  // Syllables ending in consonant clusters
  if (/[bcdfghjklmnpqrstvwxyz]{2,}$/.test(syllable)) {
    return 2;
  }
  
  return 1; // Default to short
}

// Get syllable pattern as string (e.g., "212122")
export function getSyllablePattern(syllables) {
  return syllables.map(getSyllableWeight).join('');
}
