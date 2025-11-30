// Role-based permission checking utilities

export type UserRole = 'owner' | 'admin' | 'member';

export interface UserWithRole {
  role: string;
  businessId: string;
}

/**
 * Check if user is an owner
 */
export function isOwner(user: UserWithRole): boolean {
  return user.role === 'owner';
}

/**
 * Check if user can manage other users (invite/remove/edit)
 */
export function canManageUsers(user: UserWithRole): boolean {
  return user.role === 'owner';
}

/**
 * Check if user can create/edit records (invoices, customers, items, expenses)
 */
export function canWrite(user: UserWithRole): boolean {
  return user.role === 'owner' || user.role === 'admin';
}

/**
 * Check if user can delete records
 * Only owners can delete to prevent accidental data loss
 */
export function canDelete(user: UserWithRole): boolean {
  return user.role === 'owner';
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
  return user.role === 'owner' || user.role === 'admin';
}

/**
 * Get user-friendly role name
 */
export function getRoleName(role: string): string {
  const roleNames: Record<string, string> = {
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member'
  };
  return roleNames[role] || role;
}

/**
 * Get available roles for invitation (owners can invite admins/members)
 */
export function getAvailableRoles(currentUserRole: string): Array<{ value: UserRole; label: string }> {
  if (currentUserRole === 'owner') {
    return [
      { value: 'admin', label: 'Admin - Can manage data but not users' },
      { value: 'member', label: 'Member - Read-only access' }
    ];
  }
  return [];
}
