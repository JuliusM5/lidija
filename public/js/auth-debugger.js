// Authentication Debugging and Repair Script

/**
 * This script provides authentication debugging and repair functionality
 * Save this as auth-debugger.js in the public/js folder and include it in admin.html
 */

// Store the original console.log, error, and warn methods
const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn
};

// Create a debugging logs array to capture console output
const debugLogs = [];

// Override console methods to capture logs
console.log = function() {
    debugLogs.push({type: 'log', args: Array.from(arguments), time: new Date()});
    originalConsole.log.apply(console, arguments);
};

console.error = function() {
    debugLogs.push({type: 'error', args: Array.from(arguments), time: new Date()});
    originalConsole.error.apply(console, arguments);
};

console.warn = function() {
    debugLogs.push({type: 'warn', args: Array.from(arguments), time: new Date()});
    originalConsole.warn.apply(console, arguments);
};

// Function to create diagnostic panel
function createDiagnosticPanel() {
    // Create the panel container
    const panel = document.createElement('div');
    panel.id = 'auth-debug-panel';
    panel.style.position = 'fixed';
    panel.style.width = '80%';
    panel.style.maxWidth = '800px';
    panel.style.height = '80%';
    panel.style.top = '10%';
    panel.style.left = '10%';
    panel.style.backgroundColor = '#fff';
    panel.style.boxShadow = '0 0 20px rgba(0,0,0,0.3)';
    panel.style.zIndex = '9999';
    panel.style.display = 'none';
    panel.style.borderRadius = '8px';
    panel.style.overflow = 'hidden';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    
    // Create header
    const header = document.createElement('div');
    header.style.padding = '15px';
    header.style.backgroundColor = '#7f4937';
    header.style.color = 'white';
    header.style.fontWeight = 'bold';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.innerHTML = '<span>Authentication Diagnostics</span>';
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.color = 'white';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = function() {
        panel.style.display = 'none';
    };
    header.appendChild(closeBtn);
    
    // Create content area
    const content = document.createElement('div');
    content.style.padding = '20px';
    content.style.overflowY = 'auto';
    content.style.flex = '1';
    
    // Authentication status section
    const authStatus = document.createElement('div');
    authStatus.innerHTML = '<h3>Authentication Status</h3>';
    
    // Token Information
    const tokenInfo = document.createElement('div');
    tokenInfo.style.marginBottom = '20px';
    tokenInfo.innerHTML = '<h4>Token Information</h4>';
    
    const tokenSection = document.createElement('div');
    tokenSection.style.backgroundColor = '#f8f9fa';
    tokenSection.style.padding = '10px';
    tokenSection.style.borderRadius = '4px';
    tokenSection.style.marginBottom = '15px';
    tokenSection.id = 'token-info-section';
    
    // Action buttons
    const actionButtons = document.createElement('div');
    actionButtons.style.marginBottom = '20px';
    
    // Test authentication button
    const testAuthBtn = document.createElement('button');
    testAuthBtn.textContent = 'Test Authentication';
    testAuthBtn.className = 'auth-debug-btn';
    testAuthBtn.onclick = function() {
        testAuthentication();
    };
    
    // Clear token button
    const clearTokenBtn = document.createElement('button');
    clearTokenBtn.textContent = 'Clear Token & Logout';
    clearTokenBtn.className = 'auth-debug-btn';
    clearTokenBtn.style.marginLeft = '10px';
    clearTokenBtn.onclick = function() {
        clearAuthenticationData();
    };
    
    // Force login button
    const forceLoginBtn = document.createElement('button');
    forceLoginBtn.textContent = 'Force Login';
    forceLoginBtn.className = 'auth-debug-btn';
    forceLoginBtn.style.marginLeft = '10px';
    forceLoginBtn.onclick = function() {
        showLoginHelp();
    };
    
    actionButtons.appendChild(testAuthBtn);
    actionButtons.appendChild(clearTokenBtn);
    actionButtons.appendChild(forceLoginBtn);
    
    // Console log section
    const logSection = document.createElement('div');
    logSection.innerHTML = '<h3>Debug Logs</h3>';
    
    const logsContainer = document.createElement('div');
    logsContainer.id = 'debug-logs-container';
    logsContainer.style.backgroundColor = '#f8f9fa';
    logsContainer.style.padding = '10px';
    logsContainer.style.borderRadius = '4px';
    logsContainer.style.fontFamily = 'monospace';
    logsContainer.style.fontSize = '12px';
    logsContainer.style.maxHeight = '200px';
    logsContainer.style.overflowY = 'auto';
    
    // Assemble the panel
    authStatus.appendChild(tokenInfo);
    tokenInfo.appendChild(tokenSection);
    authStatus.appendChild(actionButtons);
    logSection.appendChild(logsContainer);
    
    content.appendChild(authStatus);
    content.appendChild(logSection);
    
    panel.appendChild(header);
    panel.appendChild(content);
    
    // Add styles for buttons
    const style = document.createElement('style');
    style.textContent = `
        .auth-debug-btn {
            padding: 8px 15px;
            background-color: #7f4937;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .auth-debug-btn:hover {
            background-color: #aa5f44;
        }
        .log-entry {
            margin-bottom: 5px;
            border-bottom: 1px solid #e5e5e5;
            padding-bottom: 5px;
        }
        .log-entry.error {
            color: #dc3545;
        }
        .log-entry.warn {
            color: #ffc107;
        }
    `;
    document.head.appendChild(style);
    
    // Add to document
    document.body.appendChild(panel);
    
    return panel;
}

// Function to update token information display
function updateTokenInfo() {
    const tokenSection = document.getElementById('token-info-section');
    if (!tokenSection) return;
    
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    
    if (token) {
        // Try to decode the JWT token
        try {
            const payload = decodeJWT(token);
            
            let expiryInfo = 'Unknown expiry';
            if (payload.exp) {
                const expiryDate = new Date(payload.exp * 1000);
                const now = new Date();
                const isExpired = expiryDate < now;
                expiryInfo = `Expires: ${expiryDate.toLocaleString()} (${isExpired ? 'EXPIRED' : 'valid'})`;
            }
            
            tokenSection.innerHTML = `
                <div style="color: green; margin-bottom: 10px;">✓ Token found in localStorage</div>
                <div><strong>Issued at:</strong> ${payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'Unknown'}</div>
                <div><strong>${expiryInfo}</strong></div>
                <div><strong>Subject:</strong> ${payload.sub || 'Not specified'}</div>
                <div style="margin-top: 10px;"><strong>User:</strong> ${userJson ? JSON.parse(userJson).username || 'Unknown' : 'Not found'}</div>
                <div style="margin-top: 10px;"><strong>Role:</strong> ${payload.role || 'Not specified'}</div>
                <div style="font-size: 10px; margin-top: 15px; word-break: break-all;">
                    <strong>Token:</strong> ${token}
                </div>
            `;
        } catch (e) {
            tokenSection.innerHTML = `
                <div style="color: orange; margin-bottom: 10px;">⚠ Token found but could not be decoded</div>
                <div style="color: red;">${e.message}</div>
                <div style="font-size: 10px; margin-top: 15px; word-break: break-all;">
                    <strong>Token:</strong> ${token}
                </div>
            `;
        }
    } else {
        tokenSection.innerHTML = `
            <div style="color: red; margin-bottom: 10px;">✗ No authentication token found</div>
            <div>You are not currently logged in. Authentication will fail for protected routes.</div>
        `;
    }
}

// Function to update debug logs display
function updateLogsDisplay() {
    const logsContainer = document.getElementById('debug-logs-container');
    if (!logsContainer) return;
    
    // Clear existing logs
    logsContainer.innerHTML = '';
    
    // Get the last 20 logs
    const recentLogs = debugLogs.slice(-20);
    
    // Add logs to container
    recentLogs.forEach(log => {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${log.type}`;
        
        const time = log.time.toLocaleTimeString();
        const message = log.args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : arg
        ).join(' ');
        
        logEntry.textContent = `[${time}] ${message}`;
        logsContainer.appendChild(logEntry);
    });
    
    // Scroll to bottom
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

// Function to decode JWT token
function decodeJWT(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid token format');
    }
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
}

// Function to test authentication
function testAuthentication() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No authentication token found');
        updateLogsDisplay();
        return;
    }
    
    console.log('Testing authentication with server...');
    
    // Make a request to the server to verify the token
    fetch('/admin-api/auth/verify', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            console.log('Authentication successful:', data);
        } else {
            console.error('Authentication failed:', data);
        }
    })
    .catch(error => {
        console.error('Authentication error:', error.message);
    })
    .finally(() => {
        updateTokenInfo();
        updateLogsDisplay();
    });
}

// Function to clear authentication data
function clearAuthenticationData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Authentication data cleared');
    updateTokenInfo();
    updateLogsDisplay();
    
    // Reload the page to show login screen
    if (confirm('Authentication data cleared. Reload page to show login screen?')) {
        window.location.reload();
    }
}

// Function to show login help
function showLoginHelp() {
    // Create login help modal
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = 'white';
    modal.style.padding = '20px';
    modal.style.boxShadow = '0 0 20px rgba(0,0,0,0.3)';
    modal.style.zIndex = '10000';
    modal.style.borderRadius = '8px';
    modal.style.width = '400px';
    
    // Create modal content
    modal.innerHTML = `
        <h3 style="margin-top: 0;">Force Login</h3>
        <p>Enter credentials to attempt a direct login:</p>
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;">Username:</label>
            <input type="text" id="debug-username" value="admin" style="width: 100%; padding: 8px; box-sizing: border-box;">
        </div>
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;">Password:</label>
            <input type="password" id="debug-password" style="width: 100%; padding: 8px; box-sizing: border-box;">
        </div>
        <div style="text-align: right;">
            <button id="debug-login-cancel" style="padding: 8px 15px; margin-right: 10px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
            <button id="debug-login-submit" style="padding: 8px 15px; background-color: #7f4937; color: white; border: none; border-radius: 4px; cursor: pointer;">Login</button>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('debug-login-cancel').onclick = function() {
        document.body.removeChild(modal);
    };
    
    document.getElementById('debug-login-submit').onclick = function() {
        const username = document.getElementById('debug-username').value;
        const password = document.getElementById('debug-password').value;
        
        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }
        
        console.log(`Attempting force login with username: ${username}`);
        
        // Send login request
        fetch('/admin-api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    try {
                        const data = JSON.parse(text);
                        throw new Error(data.error || `Login failed: ${response.status}`);
                    } catch (e) {
                        throw new Error(`Login failed: ${response.status} - ${text}`);
                    }
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log('Login successful:', data);
                
                // Store token and user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Remove modal
                document.body.removeChild(modal);
                
                // Update token info
                updateTokenInfo();
                updateLogsDisplay();
                
                // Reload the page
                if (confirm('Login successful! Reload page to apply changes?')) {
                    window.location.reload();
                }
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        })
        .catch(error => {
            console.error('Login error:', error.message);
            alert(`Login failed: ${error.message}`);
            updateLogsDisplay();
        });
    };
}

// Add a button to open the diagnostic panel
function addDiagnosticButton() {
    const button = document.createElement('button');
    button.textContent = '🔐';
    button.id = 'auth-debug-button';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.left = '20px';
    button.style.zIndex = '9998';
    button.style.width = '40px';
    button.style.height = '40px';
    button.style.backgroundColor = '#7f4937';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '50%';
    button.style.cursor = 'pointer';
    button.style.fontSize = '20px';
    button.style.display = 'flex';
    button.style.justifyContent = 'center';
    button.style.alignItems = 'center';
    button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    
    // Add hover effect
    button.onmouseover = function() {
        this.style.backgroundColor = '#aa5f44';
    };
    button.onmouseout = function() {
        this.style.backgroundColor = '#7f4937';
    };
    
    // Add click handler
    button.onclick = function() {
        // Create panel if it doesn't exist
        let panel = document.getElementById('auth-debug-panel');
        if (!panel) {
            panel = createDiagnosticPanel();
        }
        
        // Show panel
        panel.style.display = 'flex';
        
        // Update token info
        updateTokenInfo();
        
        // Update logs
        updateLogsDisplay();
    };
    
    document.body.appendChild(button);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add the diagnostic button after a short delay
    setTimeout(addDiagnosticButton, 1000);
    
    // Log initial authentication status
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const payload = decodeJWT(token);
            console.log('Authentication token found in localStorage', payload);
        } catch (e) {
            console.error('Invalid authentication token:', e.message);
        }
    } else {
        console.warn('No authentication token found in localStorage');
    }
});