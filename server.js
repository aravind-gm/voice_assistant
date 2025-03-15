const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

console.log('Starting server setup...');

// Middleware
app.use(cors());
app.use(express.json());

console.log('Middleware configured');

// VAPI API endpoint
const VAPI_ENDPOINT = 'https://api.vapi.ai/conversation';

// Simple test route
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ status: 'Server is running!' });
});

// Route to handle assistant conversations
app.post('/api/conversation', async (req, res) => {
  console.log('Conversation endpoint hit:', req.body);
  try {
    const { message, conversationId } = req.body;
    
    console.log(`Processing message: "${message}" with conversationId: ${conversationId || 'new'}`);
    
    const response = await axios.post(VAPI_ENDPOINT, {
      input: {
        text: message
      },
      conversation_id: conversationId || null
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
    
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});