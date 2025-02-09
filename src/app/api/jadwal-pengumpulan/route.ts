import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Skema validasi untuk jadwal pengumpulan
const jadwalPengumpulanSchema = z.object({
  desaId: z.string().uuid(),
  hari: z.string().max(20), // Hari harus berupa string dengan maksimal 20 karakter
  waktuMulai: z.string().regex(/^\d{2}:\d{2}$/), // Format HH:MM
  waktuSelesai: z.string().regex(/^\d{2}:\d{2}$/), // Format HH:MM
});

// GET: Ambil jadwal pengumpulan berdasarkan desaId atau semua jika superadmin
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const desaId = searchParams.get("desaId");

    // Ambil role dari header (bukan query params)
    const role = request.headers.get("x-user-role")?.toUpperCase();

    let jadwalPengumpulan;

    if (role === "SUPERADMIN") {
      // Jika SUPERADMIN, ambil semua jadwal tanpa filter desaId
      jadwalPengumpulan = await prisma.jadwalpengumpulan.findMany({
        include: { desa: true },
      });
    } else {
      // Jika bukan SUPERADMIN, pastikan desaId tersedia
      if (!desaId) {
        return NextResponse.json({ error: "desaId is required" }, { status: 400 });
      }

      // Ambil data berdasarkan desaId
      jadwalPengumpulan = await prisma.jadwalpengumpulan.findMany({
        where: { desaId },
        include: { desa: true },
      });
    }

    return NextResponse.json(jadwalPengumpulan);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// POST: Tambah jadwal pengumpulan
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = jadwalPengumpulanSchema.parse(body);

    // Ubah waktu ke DateTime (format 1970-01-01TXX:XX:00.000Z)
    const waktuMulai = new Date(`2025-01-01T${validatedData.waktuMulai}:00+07:00`);
    const waktuSelesai = new Date(`2025-01-01T${validatedData.waktuSelesai}:00+07:00`);    

    // Simpan ke database
    const newJadwalPengumpulan = await prisma.jadwalpengumpulan.create({
      data: {
        id: crypto.randomUUID(), // Tambahkan ID unik
        desaId: validatedData.desaId,
        hari: validatedData.hari,
        waktuMulai,
        waktuSelesai,
      },
      include: { desa: true },
    });

    return NextResponse.json(newJadwalPengumpulan, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
