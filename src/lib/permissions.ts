// Enhanced Role-based permission checking utilities

export type UserRole = 
  | 'OWNER'
  | 'MANAGER'
  | 'CHIEF_ACCOUNTANT'
  | 'ACCOUNTANT'
  | 'CASHIER'
  | 'STOREKEEPER'
  | 'MEMBER';

export interface UserWithRole {
  role: string;
  businessId: string;
}

/**
 * Check if user is an owner
 */
export function isOwner(user: UserWithRole): boolean {
  return user.role === 'OWNER';
}

/**
 * Check if user can manage other users (invite/remove/edit)
 */
export function canManageUsers(user: UserWithRole): boolean {
  return user.role === 'OWNER';
}

/**
 * Check if user can create invoices/quotes
 */
export function canCreateInvoices(user: UserWithRole): boolean {
  return ['OWNER', 'MANAGER', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT'].includes(user.role);
}

/**
 * Check if user can edit invoices/quotes
 */
export function canEditInvoices(user: UserWithRole): boolean {
  return ['OWNER', 'MANAGER', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT'].includes(user.role);
}

/**
 * Check if user can delete invoices/quotes
 */
export function canDeleteInvoices(user: UserWithRole): boolean {
  return ['OWNER', 'MANAGER', 'CHIEF_ACCOUNTANT'].includes(user.role);
}

/**
 * Check if user can record payments
 */
export function canRecordPayments(user: UserWithRole): boolean {
  return ['OWNER', 'MANAGER', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'CASHIER'].includes(user.role);
}

/**
 * Check if user can create/edit expenses
 */
export function canManageExpenses(user: UserWithRole): boolean {
  return ['OWNER', 'MANAGER', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT'].includes(user.role);
}

/**
 * Check if user can manage inventory/items
 */
export function canManageInventory(user: UserWithRole): boolean {
  return ['OWNER', 'MANAGER', 'STOREKEEPER'].includes(user.role);
}

/**
 * Check if user can manage customers
 */
export function canManageCustomers(user: UserWithRole): boolean {
  return ['OWNER', 'MANAGER', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'CASHIER'].includes(user.role);
}

/**
 * Check if user can view financial reports
 */
export function canViewReports(user: UserWithRole): boolean {
  return ['OWNER', 'MANAGER', 'CHIEF_ACCOUNTANT'].includes(user.role);
}

/**
 * Check if user can export data
 */
export function canExportData(user: UserWithRole): boolean {
  return ['OWNER', 'MANAGER', 'CHIEF_ACCOUNTANT'].includes(user.role);
}

/**
 * Check if user can read records (all roles can read their business data)
 */
export function canRead(user: UserWithRole): boolean {
  return true; // All authenticated users can read their business data
}

/**
 * Check if user can manage business settings
 */
export function canManageSettings(user: UserWithRole): boolean {
  return ['OWNER', 'MANAGER'].includes(user.role);
}

/**
 * Get user-friendly role name
 */
export function getRoleName(role: string): string {
  const roleNames: Record<string, string> = {
    OWNER: 'Owner',
    MANAGER: 'Manager',
    CHIEF_ACCOUNTANT: 'Chief Accountant',
    ACCOUNTANT: 'Accountant',
    CASHIER: 'Cashier',
    STOREKEEPER: 'Storekeeper',
    MEMBER: 'Member'
  };
  return roleNames[role] || role;
}

/**
 * Get role description
 */
export function getRoleDescription(role: string): string {
  const descriptions: Record<string, string> = {
    OWNER: 'Full access to all features and settings',
    MANAGER: 'Can manage all operations except user management',
    CHIEF_ACCOUNTANT: 'Financial oversight, reports, and approvals',
    ACCOUNTANT: 'Create and edit financial records',
    CASHIER: 'Record payments and issue receipts',
    STOREKEEPER: 'Manage inventory and stock levels',
    MEMBER: 'Read-only access to business data'
  };
  return descriptions[role] || 'No description available';
}

/**
 * Get available roles for invitation (owners can invite all roles)
 */
export function getAvailableRoles(currentUserRole: string): Array<{ value: UserRole; label: string; description: string }> {
  if (currentUserRole === 'OWNER') {
    return [
      { 
        value: 'MANAGER', 
        label: 'Manager',
        description: 'Can manage all operations except user management'
      },
      { 
        value: 'CHIEF_ACCOUNTANT', 
        label: 'Chief Accountant',
        description: 'Financial oversight, reports, and approvals'
      },
      { 
        value: 'ACCOUNTANT', 
        label: 'Accountant',
        description: 'Create and edit financial records'
      },
      { 
        value: 'CASHIER', 
        label: 'Cashier',
        description: 'Record payments and issue receipts'
      },
      { 
        value: 'STOREKEEPER', 
        label: 'Storekeeper',
        description: 'Manage inventory and stock levels'
      },
      { 
        value: 'MEMBER', 
        label: 'Member',
        description: 'Read-only access to business data'
      }
    ];
  }
  return [];
}
