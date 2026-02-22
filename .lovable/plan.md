

# Admin UI for Managing Pro Overrides

## Overview
A new protected admin page at `/admin` where you can search users by email and toggle their Pro override on/off -- no SQL needed.

## How It Works
1. A new backend function (`admin-manage-overrides`) handles the logic server-side
2. It verifies the caller is an admin before allowing any changes
3. A simple UI lets you type an email, see if they have Pro override, and toggle it

## Security
- A `user_roles` table determines who is an admin
- The backend function checks admin status server-side before performing any action
- Only admins can access the page; non-admins are redirected

## Technical Steps

### 1. Database: Create `user_roles` table + helper function
- Create `app_role` enum with values `admin`, `user`
- Create `user_roles` table with `user_id` + `role`
- Create `has_role()` security definer function for safe RLS checks
- RLS: users can only SELECT their own role
- Insert your user ID as `admin` in the same migration

### 2. Backend function: `admin-manage-overrides`
Accepts two actions:
- **`search`**: Takes an email string, queries `auth.admin.listUsers()` to find matching users, and checks if each has a `pro_overrides` row. Returns user ID, email, and override status.
- **`toggle`**: Takes a user ID and a boolean. Inserts or deletes from `pro_overrides` accordingly.

Both actions first verify the caller has the `admin` role via the `has_role()` function.

### 3. Frontend: `/admin` page
- Protected route that checks admin role on mount
- Search input for email (searches on Enter or button click)
- Results table showing: email, user ID, Pro Override toggle (Switch component)
- Toggling the switch calls the backend function to insert/delete the override
- Toast notifications for success/error feedback

### 4. Route + Navigation
- Add `/admin` route in `App.tsx` behind `ProtectedRoute`
- Add a small "Admin" link in Settings (visible only to admins) for easy access

### Finding Your User ID
To seed yourself as admin, I'll need your user ID. I can look it up from the database if you tell me your email, or you can find it in the backend under Authentication > Users.
