# Sankey Wallet

Full-stack app to connect financial accounts, process transactions, visualize spending flows via a Sankey diagram, and manage budgets.

## Tech Stack
- Backend: Node.js, Express (TypeScript), Prisma, PostgreSQL, Plaid API, JWT
- Frontend: Next.js 14 (TypeScript), TailwindCSS, Recharts

## Local Setup
1. Copy env and fill values
```bash
cp .env.example .env
```
2. Start Postgres
```bash
npm run db:up
```
3. Install deps and migrate
```bash
cd server && npm i && npx prisma migrate dev --name init
cd ../web && npm i
```
4. Run apps
```bash
npm run dev:server   # http://localhost:4000
npm run dev:web      # http://localhost:3000
```

## Seed Demo Data
```bash
cd server && npm run seed
```
