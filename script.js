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

// API Configuration
const API_CONFIG = {
    BASE_URL: 'https://zenquotes.io',
    ENDPOINTS: {
        RANDOM: '/api/random'
    },
    // ZenQuotes doesn't support filtering parameters, but provides good inspirational quotes
    PARAMS: {}
};

// Twitter sharing configuration
const TWITTER_CONFIG = {
    BASE_URL: 'https://twitter.com/intent/tweet',
    HASHTAGS: 'motivation,inspiration,quotes,dailyquote'
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
    
    // Action buttons
    newQuoteBtn: document.getElementById('newQuoteBtn'),
    copyBtn: document.getElementById('copyBtn'),
    tweetBtn: document.getElementById('tweetBtn'),
    
    // Notification elements
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    errorMessage: document.getElementById('errorMessage')
};

// Application State
let currentQuote = null;
let isLoading = false;

/**
 * Quote Generator Class
 * Handles all quote-related operations including fetching, displaying, and sharing
 */
class QuoteGenerator {
    constructor() {
        this.initializeApp();
        this.attachEventListeners();
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
        }
    }

    /**
     * Fetch a new random quote from the API
     */
    async fetchNewQuote() {
        try {
            console.log('📡 Fetching new quote...');
            
            // Set loading state
            isLoading = true;
            this.showLoadingState();
            this.setButtonLoadingState(elements.newQuoteBtn, true);

            // Build API URL with parameters
            const url = this.buildApiUrl();
            
            // Fetch quote with timeout
            const response = await this.fetchWithTimeout(url, 10000); // 10 second timeout
            
            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Parse JSON response (ZenQuotes returns an array)
            const responseData = await response.json();
            
            // Extract the first quote from the array
            const quoteData = Array.isArray(responseData) ? responseData[0] : responseData;
            
            // Validate quote data
            if (!this.validateQuoteData(quoteData)) {
                throw new Error('Invalid quote data received from API');
            }

            // Convert ZenQuotes format to our internal format
            const normalizedQuote = {
                content: quoteData.q,
                author: quoteData.a,
                tags: [] // ZenQuotes doesn't provide tags in this format
            };

            // Store current quote
            currentQuote = normalizedQuote;
            
            // Display the quote
            this.displayQuote(normalizedQuote);
            
            console.log('✅ Quote fetched successfully:', normalizedQuote.content.substring(0, 50) + '...');

        } catch (error) {
            console.error('❌ Error fetching quote:', error);
            this.handleFetchError(error);
        } finally {
            // Reset loading state
            isLoading = false;
            this.setButtonLoadingState(elements.newQuoteBtn, false);
        }
    }

    /**
     * Build API URL (ZenQuotes API doesn't require parameters)
     * @returns {string} The complete API URL
     */
    buildApiUrl() {
        return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RANDOM}`;
    }

    /**
     * Fetch with timeout to prevent hanging requests
     * @param {string} url - The URL to fetch
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<Response>} The fetch response
     */
    async fetchWithTimeout(url, timeout = 8000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please check your internet connection.');
            }
            throw error;
        }
    }

    /**
     * Validate quote data received from ZenQuotes API
     * @param {Object} quoteData - The quote data to validate
     * @returns {boolean} True if valid, false otherwise
     */
    validateQuoteData(quoteData) {
        return (
            quoteData &&
            typeof quoteData === 'object' &&
            typeof quoteData.q === 'string' &&
            quoteData.q.trim().length > 0 &&
            typeof quoteData.a === 'string' &&
            quoteData.a.trim().length > 0
        );
    }

    /**
     * Display a quote in the UI
     * @param {Object} quote - The quote object to display
     */
    displayQuote(quote) {
        try {
            console.log('🎨 Displaying quote...');

            // Update quote text
            elements.quoteText.textContent = quote.content;
            
            // Update author
            elements.quoteAuthor.textContent = quote.author;
            
            // Update tags if they exist
            this.displayTags(quote.tags || []);
            
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
