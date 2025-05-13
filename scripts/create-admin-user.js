// scripts/create-admin-user.js - Script to create an admin user

const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');

// Try to load environment variables if dotenv is available
try {
  require('dotenv').config();
} catch (error) {
  // dotenv is not installed, which is fine for this script
}

// Define constants
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../server/data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`Created data directory: ${DATA_DIR}`);
}

// Load existing users if the file exists
function loadUsers() {
  if (fs.existsSync(USERS_FILE)) {
    try {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data || '[]');
    } catch (error) {
      console.error('Error loading users file:', error);
      return [];
    }
  }
  return [];
}

// Save users to file
function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving users file:', error);
    return false;
  }
}

// Validate username (letters, numbers, underscores, hyphens, 3-30 characters)
function isValidUsername(username) {
  const regex = /^[a-zA-Z0-9_-]{3,30}$/;
  return regex.test(username);
}

// Validate password (at least 8 characters, contain letters and numbers)
function isValidPassword(password) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return false;
  }
  // Check for at least one letter and one number
  return /[A-Za-z]/.test(password) && /[0-9]/.test(password);
}

// Create a new admin user
async function createAdminUser() {
  console.log('\n===== Šaukštas Meilės - Create Admin User =====\n');
  
  // Get existing users
  const users = loadUsers();
  
  // Check if admin already exists
  const hasAdmin = users.some(user => user.role === 'admin');
  if (hasAdmin) {
    console.log('An admin user already exists.');
    const answer = await askQuestion('Do you want to create another admin user? (y/n): ');
    if (answer.toLowerCase() !== 'y') {
      rl.close();
      return;
    }
  }
  
  // Get user input
  let username, password, name;
  
  // Get and validate username
  while (!username) {
    const input = await askQuestion('Username (3-30 characters, letters, numbers, underscores, hyphens): ');
    if (isValidUsername(input)) {
      // Check if username is already taken
      if (users.some(user => user.username === input)) {
        console.log('This username is already taken. Please choose another one.');
      } else {
        username = input;
      }
    } else {
      console.log('Invalid username format. Please try again.');
    }
  }
  
  // Get and validate password
  while (!password) {
    const input = await askQuestion(`Password (at least ${MIN_PASSWORD_LENGTH} characters, including letters and numbers): `);
    if (isValidPassword(input)) {
      // Confirm password
      const confirmation = await askQuestion('Confirm password: ');
      if (input === confirmation) {
        password = input;
      } else {
        console.log('Passwords do not match. Please try again.');
      }
    } else {
      console.log(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long and contain both letters and numbers.`);
    }
  }
  
  // Get display name
  while (!name) {
    const input = await askQuestion('Display name: ');
    if (input.trim()) {
      name = input.trim();
    } else {
      console.log('Display name cannot be empty.');
    }
  }
  
  // Hash password
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Create user object
    const newUser = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      name,
      role: 'admin',
      created_at: new Date().toISOString()
    };
    
    // Add user
    users.push(newUser);
    
    // Save updated users
    if (saveUsers(users)) {
      console.log('\nAdmin user created successfully!');
      console.log(`Username: ${username}`);
      console.log(`You can now log in to the admin panel at: /admin.html`);
    } else {
      console.log('\nFailed to create admin user.');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
  
  rl.close();
}

// Helper function to prompt a question
function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

// Handle script exit
rl.on('close', () => {
  console.log('\nSetup complete. Exiting...');
  process.exit(0);
});

// Start the script
createAdminUser().catch(error => {
  console.error('Error creating admin user:', error);
  rl.close();
});