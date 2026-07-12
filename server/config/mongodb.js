/**
 * Folder: /server/config
 * What's inside: Configuration files to connect to third-party services.
 * 
 * File: mongodb.js
 * Feature: Database Connection
 * Purpose: Establishes the connection to the MongoDB Atlas cluster using Mongoose.
 */
import mongoose from "mongoose"

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}`)
        console.log("✔ Database connected")
    } catch (error) {
        console.log("❌ Database connection failed: ", error.message)
    }
}

export default connectDB