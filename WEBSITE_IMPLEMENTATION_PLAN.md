# Ftafat Customer Website Implementation Plan

This document outlines the roadmap for building the **Ftafat Customer Website** using the existing Node.js backend and aligning with the design patterns used in the `admin` and `frontend` (mobile) apps.

## 1. Project Status & Tech Stack

### Current Assets
| Directory | Stack | Status |
|-----------|-------|--------|
| `backend` | Node.js, MongoDB, Redis, Socket.IO, Razorpay | ✅ Complete & API Ready |
| `frontend`| Expo/React Native, Zustand, TanStack Query | ✅ Mobile App Live |
| `admin` | React 19, Vite 8, Tailwind 4, React Router | ✅ Admin Panel Live |
| **`web`** | **React 19, Vite 8, Tailwind 4** | **⚠️ Scaffolding only** |

### Target Tech Stack for Web
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM 7
- **HTTP Client**: Axios
- **State Management**: React Context API + LocalStorage (consistent with `admin`)
- **Real-time**: Socket.IO Client
- **Icons**: Lucide React

---

## 2. Directory Structure

```text
web/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Button, Input, Modal, Spinner, etc.
│   │   ├── layout/          # Header, Footer, BottomNav
│   │   ├── restaurant/      # RestaurantCard, MenuItemCard
│   │   ├── cart/            # CartDrawer, CheckoutSummary
│   │   └── order/           # OrderTracker, StatusBadge
│   ├── contexts/            # Global State (Auth, Cart, Config)
│   ├── services/            # API Clients & Business Logic
│   │   ├── api.js           # Axios instance & interceptors
│   │   ├── authService.js
│   │   ├── socketService.js # Socket.IO wrapper
│   │   └── ...              # Module-specific services
│   ├── hooks/               # Custom hooks (useAuth, useCart)
│   ├── pages/               # Route-level components
│   ├── utils/               # formatters, constants, validators
│   ├── App.jsx              # Routing & Provider setup
│   └── main.jsx             # Entry point
```

---

## 3. Implementation Roadmap

### Phase 1: Infrastructure (Days 1-2)
1.  **Dependency Setup**: Install `axios`, `react-router-dom`, `socket.io-client`, `lucide-react`.
2.  **API Client (`services/api.js`)**: 
    - Configure Axios with `baseURL` and interceptors.
    - Attach Bearer Token from `localStorage`.
    - Handle 401 errors for auto-logout.
3.  **Auth Context**: Implement `login`, `register`, `logout`, and session persistence.
4.  **Config Context**: Fetch `GET /config/bootstrap` on app load to handle maintenance modes and feature flags.

### Phase 2: Core User Flow (Days 3-7)
1.  **Home Page**: Integrate `GET /feed/home`. Implement banners, category grids, and "Recommended" sections.
2.  **Restaurant Discovery**:
    - `Restaurants.jsx`: List nearby vendors using `GET /restaurants/nearby`.
    - `RestaurantDetail.jsx`: Show info and menu using `GET /restaurants/:id/menu`.
3.  **Cart & Checkout**:
    - `CartContext`: Handle single-restaurant cart logic.
    - `Checkout.jsx`: Implement address selection, coupon validation (`POST /coupons/validate`), and fee calculation.
4.  **Ordering**:
    - `POST /orders` for Food orders.
    - Handle Payment (COD vs Online/Razorpay).

### Phase 3: Post-Order & Tracking (Days 8-10)
1.  **Order History**: List and detail views for past orders (`GET /orders/mine`).
2.  **Live Tracking**:
    - Connect Socket.IO.
    - Subscribe to `order:subscribe`.
    - Listen for `order:status_changed` and `delivery:location_update`.
3.  **Profile & Addresses**: CRUD for user addresses and profile updates.

### Phase 4: Support & Notifications (Days 11-12)
1.  **Notifications**: Real-time in-app alerts via Socket.IO and history list.
2.  **Support Hub**: Ticket creation and chat-like reply interface for order issues.
3.  **Grocery Vertical**: Dedicated landing and search for the grocery module (`GET /grocery/home`).

### Phase 5: Polishing & Deployment (Day 13)
1.  **Error Handling**: Error boundaries, 404 page, and empty states.
2.  **Performance**: Image optimization and lazy loading for routes.
3.  **Environment Config**: Setup `.env` for Production/Staging API URLs.

---

## 4. Technical Integration Notes

### 💰 Money Handling
- **Units**: All amounts from the API are in **paise** (1 INR = 100 paise).
- **Display**: Always format using `(amount / 100).toFixed(2)`.
- **Logic**: Calculations (GST, Fees) should happen in paise to avoid floating-point errors.

### 📍 Geolocation
- **Format**: GeoJSON `[longitude, latitude]` for storage, but standard `lat`/`lng` for query params.
- **Requirement**: Prompt for browser location on first load to personalize the feed.

### 🔐 Authentication
- **Method**: Phone + OTP is the primary flow (`/auth/otp/send` -> `/auth/otp/verify`).
- **Persistence**: Store the `accessToken` in `localStorage`. Align token key names with the `admin` app for local development ease.

### 🛒 Cart Logic
- **Constraint**: Only one restaurant at a time. If a user adds an item from "Restaurant B" while "Restaurant A" is in the cart, prompt to clear the cart.
- **V2 Catalog**: For grocery or catalog listings, use `POST /checkout/sessions` instead of the legacy `/orders` path.

### 🔌 Socket.IO Events
- **Auth**: Pass token in the `auth` object: `{ token: "Bearer <JWT>" }`.
- **Rooms**: Automatically joins `user:<userId>`.
- **Updates**: Listen for `config:updated` to refresh bootstrap settings (e.g., if a vertical is toggled off during an emergency).

---

## 5. Next Steps for Implementation

1.  **Initialize `api.js`**: Create the base Axios configuration.
2.  **Implement Auth**: Create the Login and OTP verification pages.
3.  **Build the App Shell**: Set up `Header`, `Footer`, and `MainLayout` with React Router.
4.  **Fetch Bootstrap**: Ensure the app respects the `maintenance` flag from the backend.
