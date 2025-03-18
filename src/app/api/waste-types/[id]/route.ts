import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ✅ Tambahkan ini agar Next.js tidak melakukan cache terlalu agresif
export const dynamic = "force-dynamic";

// GET /api/waste-types/:id
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ Ubah params jadi Promise
) {
  try {
    const { id } = await context.params; // ✅ Pastikan params di `await`
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const wasteType = await db.wastetype.findUnique({
      where: { id },
    });

    if (!wasteType) {
      return NextResponse.json({ error: "Waste type not found" }, { status: 404 });
    }

    return NextResponse.json(wasteType, { status: 200 });
  } catch (error) {
    console.error("Error fetching waste type:", error);
    return NextResponse.json({ error: "Failed to fetch waste type" }, { status: 500 });
  }
}

// PUT /api/waste-types/:id
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ Ubah params jadi Promise
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const userRole = request.headers.get("x-user-role");
    if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized: Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, pricePerKg, recyclable, hazardous } = body;

    if (!name || !description || pricePerKg === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (isNaN(pricePerKg) || pricePerKg < 0) {
      return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
    }

    const existingWasteType = await db.wastetype.findUnique({
      where: { id },
    });

    if (!existingWasteType) {
      return NextResponse.json({ error: "Waste type not found" }, { status: 404 });
    }

    const updatedWasteType = await db.wastetype.update({
      where: { id },
      data: {
        name,
        description,
        pricePerKg,
        recyclable: recyclable ?? false,
        hazardous: hazardous ?? false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedWasteType, { status: 200 });
  } catch (error) {
    console.error("Error updating waste type:", error);
    return NextResponse.json({ error: "Failed to update waste type" }, { status: 500 });
  }
}

// DELETE /api/waste-types/:id
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ Ubah params jadi Promise
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const userRole = request.headers.get("x-user-role");
    if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized: Insufficient permissions" }, { status: 403 });
    }

    const existingWasteType = await db.wastetype.findUnique({
      where: { id },
    });

    if (!existingWasteType) {
      return NextResponse.json({ error: "Waste type not found" }, { status: 404 });
    }

    await db.wastetype.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting waste type:", error);
    return NextResponse.json({ error: "Failed to delete waste type" }, { status: 500 });
  }
}
