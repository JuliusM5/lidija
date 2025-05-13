// server/utils/fileUtil.js - Utility functions for file handling

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Define constants for file paths - use environment variables if available
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data');
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '../../public/img');
const RECIPES_FILE = path.join(DATA_DIR, 'recipes.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ABOUT_FILE = path.join(DATA_DIR, 'about.json');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');

// Function to ensure directories exist - called by server.js
function ensureDirectoriesExist() {
  const directories = [
    DATA_DIR,
    UPLOADS_DIR,
    path.join(UPLOADS_DIR, 'recipes'),
    path.join(UPLOADS_DIR, 'about'),
    path.join(UPLOADS_DIR, 'gallery')
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

/**
 * Load data from a JSON file
 * @param {string} filePath - Path to the JSON file
 * @returns {Array|Object} - Data from the file or empty array/object if file doesn't exist
 */
function loadData(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const jsonData = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(jsonData || '{}');
    }
    // Return empty array or object based on expected format
    return path.basename(filePath) === 'about.json' ? {} : [];
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
    return path.basename(filePath) === 'about.json' ? {} : [];
  }
}

/**
 * Save data to a JSON file
 * @param {string} filePath - Path to the JSON file
 * @param {Array|Object} data - Data to save
 * @returns {boolean} - True if save was successful, false otherwise
 */
function saveData(filePath, data) {
  try {
    // Ensure the directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonData, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error);
    return false;
  }
}

/**
 * Generate a unique ID
 * @returns {string} - Unique ID
 */
function generateId() {
  return `${uuidv4()}-${Math.random().toString(36).substring(2, 6)}`;
}

/**
 * Handle image upload
 * @param {Object} fileData - File data object from express-fileupload
 * @param {string} subdir - Subdirectory to save the file in
 * @returns {string|boolean} - Filename if successful, false otherwise
 */
function handleImageUpload(fileData, subdir = '') {
  try {
    if (!fileData) {
      return false;
    }
    
    // Check file type
    const fileType = fileData.mimetype;
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(fileType)) {
      return false;
    }
    
    // Upload directory
    let uploadDir = UPLOADS_DIR;
    if (subdir) {
      uploadDir = path.join(uploadDir, subdir);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    }
    
    // Generate unique filename
    const fileExt = path.extname(fileData.name);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${fileExt}`;
    const filePath = path.join(uploadDir, filename);
    
    // Move file
    fileData.mv(filePath);
    return filename;
  } catch (error) {
    console.error('Error uploading image:', error);
    return false;
  }
}

/**
 * Count media files in the uploads directory
 * @returns {number} - Total number of media files
 */
function countMediaFiles() {
  let count = 0;
  
  // Helper function to count image files in a directory
  function countFilesInDir(dir) {
    if (!fs.existsSync(dir)) return 0;
    
    const files = fs.readdirSync(dir);
    return files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    }).length;
  }
  
  // Count files in the uploads directory
  count += countFilesInDir(UPLOADS_DIR);
  
  // Count files in subdirectories
  const subdirs = fs.readdirSync(UPLOADS_DIR).filter(file => {
    const filePath = path.join(UPLOADS_DIR, file);
    return fs.statSync(filePath).isDirectory();
  });
  
  subdirs.forEach(subdir => {
    count += countFilesInDir(path.join(UPLOADS_DIR, subdir));
  });
  
  return count;
}

module.exports = {
  DATA_DIR,
  UPLOADS_DIR,
  RECIPES_FILE,
  COMMENTS_FILE,
  USERS_FILE,
  ABOUT_FILE,
  SUBSCRIBERS_FILE,
  ensureDirectoriesExist,
  loadData,
  saveData,
  generateId,
  handleImageUpload,
  countMediaFiles
};