import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient, user_role } from "@prisma/client";
import { logActivity } from "../lib/auth"; // Fungsi logging aktivitas
import { z } from "zod";

const prisma = new PrismaClient();

// Skema validasi untuk login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function getJakartaTime() {
  const now = new Date();
  const jakartaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  return jakartaTime;
}

// Skema validasi untuk registrasi
const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(["SUPERADMIN", "ADMIN", "WARGA"]).optional(),
  desaId: z.string().optional(), // Opsional, jika ada akan disimpan
});

export class AuthController {
  // Handler untuk login
  async login(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const { email, password } = loginSchema.parse(body);

      // Cek apakah user dengan email tersebut ada
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
      }

      // Validasi password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
      }

      // Log aktivitas login
      await logActivity(user.id, "USER_LOGIN", `User logged in: ${user.email}`);

      return NextResponse.json(
        {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            desaId: user.desaId || null,
          },
          message: `Welcome, ${user.username}! You are logged in as ${user.role}.`,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Login error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  }

  // Handler untuk registrasi
  async register(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const { email, username, password, role, desaId } = registerSchema.parse(body);

      // Cek apakah email atau username sudah terdaftar
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });
      if (existingUser) {
        return NextResponse.json({ message: "Email or username already exists" }, { status: 400 });
      }

      // Hash password sebelum disimpan
      const hashedPassword = await bcrypt.hash(password, 12);

      // Simpan user baru
      const newUser = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email,
          username,
          password: hashedPassword,
          role: role || user_role.WARGA,
          desaId: desaId?.trim() !== "" ? desaId : undefined, // Simpan hanya jika tidak kosong
          createdAt: getJakartaTime(),
          updatedAt: getJakartaTime(),
        },
      });

      // Log aktivitas registrasi
      await logActivity(newUser.id, "USER_REGISTERED", `User registered with email: ${email}`);

      return NextResponse.json(
        { message: "User created successfully", userId: newUser.id },
        { status: 201 }
      );
    } catch (error) {
      console.error("Registration error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  }
}