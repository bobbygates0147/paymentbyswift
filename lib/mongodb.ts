import mongoose from 'mongoose';

const rawMongoUri = process.env.MONGODB_URI;
const ATLAS_PASSWORD_WRAPPED_PATTERN = /mongodb(?:\+srv)?:\/\/[^:]+:<[^>]+>@/i;

if (!rawMongoUri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const MONGODB_URI: string = rawMongoUri;

if (MONGODB_URI.includes('<db_password>') || MONGODB_URI.includes('<password>')) {
  throw new Error(
    'MONGODB_URI still contains a placeholder password. Replace <db_password>/<password> with your real MongoDB password.'
  );
}

if (ATLAS_PASSWORD_WRAPPED_PATTERN.test(MONGODB_URI)) {
  throw new Error(
    'MONGODB_URI has a password wrapped in angle brackets. Remove < and > around your real password.'
  );
}

let cached = global.mongoose as any;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        return mongoose;
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

declare global {
  var mongoose: any;
}

export default connectDB;
