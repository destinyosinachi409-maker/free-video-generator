// ============================================
// CONFIG - Change this to your deployed backend URL
// ============================================

// For local testing:
// const API_BASE_URL = 'http://localhost:3000/api';

// For Render deployment (you'll update this in Step 6):
const API_BASE_URL = 'https://free-video-generator-2.onrender.com/api';

// ============================================
// DOM ELEMENTS
// ============================================

const generateBtn = document.getElementById('generate-btn');
const promptInput = document.getElementById('prompt');
const durationSelect = document.getElementById('duration');
const statusArea = document.getElementById('status-area');
const resultArea = document.getElementById('result-area');
const errorArea = document.getElementById('error-area');
const progressFill = document.getElementById('progress-fill');
const statusText = document.getElementById('status-text');
const resultVideo = document.getElementById('result-video');
const downloadBtn = document.getElementById('download-btn');
const newVideoBtn = document.getElementById('new-video-btn');
const retryBtn = document.getElementById('retry-btn');
const errorText = document.getElementById('error-text');

// ============================================
// GENERATE VIDEO
// ============================================

generateBtn.addEventListener('click', async () => {
  const prompt = promptInput.value.trim();
  
  if (!prompt) {
    alert('Please describe what you want in the video!');
    promptInput.focus();
    return;
  }

  // Reset UI
  hideAllAreas();
  statusArea.classList.remove('hidden');
  generateBtn.disabled = true;
  generateBtn.querySelector('.btn-text').classList.add('hidden');
  generateBtn.querySelector('.btn-loader').classList.remove('hidden');
  
  // Animate progress
  progressFill.style.width = '10%';
  statusText.textContent = 'Connecting to free AI server...';

  try {
    // Simulate progress while waiting
    const progressInterval = setInterval(() => {
      const current = parseInt(progressFill.style.width);
      if (current < 80) {
        progressFill.style.width = (current + 5) + '%';
      }
    }, 2000);

    const response = await fetch(`${API_BASE_URL}/generate/text-to-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt,
        duration: parseInt(durationSelect.value)
      })
    });

    clearInterval(progressInterval);

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    // Success!
    progressFill.style.width = '100%';
    statusText.textContent = 'Done!';
    
    // Show video
    if (data.videoData) {
      resultVideo.src = data.videoData;
      downloadBtn.href = data.videoData;
      downloadBtn.download = `free-video-${Date.now()}.mp4`;
      
      hideAllAreas();
      resultArea.classList.remove('hidden');
    } else {
      throw new Error('No video data received');
    }

  } catch (error) {
    console.error('Error:', error);
    hideAllAreas();
    errorArea.classList.remove('hidden');
    errorText.textContent = error.message;
  } finally {
    generateBtn.disabled = false;
    generateBtn.querySelector('.btn-text').classList.remove('hidden');
    generateBtn.querySelector('.btn-loader').classList.add('hidden');
  }
});

// ============================================
// BUTTON HANDLERS
// ============================================

newVideoBtn.addEventListener('click', () => {
  promptInput.value = '';
  hideAllAreas();
  promptInput.focus();
});

retryBtn.addEventListener('click', () => {
  hideAllAreas();
  generateBtn.click();
});

// ============================================
// HELPERS
// ============================================

function hideAllAreas() {
  statusArea.classList.add('hidden');
  resultArea.classList.add('hidden');
  errorArea.classList.add('hidden');
  progressFill.style.width = '0%';
}

// Check if server is awake (helpful for Render free tier)
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      console.log('✅ Server is online');
    }
  } catch (e) {
    console.log('⚠️ Server might be sleeping (normal on free tier)');
  }
}

// Run check when page loads
checkServer();
