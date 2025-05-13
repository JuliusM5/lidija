// server/routes/newsletter.js - Newsletter API endpoints

const express = require('express');
const router = express.Router();
const { loadData, saveData, generateId, SUBSCRIBERS_FILE } = require('../utils/fileUtil');
const { authMiddleware, adminMiddleware } = require('../utils/authUtil');

/**
 * POST /api/newsletter/subscribe
 * Subscribe to newsletter
 */
router.post('/subscribe', (req, res) => {
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
    status: 'active',
    created_at: new Date().toISOString()
  });
  
  // Save subscribers
  if (saveData(SUBSCRIBERS_FILE, subscribers)) {
    res.json({
      success: true,
      message: 'Thank you for subscribing!'
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to save subscription'
    });
  }
});

/**
 * GET /api/newsletter/subscribers
 * Get all subscribers (admin only)
 */
router.get('/subscribers', authMiddleware, adminMiddleware, (req, res) => {
  const { page = 1, per_page = 20 } = req.query;
  
  // Load subscribers
  const subscribers = loadData(SUBSCRIBERS_FILE);
  
  // Sort by date (newest first)
  subscribers.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
    const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
    return dateB - dateA;
  });
  
  // Pagination
  const pageNum = parseInt(page);
  const perPage = parseInt(per_page);
  const totalSubscribers = subscribers.length;
  const totalPages = Math.ceil(totalSubscribers / perPage);
  const offset = (pageNum - 1) * perPage;
  const paginatedSubscribers = subscribers.slice(offset, offset + perPage);
  
  res.json({
    success: true,
    data: paginatedSubscribers,
    meta: {
      page: pageNum,
      per_page: perPage,
      total: totalSubscribers,
      pages: totalPages
    }
  });
});

/**
 * DELETE /api/newsletter/unsubscribe
 * Unsubscribe from newsletter
 */
router.delete('/unsubscribe', (req, res) => {
  const { email, token } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email is required'
    });
  }
  
  // Load subscribers
  const subscribers = loadData(SUBSCRIBERS_FILE);
  
  // Find subscriber
  const subscriberIndex = subscribers.findIndex(sub => sub.email === email);
  
  if (subscriberIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Subscription not found'
    });
  }
  
  // TODO: In a real application, verify the unsubscribe token
  
  // Update subscriber status to unsubscribed
  subscribers[subscriberIndex].status = 'unsubscribed';
  subscribers[subscriberIndex].updated_at = new Date().toISOString();
  
  // Save subscribers
  if (saveData(SUBSCRIBERS_FILE, subscribers)) {
    res.json({
      success: true,
      message: 'You have been unsubscribed successfully'
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to unsubscribe'
    });
  }
});

module.exports = router;