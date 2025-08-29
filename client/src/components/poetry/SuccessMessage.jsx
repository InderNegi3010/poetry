import React from 'react';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SuccessMessage({ language, hasErrors }) {
  // Only show success message when there are NO errors (like Rekhta)
  if (hasErrors) return null;
  
  const message = language === 'hinglish' 
    ? "Great! Your poetry is in Bahr. Keep up the good work!"
    : "बहुत बढ़िया! आपकी कविता बहर में है। अच्छा काम जारी रखें!";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-6"
    >
      <div className="flex items-center">
        <CheckCircle className="w-5 h-5 mr-2" />
        <span className="font-semibold">{message}</span>
      </div>
    </motion.div>
  );
}