# Voice Bot Integration - Design Document

## Overview

This design document outlines the architecture and implementation strategy for replacing the existing text-based chatbot in AgriSenseFlow with a voice-enabled bot that supports multilingual speech recognition (ASR), text-to-speech (TTS), and animated avatar interactions using the Bhashini API.

The voice bot will provide farmers with a more accessible interface for agricultural advice, supporting Hindi, English, Tamil, Telugu, Bengali, and Marathi languages. The system will feature an animated doctor avatar (Dr. AYUSH) with realistic facial animations and lip-sync capabilities.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/TypeScript)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ VoiceBot     │  │ DoctorAvatar │  │ Voice        │     │
│  │ Component    │  │ Component    │  │ Components   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Layer     │
                    │  (Express.js)   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼───────────────────┐
        │                    │                   │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│  Bhashini API  │  │   Chat API      │  │   PostgreSQL   │
│  (ASR/TTS)     │  │   (Groq LLM)    │  │   Database     │
└────────────────┘  └─────────────────┘  └────────────────┘
```

### Component Hierarchy

```
VoiceBot (Main Container)
├── DoctorAvatar (Visual Representation)
│   ├── SVG Avatar Graphics
│   ├── State Animations (idle, listening, thinking, speaking)
│   └── Status Indicators
├── VoiceRecorder (Input Handler)
│   ├── MediaRecorder API
│   ├── Audio Waveform Visualization
│   ├── Text Input Fallback
│   └── Audio Processing (WAV conversion)
├── AudioPlayer (Output Handler)
│   ├── Audio Playback Controls
│   └── Lip-sync Coordination
└── ConversationHistory (Message Display)
    ├── Message List
    ├── Timestamps
    └── Replay Controls
```

## Components and Interfaces

### 1. VoiceBot Component

**Purpose**: Main container component that orchestrates voice interactions and manages state.

**Props**:
```typescript
interface VoiceBotProps {
  onClose?: () => void;
  initialLanguage?: string;
  context?: {
    location?: { lat: number; lng: number };
    recentDetections?: string[];
  };
}
```

**State**:
```typescript
interface VoiceBotState {
  isOpen: boolean;
  botState: 'idle' | 'listening' | 'thinking' | 'speaking';
  messages: VoiceMessage[];
  currentLanguage: string;
  audioLevel: number;
  error: string | null;
  isProcessing: boolean;
}

interface VoiceMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  audioBase64?: string;
  language: string;
}
```

**Key Methods**:
- `handleVoiceInput(audioBase64: string, language: string)`: Process voice recording
- `handleTextInput(text: string)`: Process text fallback input
- `playResponse(audioBase64: string)`: Play TTS audio response
- `updateBotState(state: BotState)`: Update avatar state
- `clearHistory()`: Clear conversation history

### 2. DoctorAvatar Component

**Purpose**: Animated SVG avatar with realistic facial animations and state-based behaviors.

**Props**:
```typescript
interface DoctorAvatarProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking';
  audioLevel: number;
  className?: string;
}
```

**Animation States**:
- **Idle**: Gentle breathing animation, occasional blinking, neutral expression
- **Listening**: Pulse rings, focused eye movement, attentive expression
- **Thinking**: Rotating glow, upward eye movement, contemplative expression
- **Speaking**: Lip-sync with audio, micro head movements, engaged expression

**Features**:
- Realistic eye blinking (every 2.5-6.5 seconds)
- Eye movement based on state
- Dynamic mouth shapes for lip-sync
- Jaw drop animation synchronized with audio level
- Smooth transitions between states
- Responsive design for mobile devices

### 3. VoiceRecorder Component

**Purpose**: Handle audio recording, visualization, and text input fallback.

**Props**:
```typescript
interface VoiceRecorderProps {
  onRecordingComplete: (
    audioBase64: string | null,
    language: string,
    textInput?: string,
    mimeType?: string
  ) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  isDisabled?: boolean;
}
```

**Features**:
- Press-and-hold recording interface
- Real-time audio level visualization (20-bar waveform)
- Audio format conversion (browser format → 16kHz mono WAV)
- Text input toggle for fallback
- Microphone permission handling
- Audio resource cleanup

**Audio Processing Pipeline**:
```
Browser Recording (webm/mp4/ogg)
    ↓
MediaRecorder API
    ↓
Blob Collection
    ↓
AudioContext Decoding
    ↓
OfflineAudioContext Resampling (16kHz mono)
    ↓
PCM to WAV Encoding
    ↓
Base64 Encoding
    ↓
API Transmission
```

### 4. AudioPlayer Component

**Purpose**: Play TTS audio responses with playback controls.

**Props**:
```typescript
interface AudioPlayerProps {
  audioBase64: string;
  onPlayStateChange?: (isPlaying: boolean) => void;
}
```

**Features**:
- Auto-play on response received
- Manual replay control
- Stop/pause functionality
- Playback state synchronization with avatar

### 5. AudioWaveform Component

**Purpose**: Visual feedback for audio recording and playback.

**Props**:
```typescript
interface AudioWaveformProps {
  isActive: boolean;
  audioLevel: number;
}
```

**Features**:
- 20 animated bars
- Spring-based animations
- Height variation based on audio level
- Smooth transitions

## Data Models

### VoiceMessage Model

```typescript
interface VoiceMessage {
  id: string;                    // Unique message identifier
  role: 'user' | 'assistant';    // Message sender
  content: string;               // Text content
  timestamp: number;             // Unix timestamp
  audioBase64?: string;          // Base64-encoded audio (for assistant messages)
  language: string;              // Language code (hi, en, ta, te, bn, mr)
}
```

### BhashiniAuthCache Model

```typescript
interface BhashiniAuthCache {
  authorization: string | null;  // Auth token
  endpoint: string | null;       // Inference endpoint URL
  expires_at: Date | null;       // Token expiration time (1 hour)
}
```

### Language Configuration

```typescript
const SUPPORTED_LANGUAGES = {
  hi: { name: 'Hindi', nativeName: 'हिंदी', asrServiceId: 'ai4bharat/conformer-hi-gpu--t4', ttsServiceId: 'ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4' },
  en: { name: 'English', nativeName: 'English', asrServiceId: 'ai4bharat/conformer-en-gpu--t4', ttsServiceId: 'ai4bharat/indic-tts-coqui-misc-gpu--t4' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்', asrServiceId: 'ai4bharat/conformer-ta-gpu--t4', ttsServiceId: 'ai4bharat/indic-tts-coqui-dravidian-gpu--t4' },
  te: { name: 'Telugu', nativeName: 'తెలుగు', asrServiceId: 'ai4bharat/conformer-te-gpu--t4', ttsServiceId: 'ai4bharat/indic-tts-coqui-dravidian-gpu--t4' },
  bn: { name: 'Bengali', nativeName: 'বাংলা', asrServiceId: 'ai4bharat/conformer-bn-gpu--t4', ttsServiceId: 'ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4' },
  mr: { name: 'Marathi', nativeName: 'मराठी', asrServiceId: 'ai4bharat/conformer-mr-gpu--t4', ttsServiceId: 'ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4' }
};
```

### API Request/Response Models

**ASR Request**:
```typescript
interface ASRRequest {
  audio_base64: string;
  source_language: string;
}

interface ASRResponse {
  text: string;
  language: string;
}
```

**TTS Request**:
```typescript
interface TTSRequest {
  text: string;
  target_language: string;
  gender?: 'male' | 'female';
}

interface TTSResponse {
  audio_base64: string;
  language: string;
}
```

**Chat Request**:
```typescript
interface ChatRequest {
  message?: string;
  messages?: Array<{ role: string; content: string }>;
  language: string;
  context?: {
    location?: { lat: number; lng: number };
    recentDetections?: string[];
  };
  session_id?: string;
}

interface ChatResponse {
  response: string;
  language: string;
  session_id: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I've identified the following consolidations to eliminate redundancy:

**Consolidated Properties**:
1. **Audio Processing Pipeline**: AC-1.5 and AC-1.6 can be combined into a single round-trip property that validates the entire audio conversion pipeline (browser format → WAV → base64 → decode → valid audio).

2. **Language Support**: AC-2.4 and AC-4.5 both test language configuration and can be combined into one property that validates all supported languages have both ASR and TTS service IDs.

3. **Message Display**: AC-7.1, AC-7.2, and AC-7.3 all test message rendering and can be combined into a comprehensive message display property.

4. **State Synchronization**: AC-5.1, AC-5.4, and AC-5.5 all test that avatar visuals match the bot state and can be combined into one state-rendering property.

5. **Input Mode Handling**: AC-6.1, AC-6.2, and AC-6.5 all test text input toggle behavior and can be combined into one property.

6. **Error Handling**: AC-8.1, AC-8.2, AC-8.3, AC-8.4, and AC-8.5 all test error scenarios and can be grouped into fewer, more comprehensive error handling properties.

### Correctness Properties

**Property 1: Audio Recording State Management**
*For any* voice recorder component, when the microphone button is pressed, the recording state should transition to active, MediaRecorder should start, and waveform visualization should display with isActive=true.
**Validates: Requirements 1.1, 1.2**

**Property 2: Audio Level Bounds**
*For any* audio recording session, all audioLevel values should be within the range [0, 1] and should update in real-time during recording.
**Validates: Requirements 1.3**

**Property 3: Recording Stop Trigger**
*For any* active recording session, releasing the microphone button should stop the MediaRecorder, transition state to inactive, and trigger the recording completion callback.
**Validates: Requirements 1.4**

**Property 4: Audio Format Conversion Round-Trip**
*For any* recorded audio blob (webm/mp4/ogg), the conversion pipeline should produce a valid 16kHz mono WAV file that, when decoded, contains the same audio content as the original recording.
**Validates: Requirements 1.5, 1.6**

**Property 5: ASR API Integration**
*For any* valid audio base64 string and language code, the system should make an ASR API call with the correct payload structure (audio content, language, service ID) and return transcribed text.
**Validates: Requirements 2.1**

**Property 6: Bhashini Authorization Caching**
*For any* ASR or TTS request, if the auth cache is empty or expired, the system should obtain a new authorization token before making the API call; otherwise, it should reuse the cached token.
**Validates: Requirements 2.2**

**Property 7: Transcription Display**
*For any* successful ASR response, a user message containing the transcribed text should be added to the conversation history and displayed in the chat interface.
**Validates: Requirements 2.3**

**Property 8: Language Configuration Completeness**
*For all* supported language codes (hi, en, ta, te, bn, mr), both ASR and TTS service IDs must be defined in the language configuration.
**Validates: Requirements 2.4, 4.5**

**Property 9: Language Persistence**
*For any* language selection, the chosen language should be saved to localStorage and restored when the component remounts or the page reloads.
**Validates: Requirements 2.5**

**Property 10: ASR Error Handling**
*For any* failed ASR API call, the system should display a user-friendly error message, remain in a usable state (not stuck in "listening"), and allow retry.
**Validates: Requirements 2.6**

**Property 11: Chat API Context Inclusion**
*For any* chat request, if location or recent detections are available in context, they should be included in the API payload.
**Validates: Requirements 3.2**

**Property 12: Chat Language Parameter**
*For any* chat request, the current language preference should be included in the API payload.
**Validates: Requirements 3.3**

**Property 13: Conversation History Growth**
*For any* user-assistant interaction, the messages array should grow by 2 (one user message, one assistant message), and all previous messages should be preserved.
**Validates: Requirements 3.4**

**Property 14: TTS API Integration**
*For any* AI response text and language code, the system should make a TTS API call with the correct payload structure and return audio base64.
**Validates: Requirements 4.1**

**Property 15: Auto-Play Behavior**
*For any* TTS audio response, the audio player should automatically start playback when the audio base64 is received.
**Validates: Requirements 4.2**

**Property 16: Audio Replay Control**
*For any* assistant message with audio, clicking the replay button should restart audio playback from the beginning.
**Validates: Requirements 4.3**

**Property 17: Audio Stop Control**
*For any* playing audio, clicking the stop button should pause playback, reset the current time to 0, and update the play state to false.
**Validates: Requirements 4.4**

**Property 18: Avatar State Rendering**
*For any* bot state (idle, listening, thinking, speaking), the avatar should render the corresponding visual indicators (status text, icons, background effects, animations).
**Validates: Requirements 5.1, 5.4, 5.5**

**Property 19: Avatar Animation Triggers**
*For any* avatar instance, blink animations should trigger periodically (every 2.5-6.5 seconds), eye positions should update based on state, and mouth shapes should change when audioLevel > 0 during speaking state.
**Validates: Requirements 5.2**

**Property 20: Lip-Sync Coordination**
*For any* speaking state with audio playback, the avatar's mouth openAmount should be proportional to the current audioLevel value.
**Validates: Requirements 5.3**

**Property 21: Text Input Toggle**
*For any* voice recorder component, clicking the keyboard icon should toggle showTextInput state, and when isRecording is true, the text input should be disabled.
**Validates: Requirements 6.1, 6.2, 6.5**

**Property 22: Text Submission Methods**
*For any* non-empty text input, both pressing Enter and clicking the send button should trigger the same text submission handler.
**Validates: Requirements 6.3**

**Property 23: Input Mode Equivalence**
*For any* text input submission, the resulting chat API call should have the same structure and flow as a voice input submission (only the source differs).
**Validates: Requirements 6.4**

**Property 24: Message Display Consistency**
*For any* conversation history, messages should be sorted by timestamp in ascending order, each message should display its timestamp, and user/assistant messages should have distinct visual styling.
**Validates: Requirements 7.1, 7.2, 7.3**

**Property 25: Conversation Persistence**
*For any* message added to the conversation, it should be saved to localStorage, and when the component mounts, all saved messages should be loaded and displayed.
**Validates: Requirements 7.4**

**Property 26: History Clear Operation**
*For any* conversation history, clicking the clear button should remove all messages from state and localStorage.
**Validates: Requirements 7.5**

**Property 27: Audio Replay Availability**
*For any* assistant message with audioBase64 property, the AudioPlayer component should be rendered with replay controls.
**Validates: Requirements 7.6**

**Property 28: Microphone Permission Error**
*For any* getUserMedia call that fails with a permission denied error, a specific error message about microphone access should be displayed.
**Validates: Requirements 8.1**

**Property 29: Network Error Recovery**
*For any* API call that fails with a network error, an error message with a retry option should be displayed.
**Validates: Requirements 8.2**

**Property 30: API Error Transformation**
*For any* API error response, the raw error should be transformed into a user-friendly message before display.
**Validates: Requirements 8.3**

**Property 31: Audio Playback Fallback**
*For any* audio playback error, the text content of the message should remain visible and accessible.
**Validates: Requirements 8.4**

**Property 32: Feature Detection**
*For any* browser environment, if MediaRecorder API is not available, a fallback message should be displayed and text input should be enabled.
**Validates: Requirements 8.5**

**Property 33: Request Deduplication**
*For any* processing state (isProcessing=true), additional API requests should be blocked until the current request completes.
**Validates: Requirements 8.6**

## Error Handling

### Error Categories

**1. Microphone Access Errors**
- **Cause**: User denies microphone permission, no microphone available, microphone in use by another app
- **Handling**: 
  - Display clear error message: "Microphone access is required for voice input. Please enable microphone permissions in your browser settings."
  - Automatically show text input fallback
  - Provide link to browser-specific permission instructions
- **Recovery**: User can grant permission and retry, or use text input

**2. Audio Processing Errors**
- **Cause**: Unsupported audio format, conversion failure, invalid audio data
- **Handling**:
  - Log detailed error for debugging
  - Display user-friendly message: "Unable to process audio. Please try recording again."
  - Clean up audio resources (contexts, streams, analyzers)
  - Reset recording state to idle
- **Recovery**: User can retry recording

**3. Network Errors**
- **Cause**: No internet connection, API timeout, server unavailable
- **Handling**:
  - Display message: "Network error. Please check your connection and try again."
  - Show retry button
  - Preserve user's input (audio or text) for retry
  - Implement exponential backoff for retries (1s, 2s, 4s)
- **Recovery**: Automatic retry with backoff, or manual retry

**4. API Errors**
- **Cause**: Invalid API key, rate limiting, service unavailable, invalid request format
- **Handling**:
  - Parse API error response for specific error codes
  - Transform to user-friendly messages:
    - 401/403: "Authentication error. Please contact support."
    - 429: "Too many requests. Please wait a moment and try again."
    - 500/503: "Service temporarily unavailable. Please try again later."
  - Log full error details for debugging
  - Maintain conversation state
- **Recovery**: Retry after delay, or fallback to text-only mode

**5. Audio Playback Errors**
- **Cause**: Invalid audio data, codec not supported, playback interrupted
- **Handling**:
  - Display message: "Unable to play audio response. You can read the text below."
  - Ensure text content is prominently displayed
  - Disable audio controls for failed message
  - Log error for debugging
- **Recovery**: Text content remains accessible, user can continue conversation

**6. Browser Compatibility Errors**
- **Cause**: MediaRecorder not supported, Web Audio API not available, old browser version
- **Handling**:
  - Feature detection on component mount
  - Display message: "Voice input is not supported in your browser. Please use text input or update your browser."
  - Automatically enable text input mode
  - Hide voice-specific UI elements
- **Recovery**: User can use text input, or upgrade browser

### Error State Management

```typescript
interface ErrorState {
  type: 'microphone' | 'audio_processing' | 'network' | 'api' | 'playback' | 'compatibility';
  message: string;
  retryable: boolean;
  timestamp: number;
}
```

**Error Display Strategy**:
- Non-blocking toast notifications for transient errors
- Inline error messages for persistent issues
- Error state clears automatically on successful operation
- Errors don't prevent other features from working

### Resource Cleanup

**Critical Cleanup Operations**:
1. **Audio Contexts**: Close AudioContext instances when no longer needed to avoid Chrome's 6-context limit
2. **Media Streams**: Stop all tracks when recording ends to release microphone
3. **Animation Frames**: Cancel requestAnimationFrame callbacks when component unmounts
4. **Event Listeners**: Remove all event listeners on cleanup
5. **Timers**: Clear all setTimeout/setInterval on unmount

**Cleanup Triggers**:
- Component unmount
- Recording stop
- Error occurrence
- User navigation away from page

## Testing Strategy

### Unit Testing

**Test Framework**: Vitest with React Testing Library

**Component Tests**:

1. **VoiceBot Component**
   - Renders correctly in open/closed states
   - Handles language switching
   - Manages conversation history
   - Integrates with child components
   - Clears history on user action

2. **DoctorAvatar Component**
   - Renders in all states (idle, listening, thinking, speaking)
   - Updates animations based on audioLevel
   - Displays correct status text for each state
   - Handles state transitions smoothly

3. **VoiceRecorder Component**
   - Starts/stops recording on button press/release
   - Displays waveform during recording
   - Converts audio to correct format
   - Toggles text input mode
   - Handles microphone permission errors

4. **AudioPlayer Component**
   - Plays audio automatically on mount
   - Handles replay button clicks
   - Stops playback on stop button click
   - Emits play state changes

5. **AudioWaveform Component**
   - Renders correct number of bars
   - Animates based on audioLevel
   - Responds to isActive prop changes

**API Integration Tests**:
- Mock Bhashini API responses
- Test ASR request/response handling
- Test TTS request/response handling
- Test auth token caching
- Test error response handling

**Audio Processing Tests**:
- Test WAV encoding with sample audio data
- Test base64 encoding/decoding
- Test audio format detection
- Test resampling to 16kHz mono

### Property-Based Testing

**Test Framework**: fast-check (JavaScript property-based testing library)

**Configuration**: Minimum 100 iterations per property test

**Property Tests**:

Each correctness property listed above should be implemented as a property-based test. Examples:

**Property 4: Audio Format Conversion Round-Trip**
```typescript
import fc from 'fast-check';

test('Property 4: Audio format conversion round-trip', () => {
  fc.assert(
    fc.asyncProperty(
      fc.uint8Array({ minLength: 1000, maxLength: 10000 }), // Random audio data
      async (audioData) => {
        const blob = new Blob([audioData], { type: 'audio/webm' });
        const wavBase64 = await blobToWavBase64(blob);
        
        // Decode base64 back to buffer
        const decoded = Buffer.from(wavBase64, 'base64');
        
        // Verify WAV header
        expect(decoded.toString('ascii', 0, 4)).toBe('RIFF');
        expect(decoded.toString('ascii', 8, 12)).toBe('WAVE');
        
        // Verify format (16-bit PCM, mono, 16kHz)
        const audioFormat = decoded.readUInt16LE(20);
        const numChannels = decoded.readUInt16LE(22);
        const sampleRate = decoded.readUInt32LE(24);
        
        expect(audioFormat).toBe(1); // PCM
        expect(numChannels).toBe(1); // Mono
        expect(sampleRate).toBe(16000); // 16kHz
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property 8: Language Configuration Completeness**
```typescript
test('Property 8: Language configuration completeness', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('hi', 'en', 'ta', 'te', 'bn', 'mr'),
      (languageCode) => {
        const config = SUPPORTED_LANGUAGES[languageCode];
        
        // Both ASR and TTS service IDs must exist
        expect(config).toBeDefined();
        expect(config.asrServiceId).toBeTruthy();
        expect(config.ttsServiceId).toBeTruthy();
        expect(config.asrServiceId).toContain('conformer');
        expect(config.ttsServiceId).toContain('indic-tts');
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property 13: Conversation History Growth**
```typescript
test('Property 13: Conversation history growth', () => {
  fc.assert(
    fc.asyncProperty(
      fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
      async (userMessages) => {
        const initialHistory: VoiceMessage[] = [];
        let currentHistory = [...initialHistory];
        
        for (const message of userMessages) {
          const beforeLength = currentHistory.length;
          
          // Simulate user message + assistant response
          currentHistory = [
            ...currentHistory,
            { id: `user-${Date.now()}`, role: 'user', content: message, timestamp: Date.now(), language: 'en' },
            { id: `assistant-${Date.now()}`, role: 'assistant', content: 'Response', timestamp: Date.now(), language: 'en' }
          ];
          
          // History should grow by exactly 2
          expect(currentHistory.length).toBe(beforeLength + 2);
          
          // All previous messages should be preserved
          for (let i = 0; i < beforeLength; i++) {
            expect(currentHistory[i]).toEqual(expect.objectContaining({
              id: expect.any(String),
              role: expect.stringMatching(/^(user|assistant)$/),
              content: expect.any(String)
            }));
          }
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

**Test Tags**: Each property test must include a comment tag:
```typescript
// Feature: voice-bot-integration, Property 4: Audio format conversion round-trip
```

### Integration Testing

**End-to-End Flows**:

1. **Complete Voice Interaction Flow**
   - User opens voice bot
   - User records voice message
   - System transcribes audio (ASR)
   - System generates response (Chat API)
   - System converts response to speech (TTS)
   - System plays audio with avatar lip-sync
   - Message appears in history

2. **Text Fallback Flow**
   - User toggles to text input
   - User types and sends message
   - System generates response
   - System converts to speech and plays
   - Message appears in history

3. **Language Switching Flow**
   - User switches language
   - User records message in new language
   - System uses correct ASR service
   - System generates response in new language
   - System uses correct TTS service

4. **Error Recovery Flow**
   - Network error occurs during ASR
   - User sees error message with retry
   - User clicks retry
   - Request succeeds
   - Conversation continues normally

5. **History Persistence Flow**
   - User has conversation
   - User closes voice bot
   - User reopens voice bot
   - Previous messages are displayed
   - User can replay audio from history

### Performance Testing

**Metrics to Monitor**:
- Avatar animation frame rate (target: 60fps)
- Audio processing time (target: <500ms)
- API response times (ASR: <3s, TTS: <5s, Chat: <3s)
- Memory usage during long conversations
- Audio context creation/cleanup timing

**Load Testing**:
- Test with 50+ messages in history
- Test rapid consecutive recordings
- Test multiple language switches
- Test with large audio files (60 seconds)

### Accessibility Testing

**Manual Testing Checklist**:
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] ARIA labels are present and accurate
- [ ] Screen reader announces state changes
- [ ] Color contrast meets WCAG AA standards
- [ ] Touch targets are at least 44x44px
- [ ] Text input works with voice dictation software

**Automated Accessibility Tests**:
- Run axe-core on all components
- Test with keyboard-only navigation
- Verify ARIA attributes with testing library queries

## Implementation Notes

### Technology Stack

**Frontend**:
- React 18+ with TypeScript
- Vite for build tooling
- TanStack Query for API state management
- Framer Motion for animations
- Tailwind CSS + shadcn/ui for styling
- Lucide React for icons

**Backend**:
- Express.js (existing)
- PostgreSQL (existing)
- Axios for HTTP requests
- Groq SDK for LLM integration

**APIs**:
- Bhashini API (ASR, TTS, Translation)
- Groq LLM (Chat responses)

### File Structure

```
AgriSenseFlow/client/src/
├── components/
│   ├── voice-bot/
│   │   ├── VoiceBot.tsx              # Main container
│   │   ├── DoctorAvatar.tsx          # Animated avatar
│   │   ├── VoiceRecorder.tsx         # Recording controls
│   │   ├── AudioPlayer.tsx           # Playback controls
│   │   ├── AudioWaveform.tsx         # Visualization
│   │   ├── ConversationHistory.tsx   # Message list
│   │   └── LanguageSelector.tsx      # Language picker
│   └── chatbot.tsx                   # (To be replaced)
├── lib/
│   ├── voice-bot/
│   │   ├── audio-processing.ts       # WAV encoding, base64
│   │   ├── bhashini-client.ts        # API client
│   │   └── storage.ts                # localStorage helpers
│   └── utils.ts
├── hooks/
│   ├── use-voice-bot.ts              # Main state management
│   ├── use-audio-recorder.ts         # Recording logic
│   └── use-audio-player.ts           # Playback logic
└── types/
    └── voice-bot.ts                  # TypeScript interfaces

AgriSenseFlow/server/
├── routes/
│   ├── bhashini.ts                   # Bhashini API routes
│   └── chat.ts                       # (Update for voice context)
└── services/
    └── bhashini-service.ts           # Auth caching, API calls
```

### Migration Strategy

**Phase 1: Component Development** (Parallel to existing chatbot)
- Create voice-bot components in new directory
- Implement audio processing utilities
- Set up Bhashini API routes
- Add environment variables

**Phase 2: Integration** (Feature flag)
- Add feature flag to toggle between old/new chatbot
- Test voice bot in production with limited users
- Gather feedback and fix issues

**Phase 3: Replacement** (Full rollout)
- Remove old chatbot component
- Update home.tsx to use VoiceBot
- Remove feature flag
- Update documentation

### Environment Variables

```env
# Bhashini API Configuration
BHASHINI_ULCA_API_KEY=your_api_key_here
BHASHINI_USER_ID=your_user_id_here
BHASHINI_PIPELINE_ID=64392f96daac500b55c543cd

# Groq LLM Configuration (existing)
GROQ_API_KEY=your_groq_key_here

# Database Configuration (existing)
DATABASE_URL=your_postgres_url_here
```

### Performance Optimizations

1. **Audio Context Reuse**: Reuse the recording AudioContext for decoding to avoid Chrome's 6-context limit
2. **Lazy Loading**: Dynamically import audio processing utilities only when needed
3. **Memoization**: Use React.memo for avatar and waveform components to prevent unnecessary re-renders
4. **Debouncing**: Debounce audio level updates to reduce render frequency
5. **Virtual Scrolling**: Use virtual scrolling for long conversation histories
6. **Image Optimization**: Use SVG for avatar to minimize bundle size
7. **Code Splitting**: Split voice bot code into separate chunk for faster initial load

### Security Considerations

1. **API Key Protection**: Never expose Bhashini API keys in frontend code
2. **Input Validation**: Validate all user inputs before sending to APIs
3. **Rate Limiting**: Implement rate limiting on backend API routes
4. **Audio Size Limits**: Enforce maximum audio file size (10MB) to prevent abuse
5. **CORS Configuration**: Properly configure CORS for API endpoints
6. **Content Security Policy**: Add CSP headers to prevent XSS attacks
7. **HTTPS Required**: Enforce HTTPS for MediaRecorder API access

### Browser Compatibility

**Supported Browsers**:
- Chrome/Edge 88+ (full support)
- Firefox 85+ (full support)
- Safari 14.1+ (full support with limitations)
- Mobile browsers (iOS Safari 14.5+, Chrome Android 88+)

**Known Limitations**:
- Safari may require user gesture for audio playback (auto-play restrictions)
- Some Android browsers may have different audio codec support
- Older browsers may not support MediaRecorder API (fallback to text input)

**Feature Detection**:
```typescript
const isMediaRecorderSupported = typeof MediaRecorder !== 'undefined';
const isWebAudioSupported = typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined';
```

### Monitoring and Analytics

**Metrics to Track**:
- Voice interaction success rate
- ASR accuracy (user corrections)
- TTS playback completion rate
- Average response time per API
- Error rates by type
- Language usage distribution
- User engagement (messages per session)
- Feature adoption (voice vs text usage)

**Logging Strategy**:
- Log all API errors with context
- Log audio processing failures
- Log performance metrics (timing)
- Avoid logging sensitive user data
- Use structured logging format (JSON)

## Deployment Considerations

### Backend Deployment

1. **Environment Setup**: Ensure all environment variables are configured in production
2. **Database Migration**: No schema changes required (reuses existing tables)
3. **API Routes**: Add new Bhashini routes to Express app
4. **Health Checks**: Add health check endpoint for Bhashini API connectivity

### Frontend Deployment

1. **Build Configuration**: Update Vite config for code splitting
2. **Asset Optimization**: Optimize SVG avatar for production
3. **Service Worker**: Consider adding service worker for offline text input
4. **CDN**: Serve static assets from CDN for faster load times

### Rollback Plan

1. **Feature Flag**: Keep feature flag for quick rollback
2. **Database**: No schema changes, so rollback is safe
3. **Frontend**: Deploy old chatbot component alongside new one
4. **Monitoring**: Set up alerts for error rate spikes

## Future Enhancements

1. **Real-time Streaming**: Implement streaming ASR for faster feedback
2. **Offline Support**: Add offline mode with cached responses
3. **Voice Biometrics**: Add voice authentication for user identification
4. **Custom Wake Word**: Implement "Hey AgriBot" wake word detection
5. **Multi-turn Context**: Improve context handling for complex conversations
6. **Voice Commands**: Add voice commands for navigation ("Show my history")
7. **Emotion Detection**: Analyze voice tone for emotional context
8. **Background Noise Cancellation**: Implement advanced noise filtering
9. **Multiple Voices**: Support different avatar voices (male/female, age)
10. **Voice Cloning**: Allow users to customize avatar voice

## References

- [Bhashini API Documentation](https://bhashini.gov.in/ulca/apis)
- [Web Audio API Specification](https://www.w3.org/TR/webaudio/)
- [MediaRecorder API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [fast-check Documentation](https://fast-check.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
