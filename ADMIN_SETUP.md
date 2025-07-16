# Admin Account Setup Guide

## Overview

The C Cinema application uses role-based access control to distinguish between regular users and administrators. Admin accounts have access to the Admin Dashboard where they can manage movies, theaters, showtimes, bookings, and contact messages.

## Purpose of Admin Accounts

Admin accounts enable authorized personnel to:
- **Manage Movies**: Add, edit, and remove movies from the catalog
- **Manage Theaters**: Create and update theater information and locations
- **Manage Showtimes**: Schedule movie screenings across different theaters
- **View Bookings**: Monitor all user bookings and reservations
- **Handle Contact Messages**: Review and respond to customer inquiries
- **System Administration**: Oversee the entire cinema management system

## How to Create an Admin Account

### Method 1: Direct Database Update (Recommended)

This is the most straightforward method for initial admin setup.

#### Step 1: Log in as a Regular User
1. Visit your cinema website
2. Click "Sign In" and authenticate using your social account
3. Note your user ID from the URL or browser developer tools

#### Step 2: Update User Role via Database
Connect to your PostgreSQL database and run:

```sql
UPDATE users 
SET role = 'admin', updated_at = NOW() 
WHERE id = 'YOUR_USER_ID_HERE';
```

**Example:**
```sql
-- Replace '39729340' with your actual user ID
UPDATE users 
SET role = 'admin', updated_at = NOW() 
WHERE id = '39729340';
```

#### Step 3: Verify the Update
```sql
SELECT id, email, role, created_at 
FROM users 
WHERE id = 'YOUR_USER_ID_HERE';
```

### Method 2: API Endpoint (Alternative)

Use the admin setup API endpoint for programmatic access.

#### Step 1: Get Your User ID
After logging in, your user ID is available in the user session. You can find it by:
- Checking the browser developer tools (Network tab)
- Looking at the `/api/auth/user` response

#### Step 2: Call the Admin Setup Endpoint
```bash
curl -X POST http://localhost:5000/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{"userId": "YOUR_USER_ID_HERE"}'
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{"userId": "39729340"}'
```

#### Expected Response:
```json
{
  "message": "Admin role granted successfully",
  "user": {
    "id": "39729340",
    "email": "admin@example.com",
    "role": "admin",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

## How to Verify Admin Access

### Step 1: Refresh Your Browser
After updating your role, refresh the cinema website or log out and log back in.

### Step 2: Check for Admin Navigation
You should now see:
- An "Admin" badge in the main navigation
- Access to `/admin` route
- Admin Dashboard with management panels

### Step 3: Test Admin Functions
Navigate to the Admin Dashboard (`/admin`) and verify you can:
- View the Movies management section
- View the Theaters management section  
- View the Showtimes management section
- View all Bookings
- View Contact Messages

### Step 4: Verify Database Role
Check your user record in the database:
```sql
SELECT id, email, role, updated_at 
FROM users 
WHERE role = 'admin';
```

## Troubleshooting

### Issue: "Access Denied" Error
**Solution:** 
- Ensure the database update was successful
- Clear browser cache and cookies
- Log out and log back in
- Verify the user ID matches exactly

### Issue: Admin Badge Not Showing
**Solution:**
- Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Check that the role was updated in the database
- Ensure you're logged in with the correct account

### Issue: API Endpoint Returns 404 Error
**Solution:**
- Verify the server is running
- Check that the user ID exists in the database
- Ensure the API endpoint is properly implemented

## Security Considerations

### Best Practices
1. **Limit Admin Accounts**: Only create admin accounts for trusted personnel
2. **Regular Audits**: Periodically review who has admin access
3. **Secure Access**: Admin accounts should use strong authentication
4. **Role Verification**: Always verify admin status before granting access

### Removing Admin Access
To remove admin privileges from a user:

```sql
UPDATE users 
SET role = 'user', updated_at = NOW() 
WHERE id = 'USER_ID_TO_DEMOTE';
```

## Environment Requirements

- **Database Access**: PostgreSQL connection with UPDATE privileges
- **Server Running**: The cinema application server must be active
- **Valid User Account**: The user must exist in the system before role assignment


---

**Note**: This guide assumes you have direct access to the PostgreSQL database. In production environments, consider implementing additional security measures and approval workflows for admin account creation.