// server/index.js - Main server file for Šaukštas Meilės website

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const helmet = require('helmet');

// Import route modules
const recipesRoutes = require('./routes/recipes');
const categoriesRoutes = require('./routes/categories');
const commentsRoutes = require('./routes/comments');
const aboutRoutes = require('./routes/about');
const newsletterRoutes = require('./routes/newsletter');
const adminRoutes = require('./routes/admin');

// Import utility functions
const { RECIPES_FILE, COMMENTS_FILE, USERS_FILE, ABOUT_FILE, SUBSCRIBERS_FILE } = require('./utils/fileUtil');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001; // Changed to 3001 as an alternative

// Environment configuration
const isProduction = process.env.NODE_ENV === 'production';

// Initialize data files and directories if they don't exist
function initializeDataFiles() {
  // Ensure data directory exists
  const dataDir = path.dirname(RECIPES_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create empty data files if they don't exist
  const dataFiles = [
    { path: RECIPES_FILE, defaultContent: '[]' },
    { path: COMMENTS_FILE, defaultContent: '[]' },
    { path: USERS_FILE, defaultContent: '[]' },
    { path: ABOUT_FILE, defaultContent: '{}' },
    { path: SUBSCRIBERS_FILE, defaultContent: '[]' }
  ];

  dataFiles.forEach(file => {
    if (!fs.existsSync(file.path)) {
      fs.writeFileSync(file.path, file.defaultContent, 'utf8');
      console.log(`Created empty data file: ${file.path}`);
    }
  });

  // Ensure upload directories exist
  const uploadDirs = [
    path.join(__dirname, '../public/img/recipes'),
    path.join(__dirname, '../public/img/about'),
    path.join(__dirname, '../public/img/gallery')
  ];

  uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created upload directory: ${dir}`);
    }
  });
}

// Initialize data files
initializeDataFiles();

// Security middleware (only apply certain headers in production)
if (isProduction) {
  // Helmet helps secure Express apps by setting HTTP response headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP to allow inline scripts (enable and configure for better security)
  }));
}

// Middleware
app.use(cors());
app.use(morgan(isProduction ? 'combined' : 'dev')); // More detailed logging in production
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  createParentPath: true,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB file size limit
  },
  useTempFiles: isProduction, // Use temp files in production for better performance with large files
  tempFileDir: '/tmp/'
}));

// Static files
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: isProduction ? '1d' : 0 // Add cache control in production
}));

// API routes
app.use('/api/recipes', recipesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/admin-connector', adminRoutes);

// Handle HTML routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/about.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorMessage = isProduction ? 'Internal Server Error' : err.message;
  
  // Log the error
  console.error(`[ERROR] ${new Date().toISOString()}: ${err.stack}`);
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    error: errorMessage
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Šaukštas Meilės website is now accessible`);
  console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
});