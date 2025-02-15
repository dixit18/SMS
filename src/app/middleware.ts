import { NextRequest, NextResponse } from "next/server"
import connectDB from "./lib/mongodb"

export async function middleware(req: NextRequest) {
  try {
    await connectDB() // Ensures MongoDB is connected
  } catch (error) {
    console.error("MongoDB Connection Error:", error)
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
  }

  return NextResponse.next() // Continue with the request
}

// Optional: Define paths where middleware should run
export const config = {
  matcher: "/api/:path*", // Runs middleware for all API routes
}
