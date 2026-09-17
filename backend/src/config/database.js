const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas using the MONGODB_URI environment variable.
 * Throws and exits if the connection cannot be established — the server
 * should not silently start without a valid database connection.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri === 'your_mongodb_atlas_connection_string') {
    throw new Error(
      'MONGODB_URI is not set. Add it to your backend/.env file.\n' +
      'See backend/.env.example for the expected format.'
    );
  }

  try {
    let conn;
    try {
      conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        family: 4,
      });
    } catch (firstErr) {
      // Retry once with slightly more headroom if initial DNS resolution had network latency
      console.log('MongoDB initial connect timed out, retrying...');
      conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        family: 4,
      });
    }

    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌  MongoDB connection failed: ${err.message}`);
    throw err; // bubble up so server.js can handle the startup failure
  }
}

module.exports = connectDB;
