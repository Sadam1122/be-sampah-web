import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

// Skema validasi pengumpulan sampah
const pengumpulanSampahSchema = z.object({
  berat: z.number().positive(),
  namaPemilik: z.string().max(100),
  rt: z.string().min(1).max(3), // Bisa 1-3 karakter
  rw: z.string().min(1).max(3), // Bisa 1-3 karakter
  desaId: z.string().uuid(), // Desa yang terhubung
  jenisSampah: z.string().max(50),
  poin: z.number().int().nonnegative(),
})

// Handler GET
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const desaId = url.searchParams.get("desaId")
    const userRole = req.headers.get("x-user-role") // Ambil role dari header

    // Jika superadmin, ambil semua data tanpa filter desaId
    if (userRole === "SUPERADMIN") {
      const pengumpulanSampah = await prisma.pengumpulansampah.findMany({
        orderBy: { waktu: "desc" }, // Urutkan dari terbaru
      })
      return NextResponse.json(pengumpulanSampah)
    }

    // Jika bukan superadmin, desaId wajib ada
    if (!desaId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
    }

    // Untuk admin & warga, ambil data berdasarkan desaId
    const pengumpulanSampah = await prisma.pengumpulansampah.findMany({
      where: { desaId },
      orderBy: { waktu: "desc" },
    })

    return NextResponse.json(pengumpulanSampah)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// Handler POST
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = pengumpulanSampahSchema.parse(body)

    // Cari desa berdasarkan desaId
    const desa = await prisma.desa.findUnique({
      where: { id: validatedData.desaId },
    })

    if (!desa) {
      return NextResponse.json({ error: "Desa not found" }, { status: 404 })
    }

    // Menyimpan pengumpulan sampah dengan RT dan RW
    const newPengumpulanSampah = await prisma.pengumpulansampah.create({
      data: {
        id: crypto.randomUUID(), // Tambahkan id unik
        namaPemilik: validatedData.namaPemilik,
        berat: validatedData.berat,
        rt: validatedData.rt,  // RT bisa 1-3 karakter
        rw: validatedData.rw,  // RW bisa 1-3 karakter
        jenisSampah: validatedData.jenisSampah,
        poin: validatedData.poin,
        desaId: validatedData.desaId,  // Menyambungkan desa dengan desaId
      },
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
