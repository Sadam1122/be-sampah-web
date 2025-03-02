import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Skema validasi update
const updatePengumpulanSampahSchema = z.object({
  berat: z.number().positive(),
  jenisSampah: z.string().max(50),
  poin: z.number().int().nonnegative(),
});

// Handler PUT untuk update data berdasarkan ID
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Ubah tipe params menjadi Promise
) {
  try {
    const { id } = await params; // Ambil id dengan await

    if (!id) {
      return NextResponse.json({ error: "ID tidak ditemukan di URL" }, { status: 400 });
    }

    console.log("PUT request for ID:", id);

    // Cek apakah data dengan ID tersebut ada
    const existingData = await prisma.pengumpulansampah.findUnique({
      where: { id },
    });

    if (!existingData) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    const body = await req.json();
    console.log("PUT body:", body);

    // Validasi data
    const validatedData = updatePengumpulanSampahSchema.parse(body);

    // Update data
    const updatedPengumpulanSampah = await prisma.pengumpulansampah.update({
      where: { id },
      data: validatedData,
    });

    console.log("Updated Data:", updatedPengumpulanSampah);
    return NextResponse.json(updatedPengumpulanSampah, { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Handler DELETE untuk menghapus data berdasarkan ID
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Ubah tipe params menjadi Promise
) {
  try {
    const { id } = await params; // Ambil id dengan await

    if (!id) {
      return NextResponse.json({ error: "ID tidak ditemukan di URL" }, { status: 400 });
    }

    console.log("DELETE request for ID:", id);

    // Cek apakah data dengan ID tersebut ada
    const existingData = await prisma.pengumpulansampah.findUnique({
      where: { id },
    });

    if (!existingData) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    // Hapus data
    await prisma.pengumpulansampah.delete({
      where: { id },
    });

    console.log("Deleted Data ID:", id);
    return NextResponse.json({ message: "Data berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat menghapus data" }, { status: 500 });
  }
}
