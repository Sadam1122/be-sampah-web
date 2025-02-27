import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { user_role } from "@prisma/client";

export async function GET(req: Request, { params }: { params: { desaId: string } }) {
  try {
    const desaId = params.desaId;
    const userRole = req.headers.get("x-user-role") as user_role;

    if (!desaId) {
      return NextResponse.json({ message: "desaId is required" }, { status: 400 });
    }

    // Jika SUPERADMIN, bisa melihat semua pengguna tanpa filter desaId
    if (userRole === "SUPERADMIN") {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { desaId: desaId }, // User yang sesuai desaId
            { desaId: null }, // SUPERADMIN tetap bisa terlihat
          ],
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
          desa: {
            select: {
              id: true,
              nama: true,
            },
          },
        },
      });
      return NextResponse.json(users);
    }

    // Jika bukan SUPERADMIN, hanya ambil user berdasarkan desaId
    const users = await prisma.user.findMany({
      where: {
        desaId: desaId,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        desa: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
