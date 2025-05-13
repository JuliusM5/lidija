// server/routes/media.js - Media API endpoints

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { getMediaFiles, handleImageUpload } = require('../utils/fileUtil');
const { authMiddleware, adminMiddleware } = require('../utils/authUtil');

/**
 * GET /api/media
 * Get media files (public access to images)
 */
router.get('/', (req, res) => {
  const { type = 'all', page = 1, per_page = 12 } = req.query;
  
  // Get media files
  const mediaFiles = getMediaFiles(type);
  
  // Sort by date (newest first)
  mediaFiles.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
    const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
    return dateB - dateA;
  });
  
  // For public access, only return essential information
  const publicMediaFiles = mediaFiles.map(file => ({
    id: file.id,
    name: file.name,
    url: file.url,
    directory: file.directory,
    type: file.type
  }));
  
  // Pagination
  const pageNum = parseInt(page);
  const perPage = parseInt(per_page);
  const totalFiles = publicMediaFiles.length;
  const totalPages = Math.ceil(totalFiles / perPage);
  const offset = (pageNum - 1) * perPage;
  const paginatedFiles = publicMediaFiles.slice(offset, offset + perPage);
  
  res.json({
    success: true,
    data: paginatedFiles,
    meta: {
      page: pageNum,
      per_page: perPage,
      total: totalFiles,
      pages: totalPages
    }
  });
});

/**
 * GET /api/media/gallery
 * Get gallery images (for the gallery page)
 */
router.get('/gallery', (req, res) => {
  // Get gallery media files
  const galleryFiles = getMediaFiles('gallery');
  
  // Sort by date (newest first)
  galleryFiles.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
    const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
    return dateB - dateA;
  });
  
  // For gallery, only return essential information
  const publicGalleryFiles = galleryFiles.map(file => ({
    id: file.id,
    name: file.name,
    url: file.url,
    description: '', // Could be enhanced with metadata in a future version
    type: file.type
  }));
  
  res.json({
    success: true,
    data: publicGalleryFiles
  });
});

/**
 * POST /api/media
 * Upload media files (admin only)
 */
router.post('/', authMiddleware, adminMiddleware, (req, res) => {
  // Check if files are uploaded
  if (!req.files || !req.files.files) {
    return res.status(400).json({ 
      success: false, 
      error: 'No files uploaded' 
    });
  }
  
  // Get upload type
  const type = req.body.type || 'gallery';
  
  // Handle multiple files
  const uploadedFiles = [];
  const errors = [];
  
  // Convert to array if single file
  const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
  
  files.forEach(file => {
    // Check file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)) {
      errors.push(`Invalid file type: ${file.name}`);
      return;
    }
    
    // Handle file upload
    const filename = handleImageUpload(file, type);
    
    if (filename) {
      uploadedFiles.push({
        name: file.name,
        path: `${type}/${filename}`,
        url: `/img/${type}/${filename}`,
        directory: type,
        size: file.size,
        type: file.mimetype
      });
    } else {
      errors.push(`Failed to move uploaded file: ${file.name}`);
    }
  });
  
  // Check if any files were uploaded
  if (uploadedFiles.length === 0) {
    res.status(400).json({ 
      success: false, 
      error: 'No files were uploaded', 
      errors 
    });
  } else {
    res.json({ 
      success: true, 
      message: 'Files uploaded successfully', 
      data: uploadedFiles, 
      errors 
    });
  }
});

/**
 * DELETE /api/media/:directory/:filename
 * Delete media file (admin only)
 */
router.delete('/:directory/:filename', authMiddleware, adminMiddleware, (req, res) => {
  const { directory, filename } = req.params;
  
  if (!directory || !filename) {
    return res.status(400).json({ 
      success: false, 
      error: 'Directory and filename are required' 
    });
  }
  
  // Check if file exists
  const filePath = path.join(__dirname, `../../public/img/${directory}`, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ 
      success: false, 
      error: 'File not found' 
    });
  }
  
  // Delete file
  try {
    fs.unlinkSync(filePath);
    res.json({ 
      success: true, 
      message: 'File deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete file' 
    });
  }
});

module.exports = router;