/**
 * Quote Generator Server
 * 
 * Simple Express server to handle ElevenLabs TTS API requests
 * and serve the static files for the quote generator app.
 */

const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// ElevenLabs Configuration
const ELEVENLABS_CONFIG = {
    BASE_URL: 'https://api.elevenlabs.io/v1',
    VOICE_ID: '21m00Tcm4TlvDq8ikWAM', // Rachel voice - natural, clear female voice
    VOICE_SETTINGS: {
        stability: 0.75,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
    }
};

/**
 * TTS endpoint - converts text to speech using ElevenLabs API
 */
app.post('/api/tts', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Check for API key
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'ElevenLabs API key not configured' });
        }

        console.log(`🔊 Generating TTS for: "${text}"`);

        // Make request to ElevenLabs API
        const response = await fetch(`${ELEVENLABS_CONFIG.BASE_URL}/text-to-speech/${ELEVENLABS_CONFIG.VOICE_ID}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: ELEVENLABS_CONFIG.VOICE_SETTINGS
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ ElevenLabs API error: ${response.status} ${response.statusText}`, errorText);
            return res.status(response.status).json({ 
                error: `ElevenLabs API error: ${response.status} ${response.statusText}` 
            });
        }

        // Stream the audio response
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', 'inline');
        
        response.body.pipe(res);
        
        console.log(`✅ TTS generated successfully for: "${text}"`);

    } catch (error) {
        console.error('❌ TTS endpoint error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        features: {
            elevenlabs_tts: !!process.env.ELEVENLABS_API_KEY
        }
    });
});

/**
 * Serve the main app
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Quote Generator Server running on http://0.0.0.0:${PORT}`);
    console.log(`🔊 ElevenLabs TTS: ${process.env.ELEVENLABS_API_KEY ? 'Enabled' : 'Disabled'}`);
});