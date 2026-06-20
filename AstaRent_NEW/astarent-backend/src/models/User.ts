export type UserRole = 'tenant' | 'landlord'

export interface User {
  id: string
  name: string
  email: string
  password?: string
  phone?: string
  avatar?: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface CreateUserDTO {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface UpdateUserDTO {
  name?: string
  phone?: string
  avatar?: string
}
