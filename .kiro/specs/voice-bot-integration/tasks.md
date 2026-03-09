# Implementation Plan: Voice Bot Integration

## Overview

This implementation plan breaks down the voice bot integration into discrete, incremental tasks. Each task builds on previous work and includes specific requirements references. The implementation will be done in TypeScript/React for the frontend and TypeScript/Express for the backend.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Create `AgriSenseFlow/client/src/components/voice-bot/` directory
  - Create `AgriSenseFlow/client/src/lib/voice-bot/` directory
  - Create `AgriSenseFlow/client/src/hooks/` directory (if not exists)
  - Create `AgriSenseFlow/client/src/types/voice-bot.ts` for TypeScript interfaces
  - Install dependencies: `framer-motion` (if not already installed)
  - _Requirements: All_

- [x] 2. Create TypeScript type definitions
  - [x] 2.1 Define core interfaces in `types/voice-bot.ts`
    - Create `VoiceMessage`, `VoiceBotState`, `VoiceBotProps` interfaces
    - Create `BhashiniAuthCache`, `ASRRequest`, `ASRResponse`, `TTSRequest`, `TTSResponse` interfaces
    - Create `ChatRequest`, `ChatResponse` interfaces
    - Create language configuration types
    - _Requirements: All_
  
  - [ ]* 2.2 Write unit tests for type definitions
    - Test that all required properties are present in interfaces
    - Test type compatibility between related interfaces
    - _Requirements: All_

- [x] 3. Implement audio processing utilities
  - [x] 3.1 Create `lib/voice-bot/audio-processing.ts`
    - Implement `writeString()` helper for WAV header
    - Implement `encodePCMtoWAV()` function for PCM to WAV conversion
    - Implement `arrayBufferToBase64()` function for base64 encoding
    - Implement `blobToWavBase64()` function for complete conversion pipeline
    - Add proper error handling and resource cleanup
    - _Requirements: 1.5, 1.6_
  
  - [ ]* 3.2 Write property test for audio format conversion
    - **Property 4: Audio Format Conversion Round-Trip**
    - **Validates: Requirements 1.5, 1.6**
    - Test that for any audio blob, conversion produces valid 16kHz mono WAV
    - Test base64 encoding/decoding round-trip
    - Verify WAV header structure (RIFF, WAVE, PCM format)
  
  - [ ]* 3.3 Write unit tests for audio processing edge cases
    - Test with empty audio data
    - Test with very large audio files
    - Test with invalid audio formats
    - Test error handling for conversion failures
    - _Requirements: 1.5, 1.6_

- [x] 4. Implement Bhashini API client
  - [x] 4.1 Create `lib/voice-bot/bhashini-client.ts`
    - Implement `getBhashiniAuth()` function with caching logic
    - Implement `transcribeAudio()` function for ASR API calls
    - Implement `synthesizeSpeech()` function for TTS API calls
    - Add language configuration constants (ASR_SERVICE_IDS, TTS_SERVICE_IDS)
    - Add proper error handling and retry logic
    - _Requirements: 2.1, 2.2, 2.4, 4.1, 4.5_
  
  - [ ]* 4.2 Write property test for language configuration
    - **Property 8: Language Configuration Completeness**
    - **Validates: Requirements 2.4, 4.5**
    - Test that all supported languages have both ASR and TTS service IDs
    - Test service ID format validity
  
  - [ ]* 4.3 Write property test for auth caching
    - **Property 6: Bhashini Authorization Caching**
    - **Validates: Requirements 2.2**
    - Test that expired tokens trigger new auth requests
    - Test that valid cached tokens are reused
    - Test cache expiration logic (1 hour)
  
  - [ ]* 4.4 Write unit tests for API error handling
    - Test network error handling
    - Test API error response parsing
    - Test retry logic with exponential backoff
    - _Requirements: 2.6, 8.2, 8.3_

- [x] 5. Create backend API routes for Bhashini
  - [x] 5.1 Create `AgriSenseFlow/server/routes/bhashini.ts`
    - Implement `GET /api/bhashini/auth` endpoint
    - Implement `POST /api/bhashini/asr` endpoint
    - Implement `POST /api/bhashini/tts` endpoint
    - Add request validation middleware
    - Add rate limiting middleware
    - _Requirements: 2.1, 2.2, 4.1_
  
  - [x] 5.2 Update `AgriSenseFlow/server/index.ts` to register Bhashini routes
    - Import and mount Bhashini router
    - Add environment variable validation
    - _Requirements: 2.1, 2.2, 4.1_
  
  - [ ]* 5.3 Write integration tests for Bhashini routes
    - Test ASR endpoint with mock audio data
    - Test TTS endpoint with sample text
    - Test auth endpoint response format
    - Test error responses for invalid requests
    - _Requirements: 2.1, 2.2, 4.1_

- [x] 6. Checkpoint - Ensure audio processing and API integration work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement AudioWaveform component
  - [x] 7.1 Create `components/voice-bot/AudioWaveform.tsx`
    - Create component with 20 animated bars
    - Implement spring-based animations using Framer Motion
    - Add height variation based on audioLevel prop
    - Add responsive styling with Tailwind CSS
    - _Requirements: 1.2, 1.3_
  
  - [ ]* 7.2 Write unit tests for AudioWaveform
    - Test rendering with isActive=true/false
    - Test bar height updates based on audioLevel
    - Test animation triggers
    - _Requirements: 1.2, 1.3_

- [x] 8. Implement VoiceRecorder component
  - [x] 8.1 Create `components/voice-bot/VoiceRecorder.tsx`
    - Implement press-and-hold recording interface
    - Add MediaRecorder API integration
    - Add Web Audio API for audio level analysis
    - Implement audio waveform visualization
    - Add text input fallback toggle
    - Add proper resource cleanup (contexts, streams, analyzers)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 6.1, 6.2, 6.3, 6.5_
  
  - [ ]* 8.2 Write property test for recording state management
    - **Property 1: Audio Recording State Management**
    - **Validates: Requirements 1.1, 1.2**
    - Test that pressing mic button starts recording
    - Test that waveform becomes active during recording
  
  - [ ]* 8.3 Write property test for audio level bounds
    - **Property 2: Audio Level Bounds**
    - **Validates: Requirements 1.3**
    - Test that all audioLevel values are in range [0, 1]
  
  - [ ]* 8.4 Write property test for recording stop trigger
    - **Property 3: Recording Stop Trigger**
    - **Validates: Requirements 1.4**
    - Test that releasing button stops recording
    - Test that completion callback is triggered
  
  - [ ]* 8.5 Write property test for text input toggle
    - **Property 21: Text Input Toggle**
    - **Validates: Requirements 6.1, 6.2, 6.5**
    - Test keyboard icon toggles text input visibility
    - Test text input disabled during recording
  
  - [ ]* 8.6 Write unit tests for microphone permission handling
    - Test permission denied error display
    - Test automatic fallback to text input
    - Test retry after permission granted
    - _Requirements: 8.1_

- [x] 9. Implement AudioPlayer component
  - [x] 9.1 Create `components/voice-bot/AudioPlayer.tsx`
    - Implement audio playback with HTML5 Audio API
    - Add play/stop controls
    - Add auto-play on audio received
    - Add playback state synchronization
    - _Requirements: 4.2, 4.3, 4.4_
  
  - [ ]* 9.2 Write property test for auto-play behavior
    - **Property 15: Auto-Play Behavior**
    - **Validates: Requirements 4.2**
    - Test that audio plays automatically when audioBase64 is set
  
  - [ ]* 9.3 Write property test for replay control
    - **Property 16: Audio Replay Control**
    - **Validates: Requirements 4.3**
    - Test that clicking replay restarts audio from beginning
  
  - [ ]* 9.4 Write property test for stop control
    - **Property 17: Audio Stop Control**
    - **Validates: Requirements 4.4**
    - Test that stop button pauses and resets audio
  
  - [ ]* 9.5 Write unit tests for audio playback errors
    - Test fallback to text display on playback failure
    - Test error message display
    - _Requirements: 8.4_

- [x] 10. Implement DoctorAvatar component
  - [x] 10.1 Create `components/voice-bot/DoctorAvatar.tsx`
    - Port SVG avatar graphics from Voice Helpers
    - Implement state-based animations (idle, listening, thinking, speaking)
    - Add realistic eye blinking (2.5-6.5 second intervals)
    - Add state-based eye movement
    - Implement dynamic mouth shapes for lip-sync
    - Add jaw drop animation based on audioLevel
    - Add status indicator with icons and text
    - Add background pulse effects for each state
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 10.2 Write property test for avatar state rendering
    - **Property 18: Avatar State Rendering**
    - **Validates: Requirements 5.1, 5.4, 5.5**
    - Test that each state renders correct visual indicators
    - Test status text matches state
    - Test background effects match state
  
  - [ ]* 10.3 Write property test for animation triggers
    - **Property 19: Avatar Animation Triggers**
    - **Validates: Requirements 5.2**
    - Test blink triggers occur periodically
    - Test eye position updates based on state
    - Test mouth shape changes with audioLevel > 0
  
  - [ ]* 10.4 Write property test for lip-sync coordination
    - **Property 20: Lip-Sync Coordination**
    - **Validates: Requirements 5.3**
    - Test mouth openAmount proportional to audioLevel during speaking
  
  - [ ]* 10.5 Write unit tests for avatar animations
    - Test smooth transitions between states
    - Test animation performance (no dropped frames)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 11. Checkpoint - Ensure all UI components render and animate correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement ConversationHistory component
  - [x] 12.1 Create `components/voice-bot/ConversationHistory.tsx`
    - Implement message list with chronological ordering
    - Add timestamp display for each message
    - Add distinct styling for user vs assistant messages
    - Add audio replay button for assistant messages with audio
    - Add scroll-to-bottom on new messages
    - Add empty state with welcome message
    - _Requirements: 7.1, 7.2, 7.3, 7.6_
  
  - [ ]* 12.2 Write property test for message display consistency
    - **Property 24: Message Display Consistency**
    - **Validates: Requirements 7.1, 7.2, 7.3**
    - Test messages sorted by timestamp
    - Test each message displays timestamp
    - Test user/assistant messages have distinct styling
  
  - [ ]* 12.3 Write property test for audio replay availability
    - **Property 27: Audio Replay Availability**
    - **Validates: Requirements 7.6**
    - Test AudioPlayer rendered for messages with audioBase64
  
  - [ ]* 12.4 Write unit tests for conversation history
    - Test empty state display
    - Test scroll behavior on new messages
    - Test message rendering with various content lengths
    - _Requirements: 7.1, 7.2, 7.3, 7.6_

- [x] 13. Implement localStorage utilities
  - [x] 13.1 Create `lib/voice-bot/storage.ts`
    - Implement `saveMessage()` function
    - Implement `loadMessages()` function
    - Implement `clearMessages()` function
    - Implement `saveLanguagePreference()` function
    - Implement `loadLanguagePreference()` function
    - Add error handling for quota exceeded
    - _Requirements: 2.5, 7.4, 7.5_
  
  - [ ]* 13.2 Write property test for conversation persistence
    - **Property 25: Conversation Persistence**
    - **Validates: Requirements 7.4**
    - Test messages saved to localStorage
    - Test messages loaded on component mount
  
  - [ ]* 13.3 Write property test for language persistence
    - **Property 9: Language Persistence**
    - **Validates: Requirements 2.5**
    - Test language saved to localStorage
    - Test language restored on reload
  
  - [ ]* 13.4 Write property test for history clear operation
    - **Property 26: History Clear Operation**
    - **Validates: Requirements 7.5**
    - Test clear removes all messages from state and storage
  
  - [ ]* 13.5 Write unit tests for storage edge cases
    - Test quota exceeded handling
    - Test invalid data in localStorage
    - Test localStorage unavailable (private browsing)
    - _Requirements: 2.5, 7.4, 7.5_

- [ ] 14. Implement custom hooks for state management
  - [ ] 14.1 Create `hooks/use-voice-bot.ts`
    - Implement main state management hook
    - Add bot state management (idle, listening, thinking, speaking)
    - Add message history management
    - Add language preference management
    - Add error state management
    - Integrate with localStorage utilities
    - _Requirements: All_
  
  - [ ] 14.2 Create `hooks/use-audio-recorder.ts`
    - Implement recording logic hook
    - Add MediaRecorder lifecycle management
    - Add audio level tracking
    - Add resource cleanup
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [ ] 14.3 Create `hooks/use-audio-player.ts`
    - Implement playback logic hook
    - Add audio element management
    - Add play state tracking
    - Add audio level extraction for lip-sync
    - _Requirements: 4.2, 4.3, 4.4, 5.3_
  
  - [ ]* 14.4 Write property test for conversation history growth
    - **Property 13: Conversation History Growth**
    - **Validates: Requirements 3.4**
    - Test history grows by 2 for each interaction
    - Test previous messages preserved
  
  - [ ]* 14.5 Write unit tests for custom hooks
    - Test hook initialization
    - Test state updates
    - Test cleanup on unmount
    - _Requirements: All_

- [x] 15. Implement main VoiceBot component
  - [x] 15.1 Create `components/voice-bot/VoiceBot.tsx`
    - Implement main container component
    - Integrate DoctorAvatar component
    - Integrate VoiceRecorder component
    - Integrate AudioPlayer component
    - Integrate ConversationHistory component
    - Add language selector
    - Add open/close toggle
    - Add clear history button
    - Wire up all event handlers
    - _Requirements: All_
  
  - [ ]* 15.2 Write property test for ASR API integration
    - **Property 5: ASR API Integration**
    - **Validates: Requirements 2.1**
    - Test ASR API called with correct payload
    - Test transcribed text returned
  
  - [ ]* 15.3 Write property test for transcription display
    - **Property 7: Transcription Display**
    - **Validates: Requirements 2.3**
    - Test user message added after ASR completes
  
  - [ ]* 15.4 Write property test for chat API context inclusion
    - **Property 11: Chat API Context Inclusion**
    - **Validates: Requirements 3.2**
    - Test location and detections included in chat request
  
  - [ ]* 15.5 Write property test for chat language parameter
    - **Property 12: Chat Language Parameter**
    - **Validates: Requirements 3.3**
    - Test language included in chat request
  
  - [ ]* 15.6 Write property test for TTS API integration
    - **Property 14: TTS API Integration**
    - **Validates: Requirements 4.1**
    - Test TTS API called with response text
    - Test audio base64 returned
  
  - [ ]* 15.7 Write property test for text submission methods
    - **Property 22: Text Submission Methods**
    - **Validates: Requirements 6.3**
    - Test Enter key and send button trigger same handler
  
  - [ ]* 15.8 Write property test for input mode equivalence
    - **Property 23: Input Mode Equivalence**
    - **Validates: Requirements 6.4**
    - Test text and voice inputs result in same chat API call structure
  
  - [ ]* 15.9 Write unit tests for VoiceBot integration
    - Test component mounting and unmounting
    - Test open/close toggle
    - Test language switching
    - Test clear history
    - _Requirements: All_

- [ ] 16. Checkpoint - Ensure complete voice bot functionality works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Implement error handling and recovery
  - [ ] 17.1 Add error handling to VoiceBot component
    - Add error state display
    - Add retry buttons for recoverable errors
    - Add fallback to text input for microphone errors
    - Add graceful degradation for unsupported browsers
    - Add loading state management to prevent duplicate requests
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [ ]* 17.2 Write property test for ASR error handling
    - **Property 10: ASR Error Handling**
    - **Validates: Requirements 2.6**
    - Test error message displayed on ASR failure
    - Test system remains usable after error
  
  - [ ]* 17.3 Write property test for microphone permission error
    - **Property 28: Microphone Permission Error**
    - **Validates: Requirements 8.1**
    - Test specific error message for permission denied
  
  - [ ]* 17.4 Write property test for network error recovery
    - **Property 29: Network Error Recovery**
    - **Validates: Requirements 8.2**
    - Test retry option displayed on network error
  
  - [ ]* 17.5 Write property test for API error transformation
    - **Property 30: API Error Transformation**
    - **Validates: Requirements 8.3**
    - Test raw errors transformed to user-friendly messages
  
  - [ ]* 17.6 Write property test for audio playback fallback
    - **Property 31: Audio Playback Fallback**
    - **Validates: Requirements 8.4**
    - Test text remains visible on playback error
  
  - [ ]* 17.7 Write property test for feature detection
    - **Property 32: Feature Detection**
    - **Validates: Requirements 8.5**
    - Test fallback message for unsupported browsers
  
  - [ ]* 17.8 Write property test for request deduplication
    - **Property 33: Request Deduplication**
    - **Validates: Requirements 8.6**
    - Test additional requests blocked during processing
  
  - [ ]* 17.9 Write unit tests for error scenarios
    - Test all error types display correctly
    - Test error recovery flows
    - Test resource cleanup on errors
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 18. Update home page to use VoiceBot
  - [x] 18.1 Update `AgriSenseFlow/client/src/pages/home.tsx`
    - Import VoiceBot component
    - Replace Chatbot component with VoiceBot
    - Pass context (location, recentDetections) to VoiceBot
    - Update state management for voice interactions
    - _Requirements: All_
  
  - [ ]* 18.2 Write integration test for home page with VoiceBot
    - Test VoiceBot renders on home page
    - Test context passed correctly
    - Test voice bot opens and closes
    - _Requirements: All_

- [x] 19. Add environment variables and configuration
  - [x] 19.1 Update `.env.example` with Bhashini variables
    - Add BHASHINI_ULCA_API_KEY
    - Add BHASHINI_USER_ID
    - Add BHASHINI_PIPELINE_ID
    - _Requirements: 2.1, 2.2, 4.1_
  
  - [x] 19.2 Update server startup to validate environment variables
    - Check for required Bhashini variables
    - Log warning if variables missing
    - _Requirements: 2.1, 2.2, 4.1_

- [ ] 20. Add accessibility features
  - [ ] 20.1 Add ARIA labels to all interactive elements
    - Add aria-label to mic button
    - Add aria-label to text input
    - Add aria-label to language selector
    - Add aria-live regions for status updates
    - _Requirements: All_
  
  - [ ] 20.2 Add keyboard navigation support
    - Ensure all controls are keyboard accessible
    - Add focus indicators
    - Test tab order
    - _Requirements: All_
  
  - [ ]* 20.3 Write accessibility tests
    - Test ARIA labels present
    - Test keyboard navigation works
    - Test focus management
    - _Requirements: All_

- [ ] 21. Optimize performance
  - [ ] 21.1 Add React.memo to prevent unnecessary re-renders
    - Memoize DoctorAvatar component
    - Memoize AudioWaveform component
    - Memoize ConversationHistory component
    - _Requirements: All_
  
  - [ ] 21.2 Implement code splitting for voice bot
    - Use React.lazy for VoiceBot component
    - Add loading fallback
    - _Requirements: All_
  
  - [ ] 21.3 Optimize audio processing
    - Debounce audio level updates
    - Reuse AudioContext instances
    - Clean up resources promptly
    - _Requirements: 1.2, 1.3, 1.5, 1.6_

- [ ] 22. Final checkpoint - End-to-end testing and polish
  - Test complete voice interaction flow
  - Test text fallback flow
  - Test language switching
  - Test error recovery
  - Test on multiple browsers
  - Test on mobile devices
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 23. Documentation and cleanup
  - [ ] 23.1 Add JSDoc comments to all public functions
    - Document audio processing functions
    - Document API client functions
    - Document custom hooks
    - _Requirements: All_
  
  - [ ] 23.2 Create README for voice bot components
    - Document component usage
    - Document props and interfaces
    - Add usage examples
    - _Requirements: All_
  
  - [x] 23.3 Remove old chatbot component
    - Delete `components/chatbot.tsx`
    - Remove unused imports
    - Update any references
    - _Requirements: All_

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All tests should be tagged with feature name and property number where applicable
- Backend routes reuse existing Bhashini integration from Voice Helpers
- Frontend components are adapted from Voice Helpers to TypeScript and AgriSenseFlow structure
