# Pakistan Biotechnology Gateway (PBG) Portal — Development & Deployment Report

**Project:** Pakistan Biotechnology Gateway Portal
**Developed by:** Raw Sec Labs — https://rawseclabs.com (Waqar Asghar)
**Operator entity:** Syntax of Life (Pvt) Ltd
**Live URL:** https://biotechnologygateway.com
**Repository:** https://github.com/syntaxpakistan/PBG-portal (branch: `main`)
**Report date:** 16 November 2026

---

## 1. What the platform is

A production biotechnology marketplace for Pakistan connecting three participant
groups through one governed platform:

- **Customers** — post RFQs (sequence requests / supply needs), receive sealed
  quotes, run projects with milestone delivery, order lab supplies.
- **Laboratories / Providers** — list moderated services, quote on routed RFQs,
  run projects with sample/QC/work/delivery milestones.
- **Suppliers** — maintain a product catalogue, receive direct buyer enquiries,
  send formal quotations, fulfil orders with courier tracking.

The Gateway team (admin) governs verification, content moderation, invoicing,
payments and disputes. **Syntax of Life (Pvt) Ltd** is the legal entity that
issues invoices, holds the escrow/payout bank account and receives payments —
all billing surfaces carry the Syntax name.

---

## 2. Technology stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, server components + server actions) |
| Language | TypeScript |
| Database | PostgreSQL on Neon (pooled + direct endpoints) |
| ORM | Prisma (migrations under `prisma/migrations/`) |
| File storage | Neon Object Storage (S3-compatible, AWS eu-central-1) |
| Auth | Better Auth (email/password + Google sign-in for existing accounts) |
| Hosting | Vercel (auto-deploy on push to `main`) |
| UI | Tailwind CSS, lucide-react icons, sonner toasts |
| Notifications | In-app + email + browser push (service worker `public/sw.js`) |

Local development falls back to a local `uploads/` directory when S3 env vars
are absent.

---

## 3. Portals and features

### 3.1 Public site

- Landing page with service exchange cards, plan pricing block, launch-offer
  promo bar, contact/lead form.
- `/marketplace` — services tab (lab offerings) + supplies tab (supplier
  products with photos, brand, price, lead time, "Sign in to enquire").
- `/registry` — verified laboratory directory **and** suppliers tab.
- `/suppliers/[id]` — public supplier storefront: org info, verified badge,
  full approved catalogue with photos and datasheets.
- `/services/molecular-biology`, `/services/sequencing`,
  `/services/bioinformatics` — public service pages.
- `/partners`, `/biogateway` (partner signup), coverage calculator, login,
  password reset.

### 3.2 Customer portal (`/dashboard`)

- RFQ posting (board or routed), sealed quote comparison, project workspace,
  milestone approvals, messaging + documents, marketplace/supplies with enquiry
  workflow, complaints, billing, notifications, coverage calculator.

### 3.3 Laboratory portal (`/lab`)

- Service catalogue with moderation, RFQ board + quoting, projects,
  supplies purchasing, analytics (plan-gated), complaints, profile/credentials,
  billing/subscription.

### 3.4 Supplier portal (`/supplier`) — rebuilt this session

| Page | Function |
|---|---|
| Overview | Status banners, 5 stat cards, getting-started checklist, recent products + enquiries, storefront link |
| Products | Full catalogue form (name, category, brand, spec, description, price, unit, SKU, stock, lead time, photo, datasheet); catalog rows with Live/In-review/Rejected badges, image lightbox preview, inline edit, hide/show, delete |
| Enquiries | Offer form (price, lead days, message, formal quote PDF), decline with reason, buyer message thread, ship & fulfil (courier + tracking no.) |
| Profile | Company profile, payout bank details, subscription card |
| Analytics | Enquiry funnel (received → offers → invoiced → paid → delivered), collected revenue, payouts, top products |
| Complaints | File/track support tickets with private Gateway thread |
| Billing | Invoices, plan status, renewal |

### 3.5 Admin portal (`/admin`)

- Verification queue (customers, labs, suppliers — manual approval).
- Content moderation (`/admin/moderation`): RFQ board posts, service listings,
  **supplier products** — each with previews + approve/reject + note to org.
- Marketplace management (`/admin/marketplace`): product table with image
  thumbnails, live/delisted + in-review states, inline approve/reject,
  enquiry oversight.
- Users & orgs, subscriptions, finance, transactions & fees, RFQs, projects,
  complaints, business reports, leads, audit log, security, settings
  (fees, plan prices, bank account, editable text content).

---

## 4. Key workflows

### 4.1 RFQ → sealed quote → project

Customer posts request → Gateway moderates board posts → invited/boarded labs
submit sealed quotes → customer accepts → project created with milestones
(sample received, QC, work in progress, delivered) → documents/messages →
invoice + escrowed payment via Syntax → payout to lab.

### 4.2 Supply enquiry → order

Buyer enquires on a product → supplier offers (price/lead/quote PDF) or
declines with reason → clarification thread → buyer accepts → invoice raised
→ Syntax verifies escrowed payment → supplier ships with courier + tracking →
fulfilled → payout.

### 4.3 Product publication gate (new)

Supplier uploads product → `PENDING` → invisible publicly → admin approves at
`/admin/moderation` or `/admin/marketplace` → live on marketplace + storefront.
Content edits re-queue; price/stock-only changes stay live. Rejections carry a
note back to the supplier. Hide = delist keeping history; delete = permanent,
blocked when enquiry history exists (cascade would destroy order records).

### 4.4 Onboarding

All roles register manually; Gateway team approves before portal access
(customers ~1 day, partners ~2 days). Labs/suppliers pick a subscription term.
Google sign-in is enabled for already-registered accounts only (sign-up with
Google is disabled by design — prevents orphan accounts with no profile).

---

## 5. Plans (current pricing)

| Plan | Term | Price | Positioning |
|---|---|---|---|
| Basic | 1 year | PKR 50,000 | Facilities starting on the Gateway |
| Pro | 3 years | PKR 144,000 | Established labs & suppliers |
| Elite | 5 years | PKR 240,000 | High-capacity & HPC providers (was "Custom") |

Customers do not buy plans — portal access is free after admin approval.
Supplier-facing plan copy was rewritten to supplier-relevant benefits
(moderated catalogue, direct enquiries, featured storefront, sales analytics).

---

## 6. Security & data handling

- Role-gated routes (`requireRole`), approval + subscription entitlement checks
  (`assertPartnerActive`) on every partner action.
- All files served through `/api/files/[key]` with party checks: product media
  public only when approved; quote files, receipts, RFQ attachments, result
  files restricted to their parties; admin/owner always allowed.
- Upload whitelist: PDF/DOCX/XLSX/ZIP/CSV/TXT/HTML/PNG/JPEG/WebP, max 25 MB.
  Raw genomic extensions rejected (`.fastq .fq .bam .vcf .fasta .fa .sam .gz`).
- Human-readable refs: `PRD-`, `ENQ-`, `CMP-`, `SUP-`, invoice numbers etc.
- Audit log on moderation, product, billing and verification actions.
- Password reset via Resend email; Better Auth sessions; 2FA required for admin.

---

## 7. This development session — what was delivered

1. **Supplier portal rebuild** — from a text-only product list to a full
   multi-page portal (7 pages) with image/datasheet uploads, catalogue
   management (preview, edit, hide, delete), enquiry→order workflow, analytics,
   complaints, storefront discoverability.
2. **Product moderation gate** — admin approval required before any product is
   public; moderation queue + inline approve/reject with thumbnails on
   `/admin/marketplace`.
3. **Image lightbox** — click-to-preview on marketplace cards, storefront,
   buyer views, catalog rows and admin tables; `object-cover` full-fill cards.
4. **Plan changes** — new prices (50k/144k/240k), Custom→Elite rename,
   supplier-specific feature bullets.
5. **Gateway rebrand** — conversational/governance/support copy now says
   "Gateway"; Syntax retained on billing/escrow/invoice/legal surfaces.
6. **Supporting pieces** — invoices section, bank-details + supplier-upgrade
   migrations, lead form, notification deep-linking fixes, complaint routing
   for supplier recipients.

---

## 8. Verification performed

- `tsc --noEmit` clean; ESLint clean (0 errors).
- All supplier routes (7), storefront, registry tab, marketplace, admin
  marketplace/moderation/complaints return 200 (authenticated + anonymous as
  appropriate).
- Moderation cycle tested end-to-end: pending product hidden publicly →
  appears in admin queues with preview + Approve/Reject → approved → live.
- File-access rules tested: pending-product media 404s for outsiders, serves
  for owner/admin; quote files restricted.
- Deploy verified on Vercel: new pricing, new routes, storefront, lightbox
  all live at commit `8dbc653`.

---

## 9. Infrastructure & deployment

- **GitHub → Vercel:** push to `main` triggers automatic build + deploy.
- **Neon Postgres:** one project, pooled `DATABASE_URL` for serverless + direct
  for migrations. Prisma migrations applied via `prisma migrate`.
- **Neon Object Storage:** S3-compatible bucket; `AWS_ENDPOINT_URL_S3`,
  `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`
  env vars required in both local `.env.local` and Vercel.
- **Important:** local development and production currently share the same
  database and storage bucket (deliberate for now — data written locally is
  live). Before real-user launch, create a Neon dev branch + separate bucket
  and point `.env.local` at them.

---

## 10. Test accounts (in the shared DB — remove before public launch)

| Email | Role | Notes |
|---|---|---|
| test.admin@pbg.dev | ADMIN | Full admin portal |
| test.supplier@pbg.dev | SUPPLIER | Approved, Basic sub active |
| sup-test@test.com | SUPPLIER | Approved for testing |

Test artifacts visible publicly right now: product `PRD-0001 "waqar asghar"`
(with a meme image, on the live marketplace), `PRD-TEST`, org "sup". Hide or
delete before go-live.

---

## 11. Known follow-ups / backlog

- Split dev DB branch + storage bucket; purge test data (see §9–10).
- Resend key must be configured in Vercel env for password-reset emails.
- Footer social links are `#` placeholders.
- Customer-portal "Analytics" nav item upsells plans customers can't buy —
  remove or show free basic stats.
- Landing claims to review before launch: "subsidized rates" (no detail page),
  "PBG guarantees" quality wording (facilitation, not guarantee),
  "Consult an expert" CTA should route to the contact form.
- Node 20 in use; AWS SDK warns about future Node 22 requirement.
