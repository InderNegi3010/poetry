import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema({
  text: { 
    type: String, 
    required: true 
  },
  analyzer: { 
    type: String, 
    enum: ["HindiAnalyzer", "HinglishAnalyzer", "Mixed_Invalid"], 
    required: true 
  },
  result: {
    status: {
      type: String,
      enum: ["success", "error"],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    bahrType: {
      type: String,
      default: null
    },
    pattern: {
      type: [String],
      default: []
    },
    highlightedLine: {
      type: String,
      default: null
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('Analysis', AnalysisSchema);