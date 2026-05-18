import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 3000;

// ============================================
// ZSKY AI - COMPLETELY FREE, NO API KEY NEEDED
// ============================================

app.post('/api/generate/text-to-video', async (req, res) => {
  try {
    const { prompt, duration = 5 } = req.body;

    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Please enter a video description' 
      });
    }

    console.log('Generating video for prompt:', prompt);

    // Call ZSky AI free API - NO API KEY REQUIRED
    const response = await fetch('https://zsky.ai/api/v1/video/generate', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        duration: parseInt(duration) || 5,
        resolution: '1080p',
        audio: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ZSky API error:', response.status, errorText);
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    // Get video as buffer
    const videoBuffer = await response.buffer();
    const base64Video = videoBuffer.toString('base64');

    console.log('Video generated successfully, size:', videoBuffer.length, 'bytes');

    res.json({
      success: true,
      status: 'COMPLETED',
      videoData: `data:video/mp4;base64,${base64Video}`,
      message: 'Video generated successfully'
    });

  } catch (error) {
    console.error('Generation error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate video'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    free: true, 
    provider: 'ZSky AI',
    message: 'Free video generation API is running'
  });
});

// Test endpoint (no video generation, just confirms server works)
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Server is working! Use POST /api/generate/text-to-video with a prompt.'
  });
});

app.listen(PORT, () => {
  console.log('🆓 FREE Video API running on port ' + PORT);
  console.log('📍 Test: http://localhost:' + PORT + '/api/test');
  console.log('❤️  Health: http://localhost:' + PORT + '/api/health');
});
