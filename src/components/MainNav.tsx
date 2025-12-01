"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Receipt,
  Wallet,
  BadgeDollarSign,
  Settings,
  Shield,
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface SidebarLink {
  href: string;
  label: string;
  icon: any; // Using any for now as Lucide icons don't share a common type
  description: string;
}

const navItems: SidebarLink[] = [
  { 
    href: '/dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard,
    description: 'Company overview and statistics'
  },
  { 
    href: '/customers', 
    label: 'Customers', 
    icon: Users,
    description: 'Manage your clients and customers'
  },
  { 
    href: '/items', 
    label: 'Items', 
    icon: Package,
    description: 'Products and services catalog'
  },
  { 
    href: '/invoices', 
    label: 'Invoices', 
    icon: FileText,
    description: 'Create and manage invoices'
  },
  { 
    href: '/receipts', 
    label: 'Sales Receipts', 
    icon: Receipt,
    description: 'View and manage receipts'
  },
  { 
    href: '/payments', 
    label: 'Payments', 
    icon: Wallet,
    description: 'Track payments received'
  },
  { 
    href: '/expenses', 
    label: 'Expenses', 
    icon: BadgeDollarSign,
    description: 'Track business expenses'
  },
  { 
    href: '/settings', 
    label: 'Settings', 
    icon: Settings,
    description: 'Business profile and preferences'
  },
];

export function MainNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.isSuperAdmin;

  return (
    <nav className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-gray-900">BizMgr</span>
        </Link>
      </div>
      <div className="flex-1 space-y-1 p-4">
        {isSuperAdmin && (
          <Link
            href="/admin"
            className="group flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors bg-red-50 text-red-900 hover:bg-red-100 mb-4 border border-red-200"
          >
            <Shield className="h-5 w-5 text-red-600" />
            <div className="flex flex-col">
              <span className="font-medium">Admin Dashboard</span>
              <span className="text-xs text-red-500 group-hover:text-red-700">
                Manage System
              </span>
            </div>
          </Link>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="h-5 w-5" />
              <div className="flex flex-col">
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-gray-500 group-hover:text-gray-700">
                  {item.description}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}