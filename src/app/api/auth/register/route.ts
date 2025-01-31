import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "../../../../lib/prisma"
import { Role } from "@prisma/client"
import { logActivity } from "../../../../lib/auth"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(8),
  role: z.nativeEnum(Role).optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, username, password, role } = registerSchema.parse(body)

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      return NextResponse.json({ message: "Email or username already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: role || "STAFF",
      },
    })

    await logActivity(newUser.id, "USER_REGISTERED", `User registered with email: ${email}`)

    return NextResponse.json(
      {
        message: "User created successfully",
        userId: newUser.id,
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input", errors: error.errors }, { status: 400 })
    }
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

