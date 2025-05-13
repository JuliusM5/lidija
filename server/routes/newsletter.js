// server/routes/newsletter.js - Newsletter API endpoints

const express = require('express');
const router = express.Router();
const { loadData, saveData, generateId, SUBSCRIBERS_FILE } = require('../utils/fileUtil');

/**
 * POST /api/newsletter
 * Subscribe to newsletter
 */
router.post('/', (req, res) => {
  const { email } = req.body;
  
  // Validate email
  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email is required'
    });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email address'
    });
  }
  
  // Load subscribers
  const subscribers = loadData(SUBSCRIBERS_FILE);
  
  // Check if email already exists
  const existingSubscriber = subscribers.find(sub => sub.email === email);
  if (existingSubscriber) {
    return res.json({
      success: true,
      message: 'You are already subscribed'
    });
  }
  
  // Add new subscriber
  subscribers.push({
    id: generateId(),
    email,
    created_at: new Date().toISOString(),
    status: 'active'
  });
  
  // Save subscribers
  if (saveData(SUBSCRIBERS_FILE, subscribers)) {
    res.json({
      success: true,
      message: 'Subscription successful'
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to save subscription'
    });
  }
});

module.exports = router;