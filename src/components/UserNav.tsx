"use client";
import { signOut } from "next-auth/react";
import { User } from 'next-auth';
import { LogOut } from 'lucide-react';

interface UserNavProps {
  user: User;
}

export function UserNav({ user }: UserNavProps) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden sm:flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-xs leading-none text-gray-600">{user.email}</p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 min-h-[44px]"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </div>
  );
}