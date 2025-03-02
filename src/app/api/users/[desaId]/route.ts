import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { user_role } from "@prisma/client";

// Menandai route sebagai dynamic agar Next.js tidak meng-cache params
export const dynamic = "force-dynamic";

export async function GET(req: Request, context: { params?: { desaId?: string } }) {
  try {
    // Pastikan params tersedia dengan await
    const { desaId } = await context.params ?? {};

    if (!desaId) {
      return NextResponse.json({ message: "desaId is required" }, { status: 400 });
    }

    const userRole = req.headers.get("x-user-role") as user_role;

    // Validasi role agar hanya ADMIN dan SUPERADMIN yang bisa akses
    if (!userRole || (userRole !== "ADMIN" && userRole !== "SUPERADMIN")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Jika SUPERADMIN, bisa melihat semua pengguna tanpa filter desaId
    if (userRole === "SUPERADMIN") {
      const users = await prisma.user.findMany({
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

    // Jika ADMIN, hanya bisa melihat user yang ada di desa yang diakses
    const users = await prisma.user.findMany({
      where: { desaId },
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
