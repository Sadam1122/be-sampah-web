import type { User, Role } from "@prisma/client"

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  role?: Role
}

export interface LoginResponse {
  token: string
  user: Omit<User, "password">
  message: string
}

export interface JwtPayload {
  id: string
  role: Role
}

export type UserProfile = Omit<User, "password">

