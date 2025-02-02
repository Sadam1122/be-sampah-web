import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

const jadwalPengumpulanSchema = z.object({
  desaId: z.string().uuid(),
  hariPengumpulan: z.string().max(20),
  waktuMulai: z.string().regex(/^\d{2}:\d{2}$/),
  waktuSelesai: z.string().regex(/^\d{2}:\d{2}$/),
})

export async function GET() {
  try {
    const jadwalPengumpulan = await prisma.jadwalPengumpulan.findMany({
      include: { desa: true },
    })
    return NextResponse.json(jadwalPengumpulan)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = jadwalPengumpulanSchema.parse(body)
    const newJadwalPengumpulan = await prisma.jadwalPengumpulan.create({
      data: {
        ...validatedData,
        waktuMulai: new Date(`1970-01-01T${validatedData.waktuMulai}:00Z`),
        waktuSelesai: new Date(`1970-01-01T${validatedData.waktuSelesai}:00Z`),
      },
      include: { desa: true },
    })
    return NextResponse.json(newJadwalPengumpulan, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

