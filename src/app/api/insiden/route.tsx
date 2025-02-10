import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { user_role } from "@prisma/client";


// Enum status insiden sesuai dengan database
enum InsidenStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
}
// Fungsi konversi waktu manual ke zona waktu Jakarta (WIB)
function getJakartaTime() {
  const now = new Date();
  const offsetJakarta = 7 * 60 * 60 * 1000; // UTC+7 (Jakarta)
  return new Date(now.getTime() + offsetJakarta);
}


// 🟢 GET: Ambil daftar insiden berdasarkan desaId dan status
export async function GET(req: Request) {
  try {
    const userRole = req.headers.get("x-user-role")?.toUpperCase() as user_role | undefined;
    if (!userRole || !Object.values(user_role).includes(userRole)) {
      return NextResponse.json({ message: "Forbidden: Invalid Role" }, { status: 403 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status") as InsidenStatus | null;
    const desaId = url.searchParams.get("desaId");

    if (status && !Object.values(InsidenStatus).includes(status)) {
      return NextResponse.json({ message: "Invalid status parameter" }, { status: 400 });
    }

    // Hanya ADMIN atau SUPERADMIN yang bisa mengakses
    if (userRole === user_role.SUPERADMIN) {
      const insiden = await prisma.insiden.findMany({
        where: { status: status || undefined },
        orderBy: { time: "desc" },
      });
      return NextResponse.json(insiden);
    }

    if (userRole === user_role.ADMIN && desaId) {
      const insiden = await prisma.insiden.findMany({
        where: { desaId, status: status || undefined },
        orderBy: { time: "desc" },
      });
      return NextResponse.json(insiden);
    }

    return NextResponse.json({ message: "Forbidden: Access Denied" }, { status: 403 });
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// 🔵 POST: Tambah insiden baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { desaId, type, location, description, reporterId } = body; // 🔹 desaId diambil dari body

    // Ambil role dari header (harus dikirim oleh frontend saat login)
    const role = req.headers.get("x-user-role")?.toUpperCase();

    // Hanya ADMIN dan SUPERADMIN yang bisa menambahkan insiden
    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      return NextResponse.json({ message: "Forbidden: Only ADMIN or SUPERADMIN can create incidents" }, { status: 403 });
    }

    if (!desaId || !type || !location || !description || !reporterId) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    // Validasi desaId harus berupa UUID
    if (!/^[0-9a-fA-F-]{36}$/.test(desaId)) {
      return NextResponse.json({ message: "Invalid desaId format" }, { status: 400 });
    }

    // Waktu sekarang dalam zona waktu Jakarta
    const timeHandled = getJakartaTime();

    // Buat insiden baru
    const newInsiden = await prisma.insiden.create({
      data: {
        id: crypto.randomUUID(), // Buat ID baru secara manual
        desaId, // 🔹 Sekarang menggunakan desaId dari body
        type,
        location,
        description,
        status: InsidenStatus.PENDING, // Pakai enum untuk status default
        time: new Date(),
        reporterId, // 🔹 Gunakan reporterId dari body
        handledBy: reporterId, // 🔹 Otomatis diisi oleh reporterId
        timeHandled, // Waktu dengan zona Jakarta
      },
    });

    return NextResponse.json(newInsiden, { status: 201 });
  } catch (error) {
    console.error("Error creating incident:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}



// 🟠 PUT: Update status insiden berdasarkan ID
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status || !Object.values(InsidenStatus).includes(status)) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const existingInsiden = await prisma.insiden.findUnique({ where: { id } });

    if (!existingInsiden) {
      return NextResponse.json({ message: "Incident not found" }, { status: 404 });
    }

    const updatedInsiden = await prisma.insiden.update({
      where: { id },
      data: { status, timeHandled: status === InsidenStatus.RESOLVED ? new Date() : null },
    });

    return NextResponse.json(updatedInsiden);
  } catch (error) {
    console.error("Error updating incident:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
