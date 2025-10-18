# Branch-Based Authentication System - Admin & Staff Roles

## Overview

The Pawn Brokerage Management System features a comprehensive role-based branch authentication system:

- **Admin Users**: Can view and edit data from ALL branches by switching between them
- **Staff/Manager Users**: Can ONLY view and edit data from their assigned branch
- **Session-based Authentication**: Secure login/logout with session management

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
- `branch_id` (uuid) - References branches table (home branch)
- `role` (text) - User role: 'admin', 'manager', or 'staff'
- `is_active` (boolean) - Account status

#### Business Tables
All business tables include `branch_id`:
- `customers`
- `loans`
- `jewels`
- `repledges`
- `banks`
- `cash_logs`

## Default Users

Three admin users (one per branch):

| Username | Password | Branch | Role | Access |
|----------|----------|--------|------|--------|
| admin_chn | admin123 | Chennai | admin | All branches |
| admin_mdu | admin123 | Madurai | admin | All branches |
| admin_slm | admin123 | Salem | admin | All branches |

**⚠️ IMPORTANT: Change these passwords immediately in production!**

## Key Features

### 1. Role-Based Access Control

#### Admin Users
- **Multi-Branch Access**: Can view/edit data from ANY branch
- **Branch Switcher**: Dropdown in top navbar to switch between branches
- **User Management**: Can create users for any branch
- **Full Visibility**: See all data when switching branches

#### Staff/Manager Users
- **Single Branch Access**: ONLY see data from their assigned branch
- **No Branch Switcher**: Fixed branch displayed in navbar
- **Restricted Management**: Can only manage data within their branch
- **Automatic Filtering**: All queries automatically filtered by their branch

### 2. Session Management
- **sessionStorage**: Secure session-based authentication
- **Auto-logout on browser close**: Sessions don't persist after closing browser
- **Branch selection persists**: Admin's selected branch saved in session
- **Secure logout**: Clears all session data

### 3. Login System
- Username/password authentication
- Branch assignment at login
- Secure password hashing with bcrypt
- Clear error messages

### 4. User Management (Admin Only)
In Settings → User Management:
- Create users for any branch (admin only)
- Edit user details and roles
- Delete users
- View users by selected branch
- Assign branch during user creation

## How It Works

### Authentication Flow
1. User enters username and password
2. System calls `authenticate_user()` database function
3. Password verified using bcrypt
4. User data and home branch stored in session
5. Admin can switch branches; staff cannot

### Data Filtering

#### For Admin Users
```typescript
// Admin selects Chennai branch
const { data } = await supabase
  .from('loans')
  .select('*')
  .eq('branch_id', selectedBranchId); // Chennai data only

// Admin switches to Madurai
// Now sees Madurai data only
```

#### For Staff Users
```typescript
// Staff always filtered by their home branch
const { data } = await supabase
  .from('loans')
  .select('*')
  .eq('branch_id', userBranchId); // Fixed to staff's branch
```

### Using the useBranchFilter Hook

```typescript
import { useBranchFilter } from '../hooks/useBranchFilter';

const { branchId, isAdmin, addBranchFilter } = useBranchFilter();

// Get currently active branch ID
const activeBranchId = branchId;

// For admin: returns selected branch
// For staff: returns home branch

// Add branch filter to queries
const { data } = await supabase
  .from('customers')
  .select('*')
  .eq('branch_id', branchId);
```

### Creating New Records

Always include branch_id when inserting:

```typescript
const { branchId } = useBranchFilter();

await supabase.from('customers').insert({
  name: 'John Doe',
  branch_id: branchId, // Uses selected branch (admin) or home branch (staff)
  // ... other fields
});
```

## UI Components

### Top Navbar

#### For Admin Users
- **Branch Dropdown**: Click to see all branches
- **Active Branch Indicator**: Shows currently selected branch
- **Switch Branches**: Click any branch to switch view

#### For Staff Users
- **Branch Display**: Shows home branch (no dropdown)
- **Fixed View**: Cannot change branch

### User Management

#### Admin View
- See users from selected branch
- Create users for any branch
- Branch selection dropdown in form
- Can assign any role

#### Staff/Manager View
- Message: "You do not have permission to manage users"
- Cannot access user management

## Testing Guide

### Test Admin Multi-Branch Access

1. **Login as Admin**
   ```
   Username: admin_chn
   Password: admin123
   ```

2. **Verify Admin Features**
   - Check top navbar shows branch dropdown with down arrow
   - Profile dropdown shows "Admin - Can view all branches"
   - User management is accessible in Settings

3. **Switch Branches**
   - Click branch dropdown in navbar
   - Select "Madurai" branch
   - Page reloads with Madurai data
   - Create a test customer in Madurai

4. **Verify Data Isolation**
   - Switch back to Chennai branch
   - Test customer from Madurai should NOT appear
   - Create a customer in Chennai
   - Switch to Madurai - Chennai customer should NOT appear

### Test Staff Branch Restrictions

1. **Create Staff User**
   - Login as admin
   - Go to Settings → User Management
   - Create new user:
     - Username: staff_chn
     - Password: staff123
     - Role: Staff
     - Branch: Chennai
   - Logout

2. **Login as Staff**
   ```
   Username: staff_chn
   Password: staff123
   ```

3. **Verify Staff Restrictions**
   - Top navbar shows ONLY "Chennai" (no dropdown)
   - Profile shows "staff - Chennai" (no admin badge)
   - Settings → User Management shows "no permission" message

4. **Test Data Access**
   - Can only see Chennai branch data
   - Cannot see Madurai or Salem data
   - All created records automatically assigned to Chennai

### Test Session Management

1. **Login and Create Session**
   - Login with any user
   - Verify you can navigate pages

2. **Test Session Persistence**
   - Refresh page - should stay logged in
   - Open new tab with same domain - should be logged in

3. **Test Logout**
   - Click profile dropdown
   - Click "Logout"
   - Redirected to login page
   - Cannot access protected pages

4. **Test Browser Close**
   - Login again
   - Close ALL browser windows
   - Reopen browser and visit site
   - Should be logged out (sessionStorage cleared)

## Security Features

### Session-Based Authentication
- Uses `sessionStorage` (not `localStorage`)
- Session cleared when browser closes
- No persistent "remember me" by default

### Password Security
- Bcrypt hashing (cost factor 12)
- Hash verification via database function
- Never stored in plain text

### Data Isolation
- Admin: Can access all branches BUT must select one at a time
- Staff: Hardcoded to home branch only
- Branch filtering enforced at query level

### Role Verification
- User role checked on every action
- Admin-only features protected
- Staff cannot escalate privileges

## API Functions

### `authenticate_user(username, password)`
Returns:
- user_id
- username
- full_name
- branch_id (home branch)
- branch_name
- branch_code
- role (admin/manager/staff)

### `hash_password(password)`
Hashes password using bcrypt.

### `verify_password(password, hash)`
Verifies password against stored hash.

## Common Use Cases

### Admin Creating User for Another Branch
1. Login as admin (any branch)
2. Switch to target branch in navbar
3. Go to Settings → User Management
4. Click "Add User"
5. Fill form - branch auto-selected
6. Or manually select different branch
7. User created for that branch

### Staff Viewing Their Data
1. Login as staff
2. Automatically see only their branch data
3. Create/edit records - auto-assigned to their branch
4. Cannot accidentally see other branches

### Admin Auditing All Branches
1. Login as admin
2. Switch to Branch A - review data
3. Switch to Branch B - review data
4. Switch to Branch C - review data
5. Each switch shows only that branch's data

## Troubleshooting

### Admin Can't Switch Branches
- Check isAdmin flag in context
- Verify user role is 'admin' in database
- Clear sessionStorage and re-login

### Staff Seeing No Data
- Verify branch_id exists on records
- Check user's branch_id matches data
- Ensure branch is active

### Session Not Persisting
- Check sessionStorage not disabled
- Verify browser allows sessionStorage
- Check for console errors

### Branch Filter Not Working
- Verify useBranchFilter hook is used
- Check selectedBranch vs branch in context
- Ensure query includes .eq('branch_id', ...)

## Best Practices

1. **Always use useBranchFilter hook** in components that fetch data
2. **Include branch_id** in all insert operations
3. **Test with both admin and staff** accounts
4. **Document branch-specific business logic**
5. **Regular password updates** for production users
6. **Audit admin actions** in production
7. **Backup data by branch** for easy restoration

## Future Enhancements

- Audit logs for admin branch switches
- Branch-wise reporting and analytics
- Multi-branch user access (one user, multiple branches)
- Super admin role (never assigned to branch)
- Branch-wise permissions (beyond just roles)
- Session timeout configuration
- Two-factor authentication
- IP-based access restrictions
