import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
import { logActivity } from "../lib/auth"; // Mengabaikan JWT terkait
import { z } from "zod";

const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(8),
  role: z.nativeEnum(Role).optional(),
});

export class AuthController {
  // Login handler (tanpa JWT)
  async login(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const { email, password } = loginSchema.parse(body);

      // Check if user exists by email
      const user = await prisma.user.findUnique({
        where: { email },
        // Tidak perlu include desa, cukup ambil desaId
      });

      if (!user) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
      }

      // Validate password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
      }

      // Log activity (without token handling)
      await logActivity(user.id, "USER_LOGIN", `User logged in: ${user.email}`);

      // Return successful response with user data
      return NextResponse.json(
        {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role, // Include role in the response
            desaId: user.desaId || null, // Include the village (desa) ID if available
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

  // Register user
  async register(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const { email, username, password, role } = registerSchema.parse(body);

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });

      if (existingUser) {
        return NextResponse.json({ message: "Email or username already exists" }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          role: role || Role.WARGA, // Default to 'WARGA' if no role provided
        },
      });

      await logActivity(newUser.id, "USER_REGISTERED", `User registered with email: ${email}`);

      return NextResponse.json(
        {
          message: "User created successfully",
          userId: newUser.id,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Registration error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  }
}
