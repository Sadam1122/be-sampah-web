import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"
import type { JwtPayload } from "../types/auth"

const prisma = new PrismaClient()

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    return decoded
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

export async function logActivity(userId: string, action: string, details: string) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details,
        ipAddress: "", // Bisa ditambahkan IP dari request
        userAgent: "", // Bisa ditambahkan user agent dari request
      },
    })
  } catch (error) {
    console.error("Activity logging error:", error)
  }
}
