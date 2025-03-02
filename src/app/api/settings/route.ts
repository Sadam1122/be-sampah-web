import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { user_role } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Skema validasi user
const userSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  role: z.enum(["ADMIN", "SUPERADMIN", "WARGA"]),
  desaId: z.string().uuid().optional(),
});

// Middleware untuk cek SUPERADMIN
function isSuperadmin(req: Request) {
  const userRole = req.headers.get("x-user-role") as user_role;
  return userRole === "SUPERADMIN";
}

// **GET: Ambil semua user, tetapi tanpa SUPERADMIN**
export async function GET(req: Request) {
  if (!isSuperadmin(req)) {
    return NextResponse.json({ message: "Only SUPERADMIN can access this" }, { status: 403 });
  }

  try {
    // **Ambil hanya user dengan role "WARGA" dan "ADMIN"**
    const users = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "WARGA"] }, // Hanya ADMIN dan WARGA
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        desaId: true,
        desa: { select: { id: true, nama: true } },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// **POST: Tambah user baru (hanya SUPERADMIN)**
export async function POST(req: Request) {
  if (!isSuperadmin(req)) {
    return NextResponse.json({ message: "Only SUPERADMIN can create users" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validatedData = userSchema.parse(body);

    if (validatedData.desaId) {
      const desa = await prisma.desa.findUnique({ where: { id: validatedData.desaId } });
      if (!desa) return NextResponse.json({ message: "Desa not found" }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash("defaultpassword", 10);

    const newUser = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email: validatedData.email,
        username: validatedData.username,
        password: hashedPassword,
        role: validatedData.role,
        desaId: validatedData.desaId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating user:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// **DELETE: Hapus user (hanya SUPERADMIN)**
export async function DELETE(req: Request) {
  if (!isSuperadmin(req)) {
    return NextResponse.json({ message: "Only SUPERADMIN can delete users" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Cegah penghapusan SUPERADMIN terakhir
    if (existingUser.role === "SUPERADMIN") {
      const superadminCount = await prisma.user.count({ where: { role: "SUPERADMIN" } });

      if (superadminCount <= 1) {
        return NextResponse.json({ message: "Cannot delete the last SUPERADMIN" }, { status: 403 });
      }
    }

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
