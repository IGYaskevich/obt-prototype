# OBT Prototype (Vite + React + TS)

Clickable UX prototype for B2B Online Booking Tool.

## What is inside
- Login with tariff switch (Free / Postpay / Flex)
- Company dashboard with balances and CTA
- Search flights/trains, results with policy badges
- Single ticket purchase flow with payment methods and approvals
- Trip basket (multi-service) flow
- Tariffs page to see UI/logic differences
- Policies & approvals page
- Exchanges/returns page (Flex + partial Postpay)
- Support page per tariff
- Closing documents page

All data and logic are mocked.

## Run locally
1. Install deps
```bash
npm i
```
2. Start dev server
```bash
npm run dev
```
Open http://localhost:5173

## Build
```bash
npm run build
npm run preview
```

## Notes
- Prototype is desktop-first, responsive for mobile with same routes.
- You can extend mocks in `src/state/store.tsx`.
