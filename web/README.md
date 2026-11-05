# Ftafat Web (Customer)

Production customer website for Ftafat food delivery. Talks to the backend under `/api/v1` as documented in `../WEBSITE_API_REFERENCE.md`.

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
  components/    UI, layout, restaurant widgets
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

1. Bootstrap / home feed + nearby restaurants
2. Search restaurants & dishes
3. Restaurant menu → cart
4. OTP login
5. Checkout (address, COD/ONLINE, coupon)
6. Orders list + detail + cancel
7. Account profile + addresses
