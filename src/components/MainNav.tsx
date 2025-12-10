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
  X,
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface SidebarLink {
  href: string;
  label: string;
  icon: any;
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

interface MainNavProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function MainNav({ isOpen = true, onClose }: MainNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.isSuperAdmin;

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
        flex h-screen w-64 flex-col border-r bg-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">BizMgr</span>
          </Link>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 space-y-1 p-4 overflow-y-auto">
          {isSuperAdmin && (
            <Link
              href="/admin"
              onClick={onClose}
              className="group flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors bg-red-50 text-red-900 hover:bg-red-100 mb-4 border border-red-200"
            >
              <Shield className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-medium">Admin Dashboard</span>
                <span className="text-xs text-red-500 group-hover:text-red-700 truncate">
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
                onClick={onClose}
                className={`group flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs text-gray-500 group-hover:text-gray-700 truncate">
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}