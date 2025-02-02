import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const getAllPengumpulanSampah = async () => {
  return prisma.pengumpulanSampah.findMany()
}

export const createPengumpulanSampah = async (data: {
  berat: number
  namaPemilik: string
  rt: string
  rw: string
  desa: string
  jenisSampah: string
  poin: number
}) => {
  return prisma.pengumpulanSampah.create({
    data,
  })
}

