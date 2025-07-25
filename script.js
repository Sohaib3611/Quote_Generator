/**
 * Quote Generator Web App
 * 
 * A lightweight web application that fetches random inspirational quotes
 * from the Quotable API and displays them with sharing capabilities.
 * 
 * Features:
 * - Fetch random quotes from Quotable API
 * - Display quote with author and tags
 * - Copy to clipboard functionality
 * - Tweet quote functionality
 * - Loading states and error handling
 * - Responsive design
 * 
 * Author: Vibe Coding Initiative
 * Purpose: JavaScript learning and API integration practice
 */

// Local quotes database (fallback for reliable functionality)
const LOCAL_QUOTES = [
    {
        content: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        tags: ["motivation", "work", "passion"]
    },
    {
        content: "Innovation distinguishes between a leader and a follower.",
        author: "Steve Jobs", 
        tags: ["innovation", "leadership"]
    },
    {
        content: "Life is what happens to you while you're busy making other plans.",
        author: "John Lennon",
        tags: ["life", "wisdom"]
    },
    {
        content: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
        tags: ["dreams", "future", "inspiration"]
    },
    {
        content: "It is during our darkest moments that we must focus to see the light.",
        author: "Aristotle",
        tags: ["hope", "perseverance", "wisdom"]
    },
    {
        content: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill",
        tags: ["success", "courage", "perseverance"]
    },
    {
        content: "The only impossible journey is the one you never begin.",
        author: "Tony Robbins",
        tags: ["motivation", "action", "inspiration"]
    },
    {
        content: "In the middle of difficulty lies opportunity.",
        author: "Albert Einstein",
        tags: ["opportunity", "challenges", "wisdom"]
    },
    {
        content: "Believe you can and you're halfway there.",
        author: "Theodore Roosevelt",
        tags: ["belief", "confidence", "motivation"]
    },
    {
        content: "The only person you are destined to become is the person you decide to be.",
        author: "Ralph Waldo Emerson",
        tags: ["self-improvement", "destiny", "choice"]
    },
    {
        content: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
        author: "Ralph Waldo Emerson",
        tags: ["inner strength", "wisdom", "perspective"]
    },
    {
        content: "Do not go where the path may lead, go instead where there is no path and leave a trail.",
        author: "Ralph Waldo Emerson",
        tags: ["leadership", "innovation", "courage"]
    },
    {
        content: "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do.",
        author: "Mark Twain",
        tags: ["action", "regret", "motivation"]
    },
    {
        content: "Your time is limited, don't waste it living someone else's life.",
        author: "Steve Jobs",
        tags: ["time", "authenticity", "life"]
    },
    {
        content: "If you want to lift yourself up, lift up someone else.",
        author: "Booker T. Washington",
        tags: ["helping others", "leadership", "growth"]
    }
];

// Pronunciation dictionary for complex words found in quotes
const PRONUNCIATION_GUIDE = {
    // Common complex words that might appear in quotes
    "distinguish": "di-STING-gwish",
    "distinguishes": "di-STING-gwish-ez",
    "innovation": "in-uh-VAY-shuhn",
    "perseverance": "pur-suh-VEER-uhns",
    "opportunity": "op-er-TOO-ni-tee",
    "disappointed": "dis-uh-POINT-ed",
    "authenticity": "aw-then-TIS-i-tee",
    "churchill": "CHUR-chill",
    "roosevelt": "ROH-zuh-velt",
    "emerson": "EM-er-suhn",
    "aristotle": "AR-i-stot-l",
    "washington": "WASH-ing-tuhn",
    "booker": "BOOK-er",
    "believe": "bi-LEEV",
    "destined": "DES-tind",
    "impossible": "im-POS-uh-buhl",
    "journey": "JUR-nee",
    "difficulty": "DIF-i-kuhl-tee",
    "courage": "KUR-ij",
    "continue": "kuhn-TIN-yoo"
};

// API Configuration (keeping for potential future use)
const API_CONFIG = {
    BASE_URL: 'https://zenquotes.io',
    ENDPOINTS: {
        RANDOM: '/api/random'
    },
    USE_LOCAL: true // Use local quotes for reliability
};

// Twitter sharing configuration
const TWITTER_CONFIG = {
    BASE_URL: 'https://twitter.com/intent/tweet',
    HASHTAGS: 'motivation,inspiration,quotes,dailyquote'
};

// ElevenLabs TTS Configuration
const ELEVENLABS_CONFIG = {
    BASE_URL: 'https://api.elevenlabs.io/v1',
    // Using Rachel voice - natural, clear female voice perfect for pronunciation
    VOICE_ID: '21m00Tcm4TlvDq8ikWAM', // Rachel voice
    VOICE_SETTINGS: {
        stability: 0.75,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
    }
};

// DOM Elements - Cache frequently used elements for better performance
const elements = {
    // Main containers
    quoteCard: document.getElementById('quoteCard'),
    loadingState: document.getElementById('loadingState'),
    quoteContent: document.getElementById('quoteContent'),
    errorState: document.getElementById('errorState'),
    
    // Quote content elements
    quoteText: document.getElementById('quoteText'),
    quoteAuthor: document.getElementById('quoteAuthor'),
    quoteTags: document.getElementById('quoteTags'),
    pronunciationGuide: document.getElementById('pronunciationGuide'),
    pronunciationList: document.getElementById('pronunciationList'),
    
    // Action buttons
    newQuoteBtn: document.getElementById('newQuoteBtn'),
    copyBtn: document.getElementById('copyBtn'),
    tweetBtn: document.getElementById('tweetBtn'),
    
    // Theme toggle
    themeToggle: document.getElementById('themeToggle'),
    themeIcon: document.getElementById('themeIcon'),
    
    // Notification elements
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    errorMessage: document.getElementById('errorMessage')
};

// Application State
let currentQuote = null;
let isLoading = false;
let currentTheme = 'light';

// TTS setup - ElevenLabs integration
let ttsSupported = false;
let currentAudio = null; // Track current audio playback

// Initialize TTS system by checking server health
async function initializeTTS() {
    try {
        console.log('🔊 Checking TTS server capabilities...');
        
        // Check server health and TTS availability
        const response = await fetch('/api/health');
        const health = await response.json();
        
        if (health.features && health.features.elevenlabs_tts) {
            ttsSupported = true;
            console.log('🔊 ElevenLabs TTS ready with natural human voices');
        } else {
            ttsSupported = false;
            console.log('⚠️ ElevenLabs TTS not available - check API configuration');
        }
    } catch (error) {
        console.error('❌ Error checking TTS availability:', error);
        ttsSupported = false;
    }
}

// Initialize TTS on page load
initializeTTS();

/**
 * Quote Generator Class
 * Handles all quote-related operations including fetching, displaying, and sharing
 */
class QuoteGenerator {
    constructor() {
        this.initializeTheme();
        this.initializeApp();
        this.attachEventListeners();
    }

    /**
     * Initialize theme system
     * Load saved theme preference or default to light mode
     */
    initializeTheme() {
        // Check for saved theme preference or default to 'light'
        const savedTheme = localStorage.getItem('quote-generator-theme') || 'light';
        currentTheme = savedTheme;
        
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        // Update theme icon
        this.updateThemeIcon();
        
        console.log(`🎨 Theme initialized: ${currentTheme} mode`);
    }

    /**
     * Initialize the application
     * Load the first quote when the app starts
     */
    async initializeApp() {
        console.log('🚀 Quote Generator App Starting...');
        
        // Show initial loading state
        this.showLoadingState();
        
        // Fetch the first quote
        await this.fetchNewQuote();
        
        console.log('✅ Quote Generator App Ready!');
    }

    /**
     * Attach event listeners to interactive elements
     */
    attachEventListeners() {
        // New Quote button
        elements.newQuoteBtn.addEventListener('click', () => {
            this.handleNewQuoteClick();
        });

        // Copy button
        elements.copyBtn.addEventListener('click', () => {
            this.handleCopyClick();
        });

        // Tweet button
        elements.tweetBtn.addEventListener('click', () => {
            this.handleTweetClick();
        });

        // Theme toggle button
        elements.themeToggle.addEventListener('click', () => {
            this.handleThemeToggle();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            console.log('🌐 Connection restored');
            this.showToast('Connection restored!', 'success');
        });

        window.addEventListener('offline', () => {
            console.log('📡 Connection lost');
            this.showToast('You are currently offline', 'warning');
        });
    }

    /**
     * Handle keyboard shortcuts for better user experience
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyboardShortcuts(event) {
        // Don't trigger shortcuts if user is typing in an input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (event.key.toLowerCase()) {
            case 'n':
            case ' ': // Spacebar
                event.preventDefault();
                if (!isLoading) {
                    this.handleNewQuoteClick();
                }
                break;
            case 'c':
                event.preventDefault();
                if (currentQuote && !isLoading) {
                    this.handleCopyClick();
                }
                break;
            case 't':
                event.preventDefault();
                if (currentQuote && !isLoading) {
                    this.handleTweetClick();
                }
                break;
            case 'd':
                event.preventDefault();
                this.handleThemeToggle();
                break;
        }
    }

    /**
     * Fetch a new random quote (using local database for reliability)
     */
    async fetchNewQuote() {
        try {
            console.log('📡 Fetching new quote...');
            
            // Set loading state
            isLoading = true;
            this.showLoadingState();
            this.setButtonLoadingState(elements.newQuoteBtn, true);

            // Simulate loading delay for better UX
            await new Promise(resolve => setTimeout(resolve, 500));

            // Get random quote from local database
            const randomIndex = Math.floor(Math.random() * LOCAL_QUOTES.length);
            const selectedQuote = LOCAL_QUOTES[randomIndex];
            
            // Ensure we don't show the same quote twice in a row
            if (currentQuote && selectedQuote.content === currentQuote.content && LOCAL_QUOTES.length > 1) {
                // Find a different quote
                let newIndex = randomIndex;
                while (newIndex === randomIndex) {
                    newIndex = Math.floor(Math.random() * LOCAL_QUOTES.length);
                }
                const differentQuote = LOCAL_QUOTES[newIndex];
                currentQuote = differentQuote;
                this.displayQuote(differentQuote);
            } else {
                currentQuote = selectedQuote;
                this.displayQuote(selectedQuote);
            }
            
            console.log('✅ Quote loaded successfully:', currentQuote.content.substring(0, 50) + '...');

        } catch (error) {
            console.error('❌ Error loading quote:', error);
            this.handleFetchError(error);
        } finally {
            // Reset loading state
            isLoading = false;
            this.setButtonLoadingState(elements.newQuoteBtn, false);
        }
    }



    /**
     * Display a quote in the UI
     * @param {Object} quote - The quote object to display
     */
    displayQuote(quote) {
        try {
            console.log('🎨 Displaying quote...');

            // Process quote text for pronunciation highlighting
            const processedQuoteText = this.highlightComplexWords(quote.content);
            elements.quoteText.innerHTML = processedQuoteText;
            
            // Update author with pronunciation if needed
            const processedAuthor = this.highlightComplexWords(quote.author);
            elements.quoteAuthor.innerHTML = processedAuthor;
            
            // Update tags if they exist
            this.displayTags(quote.tags || []);
            
            // Generate and display pronunciation guide
            this.displayPronunciationGuide(quote.content + ' ' + quote.author);
            
            // Show quote content and hide other states
            this.showQuoteContent();
            
            // Show action buttons
            this.showActionButtons();

            console.log('✅ Quote displayed successfully');

        } catch (error) {
            console.error('❌ Error displaying quote:', error);
            this.showErrorState('Error displaying quote. Please try again.');
        }
    }

    /**
     * Display quote tags
     * @param {Array} tags - Array of tag strings
     */
    displayTags(tags) {
        // Clear existing tags
        elements.quoteTags.innerHTML = '';
        
        // Only show tags if they exist and array is not empty
        if (!Array.isArray(tags) || tags.length === 0) {
            elements.quoteTags.style.display = 'none';
            return;
        }

        // Create tag elements
        tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = tag;
            elements.quoteTags.appendChild(tagElement);
        });

        // Show tags container
        elements.quoteTags.style.display = 'flex';
    }

    /**
     * Highlight complex words in text with pronunciation tooltips
     * @param {string} text - The text to process
     * @returns {string} HTML string with highlighted words
     */
    highlightComplexWords(text) {
        let processedText = text;
        
        // Find complex words in the text
        Object.keys(PRONUNCIATION_GUIDE).forEach(word => {
            const pronunciation = PRONUNCIATION_GUIDE[word];
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            
            // Replace with highlighted version
            processedText = processedText.replace(regex, (match) => {
                return `<span class="complex-word" data-pronunciation="${pronunciation}" title="Click for pronunciation: ${pronunciation}">${match}</span>`;
            });
        });
        
        return processedText;
    }

    /**
     * Display pronunciation guide for complex words found in the quote
     * @param {string} fullText - The complete text (quote + author) to analyze
     */
    displayPronunciationGuide(fullText) {
        const foundWords = [];
        
        // Find all complex words in the text
        Object.keys(PRONUNCIATION_GUIDE).forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            if (regex.test(fullText)) {
                const pronunciation = PRONUNCIATION_GUIDE[word];
                // Avoid duplicates and maintain original casing
                const matches = fullText.match(regex);
                if (matches && !foundWords.some(fw => fw.word.toLowerCase() === word.toLowerCase())) {
                    foundWords.push({
                        word: matches[0], // Use the actual match to preserve casing
                        pronunciation: pronunciation
                    });
                }
            }
        });
        
        // Clear pronunciation list
        elements.pronunciationList.innerHTML = '';
        
        if (foundWords.length === 0) {
            elements.pronunciationGuide.style.display = 'none';
            return;
        }
        
        // Create pronunciation entries
        foundWords.forEach(wordData => {
            const entryElement = document.createElement('div');
            entryElement.className = 'pronunciation-entry';
            entryElement.innerHTML = `
                <span class="word">${wordData.word}</span>
                <div class="pronunciation-controls">
                    <span class="pronunciation">${wordData.pronunciation}</span>
                    ${ttsSupported ? '<button class="speak-btn" aria-label="Listen to pronunciation"><i class="fas fa-volume-up"></i></button>' : ''}
                </div>
            `;
            
            // Add click event for speech synthesis
            if (ttsSupported) {
                const speakBtn = entryElement.querySelector('.speak-btn');
                speakBtn.addEventListener('click', () => {
                    this.pronounceWord(wordData.word);
                });
            }
            
            elements.pronunciationList.appendChild(entryElement);
        });
        
        // Show pronunciation guide
        elements.pronunciationGuide.style.display = 'block';
        
        console.log(`📢 Found ${foundWords.length} complex words with pronunciation guides`);
    }

    /**
     * Pronounce a word using ElevenLabs high-quality TTS
     * @param {string} word - The word to pronounce
     */
    async pronounceWord(word) {
        if (!ttsSupported) {
            this.showToast('High-quality text-to-speech not available', 'warning');
            return;
        }

        try {
            // Stop any current audio playback
            if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
            }

            console.log(`🔊 Generating speech for: ${word}`);
            this.showToast(`Generating pronunciation for "${word}"...`, 'info');

            // Generate speech using ElevenLabs API
            const audioBlob = await this.generateElevenLabsSpeech(word);
            
            if (!audioBlob) {
                throw new Error('Failed to generate speech');
            }

            // Create audio URL and play
            const audioUrl = URL.createObjectURL(audioBlob);
            currentAudio = new Audio(audioUrl);
            
            // Configure audio settings
            currentAudio.volume = 0.8;
            
            // Add event listeners
            currentAudio.onplay = () => {
                console.log(`🔊 Playing ElevenLabs voice: ${word}`);
            };
            
            currentAudio.onerror = (event) => {
                console.error('❌ Audio playback error:', event);
                this.showToast('Error playing pronunciation', 'error');
            };
            
            currentAudio.onended = () => {
                console.log(`✅ Finished speaking: ${word}`);
                URL.revokeObjectURL(audioUrl); // Clean up memory
                currentAudio = null;
            };

            // Play the audio
            await currentAudio.play();
            
            // Update feedback
            this.showToast(`Playing natural voice pronunciation`, 'success');

        } catch (error) {
            console.error('❌ Error with ElevenLabs TTS:', error);
            this.showToast('Error generating pronunciation', 'error');
        }
    }

    /**
     * Generate speech using our server's TTS endpoint
     * @param {string} text - Text to convert to speech
     * @returns {Promise<Blob>} Audio blob
     */
    async generateElevenLabsSpeech(text) {
        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server error: ${response.status} ${response.statusText}`);
            }

            return await response.blob();
        } catch (error) {
            console.error('❌ TTS server error:', error);
            throw error;
        }
    }

    /**
     * Handle theme toggle button click
     */
    handleThemeToggle() {
        // Toggle between light and dark
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Apply new theme
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        // Save theme preference
        localStorage.setItem('quote-generator-theme', currentTheme);
        
        // Update icon
        this.updateThemeIcon();
        
        // Show feedback
        const themeText = currentTheme === 'dark' ? 'Dark' : 'Light';
        this.showToast(`${themeText} mode activated`, 'info');
        
        console.log(`🎨 Theme switched to: ${currentTheme} mode`);
    }

    /**
     * Update theme toggle icon based on current theme
     */
    updateThemeIcon() {
        if (currentTheme === 'dark') {
            elements.themeIcon.className = 'fas fa-sun';
        } else {
            elements.themeIcon.className = 'fas fa-moon';
        }
    }

    /**
     * Handle new quote button click
     */
    async handleNewQuoteClick() {
        if (isLoading) {
            console.log('⏳ Already loading, ignoring click');
            return;
        }

        console.log('🔄 New quote requested');
        await this.fetchNewQuote();
    }

    /**
     * Handle copy button click
     */
    async handleCopyClick() {
        if (!currentQuote) {
            console.log('❌ No quote to copy');
            return;
        }

        try {
            // Format quote text for copying
            const quoteText = this.formatQuoteForSharing(currentQuote);
            
            // Use modern Clipboard API if available
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(quoteText);
            } else {
                // Fallback for older browsers or non-HTTPS
                this.fallbackCopyToClipboard(quoteText);
            }

            console.log('📋 Quote copied to clipboard');
            this.showToast('Quote copied to clipboard!', 'success');

        } catch (error) {
            console.error('❌ Error copying quote:', error);
            this.showToast('Failed to copy quote. Please try selecting and copying manually.', 'error');
        }
    }

    /**
     * Fallback method for copying to clipboard in older browsers
     * @param {string} text - Text to copy
     */
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (!successful) {
                throw new Error('Copy command failed');
            }
        } finally {
            document.body.removeChild(textArea);
        }
    }

    /**
     * Handle tweet button click
     */
    handleTweetClick() {
        if (!currentQuote) {
            console.log('❌ No quote to tweet');
            return;
        }

        try {
            // Format quote for Twitter
            const tweetText = this.formatQuoteForTwitter(currentQuote);
            
            // Build Twitter URL
            const twitterUrl = this.buildTwitterUrl(tweetText);
            
            // Open Twitter in new window
            window.open(twitterUrl, '_blank', 'width=550,height=420,scrollbars=yes,resizable=yes');
            
            console.log('🐦 Opening Twitter to share quote');
            this.showToast('Opening Twitter to share quote...', 'info');

        } catch (error) {
            console.error('❌ Error sharing to Twitter:', error);
            this.showToast('Failed to open Twitter. Please try again.', 'error');
        }
    }

    /**
     * Format quote for general sharing (copy to clipboard)
     * @param {Object} quote - The quote object
     * @returns {string} Formatted quote text
     */
    formatQuoteForSharing(quote) {
        return `"${quote.content}"\n\n— ${quote.author}`;
    }

    /**
     * Format quote for Twitter sharing (with character limits in mind)
     * @param {Object} quote - The quote object
     * @returns {string} Formatted tweet text
     */
    formatQuoteForTwitter(quote) {
        const baseText = `"${quote.content}" — ${quote.author}`;
        const hashtags = ` #${TWITTER_CONFIG.HASHTAGS.replace(/,/g, ' #')}`;
        
        // Twitter has a 280 character limit
        const maxLength = 280 - hashtags.length - 10; // Leave some margin
        
        if (baseText.length <= maxLength) {
            return baseText + hashtags;
        } else {
            // Truncate quote if too long
            const truncatedContent = quote.content.substring(0, maxLength - quote.author.length - 20) + '...';
            return `"${truncatedContent}" — ${quote.author}${hashtags}`;
        }
    }

    /**
     * Build Twitter sharing URL
     * @param {string} text - The text to tweet
     * @returns {string} Twitter sharing URL
     */
    buildTwitterUrl(text) {
        const params = new URLSearchParams({
            text: text,
            url: window.location.href
        });
        
        return `${TWITTER_CONFIG.BASE_URL}?${params.toString()}`;
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        elements.loadingState.style.display = 'flex';
        elements.quoteContent.style.display = 'none';
        elements.errorState.style.display = 'none';
        this.hideActionButtons();
    }

    /**
     * Show quote content
     */
    showQuoteContent() {
        elements.loadingState.style.display = 'none';
        elements.quoteContent.style.display = 'block';
        elements.errorState.style.display = 'none';
    }

    /**
     * Show error state
     * @param {string} message - Error message to display
     */
    showErrorState(message = 'Unable to fetch quotes at the moment. Please check your connection and try again.') {
        elements.loadingState.style.display = 'none';
        elements.quoteContent.style.display = 'none';
        elements.errorState.style.display = 'block';
        elements.errorMessage.textContent = message;
        this.hideActionButtons();
    }

    /**
     * Show action buttons
     */
    showActionButtons() {
        elements.copyBtn.style.display = 'inline-flex';
        elements.tweetBtn.style.display = 'inline-flex';
    }

    /**
     * Hide action buttons
     */
    hideActionButtons() {
        elements.copyBtn.style.display = 'none';
        elements.tweetBtn.style.display = 'none';
    }

    /**
     * Set button loading state
     * @param {HTMLElement} button - The button element
     * @param {boolean} loading - Whether the button should show loading state
     */
    setButtonLoadingState(button, loading) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
            const icon = button.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-spinner';
            }
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            const icon = button.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-sync-alt';
            }
        }
    }

    /**
     * Handle fetch errors with appropriate user feedback
     * @param {Error} error - The error that occurred
     */
    handleFetchError(error) {
        let errorMessage = 'Unable to fetch quotes at the moment.';
        
        if (!navigator.onLine) {
            errorMessage = 'You appear to be offline. Please check your internet connection and try again.';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Request timed out. Please check your internet connection and try again.';
        } else if (error.message.includes('HTTP 429')) {
            errorMessage = 'Too many requests. Please wait a moment before trying again.';
        } else if (error.message.includes('HTTP 5')) {
            errorMessage = 'The quote service is temporarily unavailable. Please try again later.';
        } else if (error.message.includes('HTTP')) {
            errorMessage = `Service error (${error.message}). Please try again later.`;
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Unable to connect to the quote service. Please check your internet connection.';
        }

        this.showErrorState(errorMessage);
        console.error('Detailed error:', error);
    }

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type of notification (success, error, info, warning)
     */
    showToast(message, type = 'info') {
        // Update toast content
        elements.toastMessage.textContent = message;
        
        // Update toast icon based on type
        const icon = elements.toast.querySelector('i');
        switch (type) {
            case 'success':
                icon.className = 'fas fa-check-circle';
                elements.toast.style.background = 'var(--accent-color)';
                break;
            case 'error':
                icon.className = 'fas fa-exclamation-circle';
                elements.toast.style.background = 'var(--error-color)';
                break;
            case 'warning':
                icon.className = 'fas fa-exclamation-triangle';
                elements.toast.style.background = 'var(--warning-color)';
                break;
            default:
                icon.className = 'fas fa-info-circle';
                elements.toast.style.background = 'var(--primary-color)';
        }

        // Show toast
        elements.toast.classList.add('show');

        // Hide toast after 3 seconds
        setTimeout(() => {
            elements.toast.classList.remove('show');
        }, 3000);
    }
}

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM Content Loaded - Initializing Quote Generator');
    
    // Create and start the quote generator
    new QuoteGenerator();
});

/**
 * Handle any unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled promise rejection:', event.reason);
    
    // Show user-friendly error message
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
        toastMessage.textContent = 'An unexpected error occurred. Please refresh the page.';
        toast.style.background = 'var(--error-color)';
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }
});

/**
 * Service Worker Registration (for future offline functionality)
 * Currently commented out as no service worker is implemented
 */
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registered:', registration);
        } catch (error) {
            console.log('❌ Service Worker registration failed:', error);
        }
    });
}
*/

// Export for potential module usage (though not used in this simple app)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuoteGenerator, API_CONFIG, TWITTER_CONFIG };
}
