import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

const desaSchema = z.object({
  nama: z.string().max(100),
  kecamatan: z.string().max(100),
  kabupaten: z.string().max(100),
  provinsi: z.string().max(100),
})

export async function GET() {
  try {
    const desa = await prisma.desa.findMany()
    return NextResponse.json(desa)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = desaSchema.parse(body)
    const newDesa = await prisma.desa.create({
      data: validatedData,
    })
    return NextResponse.json(newDesa, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

