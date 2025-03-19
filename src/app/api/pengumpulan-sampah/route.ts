import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"
import { Decimal } from "@prisma/client/runtime/library";


const prisma = new PrismaClient()

// Skema validasi pengumpulan sampah
const pengumpulanSampahSchema = z.object({
  berat: z.number().positive(),
  rt: z.string().min(1).max(3),
  rw: z.string().min(1).max(3),
  jenisSampah: z.string().max(50),
  poin: z.number().int().nonnegative(),
  username: z.string(),
})

// Handler GET - Ambil hanya data yang available (true)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const desaId = url.searchParams.get("desaId")
    const userRole = req.headers.get("x-user-role")

    if (userRole === "SUPERADMIN") {
      const pengumpulanSampah = await prisma.pengumpulansampah.findMany({
        orderBy: { waktu: "desc" },
      })
      return NextResponse.json(pengumpulanSampah)
    }

    if (!desaId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
    }

    const pengumpulanSampah = await prisma.pengumpulansampah.findMany({
      where: { desaId },
      orderBy: { waktu: "desc" },
    })

    return NextResponse.json(pengumpulanSampah)
  } catch (error) {
    console.error("GET Error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}


// Handler POST - Tambah data baru dengan available: false
export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Received body:", body)

    const validatedData = pengumpulanSampahSchema.parse(body)
    const { username, berat, rt, rw, jenisSampah, poin } = validatedData

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, desaId: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.desaId) {
      return NextResponse.json({ error: "User does not have an associated desa" }, { status: 400 })
    }

    const newPengumpulanSampah = await prisma.pengumpulansampah.create({
      data: {
        id: crypto.randomUUID(),
        berat,
        rt,
        rw,
        jenisSampah,
        poin,
        desaId: user.desaId,
        userId: user.id,
      },
    })

    console.log("Created Data:", newPengumpulanSampah)

    return NextResponse.json(newPengumpulanSampah, { status: 201 })
  } catch (error) {
    console.error("POST Error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}



// Handler PATCH - Gabungkan data jika jenis sampah sama
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Ambil data pengumpulan sampah berdasarkan ID
    const existingData = await prisma.pengumpulansampah.findUnique({ where: { id } });

    if (!existingData) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Cari data lain yang sudah ada dengan jenis sampah yang sama di desa yang sama
    const similarData = await prisma.pengumpulansampah.findFirst({
      where: {
        jenisSampah: existingData.jenisSampah,
        desaId: existingData.desaId,
      },
    });

    if (similarData) {
      // Gunakan .plus() untuk menjumlahkan Decimal
      await prisma.pengumpulansampah.update({
        where: { id: similarData.id },
        data: {
          berat: new Decimal(similarData.berat).plus(existingData.berat),
          poin: similarData.poin + existingData.poin, // poin tetap number
        },
      });

      // Hapus data lama setelah digabung
      await prisma.pengumpulansampah.delete({ where: { id } });

      return NextResponse.json({ message: "Data merged successfully" });
    } else {
      return NextResponse.json({ error: "No similar data found" }, { status: 404 });
    }
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
