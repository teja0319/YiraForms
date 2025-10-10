// import mongoose from "mongoose"
// import { getEnv } from "./env"

// type MongooseGlobal = typeof globalThis & {
//   _mongooseConn?: {
//     conn: typeof mongoose | null
//     promise: Promise<typeof mongoose> | null
//   }
// }

// const g = global as MongooseGlobal

// if (!g._mongooseConn) {
//   g._mongooseConn = { conn: null, promise: null }
// }

// export async function connectMongo() {
//   if (g._mongooseConn!.conn) return g._mongooseConn!.conn

//   if (!g._mongooseConn!.promise) {
//     const uri = getEnv("mongodb+srv://Vercel-Admin-YiraForms:H81QRqNlvmzuAjce@yiraforms.gcliyu5.mongodb.net/?retryWrites=true&w=majority")
//     g._mongooseConn!.promise = mongoose
//       .connect(uri, {
//         autoIndex: true,
//         serverSelectionTimeoutMS: 10000,
//         dbName: process.env.MONGODB_DB || undefined,
//       })
//       .then((m) => m)
//   }
//   g._mongooseConn!.conn = await g._mongooseConn!.promise
//   return g._mongooseConn!.conn
// }

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
  console.log("🟡 Checking existing MongoDB connection...")

  if (g._mongooseConn!.conn) {
    console.log("🟢 Using existing MongoDB connection.")
    return g._mongooseConn!.conn
  }

  if (!g._mongooseConn!.promise) {
    const uri = "mongodb+srv://Vercel-Admin-YiraForms:H81QRqNlvmzuAjce@yiraforms.gcliyu5.mongodb.net/?retryWrites=true&w=majority";

    console.log("🔵 Creating new MongoDB connection promise...")
    console.log(`📡 Connecting to MongoDB cluster...`)
    console.time("⏱ MongoDB Connection Time")

    g._mongooseConn!.promise = mongoose
      .connect(uri, {
        autoIndex: true,
        serverSelectionTimeoutMS: 10000,
        dbName: process.env.MONGODB_DB || undefined,
      })
      .then((m) => {
        console.timeEnd("⏱ MongoDB Connection Time")
        console.log("✅ MongoDB connected successfully.")
        console.log(`📘 Database Name: ${m.connection.name}`)
        console.log(`🌍 Host: ${m.connection.host}`)
        return m
      })
      .catch((error) => {
        console.error("❌ MongoDB connection error:", error)
        g._mongooseConn!.promise = null
        throw error
      })
  } else {
    console.log("🟠 Awaiting existing MongoDB connection promise...")
  }

  g._mongooseConn!.conn = await g._mongooseConn!.promise
  console.log("✅ MongoDB connection ready to use.")
  return g._mongooseConn!.conn
}
