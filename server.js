/**
 * Quote Generator Server
 * 
 * Simple Express server to handle ElevenLabs TTS API requests
 * and serve the static files for the quote generator app.
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const https = require('https');

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

        // Prepare request data
        const postData = JSON.stringify({
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: ELEVENLABS_CONFIG.VOICE_SETTINGS
        });

        const options = {
            hostname: 'api.elevenlabs.io',
            port: 443,
            path: `/v1/text-to-speech/${ELEVENLABS_CONFIG.VOICE_ID}`,
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        // Make HTTPS request to ElevenLabs API
        const apiRequest = https.request(options, (apiResponse) => {
            console.log(`ElevenLabs API status: ${apiResponse.statusCode}`);
            
            if (apiResponse.statusCode !== 200) {
                let errorData = '';
                apiResponse.on('data', (chunk) => {
                    errorData += chunk;
                });
                apiResponse.on('end', () => {
                    console.error(`❌ ElevenLabs API error: ${apiResponse.statusCode}`, errorData);
                    res.status(apiResponse.statusCode).json({ 
                        error: `ElevenLabs API error: ${apiResponse.statusCode}` 
                    });
                });
                return;
            }

            // Stream the audio response directly to client
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Disposition', 'inline');
            
            apiResponse.pipe(res);
        });

        apiRequest.on('error', (error) => {
            console.error('❌ HTTPS request error:', error);
            res.status(500).json({ error: 'Network error connecting to ElevenLabs' });
        });

        // Send the request data
        apiRequest.write(postData);
        apiRequest.end();
        
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