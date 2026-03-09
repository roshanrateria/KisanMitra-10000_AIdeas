// Bhashini Translation API — proxied through Lambda server
// NO API keys on client — calls go through /api/translate

import { serverPost } from '@/lib/serverApi';

export const translateText = async (
  text: string,
  sourceLanguage: string = 'en',
  targetLanguage: string = 'hi'
): Promise<string> => {
  // Return original text if source and target are the same
  if (sourceLanguage === targetLanguage) {
    return text;
  }

  // Return original text if it's empty
  if (!text || text.trim().length === 0) {
    return text;
  }

  try {
    const data = await serverPost<{ translatedText: string }>('/api/translate', {
      text,
      sourceLanguage,
      targetLanguage,
    });
    return data.translatedText || text;
  } catch (error) {
    console.error('Translation failed:', error);
    // Always return original text as fallback
    return text;
  }
};

// Supported languages
export const LANGUAGES = {
  en: 'English',
  hi: 'हिंदी (Hindi)',
  pa: 'ਪੰਜਾਬੀ (Punjabi)',
  gu: 'ગુજરાતી (Gujarati)',
  mr: 'मराठी (Marathi)',
  ta: 'தமிழ் (Tamil)',
  te: 'తెలుగు (Telugu)',
  kn: 'ಕನ್ನಡ (Kannada)',
  bn: 'বাংলা (Bengali)',
  ml: 'മലയാളം (Malayalam)'
};
