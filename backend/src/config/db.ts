import mongoose from 'mongoose';

export let isConnectedToMongo = false;

/**
 * Connect to MongoDB database
 */
export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/todo_app';

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick check to avoid hanging if no local mongo daemon
    });
    isConnectedToMongo = true;
    console.log(`[MongoDB] Connected successfully to: ${mongoose.connection.host}`);
  } catch (error: any) {
    isConnectedToMongo = false;
    console.warn(`[MongoDB Warning] Could not connect to local MongoDB (${error.message}).`);
    console.log(`[Hybrid Mode] Resilient In-Memory Task & User Store is ACTIVE for seamless instant testing!`);
    console.log(`[Tip] To use a live MongoDB, start mongod or set MONGODB_URI in backend/.env`);
  }
}

mongoose.connection.on('disconnected', () => {
  isConnectedToMongo = false;
  console.log('[MongoDB] Disconnected');
});

mongoose.connection.on('error', (err) => {
  isConnectedToMongo = false;
  console.error('[MongoDB] Runtime error:', err.message);
});
