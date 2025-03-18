import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

// GET /api/waste-types - Get all waste types
export async function GET() { // Hapus request karena tidak digunakan
  try {
    // Get all waste types
    const wasteTypes = await prisma.wastetype.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(wasteTypes, { status: 200 });
  } catch (error) {
    console.error("Error fetching waste types:", error);
    return NextResponse.json({ error: "Failed to fetch waste types" }, { status: 500 });
  }
}

// POST /api/waste-types - Create a new waste type
export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized: Insufficient permissions" }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { name, description, pricePerKg, recyclable, hazardous } = body;

    // Validate required fields
    if (!name || !description || pricePerKg === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate price
    if (isNaN(Number(pricePerKg)) || Number(pricePerKg) < 0) {
      return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
    }

    // Create new waste type with UUID
    const newWasteType = await prisma.wastetype.create({
      data: {
        id: uuidv4(),
        name,
        description,
        pricePerKg: Number(pricePerKg),
        recyclable: recyclable || false,
        hazardous: hazardous || false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(newWasteType, { status: 201 });
  } catch (error) {
    console.error("Error creating waste type:", error);
    return NextResponse.json({ error: "Failed to create waste type" }, { status: 500 });
  }
}
