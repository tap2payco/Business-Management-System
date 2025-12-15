"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  Shield,
  LogOut,
  X
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface SidebarLink {
  href: string;
  label: string;
  icon: any;
}

const adminNavItems: SidebarLink[] = [
  { 
    href: '/admin', 
    label: 'Overview', 
    icon: LayoutDashboard
  },
  { 
    href: '/admin/businesses', 
    label: 'Businesses', 
    icon: Building2
  },
  { 
    href: '/admin/users', 
    label: 'Users', 
    icon: Users
  },
  { 
    href: '/admin/settings', 
    label: 'System Settings', 
    icon: Settings
  },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = true, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <nav className={`
        fixed md:static inset-y-0 left-0 z-50
        flex h-screen w-64 flex-col border-r bg-slate-900 text-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-indigo-400" />
            <span className="text-xl font-bold">Admin Panel</span>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800">
             <Link
                href="/dashboard"
                className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white mb-2 transition-colors"
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Back to App</span>
              </Link>
             <button
                onClick={() => signOut()}
                className="w-full flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
        </div>
      </nav>
    </>
  );
}
