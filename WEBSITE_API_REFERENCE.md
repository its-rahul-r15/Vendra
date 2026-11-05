# Ftafat API Reference (Website)

Complete backend API guide for building the **customer website** (and related apps).  
Base path: **`/api/v1`** · Stack: Node.js + Express + MongoDB + Redis + Socket.IO + Razorpay

---

## Table of contents

1. [Quick start](#1-quick-start)
2. [Conventions](#2-conventions)
3. [Suggested website page → API map](#3-suggested-website-page--api-map)
4. [Auth](#4-auth)
5. [Users & addresses](#5-users--addresses)
6. [Bootstrap, feed & config](#6-bootstrap-feed--config)
7. [Restaurants & menu](#7-restaurants--menu)
8. [Vendors & catalog (V2)](#8-vendors--catalog-v2)
9. [Grocery](#9-grocery)
10. [Search & discovery](#10-search--discovery)
11. [Banners, masters, coupons](#11-banners-masters-coupons)
12. [Cart](#12-cart)
13. [Checkout & orders](#13-checkout--orders)
14. [Payments](#14-payments)
15. [Reviews](#15-reviews)
16. [Notifications](#16-notifications)
17. [Support](#17-support)
18. [Socket.IO (live tracking)](#18-socketio-live-tracking)
19. [Admin / owner / rider APIs (appendix)](#19-admin--owner--rider-apis-appendix)
20. [Website integration notes](#20-website-integration-notes)

---

## 1. Quick start

| Item | Value |
|------|--------|
| Base URL (local) | `http://localhost:3000/api/v1` |
| Socket URL (local) | `http://localhost:3000` |
| Content-Type | `application/json` (except avatar upload) |
| Auth header | `Authorization: Bearer <accessToken>` |
| Optional headers | `X-Request-Id`, `X-Idempotency-Key` |
| CORS | Credentials allowed; localhost / LAN origins OK in dev |

**Minimal customer flow**

```
1. GET  /config/bootstrap          → feature flags / maintenance
2. GET  /feed/home?lat=&lng=       → home page sections
3. POST /auth/otp/send             → phone OTP login
4. POST /auth/otp/verify           → tokens + user
5. GET  /restaurants/nearby        → list restaurants
6. GET  /restaurants/:id/menu      → menu
7. POST /cart/items                → add to cart
8. POST /orders                    → place order (COD / ONLINE)
9. Socket order:subscribe          → live status
```

---

## 2. Conventions

### Response envelope

Most endpoints return:

```json
{
  "success": true,
  "message": "Success",
  "data": { },
  "meta": { }
}
```

Errors:

```json
{
  "success": false,
  "message": "Human readable error",
  "code": "OPTIONAL_ERROR_CODE",
  "errors": []
}
```

`GET /health` returns a flat body: `{ "status": "ok", "timestamp": "..." }`.

### Auth levels

| Level | Meaning |
|-------|---------|
| **Public** | No token |
| **Optional JWT** | Works without token; personalizes if present |
| **Bearer JWT** | `Authorization: Bearer <accessToken>` required |
| **Role** | JWT + role/permission (`customer`, `restaurant_owner`, `admin`, …) |

### Pagination (common)

Query: `page` (default `1`), `limit` (default `20`, max `100`).

Typical `meta`:

```json
{
  "totalCount": 100,
  "totalPages": 5,
  "currentPage": 1,
  "perPage": 20,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

Some modules use `{ total, totalPages, page, limit }` instead — check per endpoint.

### Money & geo

- Many fees / checkout amounts are in **paise** (divide by `100` for INR display).
- Geo coordinates are **`[longitude, latitude]`** (GeoJSON order).

### Phone format

```
^\+?[1-9]\d{9,14}$
```

Examples: `9876543210`, `+919876543210`.

---

## 3. Suggested website page → API map

| Website page | Primary APIs |
|--------------|--------------|
| App shell / layout | `GET /config/bootstrap`, `GET /feed/config` |
| Home | `GET /feed/home`, `GET /banners`, `GET /masters/cuisines` |
| Restaurant list | `GET /restaurants/nearby`, `GET /search/restaurants` |
| Restaurant detail | `GET /restaurants/:id`, `GET /restaurants/:id/menu`, `GET /reviews/restaurant/:id` |
| Dish search | `GET /search/items`, `GET /search/recommended`, `/under99`, `/trending` |
| Grocery home | `GET /grocery/home`, `GET /grocery/categories`, `GET /grocery/products` |
| Login | `POST /auth/otp/send`, `POST /auth/otp/verify` (or password / Google) |
| Profile | `GET|PATCH /users/me`, `POST /users/me/avatar` |
| Addresses | `GET|POST /users/me/addresses`, `PATCH|DELETE .../:addressId` |
| Cart | `GET /cart`, `POST|PATCH|DELETE /cart/items...` |
| Checkout | `GET /orders/fees/current`, `POST /coupons/validate`, `POST /orders` or `POST /checkout/sessions` |
| Orders | `GET /orders/mine`, `GET /orders/:id`, `PATCH /orders/:id/cancel` |
| Support | `POST|GET /support`, `POST /support/:id/reply` |
| Live tracking | Socket.IO (`order:subscribe`, listen `order:status_changed`) |

---

## 4. Auth

Mount: `/api/v1/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/register` | Public | Create account (no tokens) |
| `POST` | `/login` | Public | Password login |
| `POST` | `/otp/send` | Public | Send OTP (`/send-otp` alias) |
| `POST` | `/otp/verify` | Public | Verify OTP + login (`/verify-otp` alias) |
| `POST` | `/refresh` | Public | Refresh tokens (`/refresh-token` alias) |
| `POST` | `/google` | Public | Google / Firebase login (`/firebase-login` alias) |
| `POST` | `/logout` | Bearer | Logout + clear refresh cookie |

### `POST /auth/register`

```json
{
  "name": "Rahul",
  "phone": "9876543210",
  "email": "optional@mail.com",
  "password": "optional8chars",
  "role": "customer"
}
```

**Response `data`:** `{ "userId": "..." }`

### `POST /auth/login`

```json
{ "phone": "9876543210", "password": "secret" }
```
or `{ "email": "...", "password": "..." }`

**Response `data`:** `{ "accessToken", "refreshToken", "user" }`  
Also sets httpOnly cookie `refreshToken` (path `/api/v1/auth/refresh`).

### `POST /auth/otp/send`

```json
{ "phone": "9876543210" }
```

**Response `data`:** `{ "isNewUser": true }`  
In development may also include `"otp"`.

### `POST /auth/otp/verify`

```json
{ "phone": "9876543210", "otp": "123456" }
```

**Response `data`:** `{ "accessToken", "refreshToken", "user", "isNewUser" }`

### `POST /auth/refresh`

```json
{ "refreshToken": "..." }
```
Cookie `refreshToken` is preferred if present.

**Response `data`:** `{ "accessToken", "refreshToken" }`

### `POST /auth/google`

```json
{
  "idToken": "firebase-id-token",
  "email": "optional@gmail.com",
  "name": "Optional",
  "avatar": "https://...",
  "googleId": "optional"
}
```

**Response `data`:** `{ "accessToken", "refreshToken", "user" }`

### User object (auth responses)

Typical fields: `_id`, `name`, `phone`, `email`, `role`, `addresses`, `isVerified`, `avatar`.

---

## 5. Users & addresses

Mount: `/api/v1/users` — **all require Bearer JWT**

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/me` | Current profile |
| `PATCH` / `PUT` | `/me` | Update profile (`name`, `email`) |
| `DELETE` | `/me` | Soft-deactivate account |
| `POST` | `/me/avatar` | Upload avatar (`multipart/form-data`, field `avatar`, max 5MB) |
| `GET` | `/me/addresses` | List addresses |
| `POST` | `/me/addresses` | Add address |
| `PATCH` | `/me/addresses/:addressId` | Update address |
| `DELETE` | `/me/addresses/:addressId` | Delete address |
| `PUT` | `/me/fcm-token` | Save push token `{ "fcmToken": "..." }` |

### Address body

```json
{
  "label": "Home",
  "line1": "12 MG Road",
  "line2": "Near Metro",
  "city": "New Delhi",
  "state": "Delhi",
  "pincode": "110001",
  "isDefault": true,
  "location": {
    "type": "Point",
    "coordinates": [77.2090, 28.6139]
  }
}
```

Required: `line1`, `city`, `state`, `pincode`.

---

## 6. Bootstrap, feed & config

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/config/bootstrap` | Public | Vertical flags, support phone, min app version, maintenance |
| `GET` | `/feed/home` | Public | Unified home feed |
| `GET` | `/feed/config` | Public | Home section config (titles, limits, toggles) |
| `GET` | `/categories` | Public | Flat categories |
| `GET` | `/categories/tree` | Public | Category tree (`?vertical=`) |
| `GET` | `/health` | Public | Liveness check |

### `GET /config/bootstrap` → `data`

```json
{
  "verticals": {
    "food": { "enabled": true, "mode": "...", "message": "" },
    "grocery": { "enabled": true, "mode": "...", "message": "" }
  },
  "supportPhone": "...",
  "minAppVersion": "...",
  "maintenance": false
}
```

### `GET /feed/home?lat=&lng=&isVeg=`

**Response `data` sections (typical):**  
`config`, `heroBanners`, `categories`, `recommended`, `stealDeals`, `under99`, `restaurants`, `trending`, `frequentlyBought`, `spotlight`, `mustTry`, `timestamp`

Use this as the main **home page** API for the website.

---

## 7. Restaurants & menu

Mount: `/api/v1/restaurants`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Public | List restaurants (`page`, `limit`, `search`, `isVeg`, `isActive`) |
| `GET` | `/nearby` | Optional JWT | Nearby by geo (`lat`, `lng`, `radius` km default 5, `cuisine`, `isVeg`) |
| `GET` | `/:id` | Public | Restaurant detail |
| `GET` | `/:restaurantId/menu` | Optional JWT | Full menu (guests = available items only) |

**Nearby example**

```
GET /api/v1/restaurants/nearby?lat=28.6139&lng=77.2090&radius=5&page=1&limit=20
```

**Menu response `data.menu`:** array of categories  
`{ _id, name, category, sortOrder, items[] }`

Owner-only mutations (`POST /`, `PATCH /:id`, toggle-open, menu CRUD) are listed in the [appendix](#19-admin--owner--rider-apis-appendix).

---

## 8. Vendors & catalog (V2)

### Vendors — `/api/v1/vendors`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Public | List (`vertical`, `type`, `isOpen`, `lat`, `lng`, `radiusM`, `page`, `limit`) |
| `GET` | `/:id` | Public | Vendor detail |
| `POST` | `/apply` | Bearer | Apply as seller |
| `GET` | `/my/application` | Bearer | Own application status |

**Apply body**

```json
{
  "businessName": "Spice Hub",
  "businessType": "restaurant",
  "ownerName": "Rahul",
  "businessPhone": "9876543210",
  "businessEmail": "owner@mail.com",
  "gstNumber": "optional",
  "fssaiNumber": "optional",
  "businessAddress": {}
}
```

`businessType`: `restaurant` | `grocery` | `both`

### Catalog — `/api/v1/catalog`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/categories` | Public | Categories (`?vertical=`) |
| `GET` | `/categories/tree` | Public | Nested tree |
| `GET` | `/search` | Public | Search listings (`q`, `vendorId`, `categoryId`, `vertical`, `page`, `limit`) |

Write endpoints (create/update category, master/vendor items, listings) need `catalog:write` — see appendix.

---

## 9. Grocery

Mount: `/api/v1/grocery`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/home` | Public | Banners, categories, special deals, trending |
| `GET` | `/categories` | Public | Categories |
| `GET` | `/products` | Public | Product list (filters below) |
| `GET` | `/products/:idOrSlug` | Public | Product detail |
| `GET` | `/search` | Public | Search (`q` required, `limit` ≤ 30) |
| `GET` | `/banners` | Public | Grocery banners |

**Product query params:**  
`category`, `filter` (`price`|`popularity`|`deals`|`organic`), `badge`, `minPrice`, `maxPrice`,  
`sort` (`price_asc`|`price_desc`|`popularity`|`rating`|`newest`),  
`isOrganic`, `isSpecialDeal`, `isTrending`, `search`, `page`, `limit`

---

## 10. Search & discovery

Mount: `/api/v1/search` — all **public**

| Method | Path | Query | Returns |
|--------|------|-------|---------|
| `GET` | `/restaurants` | `q`, `lat`, `lng`, `radius` (km, default 10), `page`, `limit`, `isVeg` | `{ restaurants }` |
| `GET` | `/items` | `q`, pagination, `isVeg` | `{ items, menuItems }` |
| `GET` | `/items/:id` | — | `{ item, menuItem }` |
| `GET` | `/recommended` | `limit`, `isVeg` | `{ items, products }` |
| `GET` | `/under99` | `limit`, `isVeg` | `{ items, products }` |
| `GET` | `/trending` | `limit`, `isVeg` | `{ items, products }` |

---

## 11. Banners, masters, coupons

### Banners — `/api/v1/banners`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Public | Active banners (`?section=`) |

`section` values: `FOOD_HERO`, `OFFERS_FOR_YOU`, `SPOTLIGHT`, `GROCERY_HERO`, or omit / `ALL`.

### Masters — `/api/v1/masters`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/cuisines` | Public | Active cuisines (`?search=`) |
| `GET` | `/dietary-types` | Public | Dietary types |
| `GET` | `/cancellation-reasons` | Optional JWT | Reasons (`?role=customer`) |
| `GET` | `/food-categories` | Public | Food categories (`?vertical=`) |

### Coupons — `/api/v1/coupons`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/active` | Optional JWT | Active coupons (`?restaurantId=`) |
| `POST` | `/validate` | Bearer | Validate before checkout |

**Validate body**

```json
{
  "code": "SAVE50",
  "cartTotal": 50000,
  "restaurantId": "optional"
}
```

**Response `data`:** `{ "coupon": { "code", "discountAmount" }, "discountAmount" }`  
Treat `cartTotal` / discount as **paise-oriented** unless you confirm store currency units.

---

## 12. Cart

Mount: `/api/v1/cart` — **all Bearer JWT**

| Method | Path | Body | Description |
|--------|------|------|-------------|
| `GET` | `/` | — | Get cart |
| `POST` | `/items` | `{ "menuItemId", "quantity" }` | Add item (single-restaurant cart, qty ≤ 50) |
| `PATCH` | `/items/:menuItemId` | `{ "quantity" }` | Update qty (`0` removes) |
| `DELETE` | `/items/:menuItemId` | — | Remove item |
| `DELETE` | `/` | — | Clear cart |

**Response `data`:** `{ "cart" }` with `items[]`, `subtotal`, restaurant refs.

Empty cart shape: `{ "items": [], "subtotal": 0 }`.

---

## 13. Checkout & orders

### Legacy place order (primary for current mobile / food cart)

Mount: `/api/v1/orders` — **Bearer JWT**

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/` | Place order from cart and/or body items |
| `GET` | `/fees/current` | Global fee config (platform, delivery, packaging, tax %, toggles) |
| `GET` | `/mine` | My orders (`page`, `limit`, `status`) |
| `GET` | `/:id` | Order detail |
| `PATCH` | `/:id/cancel` | Cancel order |

#### `POST /orders` body

```json
{
  "restaurantId": "...",
  "vendorId": "...",
  "paymentMethod": "COD",
  "couponCode": "SAVE50",
  "deliveryInstructions": "Ring the bell",
  "orderType": "food",
  "idempotencyKey": "optional-unique-key",
  "deliveryAddress": {
    "line1": "12 MG Road",
    "line2": "",
    "city": "New Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "location": { "type": "Point", "coordinates": [77.2090, 28.6139] }
  },
  "items": [
    { "menuItemId": "...", "quantity": 2 }
  ]
}
```

Notes:

- If cart has items, cart is used; `items` can also be sent directly.
- `paymentMethod`: `COD` / `ONLINE` (also accepts aliases like `razorpay`, `cod`, `online`, `cash`).
- Address accepts aliases: `street`↔`line1`, `postalCode`↔`pincode`.
- Item ids accept `menuItemId` | `productId` | `_id`.
- On success, cart is cleared.
- ONLINE response may include Razorpay order fields for client checkout.

**Cancel body**

```json
{
  "reason": "Changed mind",
  "cancellationReason": "Changed mind",
  "cancellationReasonId": "optional-master-id"
}
```

### V2 checkout sessions (catalog listings)

Mount: `/api/v1/checkout` — **Bearer JWT**

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/sessions` | Create checkout session + order(s) |
| `GET` | `/sessions/:id` | Get session |

**Create session body**

```json
{
  "items": [
    {
      "listingId": "...",
      "quantity": 1,
      "variants": [],
      "addons": []
    }
  ],
  "address": {
    "line1": "...",
    "city": "...",
    "state": "...",
    "pincode": "...",
    "location": { "type": "Point", "coordinates": [lng, lat] }
  },
  "couponCode": "optional",
  "paymentMethod": "ONLINE",
  "idempotencyKey": "optional"
}
```

Also accepts header `X-Idempotency-Key`.  
**Response:** `{ session, orders, razorpayOrderId, amountPaise }` (amounts in **paise**).

> Website tip: food cart flow → use **`POST /orders`**.  
> V2 listing catalog flow → use **`POST /checkout/sessions`**.

---

## 14. Payments

Mount: `/api/v1/payments`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/confirm` | Bearer | Confirm Razorpay payment after checkout |
| `GET` | `/order/:orderId` | Bearer | Payment for an order |
| `POST` | `/webhook` | Razorpay signature | Server webhook (not for UI) |

**Confirm body (client expectation)**

```json
{
  "orderId": "...",
  "razorpayPaymentId": "...",
  "razorpayOrderId": "...",
  "razorpaySignature": "..."
}
```

> **Caveat:** routes call `paymentService.confirmPayment` / `getPaymentByOrder`. Verify these service methods exist and work in your environment before shipping website payment UX. Prefer relying on Razorpay checkout + webhook for confirmation when possible.

---

## 15. Reviews

Mount: `/api/v1/reviews`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/` | Bearer | Submit review (delivered orders only, one per order) |
| `GET` | `/mine` | Bearer | My reviews |
| `GET` | `/restaurant/:restaurantId` | Public | Restaurant reviews |

**Create body**

```json
{
  "orderId": "...",
  "rating": 5,
  "text": "Great food",
  "images": ["https://..."]
}
```

---

## 16. Notifications

Mount: `/api/v1/notifications` — **Bearer JWT**

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | List (`page`, `limit`) — includes `unreadCount` in nested pagination |
| `POST` | `/fcm-token` | `{ "fcmToken" }` |
| `PATCH` | `/read-all` | Mark all read |
| `PATCH` | `/:id/read` | Mark one read |

---

## 17. Support

Mount: `/api/v1/support` — **Bearer JWT**

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/` | Create ticket |
| `GET` | `/` | List my tickets |
| `GET` | `/:id` | Ticket detail |
| `POST` | `/:id/reply` | Reply |

**Create body**

```json
{
  "subject": "Late delivery",
  "message": "Order still not arrived",
  "orderId": "optional",
  "restaurantId": "optional",
  "category": "delivery_delay",
  "priority": "normal",
  "attachments": []
}
```

`category`: `order_issue` | `payment_issue` | `delivery_delay` | `food_quality` | `account` | `other`

**Reply body:** `{ "text": "...", "attachments": [] }`

---

## 18. Socket.IO (live tracking)

| Item | Value |
|------|--------|
| URL | Same host as API, **without** `/api/v1` (e.g. `http://localhost:3000`) |
| Auth | `auth: { token: "Bearer <accessToken>" }` |
| Auto room | `user:<userId>` |

### Client → server

| Event | Payload |
|-------|---------|
| `order:subscribe` / `order:join` | `orderId` or `{ orderId }` |
| `order:unsubscribe` / `order:leave` | same |
| `restaurant:join` / `restaurant:leave` | merchant use |

### Server → client (website-relevant)

| Event | Payload / meaning |
|-------|-------------------|
| `order:status_changed` | `{ orderId, status, timestamp }` |
| `order.placed.v1` … `order.delivered.v1` / cancelled / rejected | V2 status stream |
| `order:rider_assigned` | Rider assigned |
| `delivery:location_update` | `{ orderId, lat, lng, timestamp }` |
| `notification:new` | In-app notification |
| `config:updated` / `vertical.toggled.v1` | Re-fetch bootstrap |

---

## 19. Admin / owner / rider APIs (appendix)

Not needed for a basic customer website; listed for completeness.

### Admin — `/api/v1/admin` (role `admin`)

| Method | Path |
|--------|------|
| `GET` | `/dashboard` |
| `GET` | `/users` · `PATCH /users/:userId` |
| `GET` | `/restaurants` · `PATCH /restaurants/:restaurantId` · `PATCH .../status` |
| `GET` | `/orders` · `PATCH /orders/:id/status` |
| `GET\|PUT\|PATCH` | `/fees` |
| `GET\|POST\|PUT\|DELETE` | `/categories` (+ `/reorder`, `/purge-food`) |
| `GET\|POST` | `/notifications` |
| `GET\|PUT` | `/home-config` |
| `GET` | `/audit-logs` |
| `GET` | `/seller-applications` |
| `POST` | `/seller-applications/:id/approve` · `/reject` |

### Admin masters — `/api/v1/admin/masters` (role `admin`)

`GET|POST /:type` · `PUT /:type/reorder` · `GET|PATCH|PUT|DELETE /:type/:id`  
Types include cuisines, dietary-types, cancellation-reasons, food-categories, etc.

### Config verticals (permission `vertical:toggle`)

- `GET /config/verticals`
- `PUT /config/verticals/:vertical`

### Catalog write (permission `catalog:write`)

- `POST|PATCH|DELETE /catalog/categories...`
- `POST /catalog/items/master` · `/items/vendor`
- `POST|PATCH /catalog/listings...`

### Vendor admin

- Applications / approve / reject / create / patch / pause / resume under `/vendors`

### Restaurant owner

- `GET /restaurants/owner/mine`
- `POST /restaurants`, `PATCH /restaurants/:id`, `PATCH /:id/toggle-open`
- Menu CRUD under `/restaurants/:restaurantId/menu/...`
- `GET /orders/restaurant/:restaurantId`
- `PATCH /orders/:id/status`

### Delivery — `/api/v1/delivery` (Bearer + role)

Partner: register, profile, toggle-online, location, available-orders, accept, status, history.  
Admin/owner: nearby riders, assign order.

### Grocery / banners / coupons admin

Admin CRUD under `/grocery/*`, `/banners/*`, `/coupons` (create/list/toggle/delete).

### Analytics — `/api/v1/analytics`

- `GET /restaurants/:restaurantId` (owner/admin)
- `GET /platform` (admin)

### Support admin

- `PATCH /support/:id/status`

---

## 20. Website integration notes

1. **Call bootstrap first** on load; respect `maintenance` and disabled verticals.
2. **Prefer OTP login** for customers (`/auth/otp/send` + `/verify`).
3. Store `accessToken` (memory/localStorage) and send on every protected call; refresh via `/auth/refresh` when expired.
4. **Home page** should primarily consume `GET /feed/home` (+ banners/masters as needed).
5. Pass **browser geolocation** as `lat` / `lng` for nearby, feed, and search.
6. Cart is **one restaurant at a time** — UI should clear or warn on restaurant switch.
7. Show fees from `GET /orders/fees/current` before place order.
8. Money: assume **paise** for fees/checkout V2; format with `(amount / 100).toFixed(2)`.
9. After place order (ONLINE), open Razorpay Checkout with returned order id, then call `/payments/confirm` (after verifying backend readiness).
10. For tracking page: connect Socket.IO, `order:subscribe`, listen for `order:status_changed` + location events.
11. Two commerce paths exist — **legacy cart + `/orders`** vs **V2 listings + `/checkout/sessions`**. Pick one per surface; don’t mix item id types.
12. Allowed CORS origins come from `ALLOWED_ORIGINS`; add the production website origin there.

---

## Roles reference

| Role | Typical website use |
|------|---------------------|
| `customer` | Default site user |
| `restaurant_owner` / `merchant_owner` | Seller dashboard (not public site) |
| `delivery_partner` | Rider app |
| `admin` / `super_admin` / `*_admin` | Admin panel |

---

*Generated from `backend/src/routes` and module route/controller/service code. Paths are relative to `/api/v1`.*
