import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET: Ambil 10 besar leaderboard berdasarkan totalPoin (descending)
 */
export async function GET() {
  try {
    const leaderboard = await prisma.leaderboard.findMany({
      orderBy: { totalPoin: "desc" },
      take: 10,
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
 * POST: Tambah atau perbarui data leaderboard
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validasi data input
    if (
      !body.namaPemilik ||
      typeof body.namaPemilik !== "string" ||
      typeof body.totalPoin !== "number" ||
      typeof body.jumlahPengumpulan !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    // Periksa apakah namaPemilik memiliki constraint @unique dalam schema.prisma
    const existingUser = await prisma.leaderboard.findFirst({
      where: { namaPemilik: body.namaPemilik },
    });

    let newEntry;
    if (existingUser) {
      // Jika user sudah ada, update poin & jumlah pengumpulan
      newEntry = await prisma.leaderboard.update({
        where: { id: existingUser.id }, // Gunakan id sebagai unique key
        data: {
          totalPoin: existingUser.totalPoin + body.totalPoin,
          jumlahPengumpulan: existingUser.jumlahPengumpulan + body.jumlahPengumpulan,
        },
      });
    } else {
      // Jika belum ada, buat entry baru
      newEntry = await prisma.leaderboard.create({
        data: {
          namaPemilik: body.namaPemilik,
          totalPoin: body.totalPoin,
          jumlahPengumpulan: body.jumlahPengumpulan,
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
