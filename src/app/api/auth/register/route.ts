import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { encrypt } from "../../../lib/auth";
import User from "../../../lib/models/user";
import Organization from "../../../lib/models/organization";
import connectDB from "@/app/lib/mongodb";

export async function POST(request: Request) {
  try {
    await connectDB()
    const { name, email, password, organizationName } = await request.json();

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Create organization
    const organization = await Organization.create({
      name: organizationName,
      createdAt: new Date(),
    });

    // Hash password and create user
    const hashedPassword = await hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      organizationId: organization._id,
      role: "admin",
      createdAt: new Date(),
    });

    // Create session token
    const token = await encrypt({
      userId: user._id.toString(),
      organizationId: organization._id.toString(),
      email,
      name,
      role: "admin",
    });

    const response = NextResponse.json({ success: true }, { status: 201 });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error) {
    console.log("<<<Error", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
