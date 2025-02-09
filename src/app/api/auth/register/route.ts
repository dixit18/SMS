import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import clientPromise from "../../../lib/mongodb"
import { encrypt } from "../../../lib/auth"

export async function POST(request: Request) {
  try {
    const { name, email, password, organizationName } = await request.json()

    const client = await clientPromise
    const db = client.db("stockmanagement")

    // Check if user exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create organization
    const organization = await db.collection("organizations").insertOne({
      name: organizationName,
      createdAt: new Date(),
    })

    // Hash password and create user
    const hashedPassword = await hash(password, 12)
    const user = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      organizationId: organization.insertedId,
      role: "admin",
      createdAt: new Date(),
    })

    // Create session
    const token = await encrypt({
      userId: user.insertedId.toString(),
      organizationId: organization.insertedId.toString(),
      email,
      name,
      role: "admin",
    })

    const response = NextResponse.json({ success: true }, { status: 201 })

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

