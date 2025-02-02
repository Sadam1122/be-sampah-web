import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

const pengumpulanSampahSchema = z.object({
  berat: z.number().positive(),
  namaPemilik: z.string().max(100),
  rt: z.string().length(3),
  rw: z.string().length(3),
  desa: z.string().max(100),
  jenisSampah: z.string().max(50),
  poin: z.number().int().nonnegative(),
})

export async function GET() {
  try {
    const pengumpulanSampah = await prisma.pengumpulanSampah.findMany()
    return NextResponse.json(pengumpulanSampah)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = pengumpulanSampahSchema.parse(body)
    const newPengumpulanSampah = await prisma.pengumpulanSampah.create({
      data: validatedData,
    })
    return NextResponse.json(newPengumpulanSampah, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

