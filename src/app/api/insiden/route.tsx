import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Pastikan path sesuai dengan struktur proyek Anda
import { user_role } from '@prisma/client'; // Import Role dari Prisma

export async function GET(req: Request) {
  try {
    // Ambil role pengguna dari header request
    const userRole = req.headers.get('x-user-role')?.toUpperCase() as user_role | undefined;
    console.log('User Role:', userRole); // Debugging log

    // Pastikan role yang diterima valid
    if (!userRole || !Object.values(user_role).includes(userRole)) {
      return NextResponse.json({ message: 'Forbidden: Invalid Role' }, { status: 403 });
    }

    // Hanya ADMIN atau SUPERADMIN yang bisa mengakses
    if (userRole !== user_role.ADMIN && userRole !== user_role.SUPERADMIN) {
      return NextResponse.json({ message: 'Forbidden: Access Denied' }, { status: 403 });
    }

    // Ambil parameter status dan desaId dari query jika ada
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const desaId = url.searchParams.get('desaId'); // Ambil desaId dari query string

    // Untuk SUPERADMIN: bisa akses semua desa
    if (userRole === user_role.SUPERADMIN) {
      const insiden = await prisma.insiden.findMany({
        where: {
          status: status || undefined,
        },
        select: {
          id: true,
          desaId: true,
          type: true,
          location: true,
          description: true,
          status: true,
          time: true,
          reporterId: true,
          handledBy: true,
          timeHandled: true,
        },
      });
      return NextResponse.json(insiden);
    }

    // Untuk ADMIN: hanya bisa akses insiden desa mereka
    if (userRole === user_role.ADMIN && desaId) {
      const insiden = await prisma.insiden.findMany({
        where: {
          desaId: desaId, // Filter berdasarkan desaId yang diterima dari query string
          status: status || undefined,
        },
        select: {
          id: true,
          desaId: true,
          type: true,
          location: true,
          description: true,
          status: true,
          time: true,
          reporterId: true,
          handledBy: true,
          timeHandled: true,
        },
      });
      return NextResponse.json(insiden);
    }

    // Jika role tidak dikenali atau tidak memenuhi syarat
    return NextResponse.json({ message: 'Forbidden: Access Denied' }, { status: 403 });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
