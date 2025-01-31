import type { NextApiRequest, NextApiResponse } from "next"
import { verify } from "jsonwebtoken"
import prisma from "./prisma"
import type { User, Role } from "@prisma/client"

export interface AuthenticatedRequest extends NextApiRequest {
  user?: User
}

export const verifyToken = async (token: string): Promise<User | null> => {
  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { id: string }
    return await prisma.user.findUnique({ where: { id: decoded.id } })
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

export const authenticateUser = async (req: AuthenticatedRequest, res: NextApiResponse, next: () => void) => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Authentication required" })
  }

  const user = await verifyToken(token)

  if (!user) {
    return res.status(401).json({ message: "Invalid token or user not found" })
  }

  req.user = user
  next()
}

export const authorizeRoles = (roles: Role[]) => {
  return (req: AuthenticatedRequest, res: NextApiResponse, next: () => void) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" })
    }
    next()
  }
}

export const logActivity = async (userId: string, action: string, details?: string, req?: NextApiRequest) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details,
        ipAddress: req?.socket.remoteAddress,
        userAgent: req?.headers["user-agent"],
      },
    })
  } catch (error) {
    console.error("Error logging activity:", error)
  }
}

