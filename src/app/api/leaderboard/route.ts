import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET: Ambil 100 besar leaderboard berdasarkan totalPoin (descending)
 *      - Hanya menampilkan data yang available: true
 *      - poinSaatIni hanya ditampilkan jika user memiliki role "WARGA"
 */
export async function GET() {
  try {
    const leaderboard = await prisma.leaderboard.findMany({
      where: { available: true },
      orderBy: { totalPoin: "desc" },
      take: 100,
      include: {
        user: {
          select: {
            username: true,
            role: true, // Ambil role agar bisa menyembunyikan poinSaatIni
          },
        },
      },
    });

    // Filter poinSaatIni hanya untuk role "WARGA"
    const filteredLeaderboard = leaderboard.map((entry) =>
      entry.user?.role === "WARGA"
        ? entry
        : { ...entry, poinSaatIni: undefined } // Hilangkan poinSaatIni untuk non-WARGA
    );

    return NextResponse.json(filteredLeaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to retrieve leaderboard" },
      { status: 500 }
    );
  }
}

/**
 * POST: Tambah data leaderboard baru
 *       - Data baru tidak langsung menambah totalPoin, harus dikonfirmasi dulu
 *       - poinSaatIni hanya digunakan untuk role "WARGA"
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

    // Ambil user untuk cek role
    const user = body.userId
      ? await prisma.user.findUnique({ where: { id: body.userId } })
      : null;

    const newEntry = await prisma.leaderboard.create({
      data: {
        id: crypto.randomUUID(),
        totalPoin: body.totalPoin,
        jumlahPengumpulan: body.jumlahPengumpulan,
        poinSaatIni: user?.role === "WARGA" ? body.poinSaatIni ?? 0 : 0, // poinSaatIni hanya untuk WARGA
        userId: body.userId ?? null,
        available: false,
      },
    });

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("Error creating leaderboard entry:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Konfirmasi data dan gabungkan ke leaderboard utama
 *        - poinSaatIni tetap khusus untuk WARGA
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const entry = await prisma.leaderboard.findUnique({ where: { id } });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const user = entry.userId
      ? await prisma.user.findUnique({ where: { id: entry.userId } })
      : null;

    const mainEntry = await prisma.leaderboard.findFirst({
      where: { userId: entry.userId, available: true },
    });

    if (mainEntry) {
      await prisma.leaderboard.update({
        where: { id: mainEntry.id },
        data: {
          totalPoin: mainEntry.totalPoin + entry.totalPoin,
          poinSaatIni: user?.role === "WARGA" ? mainEntry.poinSaatIni + entry.poinSaatIni : mainEntry.poinSaatIni,
          jumlahPengumpulan: mainEntry.jumlahPengumpulan + entry.jumlahPengumpulan,
        },
      });

      await prisma.leaderboard.delete({ where: { id } });
    } else {
      await prisma.leaderboard.update({
        where: { id },
        data: { available: true },
      });
    }

    return NextResponse.json({ message: "Entry confirmed" });
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
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
