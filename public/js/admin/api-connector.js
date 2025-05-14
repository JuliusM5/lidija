// public/js/admin/api-connector.js
// API connector for admin panel - Handles API requests

/**
 * Authentication functions
 */

/**
 * Get authentication headers for API requests
 * @returns {Object} - Headers object with Authorization and Content-Type
 */
export function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
    };
}

/**
 * Login user with username and password
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise} - Promise that resolves to login response
 */
export async function loginUser(username, password) {
    try {
        const response = await fetch('/admin-api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error(`Login failed: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Login error:', error);
        return { 
            success: false, 
            error: 'Authentication failed. Please check your credentials and try again.'
        };
    }
}

/**
 * Verify JWT token
 * @returns {Promise} - Promise that resolves to verification response
 */
export async function verifyToken() {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            return { success: false, error: 'No token available' };
        }
        
        const response = await fetch('/admin-api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Token verification failed: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Token verification error:', error);
        return { success: false, error: 'Token verification failed' };
    }
}

/**
 * Dashboard functions
 */

/**
 * Get dashboard statistics
 * @returns {Promise} - Promise that resolves to dashboard stats
 */
export async function getDashboardStats() {
    try {
        const response = await fetch('/admin-api/dashboard/stats', {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return { 
            success: false, 
            error: 'Failed to load dashboard statistics'
        };
    }
}

/**
 * Recipe functions
 */

/**
 * Get recipes list
 * @param {number} page - Page number
 * @param {string} status - Recipe status filter (all, published, draft)
 * @returns {Promise} - Promise that resolves to recipes list
 */
export async function getRecipes(page = 1, status = 'all') {
    try {
        const response = await fetch(`/admin-api/recipes?status=${status}&page=${page}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch recipes: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch recipes error:', error);
        return { 
            success: false, 
            error: 'Failed to load recipes'
        };
    }
}

/**
 * Get a single recipe
 * @param {string} recipeId - Recipe ID
 * @returns {Promise} - Promise that resolves to recipe details
 */
export async function getRecipe(recipeId) {
    try {
        const response = await fetch(`/admin-api/recipes/${recipeId}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch recipe: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch recipe details error:', error);
        return { 
            success: false, 
            error: 'Failed to load recipe details'
        };
    }
}

/**
 * Create a new recipe
 * @param {FormData} formData - Form data with recipe details
 * @returns {Promise} - Promise that resolves to creation response
 */
export async function createRecipe(formData) {
    try {
        const response = await fetch('/admin-api/recipes', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Failed to create recipe: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Create recipe error:', error);
        return { 
            success: false, 
            error: 'Failed to create recipe'
        };
    }
}

/**
 * Update an existing recipe
 * @param {string} recipeId - Recipe ID
 * @param {FormData} formData - Form data with recipe details
 * @returns {Promise} - Promise that resolves to update response
 */
export async function updateRecipe(recipeId, formData) {
    try {
        const response = await fetch(`/admin-api/recipes/${recipeId}`, {
            method: 'PUT',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Failed to update recipe: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Update recipe error:', error);
        return { 
            success: false, 
            error: 'Failed to update recipe'
        };
    }
}

/**
 * Delete a recipe
 * @param {string} recipeId - Recipe ID
 * @returns {Promise} - Promise that resolves to deletion response
 */
export async function deleteRecipe(recipeId) {
    try {
        const response = await fetch(`/admin-api/recipes/${recipeId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to delete recipe: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Delete recipe error:', error);
        return { 
            success: false, 
            error: 'Failed to delete recipe'
        };
    }
}

/**
 * Comment functions
 */

/**
 * Get comments list
 * @param {number} page - Page number
 * @param {string} status - Comment status filter (all, approved, pending, spam)
 * @returns {Promise} - Promise that resolves to comments list
 */
export async function getComments(page = 1, status = 'all') {
    try {
        const response = await fetch(`/admin-api/comments?status=${status}&page=${page}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch comments: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch comments error:', error);
        return { 
            success: false, 
            error: 'Failed to load comments'
        };
    }
}

/**
 * Get a single comment
 * @param {string} commentId - Comment ID
 * @returns {Promise} - Promise that resolves to comment details
 */
export async function getComment(commentId) {
    try {
        const response = await fetch(`/admin-api/comments/${commentId}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch comment: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch comment details error:', error);
        return { 
            success: false, 
            error: 'Failed to load comment details'
        };
    }
}

/**
 * Update a comment
 * @param {string} commentId - Comment ID
 * @param {Object} commentData - Comment data
 * @returns {Promise} - Promise that resolves to update response
 */
export async function updateComment(commentId, commentData) {
    try {
        const response = await fetch(`/admin-api/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commentData)
        });

        if (!response.ok) {
            throw new Error(`Failed to update comment: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Update comment error:', error);
        return { 
            success: false, 
            error: 'Failed to update comment'
        };
    }
}

/**
 * Delete a comment
 * @param {string} commentId - Comment ID
 * @returns {Promise} - Promise that resolves to deletion response
 */
export async function deleteComment(commentId) {
    try {
        const response = await fetch(`/admin-api/comments/${commentId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to delete comment: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Delete comment error:', error);
        return { 
            success: false, 
            error: 'Failed to delete comment'
        };
    }
}

/**
 * Media functions
 */

/**
 * Get media files list
 * @param {number} page - Page number
 * @param {string} type - Media type filter (all, recipes, gallery, about)
 * @returns {Promise} - Promise that resolves to media list
 */
export async function getMedia(page = 1, type = 'all') {
    try {
        const response = await fetch(`/admin-api/media?type=${type}&page=${page}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch media: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch media error:', error);
        return { 
            success: false, 
            error: 'Failed to load media files'
        };
    }
}

/**
 * Upload media files
 * @param {FormData} formData - Form data with files
 * @returns {Promise} - Promise that resolves to upload response
 */
export async function uploadMedia(formData) {
    try {
        const response = await fetch('/admin-api/media', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Failed to upload media: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Upload media error:', error);
        return { 
            success: false, 
            error: 'Failed to upload media files'
        };
    }
}

/**
 * Delete a media file
 * @param {string} directory - Media directory
 * @param {string} filename - Media filename
 * @returns {Promise} - Promise that resolves to deletion response
 */
export async function deleteMedia(directory, filename) {
    try {
        const response = await fetch(`/admin-api/media/${directory}/${filename}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to delete media: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Delete media error:', error);
        return { 
            success: false, 
            error: 'Failed to delete media file'
        };
    }
}

/**
 * About page functions
 */

/**
 * Get about page data
 * @returns {Promise} - Promise that resolves to about page data
 */
export async function getAboutData() {
    try {
        const response = await fetch('/admin-api/about', {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch about data: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch about data error:', error);
        return { 
            success: false, 
            error: 'Failed to load about page data'
        };
    }
}

/**
 * Update about page data
 * @param {FormData} formData - Form data with about page details
 * @returns {Promise} - Promise that resolves to update response
 */
export async function updateAboutData(formData) {
    try {
        const response = await fetch('/admin-api/about', {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Failed to update about page: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Update about page error:', error);
        return { 
            success: false, 
            error: 'Failed to update about page'
        };
    }
}