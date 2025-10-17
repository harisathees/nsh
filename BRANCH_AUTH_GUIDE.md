# Branch-Based Authentication System

## Overview

The Pawn Brokerage Management System now features a comprehensive branch-based authentication system. Each user is assigned to a specific branch and can only access data from their branch.

## Database Structure

### Tables

#### `branches`
Stores branch information:
- `id` (uuid) - Unique identifier
- `name` (text) - Branch name (e.g., "Chennai", "Madurai", "Salem")
- `code` (text) - Unique branch code (e.g., "CHN", "MDU", "SLM")
- `address` (text) - Branch address
- `phone` (text) - Contact number
- `is_active` (boolean) - Active status

#### `users`
Stores user accounts:
- `id` (uuid) - Unique identifier
- `username` (text) - Login username
- `password_hash` (text) - Bcrypt hashed password
- `full_name` (text) - User's full name
- `branch_id` (uuid) - References branches table
- `role` (text) - User role: 'admin', 'manager', or 'staff'
- `is_active` (boolean) - Account status

#### Updated Tables
All business tables now include `branch_id`:
- `customers`
- `loans`
- `jewels`
- `repledges`
- `banks`
- `cash_logs`

## Default Users

Three admin users are created by default (one per branch):

| Username | Password | Branch | Role |
|----------|----------|--------|------|
| admin_chn | admin123 | Chennai | admin |
| admin_mdu | admin123 | Madurai | admin |
| admin_slm | admin123 | Salem | admin |

**⚠️ IMPORTANT: Change these passwords immediately in production!**

## Features

### 1. Login System
- Username/password authentication
- Branch assignment at login
- Session persistence using localStorage
- Secure password hashing with bcrypt

### 2. User Management (Admin Only)
Accessible from Settings → User Management:
- Create new users
- Edit existing users
- Delete users
- Assign roles (admin, manager, staff)
- All users are branch-specific

### 3. Branch Data Isolation
- Users can only view/edit data from their assigned branch
- Branch information displayed in top navigation bar
- Branch filter automatically applied to all queries

### 4. Role-Based Access
- **Admin**: Full access, can manage users
- **Manager**: Data management (no user management)
- **Staff**: Standard data entry and viewing

## Implementation Details

### Authentication Flow
1. User enters username and password
2. System calls `authenticate_user()` database function
3. Password verified using bcrypt
4. User and branch data stored in context and localStorage
5. All subsequent queries filtered by branch_id

### Branch Filtering
Use the `useBranchFilter` hook in components:

```typescript
import { useBranchFilter } from '../hooks/useBranchFilter';

const { branchId, addBranchFilter } = useBranchFilter();

// Add branch filter to queries
const { data } = await supabase
  .from('loans')
  .select('*')
  .eq('branch_id', branchId);

// Or use the helper
const query = supabase.from('loans').select('*');
const { data } = await addBranchFilter(query);
```

### Creating New Records
Always include branch_id when inserting:

```typescript
const { branchId } = useBranchFilter();

await supabase.from('customers').insert({
  name: 'John Doe',
  branch_id: branchId,
  // ... other fields
});
```

## Security Notes

### RLS Disabled
- Row Level Security (RLS) is **NOT enabled** per requirements
- Data isolation enforced through application logic
- Branch filtering must be implemented in all data operations

### Password Security
- Passwords hashed using bcrypt (cost factor 12)
- Hash verification via database function
- Never store plain text passwords

### Session Management
- Authentication state stored in React Context
- Persistence via localStorage
- Logout clears all session data

## User Management Guide

### Adding Users (Admin Only)
1. Navigate to Settings → User Management
2. Click "Add User"
3. Fill in:
   - Username (unique)
   - Full Name
   - Password (minimum 6 characters)
   - Role (admin/manager/staff)
4. User automatically assigned to admin's branch

### Editing Users
1. Click Edit button next to user
2. Modify full name or role
3. Optionally change password (leave blank to keep current)
4. Save changes

### Deleting Users
1. Click Delete button next to user
2. Confirm deletion
3. User permanently removed

## Testing

### Test Accounts
Login with any of these accounts:

```
Chennai Branch:
Username: admin_chn
Password: admin123

Madurai Branch:
Username: admin_mdu
Password: admin123

Salem Branch:
Username: admin_slm
Password: admin123
```

### Verification Steps
1. Login with different branch users
2. Verify branch name shows in top navbar
3. Create data in one branch
4. Login with different branch
5. Confirm data is not visible
6. Test user management (admin only)

## API Functions

### `authenticate_user(username, password)`
Authenticates user and returns:
- user_id
- username
- full_name
- branch_id
- branch_name
- branch_code
- role

### `hash_password(password)`
Hashes password using bcrypt.

### `verify_password(password, hash)`
Verifies password against hash.

## Troubleshooting

### Login Issues
- Verify username is correct (case-sensitive)
- Check password (minimum 6 characters)
- Ensure user account is active
- Confirm branch is active

### Data Not Showing
- Verify branch_id is included in queries
- Check useBranchFilter hook is used
- Confirm data belongs to current branch

### User Management Not Accessible
- Only admins can manage users
- Check logged-in user role
- Verify admin permissions in database

## Future Enhancements

Consider adding:
- Password reset functionality
- Email-based authentication
- Multi-branch access for super admins
- Audit logs for user actions
- Session timeout configuration
- Two-factor authentication
