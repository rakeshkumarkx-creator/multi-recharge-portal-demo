# Multi-Recharge Portal — Full-Stack Local Demo

## What is included
- Node.js + Express backend API
- Responsive browser UI
- Demo retailer and admin roles (role switcher, not secure authentication)
- Five packages, daily ROI and 5X cap tracking
- Server-side simulated daily-income calculation that stops at the cap
- Simulated recharge form and transaction history
- Wallet ledger
- 11 income source overview and team-sharing table
- Admin demo tools to change a package, create demo users, inspect summary
- Simulated payout request record (no bank transfer)

## Requirements
- Node.js 18+ recommended
- npm

## Run locally
1. Extract the ZIP.
2. Open a terminal in the extracted `Multi_Recharge_Portal_Complete_Demo` folder.
3. Run `npm install`
4. Run `npm start`
5. Open `http://localhost:3000`

The server creates `data.json` on first run. Delete `data.json` to reset all demo data, then restart the server.

## Demo account switch
- Retailer: `U1001`
- Admin: `A0001`

Use Admin Panel > Demo Login / Role Switch to switch the role. This is intentionally a demo-only role switch, not secure login.

## Critical limitations
This is a development demo, not a production application. It has no secure authentication, password reset, production-grade authorization, database server, live recharge API, payment gateway, bank integration, KYC provider, SMS/OTP, or deployment configuration. The local JSON file is not suitable for concurrent or production financial records. Never use real personal data or money.

All transactions and payouts are simulated. Before production, add proper authentication, server-side access control, a durable database and audit trail, rate limiting, input validation, secrets management, API-provider contracts, idempotency, reconciliation, monitoring, backups, security review and legal/compliance review.

## Package assumptions
Basic ₹1,150 / ₹45 daily / ₹5,750 cap
Standard ₹2,250 / ₹100 daily / ₹11,250 cap
Pro ₹4,500 / ₹250 daily / ₹22,500 cap
Master ₹11,500 / ₹700 daily / ₹57,500 cap
Super ₹22,500 / ₹1,800 daily / ₹1,12,500 cap

The 5X cap applies to simulated package-based daily income only. Final written policy must specify whether other commissions, bonuses and rewards count toward the cap.
