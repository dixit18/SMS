import { NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { encrypt } from "../../../lib/auth"
import User from "../../../lib/models/user"
import connectDB from "@/app/lib/mongodb"

export async function POST(request: Request) {
  try {
    await connectDB()
    const { email, password } = await request.json()

    const user = await User.findOne({ email }).select("+password")
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
    console.log("<<<error", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

