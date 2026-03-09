# Voice Bot Integration - Requirements

## Feature Overview
Replace the existing text-based chatbot with a voice-enabled bot that supports multilingual speech recognition (ASR), text-to-speech (TTS), and translation using the Bhashini API. The voice bot will provide farmers with a more accessible interface for agricultural advice.

## User Stories

### US-1: Voice Recording
**As a** farmer  
**I want to** record my voice to ask questions about crop diseases  
**So that** I can get agricultural advice without typing

**Acceptance Criteria:**
- AC-1.1: User can press and hold a microphone button to start recording
- AC-1.2: Visual feedback (waveform animation) shows recording is active
- AC-1.3: Audio level indicator displays real-time recording volume
- AC-1.4: Recording stops when user releases the microphone button
- AC-1.5: Recorded audio is converted to 16kHz mono WAV format
- AC-1.6: Audio is encoded to base64 for API transmission

### US-2: Speech Recognition
**As a** farmer  
**I want to** have my voice converted to text in my preferred language  
**So that** the system can understand my questions

**Acceptance Criteria:**
- AC-2.1: System sends recorded audio to Bhashini ASR API
- AC-2.2: System obtains Bhashini authorization token before ASR request
- AC-2.3: Transcribed text is displayed in the chat interface
- AC-2.4: System supports Hindi, English, Tamil, Telugu, Bengali, and Marathi
- AC-2.5: Language selection persists across sessions
- AC-2.6: Error handling for failed speech recognition with user-friendly messages

### US-3: AI Response Generation
**As a** farmer  
**I want to** receive intelligent responses to my agricultural questions  
**So that** I can get expert advice on crop diseases and treatments

**Acceptance Criteria:**
- AC-3.1: System sends transcribed text to chat API
- AC-3.2: AI generates contextual responses based on user's location and recent detections
- AC-3.3: Response considers user's language preference
- AC-3.4: System maintains conversation history for context
- AC-3.5: Responses are agricultural domain-specific

### US-4: Text-to-Speech Playback
**As a** farmer  
**I want to** hear the AI's response in my language  
**So that** I can understand the advice without reading

**Acceptance Criteria:**
- AC-4.1: System converts AI response text to speech using Bhashini TTS API
- AC-4.2: Audio automatically plays when response is received
- AC-4.3: User can replay audio by clicking a speaker icon
- AC-4.4: User can stop audio playback mid-stream
- AC-4.5: TTS supports all languages supported by ASR
- AC-4.6: Audio quality is clear and understandable

### US-5: Animated Avatar
**As a** farmer  
**I want to** see an animated doctor avatar that responds to voice interactions  
**So that** the experience feels more personal and engaging

**Acceptance Criteria:**
- AC-5.1: Avatar displays different states: idle, listening, thinking, speaking
- AC-5.2: Avatar shows realistic facial animations (blinking, eye movement, lip sync)
- AC-5.3: Avatar's mouth movements sync with audio playback
- AC-5.4: Status indicator shows current state (Ready, Listening, Analyzing, Speaking)
- AC-5.5: Visual effects (pulse rings, background glows) match avatar state
- AC-5.6: Avatar is responsive and performs smoothly on mobile devices

### US-6: Fallback Text Input
**As a** farmer  
**I want to** type my questions if voice recording is not available  
**So that** I can still use the system in noisy environments or without microphone access

**Acceptance Criteria:**
- AC-6.1: User can toggle between voice and text input modes
- AC-6.2: Text input field appears when keyboard icon is clicked
- AC-6.3: User can submit text by pressing Enter or clicking send button
- AC-6.4: Text messages follow the same processing flow as voice messages
- AC-6.5: Text input is disabled while recording is active

### US-7: Conversation History
**As a** farmer  
**I want to** see my conversation history with the voice bot  
**So that** I can review previous advice and recommendations

**Acceptance Criteria:**
- AC-7.1: All messages (user and assistant) are displayed in chronological order
- AC-7.2: Each message shows timestamp
- AC-7.3: User messages are visually distinct from assistant messages
- AC-7.4: Conversation history persists in browser storage
- AC-7.5: User can clear conversation history
- AC-7.6: Audio responses can be replayed from history

### US-8: Error Handling
**As a** farmer  
**I want to** receive clear error messages when something goes wrong  
**So that** I know what to do to fix the issue

**Acceptance Criteria:**
- AC-8.1: Microphone permission denied shows helpful message
- AC-8.2: Network errors display retry option
- AC-8.3: API failures show user-friendly error messages
- AC-8.4: Audio playback errors fall back to text display
- AC-8.5: System gracefully handles unsupported browsers
- AC-8.6: Loading states prevent duplicate requests

## Technical Requirements

### TR-1: Bhashini API Integration
- TR-1.1: Implement authorization token caching (1-hour expiry)
- TR-1.2: Use correct service IDs for each language (ASR and TTS)
- TR-1.3: Handle API rate limiting and timeouts
- TR-1.4: Implement retry logic for transient failures

### TR-2: Audio Processing
- TR-2.1: Convert browser-recorded audio (webm/mp4) to 16kHz mono WAV
- TR-2.2: Use Web Audio API for audio analysis and visualization
- TR-2.3: Implement proper cleanup of audio resources (contexts, streams, analyzers)
- TR-2.4: Handle Chrome's AudioContext limit by reusing contexts

### TR-3: State Management
- TR-3.1: Manage voice bot state (idle, listening, thinking, speaking)
- TR-3.2: Synchronize avatar animations with bot state
- TR-3.3: Handle concurrent state transitions gracefully
- TR-3.4: Persist conversation history in localStorage

### TR-4: Performance
- TR-4.1: Optimize avatar animations for 60fps
- TR-4.2: Lazy load audio processing libraries
- TR-4.3: Minimize re-renders during audio playback
- TR-4.4: Implement efficient base64 encoding for large audio files

### TR-5: Accessibility
- TR-5.1: Provide keyboard navigation for all controls
- TR-5.2: Include ARIA labels for screen readers
- TR-5.3: Support high contrast mode
- TR-5.4: Ensure touch targets are at least 44x44px

### TR-6: Browser Compatibility
- TR-6.1: Support Chrome, Firefox, Safari, Edge (latest 2 versions)
- TR-6.2: Gracefully degrade on unsupported browsers
- TR-6.3: Detect and handle missing MediaRecorder API
- TR-6.4: Provide fallback for browsers without Web Audio API

## Dependencies

### External APIs
- Bhashini API (ASR, TTS, Translation)
  - Authorization endpoint: `https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline`
  - Inference endpoint: `https://dhruva-api.bhashini.gov.in/services/inference/pipeline`
- Existing Chat API (`/api/chat`)

### Libraries
- framer-motion (animations)
- lucide-react (icons)
- Web Audio API (native)
- MediaRecorder API (native)

### Environment Variables
- `BHASHINI_ULCA_API_KEY`: Bhashini API key
- `BHASHINI_USER_ID`: Bhashini user ID
- `BHASHINI_PIPELINE_ID`: Pipeline configuration ID

## Constraints

### C-1: Audio Format
- Input: Browser-native formats (webm, mp4, ogg)
- Processing: 16kHz mono WAV
- Output: Base64-encoded audio

### C-2: Language Support
- Supported: Hindi (hi), English (en), Tamil (ta), Telugu (te), Bengali (bn), Marathi (mr)
- Default: Hindi (hi)

### C-3: File Size
- Maximum audio recording: 60 seconds
- Maximum base64 payload: 10MB

### C-4: Browser Requirements
- Microphone access required for voice input
- HTTPS required for MediaRecorder API
- Modern browser with ES6+ support

## Out of Scope

- Real-time streaming speech recognition
- Offline voice processing
- Custom voice training
- Multi-speaker recognition
- Background noise cancellation (beyond browser defaults)
- Voice authentication/biometrics

## Success Metrics

- Voice recognition accuracy > 85%
- Average response time < 5 seconds
- Audio playback success rate > 95%
- User engagement increase > 30% compared to text chatbot
- Mobile usage increase > 40%

## Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Bhashini API downtime | High | Medium | Implement fallback to text-only mode |
| Poor audio quality in noisy environments | Medium | High | Provide text input alternative |
| Browser compatibility issues | Medium | Medium | Feature detection and graceful degradation |
| High API costs | Medium | Low | Implement request caching and rate limiting |
| Slow TTS response times | Medium | Medium | Show loading indicators and allow text reading |
