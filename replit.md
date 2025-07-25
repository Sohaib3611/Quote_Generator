# Quote Generator Web Application

## Overview

This is a lightweight, client-side web application that generates and displays inspirational quotes with text-to-speech capabilities. The app combines a curated local database of inspirational quotes with modern web technologies to provide users with an engaging motivation experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Single Page Application (SPA)**: Pure client-side implementation using vanilla HTML, CSS, and JavaScript
- **No Build Process**: Direct browser execution without bundlers or transpilers for simplicity
- **Responsive Design**: Mobile-first approach with CSS Grid/Flexbox layout
- **Component-Based CSS**: Modular CSS with custom properties for consistent theming
- **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with interactive features

### Backend Architecture
- **Express.js Server**: Lightweight Node.js server handling static file serving and API proxying
- **TTS API Integration**: Secure server-side ElevenLabs API calls for high-quality voice synthesis
- **Environment Variable Management**: Secure API key handling via server environment variables
- **CORS Enabled**: Cross-origin resource sharing for flexible deployment options

### Technology Stack
- **Frontend**: HTML5, CSS3 (with custom properties), Vanilla JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **External APIs**: ElevenLabs Text-to-Speech API
- **CDN Dependencies**: Font Awesome (icons), Google Fonts (Inter typography)

## Key Components

### 1. Quote Display System
- **Quote Card Component**: Central UI element displaying quote text, author, and metadata
- **Loading States**: Animated spinner during API requests and quote generation
- **Error Handling**: Graceful degradation with user-friendly error messages
- **Theme System**: Dark/light mode toggle with localStorage persistence

### 2. Quote Management System
- **Local Quote Database**: Curated collection of 15+ inspirational quotes from notable figures
- **Smart Selection Algorithm**: Randomized quote selection with duplicate prevention logic
- **Fallback Strategy**: No external API dependencies for core quote functionality
- **Quote Metadata**: Author attribution and categorization tags

### 3. User Interaction Features
- **Copy to Clipboard**: Browser Clipboard API integration with success feedback
- **Social Sharing**: Twitter intent URL generation for easy quote sharing
- **Voice Pronunciation**: ElevenLabs TTS integration for natural human-like quote reading
- **Accessibility Features**: ARIA labels, keyboard navigation, screen reader support

### 4. Audio System
- **Text-to-Speech Integration**: Server-side ElevenLabs API calls for security
- **Voice Configuration**: Rachel voice with optimized stability and clarity settings
- **Audio Controls**: Play/pause functionality with visual feedback
- **Error Handling**: Graceful fallback when TTS service is unavailable

## Data Flow

### Quote Generation Flow
1. User clicks "New Quote" button
2. JavaScript selects random quote from local database
3. Quote text, author, and tags are rendered to DOM
4. Loading state is displayed during transitions
5. Success state shows the new quote with all interactive options

### Text-to-Speech Flow
1. User clicks audio/speaker button
2. Frontend sends POST request to `/api/tts` endpoint
3. Server validates request and API key availability
4. Server forwards request to ElevenLabs API with configured voice settings
5. Audio stream is returned and played through browser audio controls
6. Error states handled gracefully with user feedback

### Theme Toggle Flow
1. User clicks theme toggle button
2. JavaScript toggles CSS custom property values
3. Theme preference is saved to localStorage
4. Visual transition animations provide smooth UX
5. Theme persists across browser sessions

## External Dependencies

### CDN Resources
- **Font Awesome 6.4.0**: Icon library for UI elements (quote icons, social icons, theme toggle)
- **Google Fonts (Inter)**: Modern, readable typography with multiple weights
- **Preconnect Optimization**: DNS prefetching for improved performance

### API Integrations
- **ElevenLabs TTS API**: High-quality text-to-speech with natural human voices
  - Voice ID: Rachel (21m00Tcm4TlvDq8ikWAM)
  - Optimized settings for quote reading (stability: 0.75, similarity_boost: 0.75)
  - Requires API key in server environment variables

### Node.js Dependencies
- **Express.js**: Web application framework for server functionality
- **CORS**: Cross-origin resource sharing middleware
- **Node-fetch**: HTTP client for API requests (if needed for future enhancements)

## Deployment Strategy

### Static File Serving
- Express server serves HTML, CSS, and JavaScript files directly
- No build process required - files can be served as-is
- Compatible with various hosting platforms (Replit, Vercel, Netlify, etc.)

### Environment Configuration
- **Development**: Local server on port 5000 with hot reload capabilities
- **Production**: Environment variables for API keys and configuration
- **Security**: API keys stored securely on server, never exposed to client

### Performance Considerations
- **Minimal Bundle Size**: No build tools or large frameworks
- **CDN Usage**: External resources served from fast CDNs
- **Caching Strategy**: Static assets can be cached aggressively
- **Progressive Enhancement**: Core functionality works without JavaScript

### Scalability Notes
- Stateless server design allows for easy horizontal scaling
- Local quote database eliminates external API rate limits for core functionality
- TTS feature is optional enhancement, app works without it