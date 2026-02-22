

# Add Pro Override Table for Free Pro Access

## What This Does
Creates a database table that lets you grant specific users Pro access for free, bypassing the Stripe subscription check. You'll be able to add users by their email or user ID directly in the backend.

## How It Works
1. A new `pro_overrides` table stores user IDs of people who get free Pro access
2. The `check-subscription` backend function checks this table first -- if the user is in it, they're immediately treated as Pro without hitting Stripe
3. The app code stays the same; `isPro` just works regardless of whether access came from Stripe or the override table

## Technical Steps

### 1. Create `pro_overrides` table (migration)
- Columns: `id`, `user_id` (unique, references auth.users), `reason` (text, optional note like "beta tester"), `created_at`
- RLS: Only allow SELECT for the user's own row (so the edge function with service role key can read all rows)

### 2. Update `check-subscription` edge function
- Before checking Stripe, query `pro_overrides` for the authenticated user's ID using the service role client
- If a row exists, return `{ subscribed: true, product_id: "override", subscription_end: null }` immediately
- If not, proceed with normal Stripe check as before

### 3. Update `SubscriptionContext.tsx`
- Relax the `isPro` check: currently requires `product_id === PRO_PRODUCT_ID`, needs to also accept `product_id === "override"`

### How to Add Users
After this is built, you can add users to the override table directly from the backend SQL runner:
```sql
INSERT INTO pro_overrides (user_id, reason)
VALUES ('the-user-uuid-here', 'beta tester');
```
You can find a user's ID by looking up their email in the authentication system.

