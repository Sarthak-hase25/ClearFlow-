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

  let attempts = 0;
  while (attempts < 3) {
    attempts++;
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        family: 4,
      });

      console.log(`✅  MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      if (attempts >= 3) {
        console.error(`❌  MongoDB connection failed: ${err.message}`);
        throw err;
      }
      console.log(`MongoDB connect attempt ${attempts} timed out, retrying in 2s...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

module.exports = connectDB;
