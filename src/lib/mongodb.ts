import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: GlobalMongoose | undefined;
}

let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function tryConnect(retryCount: number = 0): Promise<typeof mongoose> {
  const opts = {
    bufferCommands: false,
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true,
    retryReads: true,
    connectTimeoutMS: 30000,
    maxIdleTimeMS: 10000,
    autoIndex: true,
    autoCreate: true,
    ssl: true
  };

  try {
    const db = await mongoose.connect(MONGODB_URI as string, opts);
    console.log('MongoDB connected successfully');
    return db;
  } catch (error) {
    console.error(`MongoDB connection attempt ${retryCount + 1} failed:`, error);
    
    if (retryCount < MAX_RETRIES - 1) {
      console.log(`Retrying connection in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return tryConnect(retryCount + 1);
    }
    
    throw error;
  }
}

async function connectDB(): Promise<typeof mongoose> {
  try {
    if (cached.conn) {
      console.log('Using cached MongoDB connection');
      return cached.conn;
    }

    if (!cached.promise) {
      mongoose.set('strictQuery', true);

      cached.promise = tryConnect().then((mongoose) => {
        mongoose.connection.on('error', (error) => {
          console.error('MongoDB connection error:', error);
          cached.conn = null;
          cached.promise = null;
        });

        mongoose.connection.on('disconnected', () => {
          console.warn('MongoDB disconnected. Connection will be re-established on next request.');
          cached.conn = null;
          cached.promise = null;
        });

        mongoose.connection.on('reconnected', () => {
          console.log('MongoDB reconnected successfully');
        });

        mongoose.connection.on('connected', () => {
          console.log('MongoDB connection established');
        });

        return mongoose;
      });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    console.error('Failed to establish MongoDB connection:', error);
    throw new Error('Unable to connect to database. Please try again later.');
  }
}

export default connectDB; 