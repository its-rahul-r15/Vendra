# Vendra Web (Customer)

Customer ecommerce storefront for electronics, watches, accessories and related categories. Vendra reads products and categories from the commerce catalog API and uses backend checkout, accounts, addresses, and orders under `/api/v1` as documented in `../WEBSITE_API_REFERENCE.md`. Product cards are rendered only from backend catalog responses; there are no built-in/demo products.

Google login uses Firebase Authentication. Enable the Google provider in Firebase Console and configure the Firebase Web app values from `.env.example` in `web/.env`. The backend verifies Firebase ID tokens with its Firebase Admin service-account credentials; never put those private credentials in the web app.

## Stack

- React 19 + Vite 8
- Tailwind CSS 4
- React Router
- Axios + Zustand
- Brand aligned with `landing_page` (red / ember / Bebas Neue)

## Folder structure

```
src/
  api/           HTTP client + domain APIs
  components/    UI, layout, commerce product cards
  hooks/         Auth guards, shared hooks
  layouts/       Shell layouts
  lib/           App config
  pages/         Route screens
  stores/        Zustand state (auth, cart, location, ui)
  styles/        Global theme
  utils/         money, media, cn
```

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Default API: `http://localhost:3000/api/v1`

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local Vite server (port 5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npm run lint` | Oxlint |

## Customer flows covered

1. Commerce categories and products from the backend catalog
2. Product search, filters, product detail, and basket controls
3. Persistent cart and checkout using marketplace order payloads
4. OTP login
5. Checkout (address, COD/ONLINE, coupon)
6. Orders list + detail + cancel
7. Account profile + addresses
