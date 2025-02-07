import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

// Schema validasi
const jadwalPengumpulanSchema = z.object({
  desaId: z.string().uuid(),
  hari: z.enum(["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "MINGGU"]),
  waktuMulai: z.string().regex(/^\d{2}:\d{2}$/),
  waktuSelesai: z.string().regex(/^\d{2}:\d{2}$/),
})

// GET: Ambil semua jadwal pengumpulan
export async function GET(req: Request) {
  try {
    const userRole = req.headers.get("x-user-role") // Ambil role dari header
    const url = new URL(req.url)
    const desaId = url.searchParams.get("desaId")

    // Jika superadmin, ambil semua data tanpa filter desaId
    if (userRole === "SUPERADMIN") {
      const jadwalPengumpulan = await prisma.jadwalPengumpulan.findMany({
        include: { desa: true },
      })
      if (jadwalPengumpulan.length === 0) {
        return NextResponse.json({ message: "No schedules available" })
      }
      return NextResponse.json(jadwalPengumpulan)
    }

    // Untuk admin & warga, desaId wajib ada
    if (!desaId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
    }

    // Ambil data berdasarkan desaId
    const jadwalPengumpulan = await prisma.jadwalPengumpulan.findMany({
      where: { desaId },
      include: { desa: true },
    })

    // Jika tidak ada data untuk desaId yang diberikan
    if (jadwalPengumpulan.length === 0) {
      return NextResponse.json({ message: "No schedules available for this desa" })
    }

    return NextResponse.json(jadwalPengumpulan)
  } catch (error) {
    console.error("Error fetching jadwal pengumpulan:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

// POST: Tambah jadwal pengumpulan baru
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = jadwalPengumpulanSchema.parse(body)

    // Cek apakah desa dengan desaId ada
    const desaExists = await prisma.desa.findUnique({
      where: { id: validatedData.desaId },
    })
    if (!desaExists) {
      return NextResponse.json({ error: "Desa not found" }, { status: 404 })
    }

    // Konversi waktu ke format DateTime
    const waktuMulai = new Date(`1970-01-01T${validatedData.waktuMulai}:00Z`)
    const waktuSelesai = new Date(`1970-01-01T${validatedData.waktuSelesai}:00Z`)

    // Simpan ke database
    const newJadwalPengumpulan = await prisma.jadwalPengumpulan.create({
      data: {
        desaId: validatedData.desaId,
        hari: validatedData.hari,
        waktuMulai,
        waktuSelesai,
      },
      include: { desa: true },
    })

    return NextResponse.json(newJadwalPengumpulan, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error creating jadwal pengumpulan:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
