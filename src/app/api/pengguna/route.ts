import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

const penggunaSchema = z.object({
  nama: z.string().max(100),
  email: z.string().email().max(100),
  password: z.string().min(6).max(100),
})

export async function GET() {
  try {
    const pengguna = await prisma.pengguna.findMany({
      select: { id: true, nama: true, email: true, createdAt: true },
    })
    return NextResponse.json(pengguna)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = penggunaSchema.parse(body)
    const newPengguna = await prisma.pengguna.create({
      data: validatedData,
    })
    const { password, ...penggunaWithoutPassword } = newPengguna
    return NextResponse.json(penggunaWithoutPassword, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

