# TR-Tech Repairs & Designs — Frontend

React 19 + Vite 7 + Tailwind CSS client for the TR-Tech Repairs & Designs platform. Provides a responsive storefront, repair booking flow, customer account portal, and an admin dashboard.

## Tech Stack

- **React 19** — UI library
- **Vite 7** — dev server, build, and test runner
- **React Router DOM 7** — client-side routing
- **Tailwind CSS 3** — utility-first styling
- **shadcn/ui + Radix UI** — accessible component primitives
- **Lucide React** — icon library
- **Recharts** — admin analytics charts
- **Sonner** — toast notifications
- **Vitest + Testing Library** — unit and integration tests
- **ESLint** — code quality

## Prerequisites

- Node.js 18+
- npm 9+

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Run tests
npm run test

# Lint
npm run lint

# Production build (outputs to dist/)
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=/api/v1
VITE_WHATSAPP_NUMBER=27712345678
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base path (relative path enables Vite proxy) | `/api/v1` |
| `VITE_WHATSAPP_NUMBER` | WhatsApp number for contact links | `27712345678` |

> **Production / Vercel:** the SPA is served same-origin and `vercel.json` reverse-proxies
> `/api/*` and `/uploads/*` to the `tr-tech-backend` service (`https://tr-tech-backend.vercel.app`)
> on Vercel's edge. The backend URL is therefore **never exposed to the browser** — no
> public `VITE_*` variable is committed for it. Cookie-based auth (sessions + CSRF) works
> same-origin through the proxy. To use a different backend domain, update the proxy
> targets in `vercel.json` (or, if you prefer an explicit absolute URL, set `VITE_API_URL`,
> noting that `VITE_`-prefixed values are inlined into the client bundle).

## Project Structure

```
tr-tech-frontend/
├── public/                        # Static assets
│   └── TR_Tech_logo.png
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── Navbar.jsx             # Top navigation
│   │   ├── BottomNav.jsx          # Mobile bottom navigation
│   │   ├── Footer.jsx             # Site footer
│   │   ├── Hero.jsx               # Landing page hero
│   │   ├── Services.jsx           # Services showcase
│   │   ├── Why-Choose-Us.jsx      # Trust/value section
│   │   ├── CTA.jsx                # Call-to-action blocks
│   │   ├── ProductCarousel.jsx    # Featured products slider
│   │   ├── ProductDetail/         # Product detail sub-components
│   │   ├── CartDrawer.jsx         # Slide-out cart panel
│   │   ├── MiniCart.jsx           # Compact cart preview
│   │   ├── CategoryChips.jsx      # Category filter chips
│   │   ├── TrustSignals.jsx       # Trust badges
│   │   ├── Skeleton.jsx           # Loading placeholders
│   │   ├── ResponsiveImage.jsx    # Adaptive image component
│   │   ├── Sidebar.jsx            # Admin sidebar navigation
│   │   ├── Providers.jsx          # Context provider wrapper
│   │   ├── AuthContext.jsx         # Customer auth state
│   │   ├── AdminAuthContext.jsx    # Admin auth state
│   │   ├── AccountContext.jsx      # Account data state
│   │   ├── CartContext.jsx         # Cart state
│   │   ├── WishlistContext.jsx     # Wishlist state
│   │   ├── AuthModal.jsx           # Login/register modal
│   │   ├── AuthModalContext.jsx    # Auth modal state
│   │   ├── CheckoutModal.jsx       # Checkout flow modal
│   │   ├── ErrorBoundary.jsx       # Error boundary wrapper
│   │   ├── ProtectedRoute.jsx      # Customer route guard
│   │   ├── AdminProtectedRoute.jsx # Admin route guard
│   │   └── AccountLayout.jsx       # Customer account shell
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── ServicesPage.jsx
│   │   ├── ShopPage.jsx
│   │   ├── ProductDetailPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── RepairsPage.jsx
│   │   ├── ContactPage.jsx
│   │   ├── WishlistPage.jsx
│   │   ├── Admin/
│   │   │   ├── AdminLoginPage.jsx
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminRepairsPage.jsx
│   │   │   ├── ProductManagement.jsx
│   │   │   ├── ServicesManagement.jsx
│   │   │   ├── OrderManagement.jsx
│   │   │   ├── CustomerManagement.jsx
│   │   │   ├── InventoryManagement.jsx
│   │   │   ├── MarketingManagement.jsx
│   │   │   ├── ReportsAnalytics.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   ├── AdminCategoriesPage.jsx
│   │   │   └── AdminBrandsPage.jsx
│   │   └── account/
│   │       ├── AccountDashboard.jsx
│   │       ├── ProfilePage.jsx
│   │       ├── AddressesPage.jsx
│   │       ├── OrdersPage.jsx
│   │       ├── OrderDetailPage.jsx
│   │       ├── AccountRepairsPage.jsx
│   │       ├── RepairDetailPage.jsx
│   │       ├── SecurityPage.jsx
│   │       ├── NotificationsPage.jsx
│   │       └── PaymentMethodsPage.jsx
│   ├── services/
│   │   └── api.js                  # Centralized API client
│   ├── hooks/                      # Custom React hooks
│   ├── utils/                      # Helper functions
│   ├── lib/                        # Shared utilities
│   ├── data/                       # Static/mock data
│   ├── constants.js                # App-wide constants
│   ├── App.jsx                     # Route definitions
│   ├── main.jsx                    # React entry point
│   ├── index.css                   # Global styles
│   └── test/
│       ├── setup.js                # Vitest setup
│       ├── api.test.js
│       ├── helpers.test.js
│       ├── sanitize.test.js
│       ├── image-url.test.js
│       ├── home-page.test.jsx
│       ├── shop-page.test.jsx
│       ├── contact-page.test.jsx
│       ├── cart-page.test.jsx
│       ├── admin-login.test.jsx
│       ├── admin-protected-route.test.jsx
│       ├── auth-modal.test.jsx
│       ├── protected-route.test.jsx
│       ├── profile-page.test.jsx
│       └── integration.test.jsx
├── package.json
├── vite.config.js
├── tailwind.config.cjs
├── postcss.config.js
├── eslint.config.js
├── components.json
├── Dockerfile
├── nginx.conf
└── .env
```

## Routing

| Path | Description |
|------|-------------|
| `/` | Home page |
| `/about` | About TR-Tech |
| `/services` | Service offerings |
| `/shop` | Product catalog |
| `/products/:id` | Product detail |
| `/cart` | Shopping cart |
| `/checkout` | Checkout flow |
| `/book-repair` | Repair booking form |
| `/contact` | Contact page |
| `/wishlist` | Wishlist |
| `/account/*` | Customer account (protected) |
| `/admin/login` | Admin login |
| `/admin/*` | Admin dashboard (protected) |

Admin and account routes use `React.lazy` code-splitting for faster initial loads.

## API Integration

The app communicates with the Express/MongoDB backend via `src/services/api.js`. Key API modules:

- `productsAPI` — CRUD + low-stock alerts
- `servicesAPI` — CRUD
- `ordersAPI` — CRUD + stats + status updates + customer orders
- `contactAPI` — submit + list
- `repairsAPI` — CRUD + customer repairs
- `authAPI` — register, login, profile, logout
- `adminAuthAPI` — admin login/logout
- `cartAPI` — CRUD + clear
- `wishlistAPI` — CRUD + check
- `accountAPI` — profile, addresses, notifications, sessions
- `paymentMethodsAPI` — CRUD + set default
- `categoriesAPI` — CRUD + active
- `brandsAPI` — CRUD + active
- `usersAPI` — CRUD + reset password
- `marketingAPI` — coupons, campaigns, promotions
- `uploadAPI` — image upload/delete
- `healthCheck` — backend health

The API client handles CSRF token caching, request timeouts (15s), and automatic retry on 419 responses. 401 responses dispatch a `trtech:unauthorized` custom event for global logout handling.

## Vite Configuration

- **Path alias**: `@` maps to `src/`
- **Dev proxy**: `/api` and `/uploads` are proxied to `http://localhost:5000`
- **Code splitting**: `recharts` and core vendor bundles are split into separate chunks
- **Test env**: Pre-seeds `VITE_API_URL` and `VITE_WHATSAPP_NUMBER` for Vitest

## Styling

Tailwind CSS with a CSS-variable-based design system. Custom configuration in `tailwind.config.cjs`:

- Extended breakpoints (`xsm` at 375px)
- CSS custom properties for theme colors (background, foreground, primary, secondary, etc.)
- Custom animations (slide, fade)
- Safe-area inset spacing for mobile
- Touch target minimums (44px)

## Docker

Multi-stage production build:

```bash
# Build image
docker build -t tr-tech-frontend .

# Run container (exposes port 80)
docker run -p 80:80 tr-tech-frontend
```

The production container uses nginx:alpine with:
- Gzip compression
- SPA fallback (`try_files $uri $uri/ /index.html`)
- `/api` proxy to backend service
- Static asset caching (1 year for hashed assets)

## Authentication

- **Customers**: JWT-based auth via cookies + session model for revocation
- **Admins**: Separate admin auth context (`AdminAuthContext`) with its own login flow
- **Protected routes**: `ProtectedRoute` and `AdminProtectedRoute` guard customer and admin pages respectively

## Testing

Tests run in jsdom via Vitest:

```bash
npm run test        # Single run
npm run test:watch  # Watch mode
```

Test suites cover: API client, page components, auth flows, admin access, cart, contact form, sanitization, image URLs, and integration scenarios.

## Deployment (Vercel)

The frontend is a static Vite SPA and is deployed to Vercel as its own project,
independent of the `tr-tech-backend` service. Configuration lives in `vercel.json`:

- `buildCommand` — `npm run build` (outputs to `dist/`)
- `outputDirectory` — `dist`
- `rewrites` — `/api/*` and `/uploads/*` are reverse-proxied to the backend service
   (`https://tr-tech-backend.vercel.app`) on Vercel's edge; all other paths fall back to
  `index.html` for client-side routing (React Router).
- `headers` — baseline security headers + long-cache for hashed `/assets/*`

### Deploy

1. Import the `tr-tech-frontend` repository into Vercel (Framework Preset: Vite — auto-detected).
2. Vercel uses `vercel.json` automatically; no extra build settings required.
3. Deploy. The `index.html` CSP already allows `connect-src` to `'self'` and
   `https://tr-tech-backend.vercel.app`, so the proxied API/cookie traffic is permitted.
4. If your backend lives on a different domain, update the proxy `destination` values in
   `vercel.json` (these are server-side and never shipped to the browser).

### Backend integration

The SPA reaches `tr-tech-backend` same-origin through the Vercel proxy — the browser only
ever sees requests to its own domain, so no public `VITE_*` API URL is required:

- `src/constants.js` resolves `API_BASE_URL` to the relative `/api/v1` (the production default).
- `src/services/api.js` sends every request with `credentials: 'include'` and the
  `X-CSRF-Token` header; the proxy forwards these to the backend, and the backend's
  `Set-Cookie` responses are stored on the frontend's own domain (same-origin).
- Because traffic is same-origin, the backend's CORS `origin` check is not enforced by the
  browser, but it is still good practice to set the backend `FRONTEND_URL` to this
  frontend's production origin (default `https://tr-tech-frontend.vercel.app`).
- The `/uploads` route is CORS-enabled on the backend and is also proxied here.

> **Local dev** uses the same relative `/api/v1` path, which the Vite dev server proxies to
> `http://localhost:5000` (see `server.proxy` in `vite.config.js`). No code change is needed
> between environments — Vercel's edge proxy replaces the local dev proxy in production.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5173 in use | Change `server.port` in `vite.config.js` or stop the conflicting process |
| Styles not refreshing | Restart dev server; Tailwind scans files at build time |
| 401 on API calls | Ensure backend is running on port 5000; check cookie settings |
| Icons missing | Verify `lucide-react` is installed |
| ESLint errors | Run `npm run lint` and fix reported issues |

## License

Proprietary — TR-Tech Repairs & Designs internal project.
