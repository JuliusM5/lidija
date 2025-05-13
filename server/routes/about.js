// server/routes/about.js - About page API endpoints

const express = require('express');
const router = express.Router();
const { loadData, ABOUT_FILE } = require('../utils/fileUtil');

/**
 * GET /api/about
 * Get about page data
 */
router.get('/', (req, res) => {
  // Load about page data
  const about = loadData(ABOUT_FILE);
  
  if (!about || Object.keys(about).length === 0) {
    // Return empty data structure
    const emptyAbout = {
      title: '',
      subtitle: '',
      image: '',
      intro: '',
      sections: [],
      email: '',
      social: {
        facebook: '',
        instagram: '',
        pinterest: ''
      }
    };
    
    res.json({
      success: true,
      about: emptyAbout
    });
  } else {
    res.json({
      success: true,
      about
    });
  }
});

module.exports = router;