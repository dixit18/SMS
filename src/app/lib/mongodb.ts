import mongoose from "mongoose"

const uri = "mongodb://localhost:27017/"

if (!uri) {
  throw new Error("MONGODB_URI is missing")
}

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return mongoose.connection
    }
    await mongoose.connect(uri, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    })
    console.log("MongoDB connected successfully")
    return mongoose.connection
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}

export default connectDB
