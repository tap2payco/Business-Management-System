"use client";
import { signOut } from "next-auth/react";
import { User } from 'next-auth';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';

interface UserNavProps {
  user: User;
}

export function UserNav({ user }: UserNavProps) {
  return (
    <div className="relative">
      <div className="flex items-center gap-4">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-xs leading-none text-gray-600">{user.email}</p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}