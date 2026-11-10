# LessonLagoon 🏝️

**Storefront & Admin Platform for Maldivian Teaching & Learning Resources**

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Vitest**, directly following the visual design system from `LessonLagoon_MVP_Prototype.html`, `LessonLagoon_Admin_Backend.html`, and `LessonLagoon_Phase1_Build_Spec.md`.

---

## 🚀 Key Features Implemented

### 1. Storefront Experience
- **Interactive Hero**: Particle network canvas background with brand palette, responsive 3D hover collage, and quick stats.
- **Catalogue & Search**: Filter by subject, grade, curriculum, type, free/paid, or star ratings (4★ & up) with instant search and sort.
- **Product Gallery & Previews**: Watermarked multi-page preview viewer (`LESSONLAGOON · PREVIEW`) with lock card for unowned pages.
- **Single-Page Checkout**: 
  - Format selector (*Digital download* or *Digital + printed copy*).
  - Conditional delivery block for printed copies (zone selector, recipient, Maldivian phone format `+960`, island, address).
  - BML bank transfer payment method.
  - Interactive loyalty points redemption slider (enforces the 80% maximum digital cap and minimum price floor).
- **Order Page**: Copyable bank details (account number, reference, exact amount), transfer slip upload, and dual digital + print tracking steps.
- **Customer Library**: Access to all claimed free packs and paid resources, version badges (`v2.0 Updated`), and single-teacher licence stamping.
- **My Points & Loyalty**: Balance, MVR valuation, progressive profile completion (+10 pts per field), annual birthday special (100 pts + 25% coupon), and personal referral code (`MARIYAM25`).
- **"Customers who bought this also bought" Recommender**: Co-occurrence algorithm with 3-customer minimum support, re-ranking bonuses, and category fallbacks.
- **Request a Resource Form**: Native human drag-puzzle slider CAPTCHA with server-side validation.

### 2. Teacher Backend (Admin)
- **Dashboard**: "Needs your attention" alert bar, KPI counters (revenue, slips, print orders, ratings), and weekly revenue trend chart.
- **Approvals Queue**: Flagging for amount mismatches and duplicate slips, with one-tap approve or reject with custom preset reasons.
- **Resources Catalogue**: Inline price & minimum price editing, bulk actions (publish, feature, archive), and version history.
- **Upload Queue**: Simulated drop-zone pipeline (format validation, duplicate hashing, office conversion, page rendering, watermark burn-in, cover generation), and "Apply to All" bar.
- **Print Fulfilment**: Production queue, merged print pack generator, A6 courier/ferry packing sticker generator, and status transitions.
- **Pricing & Rules Centre**: Single control centre for all prices, points valuations, print rates, delivery zones, and birthday rules with live recalculator.
- **Newsletters & Automations**: Campaign builder with blocks, segment filters, and lifecycle journeys (Welcome, Abandoned Cart, Review Requests, Birthday).
- **Reviews Moderation**: Moderation queue (Pending, Approved, Hidden) and owner public replies.

---

## 🧪 Automated Test Suite

Run unit and property tests with:

```bash
npm test
```

Test suites include:
- `src/__tests__/pricing.test.ts`: Verifies list pricing, campaign multipliers, minimum price floor compliance, 80% points redemption cap, print cost calculation, and laari conversion.
- `src/__tests__/recommender.test.ts`: Tests co-occurrence baskets, minimum support of 3 customers, and exclusion of already-owned items.
- `src/__tests__/sliderCaptcha.test.ts`: Tests challenge token generation, human drag timing checks, and position tolerance verification.

---

## 🗄️ Database Architecture & Seamless PostgreSQL Migration

LessonLagoon uses **Prisma ORM** for 100% of its database interactions across all models:
- **Products & Taxonomies** (`Product`, `Category`, `Grade`, `Curriculum`, `ProductPrintOption`)
- **Orders & Approvals** (`Order`, `OrderItem`, `OrderPrintItem`, `OrderDelivery`, `PaymentSlip`, `OrderEvent`)
- **Customers & Auth** (`User`, `Account`, `Session`, `Entitlement`, `UserProfileValue`)
- **Loyalty & Referrals** (`PointsLedger`, `ShareLink`, strictly adhering to `1 MVR = 10 points`)
- **Marketing & Storefront** (`Campaign`, `Coupon`, `Review`, `ResourceRequest`, `PricingSetting`)

All queries strictly use standard Prisma ORM methods (no raw SQL or SQLite-specific syntax), making switching to PostgreSQL seamless:

### How to Switch from SQLite to PostgreSQL

1. **Update `.env`**:
   ```env
   # Replace local SQLite file URL:
   # DATABASE_URL="file:./dev.db"
   
   # With your PostgreSQL connection string:
   DATABASE_URL="postgresql://postgres:password@localhost:5432/lessonlagoon?schema=public"
   ```

2. **Update `prisma/schema.prisma`**:
   Change `provider = "sqlite"` to `provider = "postgresql"`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Deploy Schema & Seed**:
   ```bash
   # Push schema to PostgreSQL database
   npx prisma db push
   
   # Seed default taxonomies and initial catalogue
   npm run db:seed
   ```

That's it! All application features, API routes, and admin tools will immediately operate on your PostgreSQL database without any code changes.

---

## 🛠️ Local Development & Build

```bash
# Start development server
npm run dev

# Run production build
npm run build

# Start production server
npm start
```

