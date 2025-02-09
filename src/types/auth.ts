import type { user as User, user_role as Role } from "@prisma/client";

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  role?: Role // Menggunakan tipe Role yang sudah sesuai dengan enum yang ada
}

export interface LoginResponse {
  user: Omit<User, "password"> // Pastikan password tidak disertakan dalam respons
  message: string
}

export interface JwtPayload {
  id: string
  role: Role
}

export type UserProfile = Omit<User, "password">
