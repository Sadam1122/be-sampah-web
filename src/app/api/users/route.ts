import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { Role } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Skema validasi untuk data pengguna baru
const userSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  role: z.enum(["ADMIN", "SUPERADMIN", "WARGA"]), // Role yang diizinkan
  desaId: z.string().uuid(), // Validasi desaId yang harus UUID
});

// Mendapatkan data pengguna
export async function GET(req: Request) {
  const userRole = req.headers.get("x-user-role") as Role;

  // Debugging log untuk melihat role
  console.log("User Role:", userRole);

  // Pastikan hanya ADMIN atau SUPERADMIN yang bisa mengakses
  if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
    return NextResponse.json({ message: "Only ADMIN or SUPERADMIN can access this endpoint" }, { status: 403 });
  }

  try {
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
            nama: true, // Gantilah 'namaDesa' menjadi 'nama' sesuai dengan model yang ada
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

// Membuat pengguna baru
export async function POST(req: Request) {
  const userRole = req.headers.get("x-user-role") as Role;

  // Cek apakah hanya SUPERADMIN yang boleh menambah pengguna baru
  if (userRole !== "SUPERADMIN") {
    return NextResponse.json({ message: "Only SUPERADMIN can create users" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validatedData = userSchema.parse(body); // Validasi input dengan Zod

    // Cari desa berdasarkan desaId
    const desa = await prisma.desa.findUnique({
      where: { id: validatedData.desaId },
    });

    if (!desa) {
      return NextResponse.json({ message: "Desa not found" }, { status: 404 });
    }

    // Enkripsi password dengan bcrypt
    const hashedPassword = await bcrypt.hash("defaultpassword", 10); // 10 adalah tingkat salt

    // Proses pembuatan pengguna baru
    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        username: validatedData.username,
        password: hashedPassword, // Menggunakan password yang sudah dienkripsi
        role: validatedData.role,
        desaId: validatedData.desaId, // Menyambungkan dengan desa
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
