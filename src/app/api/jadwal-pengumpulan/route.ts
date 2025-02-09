import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Skema validasi untuk jadwal pengumpulan
const jadwalPengumpulanSchema = z.object({
  desaId: z.string().uuid(),
  hari: z.string().max(20), // Ubah dari hariPengumpulan ke hari
  waktuMulai: z.string().regex(/^\d{2}:\d{2}$/), // Format HH:MM
  waktuSelesai: z.string().regex(/^\d{2}:\d{2}$/), // Format HH:MM
});

export async function GET() {
  try {
    const jadwalPengumpulan = await prisma.jadwalpengumpulan.findMany({
      include: { desa: true },
    });
    return NextResponse.json(jadwalPengumpulan);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = jadwalPengumpulanSchema.parse(body);

    // Ubah waktu ke DateTime (format 1970-01-01TXX:XX:00.000Z)
    const waktuMulai = new Date(`1970-01-01T${validatedData.waktuMulai}:00.000Z`);
    const waktuSelesai = new Date(`1970-01-01T${validatedData.waktuSelesai}:00.000Z`);

    // Simpan ke database
    const newJadwalPengumpulan = await prisma.jadwalpengumpulan.create({
      data: {
        id: crypto.randomUUID(), // Tambahkan ID unik
        desaId: validatedData.desaId,
        hari: validatedData.hari, // Gunakan hari, bukan hariPengumpulan
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
