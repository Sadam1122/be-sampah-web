import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/waste-types/:id - Get a specific waste type
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const wasteType = await db.wastetype.findUnique({
      where: { id },
    })

    if (!wasteType) {
      return NextResponse.json({ error: "Waste type not found" }, { status: 404 })
    }

    return NextResponse.json(wasteType, { status: 200 })
  } catch (error) {
    console.error("Error fetching waste type:", error)
    return NextResponse.json({ error: "Failed to fetch waste type" }, { status: 500 })
  }
}

// PUT /api/waste-types/:id - Update a waste type
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Check authorization
    const userRole = request.headers.get("x-user-role")
    if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized: Insufficient permissions" }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { name, description, pricePerKg, recyclable, hazardous } = body

    // Validate required fields
    if (!name || !description || pricePerKg === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate price
    if (isNaN(pricePerKg) || pricePerKg < 0) {
      return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 })
    }

    // Check if waste type exists
    const existingWasteType = await db.wastetype.findUnique({
      where: { id },
    })

    if (!existingWasteType) {
      return NextResponse.json({ error: "Waste type not found" }, { status: 404 })
    }

    // Update waste type
    const updatedWasteType = await db.wastetype.update({
      where: { id },
      data: {
        name,
        description,
        pricePerKg,
        recyclable: recyclable || false,
        hazardous: hazardous || false,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updatedWasteType, { status: 200 })
  } catch (error) {
    console.error("Error updating waste type:", error)
    return NextResponse.json({ error: "Failed to update waste type" }, { status: 500 })
  }
}

// DELETE /api/waste-types/:id - Delete a waste type
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Check authorization
    const userRole = request.headers.get("x-user-role")
    if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized: Insufficient permissions" }, { status: 403 })
    }

    // Check if waste type exists
    const existingWasteType = await db.wastetype.findUnique({
      where: { id },
    })

    if (!existingWasteType) {
      return NextResponse.json({ error: "Waste type not found" }, { status: 404 })
    }

    // Check if waste type is referenced in collections (optional)
    // This would require a WasteCollection model with a relation to WasteType
    // const referencedCollections = await db.wasteCollection.findFirst({
    //   where: { wasteTypeId: id },
    // });
    //
    // if (referencedCollections) {
    //   return NextResponse.json(
    //     { error: "Cannot delete waste type that is referenced in collections" },
    //     { status: 400 }
    //   );
    // }

    // Delete waste type
    await db.wastetype.delete({
      where: { id },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting waste type:", error)
    return NextResponse.json({ error: "Failed to delete waste type" }, { status: 500 })
  }
}

