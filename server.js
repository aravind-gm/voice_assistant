const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

console.log('Server starting up...');

// VAPI API endpoints
const VAPI_BASE_URL = 'https://api.vapi.ai';
const VAPI_API_KEY = process.env.VAPI_API_KEY;

// Test route
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ status: 'Server is running!' });
});

// Route to handle assistant conversations
app.post('/api/conversation', async (req, res) => {
  try {
    console.log('Conversation endpoint hit with body:', req.body);
    
    const { message, conversationId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Missing message parameter' });
    }
    
    if (!VAPI_API_KEY) {
      console.warn('VAPI API key not found. Using echo mode.');
      return res.json({
        conversation_id: conversationId || 'mock-id',
        response: `Echo mode (no API key): ${message}`
      });
    }
    
    // For a new conversation, we need to create a call first
    let callId = conversationId;
    
    if (!callId) {
      console.log('Creating new assistant conversation...');
      // Create a new assistant call/conversation
      const createResponse = await axios.post(`${VAPI_BASE_URL}/call`, {
        assistant_id: process.env.VAPI_ASSISTANT_ID,
        // You might need additional parameters based on the documentation
      }, {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      callId = createResponse.data.id;
      console.log('Created new conversation with ID:', callId);
    }
    
    // Now send the message to the assistant
    console.log(`Sending message to assistant: "${message}"`);
    
    // Based on the documentation, we need to update this to use the correct endpoint
    // This might be different - check the exact endpoint for sending messages in the VAPI docs
    const response = await axios.post(`${VAPI_BASE_URL}/call/${callId}/message`, {
      content: message
    }, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('VAPI response:', response.data);
    
    // Format the response for the frontend
    res.json({
      conversation_id: callId,
      response: response.data.assistant_response || "I'm processing your request"
    });
    
  } catch (error) {
    console.error('Error in conversation endpoint:', error.response?.data || error);
    res.status(500).json({ 
      error: 'Failed to process request',
      message: error.message 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`VAPI API Key configured: ${VAPI_API_KEY ? 'Yes' : 'No'}`);
});