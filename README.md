## My Shop

Next.js + Prisma ecommerce starter with admin login, product CRUD, multi-image upload and Cloudinary cleanup on delete.

## Local Setup

1. Copy `.env.example` to `.env`.
2. Fill `DATABASE_URL` with a PostgreSQL URL.
3. Fill Cloudinary and session variables.
4. Run:

```bash
npm install
npm run db:push
npm run dev
```

## Deploy to Vercel

1. Push repository to GitHub.
2. Import project in Vercel.
3. Add env vars from `.env.example` in Vercel Project Settings.
4. Deploy.

Build script already runs:

```bash
prisma generate && prisma db push && next build
```
