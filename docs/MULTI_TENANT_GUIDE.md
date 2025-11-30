# Multi-Tenant Architecture Guide

## Overview

This Business Management System is a **true multi-tenant application** where each business operates in complete isolation from others. When someone signs up, the system creates both a new user account and a new business entity.

## How It Works

### Signup Flow

1. User visits `/signup` and provides:
   - Full name
   - Phone number (used as login ID)
   - Password
   - Business name

2. The system creates TWO records in a transaction:
   - **Business** entity with the provided business name
   - **User** entity linked to that business with `role='owner'`

3. After signup, the user is automatically signed in and has full access to their business

### Data Isolation

Every data model in the system includes a `businessId` foreign key:

```
Customer → businessId
Invoice → businessId
Item → businessId
Expense → business Id
User → businessId
```

**Critical security rules:**
- API routes ALWAYS filter by `session.user.businessId`
- Users can ONLY see data from their own business
- Attempting to access another business's data via direct URL returns 401/403 errors

Example from `/api/customers`:
```typescript
const customers = await prisma.customer.findMany({
  where: {
    businessId: session.user.businessId  // ✅ Data isolation enforced
  }
});
```

## User Roles & Permissions

The system supports three role levels per business:

### 👑 Owner (role='owner')
- **Full access** to everything
- Created automatically during business signup
- Can invite/manage other users
- Can modify business settings

### 🔧 Admin (role='admin')
- Can create/edit customers, invoices, items, expenses
- **Cannot delete** records (safeguard against accidental data loss)
- **Cannot manage** users or business settings
- Read/write access to business data

### 👁️ Member (role='member')
- **Read-only** access to all data
- Can view customers, invoices, items, expenses
- Cannot create, edit, or delete anything
- Useful for accountants, auditors, or view-only staff

## Permission Functions

The system includes a permissions utility library at `/src/lib/permissions.ts`:

```typescript
isOwner(user)           // Check if user is owner
canManageUsers(user)    // Check if user can invite/remove users (owners only)
canWrite(user)          // Check if user can create/edit (owners + admins)
canDelete(user)         // Check if user can delete (owners only)
canManageSettings(user) // Check if user can change business settings
```

## User Management

### Inviting Users

**Only business owners can invite users.**

1. Navigate to **Settings → Team Members**
2. Fill in the invite form:
   - Full name
   - Phone number (their login ID)
   - Password (temporary, user can change later)
   - Role (Admin or Member)
3. The new user can immediately sign in with their phone + password

### Removing Users

**Only business owners can remove users.**

- Cannot remove the business owner (safeguard)
- Cannot remove yourself
- Removing a user deletes their account completely

## Template Management

### Invoice Templates

Business owners can choose from three professionally designed invoice templates:

1. **Modern** (default) - Clean contemporary design with Outfit font
2. **Classic** - Traditional layout with blue accents
3. **Minimal** - Ultra-clean black and white design

**How to change:**
1. Navigate to **Settings → Templates**
2. Select your preferred template
3. Click "Save Template"
4. All future invoice PDFs will use the selected template

**Technical**: The template preference is stored in `Business.invoiceTemplate` and used automatically when generating PDFs at `/api/pdf/invoice/[id]`.

## Security Features

### Authentication
-Phone-based authentication (no email required)
- Passwords hashed with bcrypt (12 rounds)
- Session management via NextAuth.js

### Authorization
- Every API route checks for valid session
- Business ID from session used to filter ALL queries
- Role-based access control for sensitive operations

### Data Integrity
- Foreign key constraints prevent orphaned records
- Transaction-based operations for related data
- Cascade deletes configured appropriately

## Common Scenarios

### Scenario 1: Small Business Owner
- Signs up as owner
- Manages everything themselves
- No need to invite additional users

### Scenario 2: Growing Business
- Owner signs up
- Invites an admin to help manage invoices
- Invites an accountant as member for read-only access
- Owner retains control over settings and user management

### Scenario 3: Multi-User Team
- Owner manages business settings and users
- Multiple admins handle day-to-day operations
- Members (sales team) view data but don't modify

## Troubleshooting

### "I can't see my data!"
- Ensure you're logged in to the correct business
- Check that the data was created under your `businessId`

### "I can't invite users!"
- Only owners can invite users
- Check your role in Settings → Team Members

### "I can't delete a record!"
- Only owners can delete
- Admins can create/edit but not delete (safeguard)

---

**Need help?** Check your user role in Settings → Team Members to understand your permissions.
