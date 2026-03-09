# Language Handling in Disease Detection

This document describes how language changes and fallbacks are handled in the AI Disease Detection feature.

## Overview

The disease detection feature supports multilingual interfaces through the Bhashini translation service. All UI text, disease names, error messages, and treatment recommendations are automatically translated to the user's selected language.

## Key Features

### 1. Language Context Integration

The feature uses the global `LanguageContext` from `@/contexts/LanguageContext` to:
- Access the current user language preference
- Listen for language changes
- Automatically re-translate content when language changes

### 2. Automatic Re-translation

When the user changes their language preference:
- All displayed UI text is re-translated via `TranslatedText` component
- Disease names in detection results are re-translated
- Treatment recommendations are re-translated from stored English originals
- Error messages are translated before display

### 3. Fallback Mechanisms

Multiple layers of fallback ensure the app continues functioning even when translation fails:

#### Translation Service Fallback
- If Bhashini API is unavailable, original English text is displayed
- If translation returns empty/invalid results, original text is used
- Network errors gracefully fall back to English

#### Component-Level Fallback
- `TranslatedText` component tracks translation failures
- Displays original English text if translation fails
- No UI breakage on translation errors

#### Error Message Fallback
- All error messages attempt translation
- On translation failure, English error messages are shown
- User always receives actionable error information

### 4. Treatment Recommendations

Treatment recommendations have special handling:
- Original English recommendations are stored separately
- When language changes, recommendations are re-translated from English original
- Fallback recommendations (when AI service fails) are also translated
- Translation failures fall back to English recommendations

## Implementation Details

### Components with Language Support

1. **DiseaseDetectionPage**
   - Listens to language context changes
   - Re-translates treatment recommendations on language change
   - Translates all toast notifications
   - Translates success/error messages

2. **DetectionResultCard**
   - Translates disease names on language change
   - Caches translations to avoid redundant API calls
   - Falls back to English disease names on failure
   - Translates all UI labels and messages

3. **DetectionHistoryList**
   - Translates disease names in history items
   - Batches translations for efficiency
   - Falls back to English on translation failure
   - Translates UI labels

4. **ImageUploadComponent**
   - Translates all error messages
   - Translates camera permission errors
   - Translates file validation errors
   - Falls back to English on translation failure

5. **TranslatedText Component**
   - Wraps text that needs translation
   - Automatically re-translates on language change
   - Tracks translation state (loading, failed)
   - Always falls back to original text

### Translation Utilities

**File**: `src/lib/disease-detection/translation-utils.ts`

Provides helper functions:
- `translateWithFallback()` - Translate single text with automatic fallback
- `translateMultipleWithFallback()` - Translate multiple texts in parallel

### Bhashini Service Enhancements

**File**: `src/lib/bhashini.ts`

Enhanced with:
- Better error handling
- Empty result validation
- Response status checking
- Consistent fallback behavior
- Auth token error handling

## Usage Examples

### Translating UI Text

```tsx
import { TranslatedText } from '@/components/TranslatedText';
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { language } = useLanguage();
  
  return (
    <TranslatedText 
      text="Upload an image" 
      targetLanguage={language} 
    />
  );
}
```

### Translating Error Messages

```tsx
import { translateText } from '@/lib/bhashini';
import { useLanguage } from '@/contexts/LanguageContext';

async function showError() {
  const { language } = useLanguage();
  
  const titleText = language !== 'en'
    ? await translateText('Error', 'en', language).catch(() => 'Error')
    : 'Error';
  
  toast({
    title: titleText,
    description: 'Something went wrong',
    variant: 'destructive',
  });
}
```

### Re-translating on Language Change

```tsx
import { useEffect, useState } from 'react';
import { translateText } from '@/lib/bhashini';
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { language } = useLanguage();
  const [originalText] = useState('Hello World');
  const [translatedText, setTranslatedText] = useState('Hello World');
  
  useEffect(() => {
    const retranslate = async () => {
      if (language === 'en') {
        setTranslatedText(originalText);
        return;
      }
      
      try {
        const translated = await translateText(originalText, 'en', language);
        setTranslatedText(translated);
      } catch (error) {
        // Fallback to English
        setTranslatedText(originalText);
      }
    };
    
    retranslate();
  }, [language, originalText]);
  
  return <div>{translatedText}</div>;
}
```

## Requirements Validation

This implementation satisfies the following requirements:

### Requirement 6.5
✅ All UI text displays in user's selected language from Kisan Mitra preferences

### Requirement 6.6
✅ When translation fails, original English text is displayed as fallback

### Requirement 6.7
✅ Error messages are shown in translated versions appropriate to user's language

### Requirement 6.8
✅ When Bhashini service is unavailable, system continues functioning with English text only

## Testing

To test language handling:

1. **Language Change Test**
   - Change language in LanguageSelector
   - Verify all UI text updates without page reload
   - Verify disease names are re-translated
   - Verify treatment recommendations are re-translated

2. **Fallback Test**
   - Simulate Bhashini API failure (network offline)
   - Verify English text is displayed
   - Verify no UI breakage
   - Verify error messages are still shown

3. **Error Message Test**
   - Trigger various errors (invalid file, camera denied, etc.)
   - Verify error messages are in selected language
   - Verify fallback to English if translation fails

4. **Treatment Recommendations Test**
   - Get treatment recommendations in one language
   - Change language
   - Verify recommendations are re-translated
   - Verify fallback to English on translation failure

## Performance Considerations

- Translation results are cached where possible
- Parallel translation for multiple texts
- Auth token is cached for 58 minutes
- Debouncing prevents excessive API calls
- Fallback is immediate (no retry delays)

## Future Enhancements

Potential improvements:
- Local caching of translations in localStorage
- Offline translation support
- Translation quality feedback mechanism
- Support for more languages
- Batch translation API calls
