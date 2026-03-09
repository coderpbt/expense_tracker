import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGOSE_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
   throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads in development.
 * This prevents opening too many connections to MongoDB.
 */
let cached = global.mongoose;

if (!cached) {
   cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
   if (cached.conn) {
      return cached.conn;
   }

   if (!cached.promise) {
      const opts = {
         bufferCommands: false,
         // other options can be added here
      };

      cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
         return mongoose;
      });
   }

   try {
      cached.conn = await cached.promise;
      return cached.conn;
   } catch (e) {
      cached.promise = null;
      throw e;
   }
}