import dns from "node:dns";
import mongoose from "mongoose";

// Dev only: some PCs (VPNs, DNS tools, router DNS) give Node a resolver that
// cannot answer the SRV lookups mongodb+srv:// needs (querySrv ECONNREFUSED).
// Use public DNS for local development. Production keeps the host's DNS.
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

// Cache the connection on globalThis so hot reloads and serverless
// invocations reuse one connection instead of exhausting Atlas.
const globalWithMongoose = globalThis as typeof globalThis & {
  _mongooseCache?: Cache;
};
const cache: Cache = (globalWithMongoose._mongooseCache ??= {
  conn: null,
  promise: null,
});

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local (see .env.example).");
  }
  if (cache.conn) return cache.conn;

  cache.promise ??= mongoose.connect(uri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 8000,
  });

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null; // allow a retry on the next call
    throw err;
  }
  return cache.conn;
}
