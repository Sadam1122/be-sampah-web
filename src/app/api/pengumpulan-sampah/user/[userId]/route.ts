import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> } // Ubah tipe params menjadi Promise
) {
  try {
    // Tunggu (await) context.params agar bisa mengakses userId dengan benar
    const { userId } = await context.params;
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Ambil role dari header
    const userRole = req.headers.get("x-user-role");
    if (!userRole) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    // Jika role adalah WARGA, pastikan user di database memang WARGA
    if (userRole === "WARGA") {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (!user || user.role !== "WARGA") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Ambil semua data pengumpulan sampah untuk user tersebut (tidak difilter berdasarkan available)
    const pengumpulanSampah = await prisma.pengumpulansampah.findMany({
      where: { userId },
      orderBy: { waktu: "desc" },
    });

    return NextResponse.json(pengumpulanSampah);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
