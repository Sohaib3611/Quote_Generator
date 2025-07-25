# Quote Generator Web Application

## Overview

This is a lightweight, client-side web application that generates and displays inspirational quotes. The app uses a curated local database of inspirational quotes and provides users with sharing capabilities and text-to-speech functionality through ElevenLabs API integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Single Page Application (SPA)**: Pure client-side implementation using vanilla HTML, CSS, and JavaScript
- **No Build Process**: Direct browser execution without bundlers or transpilers
- **Responsive Design**: Mobile-first approach with CSS Grid/Flexbox layout
- **Component-Based CSS**: Modular CSS with custom properties for theming

### Backend Architecture
- **Express.js Server**: Node.js server handling static files and API endpoints
- **TTS API Integration**: Secure server-side ElevenLabs API calls for voice synthesis
- **Environment Variable Management**: Secure API key handling via server environment

### Technology Stack
- **HTML5**: Semantic markup with accessibility considerations
- **CSS3**: Modern CSS with custom properties, gradients, and animations
- **Vanilla JavaScript**: ES6+ features for DOM manipulation and API communication
- **Node.js/Express**: Server-side runtime and web framework
- **ElevenLabs API**: High-quality text-to-speech with natural human voices
- **External CDNs**: Font Awesome for icons, Google Fonts for typography

## Key Components

### 1. Quote Display System
- **Quote Card**: Central UI component displaying quote text, author, and metadata
- **Loading States**: Spinner animation during API requests
- **Error Handling**: User-friendly error messages for API failures

### 2. Quote Management System
- **Local Quote Database**: Curated collection of inspirational quotes from famous figures (Steve Jobs, Eleanor Roosevelt, Winston Churchill, etc.)
- **Smart Selection**: Randomized quote selection with duplicate prevention logic
- **Reliable Delivery**: No external dependencies ensuring consistent functionality

### 3. User Interaction Features
- **Copy to Clipboard**: Browser Clipboard API integration
- **Social Sharing**: Twitter intent URL generation
- **Quote Generation**: On-demand fetching of new quotes
- **Theme Toggle**: Dark/light mode switching with localStorage persistence
- **Natural Voice Pronunciation**: ElevenLabs TTS integration for human-like pronunciation

### 4. Text-to-Speech System
- **ElevenLabs Integration**: High-quality voice synthesis using Rachel voice
- **Server-Side Processing**: Secure API key handling through Express backend
- **Voice Settings**: Optimized stability and similarity settings for natural speech

## Data Flow

### Quote Generation Flow
1. User clicks "New Quote" button
2. JavaScript selects random quote from local database
3. Quote content displays in UI with fade-in animation
4. User can interact with copy, share, or TTS features

### Text-to-Speech Flow
1. User clicks TTS button on quote
2. Frontend sends POST request to `/api/tts` endpoint
3. Express server makes authenticated request to ElevenLabs API
4. Audio stream returns to client and plays automatically
5. Loading states and error handling throughout process

### Theme Management Flow
1. User toggles theme button
2. JavaScript updates CSS custom properties
3. Theme preference saved to localStorage
4. Preference persists across browser sessions

## External Dependencies

### Client-Side Dependencies
- **Font Awesome 6.4.0**: Icon library for UI elements
- **Google Fonts (Inter)**: Typography and font loading
- **Browser APIs**: Clipboard API, localStorage, Audio API

### Server-Side Dependencies
- **Express.js 5.1.0**: Web framework for server routing
- **CORS 2.8.5**: Cross-origin resource sharing middleware
- **node-fetch 3.3.2**: HTTP client for ElevenLabs API calls
- **ElevenLabs API**: External TTS service integration

### Environment Variables
- **ELEVENLABS_API_KEY**: Required for TTS functionality
- **PORT**: Server port configuration (defaults to 5000)

## Deployment Strategy

### Development Setup
- **Local Server**: `npm start` runs Express server on localhost
- **Static Files**: All frontend assets served from root directory
- **Environment Config**: `.env` file for API keys (not in repository)

### Production Considerations
- **Environment Variables**: Secure API key management required
- **Static Hosting**: Frontend can be deployed separately from backend
- **CDN Dependencies**: External resources loaded from reliable CDNs
- **Error Handling**: Graceful fallbacks for API failures

### Security Features
- **Server-Side API Calls**: API keys never exposed to client
- **CORS Protection**: Configured for secure cross-origin requests
- **Input Validation**: Text sanitization for TTS requests
- **Rate Limiting**: Consider implementing for production TTS usage