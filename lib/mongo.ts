import mongoose from "mongoose"
import { getEnv } from "./env"

type MongooseGlobal = typeof globalThis & {
  _mongooseConn?: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

const g = global as MongooseGlobal

if (!g._mongooseConn) {
  g._mongooseConn = { conn: null, promise: null }
}

export async function connectMongo() {
  if (g._mongooseConn!.conn) return g._mongooseConn!.conn

  if (!g._mongooseConn!.promise) {
    const uri = getEnv("MONGODB_URI")
    g._mongooseConn!.promise = mongoose
      .connect(uri, {
        autoIndex: true,
        serverSelectionTimeoutMS: 10000,
        dbName: process.env.MONGODB_DB || undefined,
      })
      .then((m) => m)
  }
  g._mongooseConn!.conn = await g._mongooseConn!.promise
  return g._mongooseConn!.conn
}
