import mongoose from 'mongoose';

export async function connectDB() {
  // Resolve MongoDB connection string
  const env = process.env.NODE_ENV || 'development';
  const uriFromEnv =
    process.env.MONGODB_URI ||
    process.env.ATLAS_URI ||
    process.env.MONGODB_URL;

  if (env === 'production' && !uriFromEnv) {
    throw new Error('MongoDB connection string not configured. Set MONGODB_URI, ATLAS_URI, or MONGODB_URL.');
  }

  const uri = uriFromEnv || 'mongodb://localhost:27017/techpulse_db';

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    // On production we don't want the process to exit silently; rethrow to let the caller handle it
    throw err;
  }
}

export default connectDB;
