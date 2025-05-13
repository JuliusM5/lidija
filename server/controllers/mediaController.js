// server/controllers/mediaController.js
const path = require('path');
const fs = require('fs');
const { 
  getMediaFiles, 
  handleImageUpload 
} = require('../utils/fileUtil');

/**
 * Get media files
 */
exports.getMediaFiles = (type = 'all', page = 1, perPage = 12) => {
  // Get media files
  const mediaFiles = getMediaFiles(type);
  
  // Sort by date (newest first)
  mediaFiles.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
    const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
    return dateB - dateA;
  });
  
  // For public access, provide limited information
  const publicMediaFiles = mediaFiles.map(file => ({
    id: file.id,
    name: file.name,
    url: file.url,
    directory: file.directory,
    type: file.type
  }));
  
  // Pagination
  const pageNum = parseInt(page);
  const pageSize = parseInt(perPage);
  const totalFiles = publicMediaFiles.length;
  const totalPages = Math.ceil(totalFiles / pageSize);
  const offset = (pageNum - 1) * pageSize;
  const paginatedFiles = publicMediaFiles.slice(offset, offset + pageSize);
  
  return {
    success: true,
    data: paginatedFiles,
    meta: {
      page: pageNum,
      per_page: pageSize,
      total: totalFiles,
      pages: totalPages
    }
  };
};

/**
 * Get gallery images
 */
exports.getGalleryImages = () => {
  // Get gallery files
  const galleryFiles = getMediaFiles('gallery');
  
  // Sort by date (newest first)
  galleryFiles.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
    const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
    return dateB - dateA;
  });
  
  // Format for gallery display
  const publicGalleryFiles = galleryFiles.map(file => ({
    id: file.id,
    name: file.name,
    url: file.url,
    description: '', // Could be enhanced with metadata
    type: file.type
  }));
  
  return {
    success: true,
    data: publicGalleryFiles
  };
};

/**
 * Upload media files
 */
exports.uploadFiles = (files, type = 'gallery') => {
  if (!files) {
    return { success: false, error: 'No files uploaded' };
  }
  
  // Handle multiple or single file
  const uploadedFiles = [];
  const errors = [];
  
  // Convert to array if single file
  const filesArray = Array.isArray(files) ? files : [files];
  
  filesArray.forEach(file => {
    // Check file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)) {
      errors.push(`Invalid file type: ${file.name}`);
      return;
    }
    
    // Handle upload
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
      errors.push(`Failed to upload file: ${file.name}`);
    }
  });
  
  if (uploadedFiles.length === 0) {
    return { 
      success: false, 
      error: 'No files were uploaded', 
      errors 
    };
  } else {
    return { 
      success: true, 
      message: 'Files uploaded successfully', 
      data: uploadedFiles, 
      errors: errors.length > 0 ? errors : undefined
    };
  }
};

/**
 * Delete a media file
 */
exports.deleteFile = (directory, filename) => {
  if (!directory || !filename) {
    return { success: false, error: 'Directory and filename are required' };
  }
  
  // Check if file exists
  const uploadsDir = path.join(__dirname, '../../public/img');
  const filePath = path.join(uploadsDir, directory, filename);
  
  if (!fs.existsSync(filePath)) {
    return { success: false, error: 'File not found' };
  }
  
  // Delete file
  try {
    fs.unlinkSync(filePath);
    return { success: true, message: 'File deleted successfully' };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error: 'Failed to delete file' };
  }
};