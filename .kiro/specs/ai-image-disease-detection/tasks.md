# Implementation Plan: AI Image-Based Disease Detection

## Overview

This implementation plan breaks down the integration of AI-powered image-based disease detection into the Kisan Mitra application. The feature will be built incrementally, starting with core detection functionality, then adding history management, analytics, and finally integration with existing Kisan Mitra features. Each task builds on previous work to ensure a cohesive, working system at every checkpoint.

## Tasks

- [x] 1. Set up disease detection infrastructure and API service
  - Create directory structure: `src/components/disease-detection/` and `src/lib/disease-detection/`
  - Create API service module for HuggingFace disease detection endpoint
  - Define TypeScript interfaces for DetectionResult, Prediction, and API schemas
  - Set up Zod schemas for runtime validation
  - Configure environment variables for HuggingFace endpoint
  - _Requirements: 2.1, 2.7, 2.8_

- [ ] 2. Implement image upload component with drag-drop and camera
  - [x] 2.1 Create ImageUploadComponent with drag-drop functionality
    - Implement using react-dropzone library
    - Add file type validation (JPEG, PNG, WEBP)
    - Add file size validation (max 10MB)
    - Display preview of selected image
    - Show appropriate error messages for invalid files
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.9, 1.10_

  - [x] 2.2 Write property test for file validation
    - **Property 1: File Validation Consistency**
    - **Validates: Requirements 1.3, 1.4, 1.9**

  - [x] 2.3 Add camera capture functionality
    - Implement camera button and video stream initialization
    - Request camera permissions using navigator.mediaDevices.getUserMedia
    - Add capture button to take photo from video stream
    - Convert captured image to File object
    - Implement camera resource cleanup on unmount
    - _Requirements: 1.6, 1.7, 1.8_

  - [x] 2.4 Write property test for camera resource cleanup
    - **Property 13: Camera Resource Cleanup**
    - **Validates: Requirements 1.7, 1.8**

  - [x] 2.5 Style component with Shadcn/UI
    - Use Card, Button components from Shadcn/UI
    - Implement responsive layout
    - Add loading states and animations
    - Ensure consistency with Kisan Mitra design system
    - _Requirements: 8.5_

- [ ] 3. Implement disease detection API integration
  - [x] 3.1 Create detection service with retry logic
    - Implement API call to HuggingFace endpoint
    - Send image as FormData with optional location data
    - Implement exponential backoff retry mechanism (3 attempts)
    - Parse and validate API response against schema
    - Handle network errors and timeouts
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7_

  - [ ] 3.2 Write property test for retry mechanism
    - **Property 12: Retry Mechanism Exhaustion**
    - **Validates: Requirements 2.4, 2.5**

  - [x] 3.3 Create DetectionResult object builder
    - Generate unique ID using timestamp
    - Convert image to data URL for storage
    - Include geolocation if available
    - Set timestamp and metadata
    - Calculate total disease count
    - _Requirements: 2.8_

  - [ ] 3.4 Write property test for detection result schema
    - **Property 3: Detection Result Schema Compliance**
    - **Validates: Requirements 2.7, 2.8**

  - [ ] 3.5 Write unit tests for API error handling
    - Test timeout scenarios
    - Test invalid response formats
    - Test network failures
    - Test empty predictions handling
    - _Requirements: 2.4, 2.5, 2.6_

- [ ] 4. Checkpoint - Ensure basic detection works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement detection results display
  - [x] 5.1 Create DetectionResultCard component
    - Display total disease count and timestamp
    - Show location coordinates if available
    - List each prediction with disease name and confidence
    - Implement severity badges (High/Medium/Low)
    - Add progress bars for confidence visualization
    - Include treatment recommendation prompt
    - _Requirements: 3.1, 3.3, 3.6, 3.8_

  - [ ] 5.2 Write property test for confidence score display
    - **Property 5: Confidence Score Display Accuracy**
    - **Validates: Requirements 3.6**

  - [x] 5.3 Create DetectionImageWithBoundingBoxes component
    - Load image and get natural dimensions
    - Create SVG overlay with matching viewBox
    - Render bounding boxes for each prediction
    - Draw disease labels with confidence percentages
    - Implement distinct colors for different diseases
    - Add hover effects for interactivity
    - _Requirements: 3.2, 3.4, 3.5_

  - [ ] 5.4 Write property test for bounding box coordinates
    - **Property 4: Bounding Box Coordinate Validity**
    - **Validates: Requirements 3.2**

  - [x] 5.5 Handle empty detection results
    - Display "no diseases detected" message
    - Show original image without bounding boxes
    - Provide positive feedback for healthy crops
    - _Requirements: 3.7_

  - [ ] 5.6 Write property test for empty detection handling
    - **Property 14: Empty Detection Handling**
    - **Validates: Requirements 2.6, 3.7**

- [ ] 6. Implement detection history storage
  - [x] 6.1 Create localStorage service for detection history
    - Implement saveDetection function with JSON serialization
    - Implement getDetectionHistory function with deserialization
    - Implement deleteDetection function
    - Implement clearAllDetections function
    - Handle localStorage quota exceeded errors
    - Enforce maximum history size (100 detections)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 6.2 Write property test for persistence round trip
    - **Property 6: Detection History Persistence Round Trip**
    - **Validates: Requirements 4.3, 4.4**

  - [ ] 6.3 Write property test for storage quota management
    - **Property 8: Storage Quota Management**
    - **Validates: Requirements 4.5**

  - [x] 6.4 Create DetectionHistoryList component
    - Display detections sorted by timestamp (newest first)
    - Show thumbnail, disease count, date, location for each item
    - Implement click handler to view full results
    - Add delete button for individual items
    - Add clear all history button
    - _Requirements: 4.6, 4.7, 4.8, 4.9_

  - [ ] 6.5 Write property test for history ordering
    - **Property 7: History Ordering Consistency**
    - **Validates: Requirements 4.6**

- [ ] 7. Checkpoint - Ensure detection and history work together
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Integrate Gemini AI for treatment recommendations
  - [x] 8.1 Extend Gemini service for disease treatment
    - Create getDiseaseeTreatment function
    - Build context with disease names, confidences, crop type
    - Use organic farming-focused prompt
    - Include location data if available
    - Parse and return treatment recommendations
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 8.2 Add treatment recommendation button to results
    - Add "Get Treatment Advice" button to DetectionResultCard
    - Show loading state while fetching recommendations
    - Display recommendations in expandable section
    - Handle API failures with fallback suggestions
    - _Requirements: 5.1, 5.6, 5.8_

  - [x] 8.3 Enable follow-up questions via chatbot
    - Pass disease context to existing AIChatbot component
    - Pre-populate chatbot with disease information
    - Allow users to ask follow-up questions
    - Maintain conversation context
    - _Requirements: 5.7_

  - [ ] 8.4 Write unit tests for treatment integration
    - Test context building with multiple diseases
    - Test fallback recommendations
    - Test chatbot context passing
    - _Requirements: 5.2, 5.3, 5.8_

- [ ] 9. Implement multilingual support
  - [x] 9.1 Integrate Bhashini translation service
    - Use existing translateText function from lib/bhashini.ts
    - Wrap UI text components with TranslatedText
    - Translate disease names from API responses
    - Translate treatment recommendations
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 9.2 Handle language changes and fallbacks
    - Listen to language context changes
    - Re-translate displayed content on language change
    - Implement fallback to English on translation failure
    - Display error messages in user's language
    - _Requirements: 6.5, 6.6, 6.7, 6.8_

  - [ ] 9.3 Write property test for translation fallback
    - **Property 9: Translation Fallback Behavior**
    - **Validates: Requirements 6.6, 6.8**

- [ ] 10. Implement analytics dashboard
  - [x] 10.1 Create data aggregation utilities
    - Implement aggregateDiseaseFrequency function
    - Implement aggregateTemporalData function (by week/month)
    - Implement calculateConfidenceStats function
    - Add date range filtering
    - Add field filtering
    - _Requirements: 7.1, 7.2, 7.3, 7.8_

  - [ ] 10.2 Write property test for disease frequency aggregation
    - **Property 10: Disease Frequency Aggregation Accuracy**
    - **Validates: Requirements 7.2**

  - [x] 10.3 Create AnalyticsSummary component
    - Display total detections count
    - Display unique diseases count
    - Display most common disease
    - Display average confidence score
    - Handle insufficient data case (< 3 detections)
    - _Requirements: 7.1, 7.7_

  - [x] 10.4 Create DiseaseFrequencyChart component
    - Use Recharts library (already in dependencies)
    - Implement bar chart with disease names on X-axis
    - Sort by frequency descending
    - Add tooltips with detailed information
    - _Requirements: 7.2_

  - [x] 10.5 Create TemporalTrendChart component
    - Implement line chart with time periods on X-axis
    - Show multiple lines for different diseases
    - Group data by week or month
    - Add legend and tooltips
    - _Requirements: 7.3_

  - [x] 10.6 Create DiseaseLocationMap component
    - Use Leaflet.js for map rendering
    - Add markers for each detection with location data
    - Color-code markers by disease type
    - Implement marker clustering for nearby detections
    - Add popups with detection details on marker click
    - _Requirements: 7.4, 7.5_

  - [ ] 10.7 Write property test for map marker accuracy
    - **Property 11: Map Marker Location Accuracy**
    - **Validates: Requirements 7.4**

  - [x] 10.8 Implement confidence distribution visualization
    - Create box plot or histogram for confidence scores
    - Group by disease type
    - Show min, max, average values
    - _Requirements: 7.6_

  - [x] 10.9 Add date range and field filters
    - Create filter controls for date range selection
    - Create dropdown for field selection
    - Update all charts when filters change
    - Persist filter preferences
    - _Requirements: 7.8, 7.9_

- [ ] 11. Checkpoint - Ensure analytics display correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Integrate with existing Kisan Mitra features
  - [x] 12.1 Add disease detection to main navigation
    - Add new tab/route for disease detection in Dashboard
    - Update navigation menu with disease detection link
    - Add icon for disease detection feature
    - Ensure responsive navigation on mobile
    - _Requirements: 8.1_

  - [x] 12.2 Integrate geolocation service
    - Use existing getCurrentLocation utility from Kisan Mitra
    - Request location permissions on component mount
    - Pass location data to detection API
    - Handle location permission denial gracefully
    - _Requirements: 8.2, 10.5, 10.6_

  - [ ] 12.3 Link detections to field management
    - Associate detections with specific fields based on location
    - Display recent detections in field detail view
    - Add field selector in detection interface
    - _Requirements: 8.6, 8.7_

  - [ ] 12.4 Reuse existing storage utilities
    - Use storage patterns from lib/storage.ts
    - Maintain consistency with existing data structures
    - Implement similar error handling
    - _Requirements: 8.8_

  - [ ] 12.5 Write integration tests for Kisan Mitra features
    - Test navigation to disease detection page
    - Test geolocation integration
    - Test field association
    - Test chatbot integration with disease context
    - _Requirements: 8.1, 8.2, 8.3, 8.6, 8.7_

- [ ] 13. Implement performance optimizations
  - [x] 13.1 Add loading states and progress indicators
    - Show spinner during image upload
    - Display progress during API call
    - Show estimated time for long operations (> 5 seconds)
    - Add skeleton loaders for charts
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 13.2 Optimize image handling
    - Compress images before upload for slow connections
    - Optimize image display sizes
    - Implement lazy loading for history thumbnails
    - Cache detection results for instant reload
    - _Requirements: 9.4, 9.5, 9.6_

  - [x] 13.3 Handle offline scenarios
    - Detect offline state and display message
    - Disable upload functionality when offline
    - Allow viewing cached history when offline
    - Show actionable error messages for network issues
    - _Requirements: 9.7, 9.8_

  - [ ] 13.4 Write unit tests for performance features
    - Test loading state transitions
    - Test image compression
    - Test offline detection
    - Test cache behavior
    - _Requirements: 9.1, 9.2, 9.4, 9.6, 9.7_

- [ ] 14. Implement security and privacy features
  - [x] 14.1 Ensure secure data handling
    - Verify HTTPS for all API calls
    - Store data only in browser localStorage
    - Use data URLs or blob URLs for images
    - Avoid exposing file system paths
    - _Requirements: 10.1, 10.2, 10.4_

  - [ ] 14.2 Write property test for HTTPS enforcement
    - **Property 15: HTTPS Protocol Enforcement**
    - **Validates: Requirements 10.2**

  - [x] 14.3 Implement data deletion
    - Add delete functionality for individual detections
    - Add clear all history functionality
    - Ensure complete removal from localStorage
    - Handle missing data gracefully after deletion
    - _Requirements: 10.3, 10.8_

  - [x] 14.4 Handle location permissions properly
    - Request permissions only when needed
    - Continue functioning without location data if denied
    - Don't store location if permission not granted
    - Respect user privacy preferences
    - _Requirements: 10.5, 10.6, 10.7_

  - [ ] 14.5 Write unit tests for security features
    - Test HTTPS URL validation
    - Test data deletion completeness
    - Test permission handling
    - Test privacy compliance
    - _Requirements: 10.2, 10.3, 10.5, 10.6_

- [ ] 15. Create main disease detection page with tabs
  - [x] 15.1 Create DiseaseDetectionPage component
    - Set up tab navigation (Detect, Results, History, Analytics)
    - Implement state management for current detection
    - Handle tab switching and state persistence
    - Integrate all sub-components
    - _Requirements: 8.1_

  - [x] 15.2 Wire all components together
    - Connect ImageUpload to detection API
    - Connect detection results to history storage
    - Connect history to analytics
    - Connect results to treatment recommendations
    - Ensure data flows correctly between components
    - _Requirements: 2.1, 4.1, 5.1, 7.1_

  - [ ] 15.3 Write integration tests for complete flow
    - Test upload → detect → results → history flow
    - Test results → treatment → chatbot flow
    - Test history → analytics flow
    - Test navigation between tabs
    - _Requirements: All major flows_

- [ ] 16. Final checkpoint - End-to-end testing
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all features work together seamlessly
  - Test on different screen sizes and devices
  - Verify multilingual support across all features
  - Check performance with large history datasets

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and allow for user feedback
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples, edge cases, and integration points
- The implementation follows a bottom-up approach: infrastructure → core features → integration → optimization
- All components use TypeScript for type safety and Shadcn/UI for consistent styling
- The feature integrates seamlessly with existing Kisan Mitra infrastructure (Gemini AI, Bhashini, storage, geolocation)
