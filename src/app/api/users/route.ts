import { NextResponse } from "next/server"
import prisma from "../../../lib/prisma"
import type { Role } from "@prisma/client"

export async function GET(req: Request) {
  const userRole = req.headers.get("x-user-role") as Role

  if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        verified: true,
        createdAt: true,
      },
    })
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const userRole = req.headers.get("x-user-role") as Role

  if (userRole !== "SUPERADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json({ message: "Use /api/auth/register for user creation." }, { status: 405 })
}

