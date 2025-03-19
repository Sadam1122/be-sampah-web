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
            username: true,
            role: true,
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
 * POST: Tambah atau update data leaderboard berdasarkan userId
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      typeof body.totalPoin !== "number" ||
      typeof body.jumlahPengumpulan !== "number" ||
      (body.userId && typeof body.userId !== "string")
    ) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    // Cek apakah user sudah ada di leaderboard
    const existingEntry = await prisma.leaderboard.findFirst({
      where: { userId: body.userId },
    });

    if (existingEntry) {
      // Jika sudah ada, update data leaderboard
      const updatedEntry = await prisma.leaderboard.update({
        where: { id: existingEntry.id }, // Gunakan ID yang ada untuk update
        data: {
          totalPoin: existingEntry.totalPoin + body.totalPoin,
          jumlahPengumpulan: existingEntry.jumlahPengumpulan + body.jumlahPengumpulan,
          poinSaatIni: existingEntry.poinSaatIni + (body.poinSaatIni ?? 0),
        },
      });

      return NextResponse.json(updatedEntry);
    } else {
      // Jika belum ada, buat entri baru
      const newEntry = await prisma.leaderboard.create({
        data: {
          id: crypto.randomUUID(),
          totalPoin: body.totalPoin,
          jumlahPengumpulan: body.jumlahPengumpulan,
          poinSaatIni: body.poinSaatIni ?? 0,
          userId: body.userId ?? null,
        },
      });

      return NextResponse.json(newEntry, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating/updating leaderboard entry:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Menghapus satu data leaderboard atau seluruh data user
 */
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id, deleteAll } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existingEntry = await prisma.leaderboard.findUnique({ where: { id } });

    if (!existingEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    if (deleteAll) {
      await prisma.leaderboard.deleteMany({ where: { userId: existingEntry.userId } });
      return NextResponse.json({ message: "All leaderboard entries deleted" });
    } else {
      await prisma.leaderboard.delete({ where: { id } });
      return NextResponse.json({ message: "Leaderboard entry deleted" });
    }
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
