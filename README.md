# STJ Southern Ambulance — Website

Next.js 15 website with admin dashboard, PayHere payment integration, and Railway deployment.

## Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS — Vital Guard design system (Navy + Emerald + Emergency Red)
- **Database:** PostgreSQL via Prisma ORM (Railway)
- **Payments:** PayHere (LKR)
- **Email:** Nodemailer via SMTP (mail.stj.lk)
- **Auth:** HMAC-SHA256 signed cookies (no NextAuth)
- **Storage:** Railway persistent volume at `/data/uploads`
- **Hosting:** Railway

## Local Development

### 1. Prerequisites

```bash
node -v   # 18+
```

### 2. Install

```bash
npm install
```

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in values.

Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Railway) |
| `PAYHERE_MERCHANT_ID` | PayHere merchant ID |
| `PAYHERE_MERCHANT_SECRET` | PayHere merchant secret |
| `PAYHERE_SANDBOX` | `"true"` for sandbox, `"false"` for live |
| `NEXTAUTH_SECRET` | Random 32-char — `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` dev / `https://stj.lk` prod |
| `SMTP_HOST` | `mail.stj.lk` |
| `SMTP_USER` | `no-reply@stj.lk` |
| `SMTP_PASS` | SMTP password |
| `EMAIL_ADMIN_TO` | `info@stj.lk` |
| `UPLOAD_PATH` | `/data/uploads` |
| `AUDIT_DAILY_SALT` | Random 32-char string |

### 4. Database

```bash
npm run db:push       # push schema (first time)
npm run db:migrate    # run migrations
npm run db:studio     # Prisma Studio
```

### 5. Create first admin user

Run via Prisma Studio or a one-off script using `hashPassword` from `lib/auth.ts`.

### 6. Dev server

```bash
npm run dev
# http://localhost:3000
# http://localhost:3000/admin
```

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/services` | Services |
| `/about` | About STJ |
| `/fleet` | Fleet and equipment |
| `/news` | News (CMS-driven) |
| `/contact` | Contact form |
| `/invoice/[id]` | Customer invoice + payment |
| `/invoice/[id]/checkout` | PayHere checkout |
| `/invoice/[id]/success` | Payment confirmed |
| `/invoice/[id]/failed` | Payment failed |
| `/admin/dashboard` | Admin KPIs |
| `/admin/invoices` | Invoice management |
| `/admin/invoices/new` | Create invoice |
| `/admin/customers` | Customer registry |
| `/admin/cms` | Website text editing |
| `/admin/news` | News post management |
| `/admin/reports` | Revenue reports |
| `/admin/logs` | Audit logs |
| `/admin/users` | Admin user management |
| `/api/health` | Railway health check |

## PayHere Webhook

Set notify URL in PayHere dashboard to:
```
https://stj.lk/api/payments/webhook
```

## Railway Deployment

1. Set all `.env.local` variables in Railway **Variables** tab
2. Create a Railway volume mounted at `/data`
3. Push to the connected branch — Railway auto-deploys via Nixpacks
4. `railway.toml` runs `npx prisma migrate deploy && npm start`
5. Health check pings `/api/health`

## IP Privacy (PDPA)

Raw IPs are never stored. All audit logging uses:
`SHA-256(ip + date + daily_salt)` → 16-char hex. Logs retained 90 days.
