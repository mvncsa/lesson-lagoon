# LessonLagoon – Phase 1 Build Specification

**Document:** Phase 1 build spec (single owner store for digital teaching and learning resources)
**Version:** 1.0
**Design references (source of truth for look and behaviour):**

| File | Role |
|---|---|
| `LessonLagoon_MVP_Prototype.html` | Customer storefront: landing page, catalogue, product page, cart, checkout, order page, Library, points, email approval page |
| `LessonLagoon_Admin_Backend.html` | Owner backend: dashboard, upload queue, resources, subjects & grades, approvals, orders, customers, campaigns, points, reviews, landing page editor, emails, settings, audit log, backup |

**Parent documents:** `Teaching_Resources_Marketplace_SRS_v1.3` (full product) and `Teaching_Resources_MVP_Design.md` (MVP). Where this document conflicts with them, **this document wins for Phase 1**.

---

## 0. How to use this document

- This spec turns the two HTML prototypes into a production application. Visual design, wording, layout, colours and interaction patterns MUST follow the prototypes. Section 3 maps every prototype screen to a requirement.
- Features the prototypes do **not** yet show are marked **NEW**. These are: printed delivery, newsletter composer and dispatch, automated offer journeys, ebook and tutorial resource types, and the email list (subscribers who have not bought).
- Every requirement has an ID (for example `P1-PRN-04`). Use IDs in tickets, test names and commit messages.
- **MUST** = required for Phase 1 launch. **SHOULD** = build if time allows. **LATER** = designed for, not built.
- Money is stored as integers in laari (MVR × 100). No floating point for money, ever.
- All prices, discounts, points and delivery fees are calculated on the server by one pricing service. The browser only displays them.

---

## 1. Phase 1 scope

### 1.1 Goal
One owner can run a complete online store for teaching resources: publish resources quickly, show them beautifully, take payment by bank transfer, approve payments from email, deliver files safely, optionally deliver printed copies, and grow a mailing list with automatic offers and newsletters.

### 1.2 In scope

| # | Area | Summary |
|---|---|---|
| 1 | Landing page management | Hero with interactive background, sections, reviews, prices, FAQ, announcement bar. Fully editable with preview, publish and rollback. |
| 2 | Resource upload and cataloguing | Drag-and-drop bulk upload, auto-filled details, subjects, grades, curricula, resource types, tags, versions. |
| 3 | Watermarked previews | Automatic page/slide images with the watermark burned into the pixels, using JavaScript libraries. |
| 4 | Checkout | Smooth one-page checkout. Free items download instantly. Paid items go to bank transfer. |
| 5 | Bank transfer and email approval | Slip upload, owner email with Approve / Reject, confirm page, approvals queue. |
| 6 | Printed delivery **NEW** | Customer can request a printed copy with print and delivery cost shown before ordering. Owner fulfils and tracks. |
| 7 | Single owner | One owner account with optional extra admins on an allowlist. No multi-teacher marketplace. |
| 8 | Email list management | Customers plus email-only subscribers, consent, tags, segments, import/export. |
| 9 | Registration and offer automation **NEW** | Google sign-in, welcome offer, timed reminder emails, abandoned cart, post-purchase, win-back. |
| 10 | Newsletter management and dispatch **NEW** | Compose, preview, test, schedule and send to segments with throttling, unsubscribe and basic tracking. |
| 11 | Points (core) | **MUST.** Points are a core loyalty feature, always on. Earn on sign-up, purchase, review, birthday; pay up to 80% of each item with points. See 15.3. |
| 12 | Share to a friend & earn | **MUST.** Every resource has "Share & earn"; the sharer earns points when a friend signs up or buys through their link. Referral codes too. See 15.4–15.5. |
| 13 | Birthday special **NEW** | **MUST.** If the customer gives their birthday, they get a birthday offer and bonus points every year. See 15.6. |
| 16 | Reviews & ratings (core) | **MUST.** Verified-buyer star ratings and written reviews, with photos, helpful votes, owner replies and moderation. See 15.7. |
| 17 | "Customers who bought this also bought" recommender **NEW** | **MUST.** Purchase-based recommendations on product, cart, order, Library and emails. See 15.9. |
| 18 | Request a resource **NEW** | **MUST.** Email-only request form protected by our own slider CAPTCHA (already implemented in Hub). See 15.10. |
| 15 | Progressive profile & rewards **NEW** | **MUST.** Sign up with Google in one tap; later, earn 10 points for each extra detail the customer adds and saves. See 15.8. |
| 14 | Pricing & rules centre **NEW** | **MUST.** Every price, fee, discount, points value and reward is editable from one dashboard page, pre-filled with the defaults in this document. See 20. |

### 1.3 Out of scope for Phase 1 (LATER)
BML card gateway (the checkout keeps a disabled "Card – coming soon" option), subscriptions, multiple sellers, email/password login, Dhivehi interface, AI features, GST (setting exists but OFF), courier API integration, SMS.

---

## 2. Technology

| Layer | Choice |
|---|---|
| Web app | Next.js 15 (App Router, TypeScript strict), server-rendered storefront, server actions and route handlers |
| Database | PostgreSQL 16 with Prisma |
| Background jobs | pg-boss worker (separate process, same codebase) |
| File storage | S3-compatible storage (DigitalOcean Spaces). Private bucket for originals; public CDN bucket for previews and covers |
| Auth | Auth.js v5, Google provider only |
| Email | Transactional email provider via API (for example Amazon SES, Postmark or Brevo). One provider for both transactional and newsletter streams, using separate message streams/sub-domains |
| Preview pipeline | `pdfjs-dist` + `@napi-rs/canvas` (render), `sharp` (watermark, resize, WebP), `pdf-lib` (download stamping), `file-type` (type check), `clamscan` (virus scan). Office-to-PDF conversion by headless LibreOffice (`libreoffice-convert`) or a Gotenberg container. Everything after conversion is pure JavaScript |
| Hosting | Docker Compose on Ubuntu VM for dev/staging; production on the same images |

Why LibreOffice: there is no pure-JavaScript library that renders Word and PowerPoint layouts faithfully. The prototype renders DOCX/PPTX text in the browser with JSZip as a quick approximation; production MUST convert on the server for accurate previews.

---

## 3. Screen map (prototype → requirement)

### 3.1 Storefront (`LessonLagoon_MVP_Prototype.html`)

| Prototype screen / element | Route | Requirements |
|---|---|---|
| Announcement bar with campaign countdown | all pages | P1-LP-05, P1-CMP-03 |
| Header: logo, search, points pill, Library, cart, avatar | all pages | P1-AUTH, P1-PTS-08 |
| Hero with interactive canvas background and cover collage | `/` | P1-LP-02, P1-LP-03 |
| Trust strip, welcome-offer banner, featured, campaign block, free, subjects, all resources, reviews, how it works, points promo, FAQ, footer | `/` | P1-LP-01, P1-LP-04 |
| Product page: watermarked gallery, lock card, buy box, facts, reviews, share & earn, **"Customers who bought this also bought"** | `/r/[slug]` | P1-CAT-08, P1-PRV-09, P1-PRN-02, P1-REV, P1-REC |
| Cart drawer | overlay | P1-CHK-03 |
| One-page checkout | `/checkout` | P1-CHK-04 to P1-CHK-09, P1-PRN-03 |
| Order page: bank details with copy buttons, slip upload, status steps | `/orders/[no]` | P1-PAY-01 to P1-PAY-05, P1-PRN-07 |
| Email approval confirm page | `/approvals/[token]` | P1-APR-02 to P1-APR-04 |
| My Library | `/library` | P1-DL-01 to P1-DL-04 |
| My Points | `/points` | P1-PTS |
| Google sign-in modal with consent tick | overlay | P1-AUTH-01 to P1-AUTH-06 |
| Demo switcher panel | **remove in production** | — |

### 3.2 Owner backend (`LessonLagoon_Admin_Backend.html`)

| Prototype screen | Route | Requirements |
|---|---|---|
| Owner sign-in (allowlist) | `/admin/sign-in` | P1-AUTH-07 |
| Dashboard: "Needs your attention", KPIs, quick upload, sales, top resources | `/admin` | P1-ADM-01 |
| Upload resources: drop zone (also drop anywhere / press U), queue cards, apply-to-all bar, CSV fill | `/admin/upload` | P1-UPL |
| Resources: filters, inline price/min price, bulk actions, editor modal, versions | `/admin/resources` | P1-CAT |
| Subjects & grades | `/admin/catalogue` | P1-CAT-02 |
| Approvals queue with mismatch and duplicate flags | `/admin/approvals` | P1-APR |
| Orders with timeline, expire, remind, mark paid, refund | `/admin/orders` | P1-ORD |
| Customers with segments, detail, tags, notes, points adjust, grant | `/admin/customers` | P1-LST |
| Campaigns & coupons | `/admin/campaigns` | P1-CMP |
| Points & referrals | `/admin/points` | P1-PTS |
| Reviews | `/admin/reviews` | P1-REV |
| Landing page editor with preview, variants, sections, FAQ, history | `/admin/landing` | P1-LP |
| Emails: templates, outbox | `/admin/emails` | P1-EML |
| Settings: profile, uploads, bank, sign-in, admins | `/admin/settings` | P1-SET |
| **NEW** Resource requests | `/admin/requests` | P1-RQR |
| **NEW** Pricing & rules centre | `/admin/pricing` | P1-PRC |
| Points & referrals (extended with share analytics and birthday) | `/admin/points` | P1-PTS, P1-SHR, P1-BDY |
| Audit log | `/admin/audit` | P1-SEC-06 |
| Backup & data | `/admin/backup` | P1-OPS-02 (server backups replace browser export) |
| **NEW** Print orders | `/admin/print` | P1-PRN-06 to P1-PRN-10 |
| **NEW** Newsletters | `/admin/newsletters` | P1-NWS |
| **NEW** Automations | `/admin/automations` | P1-AUT |
| **NEW** Subscribers (email list) | inside `/admin/customers` as a tab | P1-LST-02 |

New screens MUST reuse the backend's existing components: `box`, `kpi`, `t` table, `chip`, `sw` switch, `applybar`, `modal`, `toast`, badges and colour tokens.

---

## 4. Design system (from both prototypes)

| Token | Value |
|---|---|
| Primary | `#0E8C7F` (hover `#0B6F65`) |
| Accent | `#FF7A59` |
| Ink | `#14213D` |
| Muted text | `#5B6475` |
| Lines | `#E7E9EE` |
| Background | `#FAFAF7` |
| Gold (stars, points) | `#F5B300` |
| OK / Warn / Bad | `#16A34A` / `#D97706` / `#DC2626` |
| Radius | 14px cards, 18–22px panels, pill buttons |
| Font | Plus Jakarta Sans (self-hosted in production, system fallback) |

- **P1-UI-01:** Mobile-first. Every storefront and backend screen MUST work at 360px width, as in the prototypes' `@media (max-width:900px)` rules.
- **P1-UI-02:** Respect `prefers-reduced-motion` everywhere.
- **P1-UI-03:** Toasts confirm every save; destructive actions use the confirm modal pattern.
- **P1-UI-04:** Accessibility: WCAG 2.2 AA contrast, keyboard navigation, focus rings, alt text on covers, labelled inputs.
- **P1-UI-05:** Keyboard shortcuts in backend: `U` upload, `/` search, `Esc` close (as in the prototype).

---

## 5. Authentication and roles

| Role | Access |
|---|---|
| Guest | Browse, preview, read reviews, add to cart, subscribe to newsletter by email |
| Customer | Google sign-in; claim free, buy, upload slips, download, request print, points, reviews, manage email preferences |
| Owner / Admin | Backend. Owner plus any emails on the admin allowlist |
| System | Worker jobs |

- **P1-AUTH-01:** Google sign-in only, scopes `openid email profile`, `email_verified` must be true.
- **P1-AUTH-02:** Database sessions in a `__Host-` cookie (Secure, HttpOnly, SameSite=Lax). Customers 30 days rolling; admins 12 hours.
- **P1-AUTH-03:** Sign-in opens inline as a modal and returns the user to the exact action they started (claim free, checkout, share, review).
- **P1-AUTH-04:** Sign-up asks for nothing beyond Google: only Terms acceptance and a separate **unticked** "Email me offers and new resources" box (marketing consent). Name, email and photo come from Google. All other details, including birthday, are collected later through the progressive profile (15.8), never required to sign up, browse, claim or buy.
- **P1-AUTH-05:** First sign-in creates the customer, a referral code, applies any stored referral, starts the **Welcome journey** (P1-AUT-01) and awards sign-up points.
- **P1-AUTH-06:** If the email already exists as a newsletter-only subscriber, link it to the new account and keep its consent history.
- **P1-AUTH-07:** Admin access requires the Google email to be on the allowlist **and** `role = ADMIN`. Non-allowlisted accounts see the "Not an admin account" screen. Adding/removing admins and changing bank details require re-confirmation and email all admins.

---

## 6. Landing page management

- **P1-LP-01:** Sections in this default order, each with on/off and up/down ordering: trust strip, welcome-offer banner, featured, campaign block, free resources, shop by subject, all resources, reviews, how it works, points promo, FAQ. **NEW optional sections:** "New this week" (auto: latest published), "Print & deliver" promo, and "Join our mailing list" signup block.
- **P1-LP-02:** Hero: label, headline (with `<em>` highlight), sub-headline, two buttons with link targets, stats (3), cover collage (auto from featured, or owner-chosen). Up to 3 hero variants; one is active.
- **P1-LP-03:** Interactive background presets: floating shapes, particle network, gradient mesh. Canvas, brand colours, max 26 particles on mobile, paused off-screen and in hidden tabs, off with reduced motion, loaded after the hero text so it never delays first paint.
- **P1-LP-04:** All prices on the page come from the pricing service, including campaign and welcome-offer prices with the list price struck through.
- **P1-LP-05:** Announcement bar: shows live campaign with countdown; otherwise owner text if enabled.
- **P1-LP-06:** Editing saves a **draft**. Customers see changes only after **Publish**. Each publish stores a version; the owner can restore any of the last 10.
- **P1-LP-07:** Live preview in the editor (desktop and mobile toggle).
- **P1-LP-08:** SEO: server-rendered HTML, page title and description editable, Open Graph image, `sitemap.xml`, Product JSON-LD with public price only.
- **P1-LP-09:** Performance: Lighthouse mobile ≥ 90, LCP < 2.5s on 4G.

---

## 7. Resources, upload and cataloguing

### 7.1 Resource types **(extended)**

| Type | Accepted files | Preview | Delivered as |
|---|---|---|---|
| Worksheet / document | PDF, DOCX | First N pages | Original + PDF |
| Slides | PPTX | First N slides | Original + PDF |
| eBook **NEW** | PDF, EPUB | PDF: first N pages; EPUB: cover + table of contents + first chapter excerpt rendered to images | Original file |
| Tutorial **NEW** | MP4 (≤ 500 MB) or unlisted YouTube/Vimeo link, plus optional PDF handout | Video: owner-chosen 30–60s preview clip or poster frame with watermark; Link: poster image | Signed streaming link (MP4) or the private link revealed after purchase; handout as PDF |
| Bundle **NEW (SHOULD)** | Group of existing resources | Covers of included items | All included files |

- **P1-CAT-01:** Fields: title, slug, short description, long description (sanitised rich text), resource type, subject, grade(s), curriculum, language (English/Dhivehi/Arabic), tags, cover, files, page/slide count or duration, price (0 = free), minimum price (owner-only), preview pages, featured, status (Draft / Published / Archived), **print available** (see 10), points override.
- **P1-CAT-02:** Subjects (with icon), grades and curricula are owner-managed lists. A subject cannot be deleted while resources use it.
- **P1-CAT-03:** Status rules: Published needs title, subject, grade and at least one ready file. Resources owned by customers cannot be deleted, only archived (still downloadable by owners).
- **P1-CAT-04:** Inline editing of price and minimum price in the list; minimum price must be > 0 and ≤ price for paid items. Price history is recorded.
- **P1-CAT-05:** Bulk actions on selected resources: publish, unpublish, archive, feature, set subject, set price.
- **P1-CAT-06:** Versions: "Upload new version" replaces the file, rebuilds previews, records "what changed", and optionally emails every owner of the resource. Library shows an "Updated" badge.
- **P1-CAT-07:** Duplicate resource (copies metadata and previews as a draft).
- **P1-CAT-08:** Storefront search and filters: text, subject, grade, type, free/paid, **minimum rating (4★ & up)**, sort (newest, popular, price, **top rated**).

### 7.2 Upload flow (as in the backend prototype)

- **P1-UPL-01:** Drop files on the upload page, anywhere in the backend, paste, or press `U`. Many files at once.
- **P1-UPL-02:** Files go **directly from the browser to private storage** via pre-signed URLs into a quarantine prefix; the server never buffers large files.
- **P1-UPL-03:** Auto-fill from file name: title (cleaned), grade (`g4`, `grade 4`, `kg`), subject (keyword map), type from extension. Page/slide count from the file.
- **P1-UPL-04:** Queue card per file shows live steps: check type and size → duplicate check (SHA-256) → convert (Office) → render pages → watermark → cover. Errors show a plain reason and Retry/Remove.
- **P1-UPL-05:** "Apply to all" bar: subject, grade, curriculum, price, minimum price, preview pages.
- **P1-UPL-06:** "Fill details from CSV" using the downloadable template (`filename,title,subject,grade,curriculum,price_mvr,min_price_mvr,preview_pages,featured,description`). CSV cells are formula-safe on export.
- **P1-UPL-07:** "✨ write for me" generates a short description from type, page count, grade, subject and title (rule-based template in Phase 1).
- **P1-UPL-08:** Per file: Publish, Save draft, Remove; plus Publish all ready / Save all as drafts. Duplicate files are flagged and need explicit confirmation.
- **P1-UPL-09:** Owner can replace the auto cover with their own image (cropped to 5:4).
- **P1-UPL-10:** Defaults in Settings: default price, default minimum price %, default preview pages, max upload size, auto-publish off.

---

## 8. Watermarked previews

- **P1-PRV-01:** Validate by content (`file-type`), allow only the types in 7.1, virus-scan with ClamAV. Scan error = not clean = rejected.
- **P1-PRV-02:** DOCX/PPTX → PDF with headless LibreOffice in an isolated worker container (non-root, no network, 60s timeout, 2 GB RAM). The converted PDF is internal only.
- **P1-PRV-03:** Render selected pages with `pdfjs-dist` on `@napi-rs/canvas` at 1200px width.
- **P1-PRV-04:** `sharp` composites a diagonal, tiled, semi-transparent SVG watermark (owner text, default `LESSONLAGOON · PREVIEW`) and a footer strip **into the pixels**, then saves WebP (quality 75) in two sizes (full and card).
- **P1-PRV-05:** Only the chosen preview pages are ever generated, so nothing beyond them can be requested.
- **P1-PRV-06:** Previews and covers go to the public CDN with random keys; originals stay private.
- **P1-PRV-07:** Changing watermark text or preview count regenerates previews in the background ("Re-stamp all previews" button in Settings).
- **P1-PRV-08:** Viewer code: the storefront overlays a small per-viewer code on the preview viewer (as in the prototype). It is a deterrent; the main protection is the burned-in watermark.
- **P1-PRV-09:** Gallery: swipe on mobile, arrows on desktop, right-click and drag disabled, final lock card "You've seen 3 of 24 pages – Get the full resource".
- **P1-PRV-10:** Failure: product shows cover and "Preview unavailable"; admin sees the error and Retry. Publishing is still allowed.
- **P1-PRV-11 NEW:** EPUB previews: render cover, contents and first chapter excerpt to images (HTML → image via the worker), then watermark the same way.
- **P1-PRV-12 NEW:** Tutorial previews: `ffmpeg` cuts the owner-chosen preview window, scales to 720p and burns a watermark; poster frame is watermarked like pages.

---

## 9. Checkout

### 9.1 Free resources
- **P1-CHK-01:** "Get it free" → sign in if needed → order `COMPLETED_FREE` → entitlement → download starts → toast "Added to your Library".
- **P1-CHK-02:** Daily free-claim limit per customer (default 20).

### 9.2 Paid resources (one page)
- **P1-CHK-03:** Cart drawer slides in on "Add"; "Buy now" skips straight to checkout.
- **P1-CHK-04:** Checkout page, single screen, in this order:
  1. Account (signed-in card or inline Google button)
  2. **Format** per item: *Digital download* (default) or *Digital + printed copy* (only for print-enabled resources, see 10) **NEW**
  3. **Delivery details** (shown only if any item is printed) **NEW**
  4. Payment method: Bank transfer (active); Card – coming soon (disabled)
  5. Agreement (Terms, licence, digital-delivery acknowledgement)
  6. Order summary: items, discounts, coupon field, points slider, **print cost**, **delivery fee**, total, points you'll earn, **Place order · MVR X**
- **P1-CHK-05:** Pricing order (server): list price → better of campaign or welcome offer → coupon → floor at minimum price → points (max 80% of each digital line after discounts, never below minimum) → add print and delivery charges.
- **P1-CHK-06:** Points can **not** be used on print or delivery charges (they are real costs).
- **P1-CHK-07:** Place order creates `AWAITING_TRANSFER` with a full price snapshot and an idempotency key. Points used are **held**.
- **P1-CHK-08:** Total updates live when the customer switches format, changes delivery area, moves the points slider or applies a coupon.
- **P1-CHK-09:** Clear empty, error and loading states; double-click safe.

---

## 10. Printed delivery **NEW**

### 10.1 Owner setup
- **P1-PRN-01:** Per resource, the owner can switch **Print available** on and set:
  - print price (fixed MVR per copy) **or** auto price from page count using the print rate table,
  - print options offered: colour or black & white; binding (none / stapled / spiral); paper (standard / card),
  - quantity limit per order (default 30, for class sets),
  - production time in working days (default 2).

  Print rate table (Settings → Printing), all editable:

  | Item | Default |
  |---|---|
  | B&W per page | MVR 1.00 |
  | Colour per page | MVR 3.00 |
  | Card paper surcharge per page | MVR 1.00 |
  | Stapled | MVR 5.00 |
  | Spiral binding | MVR 25.00 |
  | Minimum print charge per copy | MVR 20.00 |

  Delivery zones (Settings → Delivery), all editable:

  | Zone | Default fee | Estimated time |
  |---|---|---|
  | Pick up (owner's address) | MVR 0 | When ready |
  | Malé, Villimalé | MVR 30 | 1–2 days after printing |
  | Hulhumalé | MVR 40 | 1–2 days |
  | Greater Malé islands (Thilafushi, Gulhifalhu) | MVR 60 | 2–3 days |
  | Other atolls (by ferry/cargo; customer collects at harbour) | MVR 100 | 3–7 days |

  Free-delivery threshold (optional), e.g. free Malé delivery over MVR 500.

### 10.2 Customer experience
- **P1-PRN-02:** Product page buy box shows a format switch when print is available: *Digital* / *Digital + printed copy*. Choosing print reveals options (colour, binding, quantity) and shows **"Printed copy: + MVR X per copy · delivery from MVR Y"** before adding to cart.
- **P1-PRN-03:** Checkout shows a **Delivery details** block: recipient name, phone (+960 format), zone (dropdown), island, address/house name, delivery notes, or Pick up. The fee and estimated date appear immediately.
- **P1-PRN-04:** Printed orders always include the digital download. Digital access unlocks on payment approval; the printed copy follows.
- **P1-PRN-05:** Order summary shows separate lines: *Resources*, *Discounts*, *Points*, *Printing (n copies)*, *Delivery (zone)*, *Total*. The bank transfer amount is the full total.
- **P1-PRN-07:** Order page shows a second tracker for print: *Paid → Printing → Ready / Out for delivery → Delivered / Collected*, with the estimated date and any tracking note.

### 10.3 Owner fulfilment
- **P1-PRN-06:** New backend page **Print orders** lists paid orders with printed items, filtered by status and zone, with a badge in the sidebar.
- **P1-PRN-08:** Actions: download a **print pack** (merged print-ready PDF without watermark, with a cover slip showing order number, recipient, phone, address, options and quantity), mark Printing, mark Ready / Out for delivery (optional tracking note), mark Delivered / Collected. Each change emails the customer (templates in 13.3).
- **P1-PRN-09:** Delivery sticker / packing slip PDF (A6) per order.
- **P1-PRN-10:** Cancel print part only: refunds the print and delivery amount, keeps the digital purchase.
- **P1-PRN-11:** Address and phone are personal data: visible only to admins, deleted on account deletion except where kept for accounting.

---

## 11. Bank transfer payment and email approval

### 11.1 Customer side
- **P1-PAY-01:** Order page shows bank name, account name, account number, exact amount and reference (= order number) with copy buttons.
- **P1-PAY-02:** Slip upload: camera on mobile, JPG/PNG/HEIC/PDF, max 10 MB; optional transfer reference and date.
- **P1-PAY-03:** Upload → `AWAITING_VERIFICATION`, customer email "We received your slip", owner approval email, page polls for status.
- **P1-PAY-04:** No slip within 48 hours (configurable) → `EXPIRED`, held points and coupon use released. One reminder email at 24 hours.
- **P1-PAY-05:** Rejected slips show the reason and allow re-upload.

### 11.2 Owner side
- **P1-APR-01:** Owner email: order number, customer, items (including print and delivery lines), expected amount, slip amount entered, reference, slip inline and attached, duplicate/mismatch warnings, large **APPROVE** and **REJECT** buttons.
- **P1-APR-02:** Buttons open `/approvals/[token]`: signed, single-use, hashed in DB, tied to payment and action, expires in 7 days.
- **P1-APR-03:** Opening a link changes nothing (email scanners pre-open links). The page shows the order and slip and a **Confirm** button (POST + CSRF). Reject requires a reason (preset list + note).
- **P1-APR-04:** If not signed in as admin, the owner signs in with Google first, then returns to the confirm page.
- **P1-APR-05:** Approve → `PAID`, entitlements granted, held points spent, earned points pending, referral rewards, welcome offer marked used, print items moved to **Print queue**, customer email.
- **P1-APR-06:** Approvals queue in backend with the same actions, "≠ amount mismatch", "⚠️ possible duplicate slip" (SHA-256 + perceptual hash + reference), waiting-time badge. Owner reminder email for slips waiting more than 12 hours.
- **P1-ORD-01:** Orders list with status chips, search, CSV export, timeline per order, resend payment instructions, mark as paid (cash/other, with confirmation), refund (removes access, reverses earned points, returns used points), expire overdue.

### 11.3 Order states

```
Digital:  AWAITING_TRANSFER → AWAITING_VERIFICATION → PAID
                          ↘ EXPIRED / CANCELLED      ↘ PAYMENT_REJECTED → AWAITING_VERIFICATION
          COMPLETED_FREE (terminal)                   PAID → REFUNDED

Print (per order, starts when PAID):
          PRINT_QUEUED → PRINTING → READY_FOR_PICKUP | OUT_FOR_DELIVERY → DELIVERED | COLLECTED
                                  ↘ PRINT_CANCELLED (print + delivery refunded)
```

All transitions go through one service and write `order_events` and `audit_logs`.

---

## 12. Delivery of digital files

- **P1-DL-01:** Downloads use signed URLs valid for 5 minutes, issued only after an entitlement check.
- **P1-DL-02:** PDFs are stamped at download time with "Licensed to {name} · {email} · {order}" (`pdf-lib`). DOCX/PPTX get the licence in document properties. EPUB gets a licence page. Every download is logged.
- **P1-DL-03:** My Library: all owned items, a download button per file, version badge, order history, print status for printed orders.
- **P1-DL-04:** Alert the owner if one account downloads from many IP addresses in a short time.

---

## 13. Email list, registration offers and automation

### 13.1 Email list management
- **P1-LST-01:** Contacts = customers (signed in with Google) + **subscribers** (email only, from the landing-page signup block, checkout consent or CSV import). **NEW**
- **P1-LST-02:** Subscribers tab: email, name (optional), source, consent status and date, tags, last opened, unsubscribed date. Double opt-in for landing-page signups (confirmation email).
- **P1-LST-03:** Consent is stored per contact with source, timestamp and IP. Marketing email only goes to `consent = true` and not unsubscribed, not bounced, not blocked.
- **P1-LST-04:** Segments: built-in (all with consent, signed up never purchased, has 200+ points, top buyers, inactive 60+ days, by subject purchased, by grade interest, printed-copy buyers) plus custom segments from simple rules (tag, subject bought, joined between, spent over, points over).
- **P1-LST-05:** Import CSV (email, name, tags, consent source) with duplicate merge and a confirmation that consent was obtained. Export CSV (formula-safe).
- **P1-LST-06:** Customer detail as in the prototype: tags, notes, points adjust with reason, grant resource, block, orders, library, points history, **email activity** (sent, opened, clicked).
- **P1-LST-07:** Preference centre for customers: offers on/off, newsletter on/off, subject interests, grade interests, birthday (day and month, optional). Every marketing email links to it plus one-click unsubscribe (`List-Unsubscribe` header).

### 13.2 Offer automation (journeys) **NEW**

Owner screen **Automations** shows each journey as a card with on/off switch, steps, delay, template link and stats (entered, sent, converted).

| ID | Journey | Trigger | Steps (defaults, all editable) | Stops when |
|---|---|---|---|---|
| P1-AUT-01 | Welcome | First sign-in | Day 0: welcome + 20% first-order offer (7 days) + 50 points. Day 3: "Your offer is waiting" with 3 picks for their subject interest. Day 6: "Offer ends tomorrow" | First paid order or offer expired |
| P1-AUT-02 | Subscriber welcome | Confirmed email-only subscriber | Day 0: welcome + free resource link (sign in to claim) + mention of the welcome offer they get when they sign up | Signs in |
| P1-AUT-03 | Abandoned cart | Cart with items, no order in 4 hours (signed-in) | Hour 4: "You left something" with cart items. Hour 24: reminder (optionally adds a small coupon) | Order placed |
| P1-AUT-04 | Unpaid order | `AWAITING_TRANSFER` | Hour 24: payment instructions again | Slip uploaded or expired |
| P1-AUT-05 | Post-purchase | Order `PAID` | Day 3: "How did it go?" review request (+20 points). Day 7: related resources in same subject/grade | — |
| P1-AUT-06 | Free-to-paid | First free claim, no paid order | Day 2: best-selling paid resource in same subject with welcome offer reminder | Paid order |
| P1-AUT-07 | Win-back | No visit or order for 60 days | Day 0: "We miss you" + personal coupon (15%, 14 days). Day 10: reminder | Order or 2 sends |
| P1-AUT-08 | Points reminder | Balance ≥ 200 and no order for 30 days | "You have MVR X in points to spend" | Order |
| P1-AUT-15 | Birthday | Start of birthday window | Day 0: gift email (points + coupon). 3 days before expiry: reminder if unused | Coupon used or expired |
| P1-AUT-16 | Share nudge | 2 days after a paid order is approved | "Loved it? Share with a teacher friend and earn points" with personal share link | — |
| P1-AUT-17 | Complete your profile | 2 days after sign-up, profile incomplete | Day 2: "Earn up to 100 points" with missing items. Day 10: one reminder | Profile complete or 2 sends |
| P1-AUT-09 | New in your subject | Resource published in a subject the contact bought or follows | Weekly digest (max 1 per week) | — |

Rules:
- **P1-AUT-10:** Journeys respect consent. Transactional emails (receipts, slips, approvals, print status) always send; marketing journeys only with consent.
- **P1-AUT-11:** Frequency cap: max 1 marketing email per contact per day and 3 per week across journeys and newsletters (configurable).
- **P1-AUT-12:** Personal coupons are unique, single-use, expire automatically, and still respect minimum prices.
- **P1-AUT-13:** Journeys run in the worker every 15 minutes; each step is idempotent (stored as `journey_enrolments` and `journey_steps_sent`).
- **P1-AUT-14:** "Hooking" on-site elements (non-email): welcome banner with countdown, points pill in header, "You'll earn X points" in cart, share & earn button, lock card on preview, "New this week" section, exit-intent mailing-list signup on landing page (SHOULD, max once per 7 days).

### 13.3 Transactional email templates
Editable subject and body with placeholders, as in the backend **Emails** screen: welcome, **birthday gift, birthday reminder, friend joined from your link, referral reward earned, points expiring**, slip received, payment approved, payment rejected, owner approval, resource updated, unpaid reminder, **print queued, printing, ready for pickup, out for delivery, delivered**, **subscriber confirm**, **newsletter footer**.

---

## 14. Newsletter management and dispatch **NEW**

- **P1-NWS-01:** Newsletters list: draft, scheduled, sending, sent; with recipients, opens, clicks, unsubscribes and orders attributed (7-day window).
- **P1-NWS-02:** Composer with blocks: heading, text (bold, italic, links, lists), image, button, **resource card** (pick a resource; pulls cover, title, live price), **resource grid** (2 or 3), campaign banner, divider, footer. Mobile and desktop preview. Brand colours locked to the design tokens.
- **P1-NWS-03:** Personalisation placeholders: `{name}`, `{points}`, `{points_value}`, `{referral_code}`, `{welcome_offer_end}`.
- **P1-NWS-04:** Audience: choose a segment; show live count of eligible recipients after consent, unsubscribes and bounces are removed.
- **P1-NWS-05:** Subject line, preview text, sender name. Send test to owner and admin emails.
- **P1-NWS-06:** Send now or schedule (Maldives time, UTC+5). Cancel before start.
- **P1-NWS-07:** Dispatch through the worker in batches (default 50 per minute, configurable to the provider limit), with retry and backoff. Hard bounces and complaints automatically stop future mail to that address.
- **P1-NWS-08:** Every newsletter has one-click unsubscribe, preference centre link and the store's postal address in the footer.
- **P1-NWS-09:** Basic tracking: open pixel and click redirect with signed links. Tracking can be switched off in Settings.
- **P1-NWS-10:** Duplicate a newsletter; save as template.
- **P1-NWS-11:** Campaign shortcut: from a campaign, "Email this campaign" pre-fills a newsletter with the banner and selected resources (replaces the prototype's simple "Email a group" box).
- **P1-NWS-12:** Sending domain set up with SPF, DKIM and DMARC before launch; marketing stream on a sub-domain (e.g. `news.lessonlagoon.mv`).

---

## 15. Campaigns, coupons, points, share & earn, birthday

All numbers in this section are **defaults**. Each one is editable in the Pricing & rules centre (Section 20).

### 15.1 Campaigns
- **P1-CMP-01:** Campaign: occasion preset (Teachers' Day, Independence Day, Ramazan, Back to school, Flash sale, Custom), name, discount %, scope (all or subject), points multiplier, start/end, banner text, colour. Start and end automatically.
- **P1-CMP-02:** Overlap warning; the bigger discount wins; never below minimum price. Duplicate to reuse next year.
- **P1-CMP-03:** Live campaign drives the announcement bar, campaign block, card badges and countdown.
### 15.2 Coupons
- **P1-CMP-04:** Coupons: code, % off **or fixed MVR off**, usage limit, per-customer limit, expiry, active switch, usage bar. **NEW option:** apply to print charges yes/no (default no).

### 15.3 Points (core – always on)

| Earn rule | Default | Available |
|---|---|---|
| Sign-up bonus | 50 points | Immediately |
| Purchase | 1 point per MVR 1 paid in cash (digital + print; not delivery) | After 7-day hold |
| Campaign multiplier | Set per campaign (e.g. 2×) | With purchase points |
| Approved review | 20 points | On approval |
| Share & earn | See 15.4 | See 15.4 |
| Referral code | See 15.5 | See 15.5 |
| Birthday bonus | 100 points | On birthday (see 15.6) |

| Spend rule | Default |
|---|---|
| Value | 10 points = MVR 1 |
| Max share of each digital item payable by points | 80% (customer always pays at least 20% in cash) |
| Minimum points per redemption | 100 points |
| Points on print and delivery charges | Cannot be spent |
| Points expiry | 12 months after last activity, with a 30-day warning email |

- **P1-PTS-01:** Points are a core feature in Phase 1, **not** behind a switch. The owner can change every value above and pause *earning* temporarily (e.g. for audit), but the balance, ledger and redemption always stay visible to customers.
- **P1-PTS-02:** Every change is an append-only `points_ledger` row (type, points, balance after, status: pending / available / held / spent / expired / reversed, source, expiry). Balances are reconciled nightly.
- **P1-PTS-03:** Checkout points slider (as in the prototype): shows available points and their MVR value, steps of 10, live total. The cap is the lower of 80% of each line after discounts or the line price minus its minimum price.
- **P1-PTS-04:** Points are **held** when an order is placed, **spent** on approval, **released** on rejection, expiry or cancellation. Concurrent redemptions are locked per customer.
- **P1-PTS-05:** Refunds reverse earned points and return spent points.
- **P1-PTS-06:** Customer **My Points** page (as in the prototype): balance, MVR value, pending, held, progress bar to the next reward, history, referral code, share buttons, birthday status.
- **P1-PTS-07:** Header points pill on every page; product page "Earn X points"; cart "You'll earn X points"; order page "X points added".
- **P1-PTS-08:** Owner can adjust points with a required reason (audited), and see points issued, redeemed, outstanding (and their MVR liability) on the dashboard.
- **P1-PTS-09 (SHOULD):** Rewards shelf: owner marks low-cost resources that can be fully paid with points (an exception to the 80% rule, chosen by the owner).

### 15.4 Share to a friend & earn (Phase 1 – MUST)

- **P1-SHR-01:** Every product page and Library item has **🔗 Share & earn**: WhatsApp, Viber, Facebook, Messenger, copy link, and the phone's native share sheet. Signed-in customers get a personal link `/r/{slug}?ref={code}`; guests are asked to sign in first so their shares count.
- **P1-SHR-02:** Shared links show a rich preview card (Open Graph image = watermarked cover, title, price).
- **P1-SHR-03:** When a friend opens the link, the referral is stored in a first-party cookie for 30 days (first touch wins) and the friend sees a banner: "{Sharer first name} shared this with you – sign up and get {friend reward} points".
- **P1-SHR-04:** Rewards (defaults):

  | Event by the friend | Sharer gets | Friend gets |
  |---|---|---|
  | Signs up with Google through the link | 10 points | 50 referral points (on top of the sign-up bonus), available after their first purchase |
  | Claims a free resource | 0 (sign-up reward already covers it) | — |
  | First paid order approved | 5% of the order's cash value in points + the referral reward in 15.5 | Welcome offer as usual |

- **P1-SHR-05:** Points are **never** given just for clicking Share. Only real new Google accounts count. Blocked: self-referral (same account, same device fingerprint or same IP within 24 hours), existing customers, more than the monthly cap (default 200 share points per sharer per month).
- **P1-SHR-06:** Each friend can be credited to one sharer only, and this can never change.
- **P1-SHR-07:** Sharer gets an email and on-site notice: "🎉 {friend first name} joined from your link – +10 points".
- **P1-SHR-08:** Owner analytics on the Points page: shares by channel, clicks, sign-ups, first orders, points paid, top sharers, top shared resources, blocked attempts.
- **P1-SHR-09:** Data: `share_links` (sharer, product, code), `share_events` (click, signup, first_order, blocked + reason), linked to `referrals` and `points_ledger`.

### 15.5 Referral code
- **P1-REF-01:** Each customer has a short code (e.g. `MARIYAM25`) on My Points, with invite link and WhatsApp button.
- **P1-REF-02:** A friend can enter the code at sign-up or checkout, or arrive by any `ref` link. One referrer per customer, permanent.
- **P1-REF-03:** Defaults: referrer **100 points** and friend **50 points**, both credited when the friend's first paid order is approved (7-day hold applies to the referrer).
- **P1-REF-04:** Leaderboard of top referrers in the backend (as in the prototype).

### 15.6 Birthday special **NEW**
- **P1-BDY-01:** Birthday is **optional** and collected as **day and month only** (no year) through the progressive profile (15.8, +10 points on first save). Customers can add it in My Account, or from a "🎂 Add your birthday and get a gift every year" card on My Points. Google sign-in does not share birthdays by default, so Phase 1 asks the customer directly.
- **P1-BDY-02:** The birthday can be changed once every 12 months, to stop people resetting it for extra rewards. A newly added birthday qualifies only if it was saved at least 30 days before the birthday (configurable).
- **P1-BDY-03:** Birthday reward (defaults, all configurable):
  - **100 bonus points**, available immediately,
  - a personal **25% off** single-use coupon (still respects minimum prices; not valid on print or delivery unless the owner switches that on),
  - valid **7 days before to 7 days after** the birthday (configurable window),
  - optional **free resource of the owner's choice** (off by default).
- **P1-BDY-04:** On the first day of the window (08:00 Maldives time) the system creates the coupon and points and shows a birthday banner on the site ("🎂 Happy birthday, {name}! Your gift is ready"). It sends the **birthday email** only to customers who agreed to marketing; everyone else still sees the on-site banner and the coupon on My Points.
- **P1-BDY-05:** One birthday reward per customer per calendar year. 29 February birthdays get the reward on 28 February in non-leap years.
- **P1-BDY-06:** Birthday journey in Automations (P1-AUT-15): day 0 gift email; 3 days before the coupon expires, a reminder if it hasn't been used.
- **P1-BDY-07:** Owner view: upcoming birthdays this month (count only on the dashboard; names visible in Customers), birthday coupons issued and used, revenue from birthday coupons.
- **P1-BDY-08:** Privacy: birthday is personal data, visible only to admins, removed on account deletion, and only used for the birthday reward.

### 15.7 Reviews
- **P1-REV-00 – Launch testimonials (seed data):** The store launches with these four individual testimonials, shown in the home page reviews section with **On home** switched on. Each one is a personal experience written in the first person, and none speaks for a school or group. They are stored as testimonials (`uid = null`), labelled "Testimonial" rather than "Verified purchase", and given no star rating. The owner can edit, hide or delete them like any other testimonial. They replace the school-level sample testimonial in the storefront prototype ("Our KG teachers use…").

  | Name shown | Linked resource type | Testimonial |
  |---|---|---|
  | Ahmed N. | Tutorial | "The short video tutorials explain one idea at a time, so I can pause, try it myself and carry on. I finally understood topics I had been avoiding for years." |
  | Aishath N. | Tutorial | "I watch a tutorial in the evening and I'm ready the next morning. The step-by-step examples and the handout make it easy to follow, even when I'm short on time." |
  | Mariyam S. | Tutorial | "What I like most is that I can learn at my own pace. I go back to the same tutorial whenever I need a reminder, and it's always there in my Library." |
  | Mohamed R. | Tutorial | "Clear, practical and straight to the point. Each tutorial gives me something I can use the same day, and the worked examples answered the questions I usually get stuck on." |

  Display rules: first name and last initial only; no photos (initials avatar, as in the prototype); no school, island or job title. On the product page, show each testimonial only on the resource it's linked to; until those tutorials are published, show them on the home page only.

- **P1-REV-01 – Who can review:** only customers who own the resource (free claim or approved paid order), one review per customer per resource, editable by them. Reviews are labelled **✓ Verified purchase** (paid) or **✓ Verified download** (free). Testimonials (P1-REV-00) are labelled "Testimonial" and never count toward star averages.
- **P1-REV-02 – What a review contains:** 1–5 stars (required), title (optional, 80 chars), text (20–1,000 chars), up to 3 photos of the resource in use (optional; auto-resized, location data removed; photos showing children's faces are held for moderation), and quick tags: *Easy to use*, *Saved me time*, *Students loved it*, *Good value*, *Well explained*.
- **P1-REV-03 – When customers are asked:** "Rate this" stars in the Library after the first download; post-purchase email (P1-AUT-05) on day 3 with one-tap stars that open the review form pre-filled; one reminder on day 10 if not reviewed. Max one request sequence per resource.
- **P1-REV-04 – Reward:** 20 points when a review is **approved** (+10 extra with a photo). Points never depend on the star rating, and the form says so.
- **P1-REV-05 – Product page display:** average and count next to the title (★ 4.8 · 38 reviews); rating breakdown bars (5★ to 1★, clickable filters); most-mentioned quick tags; sort (most helpful, newest, highest, lowest); filters (with photos, verified purchase); "Was this helpful? 👍" votes; owner reply shown under the review.
- **P1-REV-06 – Display elsewhere:** stars and count on every product card; rating filter and "Top rated" sort in the catalogue; home-page carousel of featured reviews; `aggregateRating` in Product JSON-LD for Google rich results (verified reviews only).
- **P1-REV-07 – Moderation:** Reviews page with tabs Pending / Approved / Hidden / Reported. Optional auto-approve for 4–5★ text-only reviews without links (default off). Automatic hold for links, phone numbers, offensive words or photos. Actions: approve, hide (reason sent to reviewer), reply publicly, feature on home, mark abusive. Negative reviews must **not** be hidden just for being negative.
- **P1-REV-08 – Reporting:** customers can report a review (spam, offensive, not about this resource); 3 reports send it back to Pending.
- **P1-REV-09 – Insights:** dashboard shows average rating per resource, new reviews this week, resources rated below 3.5 (needs attention) and review rate (reviews ÷ owners).
- **P1-REV-10 – Data:** `reviews` (product_id, user_id, rating, title, text, tags[], status, verified_type, helpful_count, report_count, owner_reply, replied_at, points_ledger_id), `review_photos`, `review_votes` (unique user + review), `review_reports`. `products.rating_avg` and `rating_count` recalculate on approve/hide.

---

### 15.8 Progressive profile – earn points for completing your profile **NEW**

Customers sign up in one tap with Google. Afterwards they are invited, a little at a time, to add more details, and they earn points the first time they save each one.

- **P1-PRF-01 – Profile items and rewards (defaults, all configurable):**

  | Item | What is asked | Reward on first save |
  |---|---|---|
  | Role | Teacher / Parent / Student / Tutor / Other | 10 points |
  | Subjects I teach or learn | Pick from the subject list (multi) | 10 points |
  | Grades | Pick grades (multi) | 10 points |
  | Curriculum | National / Cambridge / Other | 10 points |
  | Island / atoll | Dropdown | 10 points |
  | Mobile number | +960 format (used for print delivery and order updates) | 10 points |
  | Birthday | Day and month only (see 15.6) | 10 points |
  | Preferred language | English / Dhivehi / Arabic | 10 points |

  Optional **"Profile complete" bonus**: extra 20 points when all items are saved (default ON).

- **P1-PRF-02 – When points are given:** points are added **only when the item is saved with a valid value**, and **once per item per customer, ever**. Editing, clearing and re-saving never earns again. Points are available immediately (no hold) and recorded in the ledger as "Profile: {item}".
- **P1-PRF-03 – Where customers are asked (progressive, never blocking):**
  - **Profile progress card** on My Points and My Account: progress bar ("Profile 3/8 complete – earn 50 more points"), each missing item as a one-tap chip.
  - **One-question prompts** at natural moments, max one per visit and one per 3 days: after first free claim (subjects), after first purchase (grades), at checkout when print is chosen (mobile, island), in the welcome email day 3 (birthday).
  - Inline in the progress card: answer, tap **Save**, toast "✅ Saved · +10 points", balance updates live.
  - Every prompt has **Skip** and **Don't ask again**.
- **P1-PRF-04 – Use of the data:** subjects, grades and curriculum personalise the home page ("Recommended for you"), newsletters and the "New in your subject" journey; island pre-fills delivery; birthday drives 15.6. The prompt explains why each item is asked.
- **P1-PRF-05 – Abuse protection:** values are validated (real dropdown values, valid +960 mobile); mobile must be unique per account to earn the reward; owner can reverse profile points if data is clearly fake.
- **P1-PRF-06 – Owner view:** Customers table shows a profile-completion % column and filter; dashboard shows average completion and points paid for profile items. All rewards, items on/off and prompt frequency are in the Pricing & rules centre.
- **P1-PRF-07 – Automation:** journey P1-AUT-17 "Complete your profile" – day 2 after sign-up, email (with consent) or on-site banner: "Earn up to 100 points by completing your profile"; stops when complete.

---

### 15.9 "Customers who bought this also bought" recommender **NEW**

- **P1-REC-01 – Where it shows:**

  | Place | Widget | Items |
  |---|---|---|
  | Product page (below buy box and reviews) | **Customers who bought this also bought** | up to 8 |
  | Cart drawer and checkout | **Often bought together** with one-tap "Add" | 3 |
  | Order page after approval and "Downloads ready" email | **You may also like** | 4 |
  | My Library | **Based on your Library** | 6 |
  | Home page (signed in) | **Recommended for you** | 8 |
  | Post-purchase email (P1-AUT-05 day 7) and newsletter resource grid | Auto-filled by the same engine | 3–6 |

- **P1-REC-02 – Algorithm (item-to-item co-purchase):**
  1. **Signals:** approved paid orders and free claims in the last 365 days. Each customer's owned resources form a "basket". Paid = weight 1.0, free claim = 0.5, bought in the same order = +0.5.
  2. **Co-occurrence:** for every pair A, B, add up the weights of customers who own both.
  3. **Score** (normalised so best-sellers don't appear everywhere):

     $$\text{score}(A,B)=\frac{\text{co}(A,B)}{\sqrt{n(A)\cdot n(B)}}\times\text{recency}$$

     where $n(X)$ is the weighted number of customers owning X, and purchases in the last 90 days count 1.5×.
  4. **Minimum support:** a pair is shown only if at least 3 different customers own both, so no single person's purchases can be inferred.
  5. **Re-ranking:** remove items the viewer owns, unpublished items and the item itself; +10% for same subject or grade; +5% for rating ≥ 4.5; no more than 2 items in a row from the same subject; owner-pinned items first.
  6. **Fallback** (new resource or too little data), in order: owner's pinned related items → same subject and grade sorted by rating × sales → best sellers in the viewer's profile subjects (15.8) → overall best sellers.
- **P1-REC-03 – Recommended for you:** add up scores of items related to everything the customer owns, add their profile interests (subjects, grades, curriculum), remove owned items, then apply the same re-ranking.
- **P1-REC-04 – Computation:** worker job `build-recommendations` stores the top 20 related items per resource in `product_similarities`; full rebuild nightly, incremental update within 15 minutes of an approved order; cached per resource. SQL + TypeScript only; no external AI/ML service needed at this size.
- **P1-REC-05 – Owner controls:** in the resource editor, pin up to 4 related items and block unwanted pairs, with a preview of what customers see and why ("bought together by 12 customers"). In the Pricing & rules centre: widgets on/off, minimum support, look-back days, recency weight, item counts.
- **P1-REC-06 – Bundle suggestion (SHOULD):** when two items are bought together by 10+ customers, suggest "Create a bundle?" with a suggested price.
- **P1-REC-07 – Measurement:** impressions, clicks, add-to-cart and purchases from each widget (`recommendation_events`); dashboard shows click-through rate and revenue from recommendations (paid within 7 days of the click).
- **P1-REC-08 – Privacy:** only aggregate data is used; no names or individual purchases are ever shown.

### 15.10 Request a resource **NEW**

Anyone can ask the owner for a resource that isn't in the store yet. The only required field is an email address, protected by our own slider CAPTCHA.

- **P1-RQR-01 – Where the form appears:** a "Can't find it? Request a resource" link on the search page when there are no results, below the All resources grid, in the footer, and on the landing page as an optional section. Route: `/request`. Also opens as a modal.
- **P1-RQR-02 – Fields:**

  | Field | Required | Notes |
  |---|---|---|
  | Email | **Yes** | Pre-filled and locked if signed in |
  | What do you need? | No | Free text, 500 chars (e.g. "Grade 5 Dhivehi reading comprehension") |
  | Subject, Grade, Type | No | Dropdowns from the catalogue lists |
  | Notify me by email when it's ready | Ticked by default | Transactional notice about this request only |
  | Email me offers and new resources | **Unticked** | Marketing consent, same rules as P1-LST-03 |
  | Slider CAPTCHA | **Yes** | See P1-RQR-04 |

  The form is designed for one email and one slide; everything else is optional.
- **P1-RQR-03 – After submitting:** the person sees "Thanks! We'll email you when it's ready". The system sends a confirmation email with a link to confirm the address (requests from unconfirmed addresses stay in *Unverified*), notifies the owner, and creates or updates the contact in the email list with source `resource_request`. Signed-in users skip email confirmation.
- **P1-RQR-04 – Our own slider CAPTCHA (no third-party service):**
  - **The slider is already implemented in Hub.** Reuse that component and its server verification; don't build a new one.
  - The user drags a puzzle piece or handle to the target position shown in an image.
  - The server issues a one-time challenge (random target position, signed token, 2-minute expiry), checks the final position within tolerance, and checks that the drag looks human (movement path, timing not instant or perfectly linear).
  - The token is single-use and tied to this form submission.
  - Accessibility: a keyboard-operable alternative (arrow keys move the handle) and an "audio/email check" fallback where the person confirms via the emailed link instead.
  - Extra hidden checks layered with the slider: a hidden honeypot field, a minimum time on the form (3 seconds), and rate limits (5 requests per email per day, 10 per IP per hour).
  - A failed slider gives a fresh challenge; after 5 failures from one IP, block for 15 minutes.
- **P1-RQR-05 – Owner side (`/admin/requests`):** a list with status (*New*, *Unverified*, *Planned*, *In progress*, *Published*, *Declined*), the request text, subject, grade, type and email. **Similar requests are grouped** (same subject + grade + type, or similar wording) and show a "requested by N people" count, so the owner can see demand. Actions: change status, add a private note, merge duplicates, decline with a polite reply, and **link a published resource**.
- **P1-RQR-06 – "It's ready" notice:** when the owner links a published resource and marks the request *Published*, every requester who ticked "Notify me" gets an email with the resource link. If the owner switches on the optional **requester reward**, signed-in requesters also get 10 points or a 10% coupon for that resource (default off).
- **P1-RQR-07 – Dashboard:** "Needs your attention" shows new requests, and the dashboard shows the top 5 most-requested topics.
- **P1-RQR-08 – Privacy:** request emails are used only for this request unless marketing consent was ticked. Unverified requests and their emails are deleted after 30 days.
- **P1-RQR-09 – Data:** `resource_requests` (id, contact_id, user_id nullable, email, text, subject_id, grade_id, type, notify, status, group_id, linked_product_id, note, verified_at, ip_hash, created_at), `request_groups` (id, label, count), `captcha_challenges` (as defined in Hub's slider implementation).

---

## 16. Owner dashboard

- **P1-ADM-01:** "Needs your attention" list (from the prototype) extended with: **print orders to produce**, **print orders waiting > 2 days**, **newsletter scheduled today**, **automations paused due to errors**, **bounced emails**. KPIs: pending approvals, paid revenue, customers, **subscribers**, live resources, points outstanding, **print revenue**, **average rating and new reviews**, **revenue from recommendations**.

---

## 17. Data model (Phase 1)

Existing (from MVP design): `users`, `accounts`, `sessions`, `categories` (subjects), `grades`, `curricula`, `products`, `product_versions`, `product_files`, `preview_pages`, `reviews`, `landing_sections`, `landing_versions`, `carts`, `cart_items`, `orders`, `order_items`, `order_events`, `payments`, `payment_slips`, `approval_tokens`, `entitlements`, `downloads`, `coupons`, `coupon_redemptions`, `campaigns`, `campaign_products`, `customer_offers`, `points_ledger`, `points_holds`, `referrals`, `share_events`, `customer_notes`, `customer_tags`, `email_templates`, `email_logs`, `audit_logs`, `settings`.

**NEW tables**

| Table | Key columns |
|---|---|
| `product_print_options` | product_id, enabled, pricing_mode (fixed/auto), fixed_price, allow_colour, allow_bw, bindings[], papers[], max_qty, production_days |
| `print_rates` | key (bw_page, colour_page, card_page, staple, spiral, min_copy), amount |
| `delivery_zones` | id, name, fee, eta_text, active, sort, free_over (nullable) |
| `order_print_items` | order_item_id, colour, binding, paper, qty, unit_price, line_total |
| `order_deliveries` | order_id, zone_id, fee, recipient, phone, island, address, notes, pickup (bool), status, tracking_note, status_history jsonb |
| `contacts` | id, email (unique, lower), name, user_id (nullable), source, consent, consent_at, consent_ip, double_opt_in_at, unsubscribed_at, bounced_at, complained_at, interests jsonb |
| `segments` | id, name, rules jsonb, built_in |
| `journeys` | key, enabled, config jsonb |
| `journey_enrolments` | journey_key, contact_id, entered_at, exited_at, exit_reason |
| `journey_steps_sent` | enrolment_id, step, sent_at, email_log_id (unique enrolment+step) |
| `newsletters` | id, subject, preview_text, blocks jsonb, segment_id, status, scheduled_at, sent_at, stats jsonb |
| `newsletter_recipients` | newsletter_id, contact_id, status, sent_at, opened_at, clicked_at, error |
| `email_events` | email_log_id, type (delivered/open/click/bounce/complaint/unsubscribe), at, meta |
| `pricing_settings` | key, value jsonb, default_value jsonb, effective_from, updated_by |
| `pricing_settings_history` | key, old_value, new_value, changed_by, changed_at, scheduled_for |
| `share_links` | id, sharer_id, product_id (nullable for general invite), code, channel, created_at |
| `product_similarities` | product_id, related_id, score, support, source (copurchase/manual/fallback), updated_at |
| `related_pins` | product_id, related_id, pinned/blocked, sort |
| `recommendation_events` | widget, product_id, viewer_id, item_id, type (impression/click/add/purchase), at |
| `review_photos`, `review_votes`, `review_reports` | see P1-REV-10 |
| `resource_requests`, `request_groups`, `captcha_challenges` | see P1-RQR-09 |
| `profile_fields` | key, label, type, options jsonb, enabled, reward_points, sort |
| `user_profile_values` | user_id, field_key, value jsonb, first_saved_at, rewarded (bool), updated_at (unique user_id + field_key) |
| `profile_prompts` | user_id, field_key, shown_at, action (saved/skipped/never) |
| `birthday_rewards` | user_id, year, points_ledger_id, coupon_id, window_start, window_end, status (unique user_id + year) |

Columns added to `users`: `birth_day` (1–31, nullable), `birth_month` (1–12, nullable), `birthday_set_at`, `birthday_changed_at`.

Constraints: money as bigint laari; `min_price > 0 AND min_price <= price` for paid; unique entitlement per user/product; unique `contacts.email`; append-only `points_ledger`, `order_events`, `audit_logs`; one active print delivery per order.

---

## 18. Background jobs

| Job | Schedule / trigger |
|---|---|
| `process-upload` (scan, convert, render, watermark, cover) | On upload |
| `restamp-previews` | On watermark change |
| `send-email` (transactional) | On event, retries ×5 |
| `newsletter-dispatch` | Scheduled time, batched |
| `journeys-tick` | Every 15 min |
| `campaign-switch` | Every 5 min |
| `birthday-rewards` (create points + coupon, start journey) | Daily 08:00 MVT |
| `build-recommendations` | Nightly full rebuild; incremental within 15 min of an approved order |
| `request-cleanup` (delete unverified requests after 30 days) | Daily |
| `review-requests`, `rating-recalc` | On download/approval; on review approve/hide |
| `apply-scheduled-pricing` | Every 5 min |
| `share-attribution` (credit sharer on friend sign-up / first order, apply caps and fraud checks) | On event |
| `expire-unpaid-orders` + 24h reminder | Every 15 min |
| `owner-slip-reminder` | Hourly |
| `release-pending-points`, `expire-points` | Daily |
| `print-overdue-alert` | Daily |
| `provider-webhooks` (bounce, complaint, delivery) | On webhook, signature verified |
| `backup` | Daily DB dump + storage sync, 30-day retention |

---

## 19. Security and privacy essentials

- **P1-SEC-01:** Deny-by-default authorisation on every page, route and action. Customers only see their own orders, slips, addresses, points and library (owner-scoped queries, 404 otherwise).
- **P1-SEC-02:** Zod validation on all input; no mass assignment of role, price, points, status or delivery fee.
- **P1-SEC-03:** Security headers: nonce-based CSP, HSTS, `nosniff`, `frame-ancestors 'none'`, `no-store` on account/admin/approval pages.
- **P1-SEC-04:** Upload safety: magic-byte check, ClamAV, quarantine, size limits, no SVG/HTML uploads, conversion sandbox without network.
- **P1-SEC-05:** Rate limits: sign-in, free claims, slip uploads, coupon attempts, newsletter signup, approval page, share attribution.
- **P1-SEC-06:** Audit log of every admin action (as in the prototype), read-only in the UI.
- **P1-SEC-07:** Secrets only in environment variables; bank account number and delivery addresses encrypted at rest.
- **P1-SEC-08:** Privacy: privacy notice, consent records, data export and account deletion on request (print addresses anonymised after 12 months).

---

## 20. Pricing & rules centre and Settings

### 20.1 Pricing & rules centre **NEW** (`/admin/pricing`)

- **P1-PRC-01:** **Every** price, fee, discount, points value and reward in the system is edited on this one page. Nothing is hard-coded. On first install the page is pre-filled with the defaults below.
- **P1-PRC-02:** The page is grouped in tabs that match the tables below. Each field shows its default, a short help line, and a **"Reset to default"** link.
- **P1-PRC-03:** A **live example box** on each tab recalculates as you type. For example: "MVR 100 resource in a 15% campaign, with coupon TEACH10 and maximum points → customer pays MVR 20.00 cash, uses 520 points, earns 20 points".
- **P1-PRC-04:** Validation stops unsafe values: points cap 0–100%, discounts 0–90%, fees ≥ 0, minimum price % 1–100, and point value > 0. A warning appears if a change would let any resource sell below its minimum price.
- **P1-PRC-05:** Changes can be **saved now** or **scheduled** for a date and time. Every change is versioned in `pricing_settings_history` (who, when, old value, new value) and shown in the audit log. Previous versions can be restored.
- **P1-PRC-06:** Orders keep the prices that applied when they were placed (price snapshot). Changes never alter existing orders, held points or issued coupons.
- **P1-PRC-07:** Per-resource prices (price, minimum price, print price override) stay on the resource and in the Resources table with inline editing and bulk "set price"; this page sets the **defaults** used for new uploads.

**Default values (initial install)**

| Tab | Setting | Default |
|---|---|---|
| Resource defaults | Default price for new uploads | MVR 50 |
| | Default minimum price | 20% of price |
| | Default preview pages | 3 |
| | Free claims per customer per day | 20 |
| Points – value | Points per MVR 1 of discount | 10 points = MVR 1 |
| | Max % of each digital item payable with points | 80% |
| | Minimum points per redemption | 100 |
| | Points expiry (inactivity) | 12 months |
| Points – earning | Sign-up bonus | 50 |
| | Points per MVR 1 paid | 1 |
| | Earn on print charges | Yes |
| | Approved review | 20 |
| | Hold before purchase points are usable | 7 days |
| Reviews | Points per approved review | 20 (+10 with photo) |
| | Auto-approve 4–5★ text-only | Off |
| Recommendations | Minimum customers per pair | 3 |
| | Look-back period | 365 days |
| | Recent weighting (last 90 days) | 1.5× |
| | Items: product page / cart / Library / home | 8 / 3 / 6 / 8 |
| Resource requests | Requester reward when published | Off (if on: 10 points or 10% coupon) |
| | Limits | 5 per email per day, 10 per IP per hour |
| Profile rewards | Points per profile item (first save only) | 10 |
| | Profile-complete bonus | 20 |
| | Items enabled | Role, subjects, grades, curriculum, island, mobile, birthday, language |
| | Max prompts | 1 per visit, 1 per 3 days |
| Share & earn | Sharer reward per new sign-up | 10 points |
| | Sharer reward on friend's first paid order | 5% of cash value |
| | Monthly share points cap per sharer | 200 |
| | Referral cookie duration | 30 days |
| Referral code | Referrer reward | 100 points |
| | Friend reward | 50 points |
| Welcome offer | Enabled | Yes |
| | Discount | 20% off first paid order |
| | Valid for | 7 days |
| Birthday special | Enabled | Yes |
| | Bonus points | 100 |
| | Birthday coupon | 25% off, single use |
| | Window | 7 days before to 7 days after |
| | Must be saved at least | 30 days before birthday |
| | Coupon valid on print/delivery | No |
| | Free gift resource | None |
| Automation offers | Win-back coupon | 15% off, 14 days |
| | Abandoned-cart coupon on 2nd reminder | Off (if on: 5%) |
| Printing | B&W per page | MVR 1.00 |
| | Colour per page | MVR 3.00 |
| | Card paper surcharge per page | MVR 1.00 |
| | Stapled | MVR 5.00 |
| | Spiral binding | MVR 25.00 |
| | Minimum print charge per copy | MVR 20.00 |
| | Max copies per order | 30 |
| | Production time | 2 working days |
| Delivery | Pick up | MVR 0 |
| | Malé, Villimalé | MVR 30 |
| | Hulhumalé | MVR 40 |
| | Greater Malé islands | MVR 60 |
| | Other atolls (collect at harbour) | MVR 100 |
| | Free delivery over | Off (if on: MVR 500, Malé only) |
| Payments | Bank transfer window | 48 hours |
| | Unpaid reminder after | 24 hours |
| | Tax (GST) | Off, 0% |

### 20.2 Settings (`/admin/settings`)
Store profile; licence text; uploads (watermark text, max size); bank account (with re-confirm); **email (sender name, reply-to, tracking on/off, frequency caps, postal address)**; Google sign-in; admin allowlist. All money and reward values live in the Pricing & rules centre, not here.

---

## 21. Build phases

| Step | Deliverable | Done when |
|---|---|---|
| 1 | Foundation: repo, Docker Compose (app, worker, Postgres, MinIO, Mailpit, ClamAV, LibreOffice/Gotenberg), Prisma schema, CI, security headers | App runs over HTTPS on staging; CI green |
| 2 | Google auth, roles, admin allowlist, contacts table | Only allowlisted admins reach `/admin` |
| 3 | Catalogue, subjects/grades, upload queue, preview pipeline (PDF, DOCX, PPTX), resource editor, versions | PDF, DOCX, PPTX each give correct watermarked previews; originals unreachable |
| 4 | Landing page + editor with draft/publish/rollback, interactive background | Lighthouse mobile ≥ 90; every section editable |
| 5 | Free claim, Library, signed and stamped downloads | Free claim to download in ≤ 2 taps |
| 6 | Cart, pricing service, checkout, bank transfer, slip upload, email approval, approvals queue, orders | Full slip → email approve → download works from a phone |
| 7 | **Printed delivery**: print options, rate table, zones, checkout delivery block, print queue, print pack PDF, status emails | Printed order shows correct costs, is paid, printed and marked delivered with emails at each step |
| 8 | **Pricing & rules centre**, campaigns, coupons, **points (core)**, **share & earn**, referral codes, **birthday special**, reviews | Every value in 20.1 editable and versioned; property tests pass; 80% cap and minimum price hold; share fraud checks block self-referral |
| 8b | **Reviews (full)** and **"also bought" recommender** | Verified reviews with photos, votes, replies and moderation; recommendations on product, cart, order, Library, home and emails, with fallbacks |
| 9 | **Email list, preference centre, automations** | Welcome and abandoned-cart journeys fire once, respect consent and caps |
| 10 | **Newsletters** composer, segments, scheduling, dispatch, tracking, bounces | 1,000-recipient test send completes within limits; unsubscribe works in one click |
| 11 | eBook (PDF/EPUB) and tutorial (MP4/link) types | Each type previews and delivers correctly |
| 12 | Hardening and launch | Checklist in 22 complete |

---

## 22. Acceptance checklist (go-live)

- [ ] Every screen in Section 3 matches its prototype on desktop and at 360px width.
- [ ] Upload 10 mixed files at once; all get auto-filled details and watermarked previews; duplicates flagged.
- [ ] A real slip is approved from the owner's phone through the email link; double-clicking approve grants once.
- [ ] Free claim, paid digital and paid digital + print orders all complete end to end.
- [ ] Printed order: costs shown on product page and checkout match the rate table and zone; points never reduce print or delivery; status emails sent at each step.
- [ ] New sign-up receives the welcome email, sees the welcome banner, and gets day 3 and day 6 reminders only if they haven't bought.
- [ ] Abandoned cart email sends once at 4 hours and stops after an order.
- [ ] Newsletter sent to a segment excludes non-consented, unsubscribed and bounced contacts; one-click unsubscribe works.
- [ ] Points: sign-up, purchase, review, birthday, share and referral earning; redeem with 80% cap; hold/release; refund reversal all correct in the ledger.
- [ ] Share & earn: a friend signing up through a WhatsApp-shared link credits the sharer once; clicking share alone gives nothing; self-referral is blocked; monthly cap works.
- [ ] Reviews: only owners can review; stars, breakdown, photos, helpful votes, owner reply and moderation work; points given on approval regardless of rating; cards show averages.
- [ ] Recommender: with seeded orders the product page shows sensible "also bought" items, never owned items, never pairs with fewer than 3 customers; new resources show fallbacks; pins and blocks work.
- [ ] Request a resource: a guest can submit with only an email after passing the Hub slider CAPTCHA; bots without a valid slider token, filling the honeypot or submitting too fast are rejected; similar requests group with a count; linking a published resource emails all "Notify me" requesters.
- [ ] Progressive profile: Google sign-up needs no extra fields; saving each profile item gives +10 points once; re-saving gives nothing; completing all gives the bonus; prompts respect Skip and frequency limits.
- [ ] Birthday: a customer with a birthday in the window gets 100 points, a 25% coupon, the site banner, and the email only if they agreed to marketing; only once per year.
- [ ] Pricing & rules centre: changing any default (e.g. points value, print rate, delivery fee, birthday coupon) updates the storefront and checkout immediately or at the scheduled time, without changing existing orders.
- [ ] Landing page edit → preview → publish → rollback works.
- [ ] SPF, DKIM, DMARC pass for both sending streams.
- [ ] Backups run and a restore has been tested.
- [ ] Demo switcher and sample data removed; legal pages (Terms, Privacy, Licence & Refunds, Delivery policy) published.

---

## 23. Owner decisions to confirm

All of these are editable later in the Pricing & rules centre; these are only the starting values.

| Item | Proposed default |
|---|---|
| Points value and cap | 10 points = MVR 1; up to 80% of each item |
| Share & earn | 10 points per friend sign-up + 5% of first order; 200/month cap |
| Referral code | 100 to referrer, 50 to friend |
| Birthday special | 100 points + 25% coupon, valid 7 days either side |
| Profile rewards | 10 points per item saved (first time only) + 20 completion bonus |
| Print rates | B&W MVR 1/page, colour MVR 3/page, spiral MVR 25, minimum MVR 20/copy |
| Delivery zones and fees | Pick up free; Malé 30; Hulhumalé 40; Greater Malé 60; atolls 100 (collect at harbour) |
| Points on print | Earn on print charges: yes; spend on print: no |
| Welcome offer | 20% off first paid order, 7 days |
| Marketing frequency cap | 1 per day, 3 per week |
| Newsletter send rate | 50 per minute |
| Abandoned-cart coupon on second reminder | Off |
| Resource types at launch | PDF, DOCX, PPTX (MUST); EPUB and tutorials (step 11) |
