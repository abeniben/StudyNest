require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { initializeCronJobs } = require('./config/cronJobs');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FCM_PROJECT_ID,
    clientEmail: process.env.FCM_CLIENT_EMAIL,
    privateKey: process.env.FCM_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});

// Load environment variables
const envPath = path.resolve(__dirname, '..' ,'.env');
console.log('Looking for .env at:', envPath);
try {
  if (fs.existsSync(envPath)) {
    console.log('.env file found');
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('.env content:', envContent);
  } else {
    console.log('.env file not found');
  }
} catch (err) {
  console.error('Error reading .env:', err.message);
}

console.log('Environment variables:', {
  MONGO_URI: process.env.MONGO_URI ? 'Found' : 'Missing',
  JWT_SECRET: process.env.JWT_SECRET ? 'Found' : 'Missing',
  RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Found' : 'Missing',
  PORT: process.env.PORT || 'Missing',
  FCM_SERVER_KEY: process.env.FCM_SERVER_KEY ? 'Found' : 'Missing'
});

//dotenv.config();


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
connectDB();

// Routes
app.use('/api', routes);

// Start cron jobs
initializeCronJobs();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));