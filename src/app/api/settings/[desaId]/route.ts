import { NextResponse } from "next/server"
import prisma from "../../../../lib/prisma"
import type { user_role } from "@prisma/client"
import { z } from "zod"

// Mark route as dynamic to prevent Next.js from caching params
export const dynamic = "force-dynamic"

// Validation schema for user update (WARGA only)
const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  username: z.string().min(3).max(20).optional(),
})

// GET: Fetch all users with role "WARGA" based on user's role and desa

export async function GET(req: Request) {
  try {
    const userRole = req.headers.get("x-user-role") as user_role | null;
    const userDesaId = req.headers.get("x-user-desa-id");

    if (!userRole || (userRole !== "ADMIN" && userRole !== "SUPERADMIN")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Tentukan filter berdasarkan role pengguna
    const whereCondition: { role: user_role; desaId?: string } = { role: "WARGA" };

    if (userRole === "ADMIN") {
      if (!userDesaId) {
        return NextResponse.json({ message: "User's desa ID is required for ADMIN" }, { status: 400 });
      }
      whereCondition.desaId = userDesaId;
    }

    const users = await prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        role: true,
        desa: { select: { id: true, nama: true } },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update user (ADMIN only, and only for "WARGA" role)
export async function PUT(req: Request) {
  try {
    const userRole = req.headers.get("x-user-role") as user_role
    const userDesaId = req.headers.get("x-user-desa-id")

    if (userRole !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = userSchema.partial().parse(body)

    const updatedUser = await prisma.user.update({
      where: {
        id: validatedData.id,
        role: "WARGA",
        desaId: userDesaId, // Ensure the user belongs to the admin's desa
      },
      data: { ...validatedData, updatedAt: new Date() },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 })
    console.error("Error updating user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// DELETE: Delete user (ADMIN only, and only for "WARGA" role)
export async function DELETE(req: Request) {
  try {
    const userRole = req.headers.get("x-user-role") as user_role
    const userDesaId = req.headers.get("x-user-desa-id")
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("id")

    if (userRole !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "WARGA",
        desaId: userDesaId, // Ensure the user belongs to the admin's desa
      },
    })

    if (!existingUser) {
      return NextResponse.json({ message: "User not found or access denied" }, { status: 404 })
    }

    await prisma.user.delete({ where: { id: userId } })
    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

