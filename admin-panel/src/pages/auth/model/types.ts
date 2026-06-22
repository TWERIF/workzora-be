export interface UserCreate {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  userName: string;
  locale: string;
  isActive: boolean;
}

export const UserRole = {
  FREELANCER: "freelancer",
  CLIENT: "client",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  reserveEmail?: string;
  password?: string;
  firstName: string;
  lastName: string;
  username: string;
  role: UserRole | string;
  isActive: boolean;
  skills: string[];
  ratings: number;
  position: string;
  rates: number;
  createdAt?: Date;
  updatedAt?: Date;
  avatarUrl: string;
}

export type UserPreview = Pick<
  User,
  | "id"
  | "firstName"
  | "lastName"
  | "role"
  | "ratings"
  | "position"
  | "rates"
  | "skills"
>;
