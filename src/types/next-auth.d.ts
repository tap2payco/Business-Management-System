import "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    phone: string;
    password: string;
    businessId: string;
    role: string;
  }
  
  interface Session {
    user: User & {
      id: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    phone: string;
    businessId: string;
    role: string;
  }
}