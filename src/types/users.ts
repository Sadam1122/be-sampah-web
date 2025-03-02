import type { user_role } from "@prisma/client"

export interface User {
  id: string
  email: string
  username: string
  role: user_role
  desaId: string | null
  createdAt: Date
  updatedAt: Date
  desa?: {
    id: string
    nama: string
  }
}

export interface UserCreateInput {
  email: string
  username: string
  password?: string
  role: user_role
  desaId?: string | null
}

export interface UserUpdateInput {
  email?: string
  username?: string
  role?: user_role
  desaId?: string | null
}

