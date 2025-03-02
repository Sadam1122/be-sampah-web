import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Pastikan path import benar

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log("Fetching user with ID:", id);

    if (!id) {
      return NextResponse.json({ message: "ID tidak diberikan" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
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

    console.log("User found:", user);

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
