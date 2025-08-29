import express from 'express';
import Analysis from '../models/Analysis.js';
import HindiAnalyzer from '../analyzers/HindiAnalyzer.js';
import HinglishAnalyzer from '../analyzers/HinglishAnalyzer.js';
import { detectLanguage, validateText } from '../utils/languageDetector.js';

const router = express.Router();

// POST /api/check-bahr - Main endpoint for checking Bahr
router.post('/check-bahr', async (req, res) => {
  try {
    const { text } = req.body;
    
    // Validate input
    const validation = validateText(text);
    if (!validation.isValid) {
      return res.status(400).json({
        status: 'error',
        message: validation.error
      });
    }

    // Detect language
    const detectedLanguage = detectLanguage(text);
    let analyzer;
    let analyzerName;
    
    // Choose appropriate analyzer
    if (detectedLanguage === 'devanagari') {
      analyzer = HindiAnalyzer;
      analyzerName = 'HindiAnalyzer';
    } else if (detectedLanguage === 'hinglish') {
      analyzer = HinglishAnalyzer;
      analyzerName = 'HinglishAnalyzer';
    } else {
      // Mixed content or unknown - analyze line by line to show which lines are invalid
      const lines = text.split('\n').filter(l => l.trim());
      const syllableAnalysis = [];
      const errorLines = [];
      
      // Count Hindi vs English lines to determine primary language
      const allLines = lines.map(l => ({ line: l, lang: detectLanguage(l) }));
      const hindiLines = allLines.filter(l => l.lang === 'devanagari').length;
      const englishLines = allLines.filter(l => l.lang === 'hinglish').length;
      const primaryLanguage = hindiLines >= englishLines ? 'devanagari' : 'hinglish';
      
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineLanguage = detectLanguage(line);
        let hasErrors = false;
        
        // For mixed content, mark lines that don't belong to the primary language
        if (primaryLanguage === 'devanagari') {
          // Primary is Hindi - English lines are errors
          if (lineLanguage === 'devanagari') {
            hasErrors = /[a-zA-Z0-9]/.test(line); // Check for invalid chars in Hindi
          } else {
            hasErrors = true; // Non-Hindi line in Hindi poem
          }
        } else {
          // Primary is Hinglish - Hindi lines are errors  
          if (lineLanguage === 'hinglish') {
            hasErrors = /[0-9०-९]/.test(line); // Check for numbers in Hinglish
          } else {
            hasErrors = true; // Non-Hinglish line in Hinglish poem
          }
        }
        
        
        
        // Create basic line analysis for display
        const lineAnalysis = {
          line: line.trim(),
          syllables: [],
          sections: [],
          totalSyllables: 0,
          hasErrors: hasErrors,
          lineNumber: i + 1
        };
        
        syllableAnalysis.push(lineAnalysis);
        
        if (hasErrors) {
          errorLines.push(i + 1);
        }
      }
      
      
      const errorResult = {
        status: 'error',
        message: 'The system could not match the Behr in the highlighted lines',
        bahrType: null,
        pattern: [],
        syllableAnalysis: syllableAnalysis,
        highlightedLine: null,
        errorLines: errorLines
      };
      
      // Still store in database for tracking
      const analysisRecord = new Analysis({
        text: text.trim(),
        analyzer: 'Mixed_Invalid',
        result: errorResult
      });
      
      await analysisRecord.save();
      
      return res.json(errorResult);
    }
    
    // Analyze the text
    const result = analyzer.analyze(text);
    
    // Store in MongoDB
    const analysisRecord = new Analysis({
      text: text.trim(),
      analyzer: analyzerName,
      result: result
    });
    
    await analysisRecord.save();
    
    // Return result
    res.json(result);
    
  } catch (error) {
    console.error('Error in /api/check-bahr:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// GET /api/analyses - Get all stored analyses
router.get('/analyses', async (req, res) => {
  try {
    const { limit = 100, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    const analyses = await Analysis.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Analysis.countDocuments();
    
    res.json({
      status: 'success',
      count: analyses.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: analyses
    });
    
  } catch (error) {
    console.error('Error in /api/analyses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

export default router;
