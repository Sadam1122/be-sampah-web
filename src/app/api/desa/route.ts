import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

const desaSchema = z.object({
  nama: z.string().max(100),
  kecamatan: z.string().max(100),
  kabupaten: z.string().max(100),
  provinsi: z.string().max(100),
})

/**
 * ✅ GET: Fetch desa by ID or fetch all desa.
 */
export async function GET(request: Request) {
  try {
    // Handle query parameters or fetch all data
    const { searchParams } = new URL(request.url)
    const desaId = searchParams.get("id")

    // If there is a desaId in the query, fetch that specific desa
    if (desaId) {
      const desa = await prisma.desa.findUnique({
        where: { id: desaId }, // Searching by ID
      })

      if (!desa) {
        return NextResponse.json({ error: "Desa not found" }, { status: 404 })
      }

      return NextResponse.json(desa)
    } else {
      // If no desaId, fetch all desa
      const desa = await prisma.desa.findMany()
      return NextResponse.json(desa)
    }
  } catch (error) {
    console.error("Error in GET /api/desa/rute:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

/**
 * ✅ POST: Create new desa (only accessible by SUPERADMIN role)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = desaSchema.parse(body);

    // Cek role dari header
    const role = request.headers.get("x-user-role"); // Sesuai dengan backend kamu

    if (role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Buat desa baru dengan id otomatis
    const newDesa = await prisma.desa.create({
      data: {
        id: crypto.randomUUID(),
        ...validatedData,
      },
    });

    return NextResponse.json(newDesa, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/desa:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
