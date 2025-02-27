import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET: Ambil 100 besar leaderboard berdasarkan totalPoin (descending)
 */
export async function GET() {
  try {
    const leaderboard = await prisma.leaderboard.findMany({
      orderBy: { totalPoin: "desc" },
      take: 100,
      include: {
        user: {
          select: {
            username: true, // Menampilkan username jika ada
          },
        },
      },
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to retrieve leaderboard" },
      { status: 500 }
    );
  }
}

/**
 * POST: Tambah atau perbarui data leaderboard berdasarkan userId
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validasi data input
    if (
      typeof body.totalPoin !== "number" ||
      typeof body.jumlahPengumpulan !== "number" ||
      (body.userId && typeof body.userId !== "string") // userId boleh null
    ) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    // Cari apakah ada leaderboard dengan userId yang sama
    const existingEntry = await prisma.leaderboard.findFirst({
      where: { userId: body.userId ?? null }, // Jika userId null, tetap cari berdasarkan null
    });

    let newEntry;
    if (existingEntry) {
      // Update jika sudah ada
      newEntry = await prisma.leaderboard.update({
        where: { id: existingEntry.id }, // Menggunakan id sebagai unique key
        data: {
          totalPoin: existingEntry.totalPoin + body.totalPoin,
          jumlahPengumpulan: existingEntry.jumlahPengumpulan + body.jumlahPengumpulan,
        },
      });
    } else {
      // Buat entry baru
      newEntry = await prisma.leaderboard.create({
        data: {
          id: crypto.randomUUID(), // Harus ada id karena di schema tidak ada @default(uuid())
          totalPoin: body.totalPoin,
          jumlahPengumpulan: body.jumlahPengumpulan,
          userId: body.userId ?? null, // Jika userId tidak dikirim, set null
        },
      });
    }

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating leaderboard entry:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
