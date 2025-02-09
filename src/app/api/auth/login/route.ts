import { NextResponse } from "next/server"
import { compare } from "bcryptjs"
import clientPromise from "../../../lib/mongodb"
import { encrypt } from "../../../lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const client = await clientPromise
    const db = client.db("stockmanagement")

    const user = await db.collection("users").findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 })
    }

    const isValid = await compare(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 })
    }

    const token = await encrypt({
      userId: user._id.toString(),
      organizationId: user.organizationId.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    })

    const response = NextResponse.json({ success: true })

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

