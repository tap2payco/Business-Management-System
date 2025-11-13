// prisma-extensions.d.ts
import { Prisma } from '@prisma/client';

declare module '@prisma/client' {
  type UserCreateInput = Prisma.UserCreateInput & {
    phone: string;
    password: string;
  };

  type UserSelect = Prisma.UserSelect & {
    phone?: boolean;
    password?: boolean;
  };

  type UserWhereUniqueInput = Prisma.UserWhereUniqueInput & {
    phone?: string;
  };

  type User = Prisma.User & {
    phone: string;
    password: string;
  };
}