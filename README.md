# BeFoodie SaaS Infrastructure

Multi-restaurant QR ordering and kitchen management SaaS system built with Next.js 15, Supabase, and Socket.io.

## Architecture: Restaurant-Scoped SaaS

This application follows a strict multi-tenant architecture where every restaurant has its own isolated scope:

- **Customer Menu**: `/r/[restaurantSlug]/menu/[tableId]`
- **Admin Dashboard**: `/r/[restaurantSlug]/admin`
- **Kitchen View**: `/r/[restaurantSlug]/kitchen`
- **Scoped API**: `/r/[restaurantSlug]/api/*`

### Authentication

Authentication is scoped per restaurant tenant.
- **Login**: `/r/[restaurantSlug]/api/auth/login`
- **Status**: `/r/[restaurantSlug]/api/auth/status`
- **Logout**: `/r/[restaurantSlug]/api/auth/logout`

The system uses secure HTTP-only cookies and JWTs containing the `restaurantSlug`. Middleware validates that the user's token slug matches the restaurant slug in the URL, preventing cross-tenant access.

### Legacy Support
Legacy routes (e.g., `/admin`, `/kitchen`, `/menu/*`) are automatically redirected to the default `demo` restaurant scope via `middleware.ts`.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env.local` with:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `JWT_SECRET`

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Onboard New Restaurant**:
   Navigate to `/platform/create-restaurant`.
