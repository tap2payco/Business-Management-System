import { User, Business } from '@prisma/client';

export interface EnhancedUser extends User {
  phone: string;
  password: string;
  business: Business;
  businessId: string;
}

export interface UserCredentials {
  phone: string;
  password: string;
}

export interface UserSignup extends UserCredentials {
  name: string;
  businessName: string;
}