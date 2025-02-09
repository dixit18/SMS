import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

const secretKey = process.env.JWT_SECRET || "secretekey"
const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key)
}

export async function decrypt(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    })
    return payload
  } catch (error) {
    return null
  }
}

export async function getSession() {
  const token =   (await cookies()).get("token")?.value
  if (!token) return null
  return await decrypt(token)
}

export async function updateSession(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  if (!token) return null

  const session = await decrypt(token)
  if (!session) return null

  // Refresh the token
  const newToken = await encrypt(session)
  request.cookies.set("token", newToken)

  return session
}

