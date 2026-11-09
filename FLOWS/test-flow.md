# Pakistan Biotechnology Gateway — Full Test Flows

How to verify every feature across all four portals. Work top-to-bottom for a
complete end-to-end pass, or jump to a single feature's section.

## Environments

| Env | URL | Notes |
|---|---|---|
| Production | https://pbg-teal.vercel.app | Vercel + Neon Postgres + Neon storage |
| Local dev | http://localhost:3000 | `npm run dev` — same Neon DB |

## Demo accounts

| Role | Email | Password | Identity |
|---|---|---|---|
| Admin | `admin@syntaxlife.pk` | `Admin@12345` | Syntax Admin |
| Lab (verified) | `genomelab@pbg.pk` | `Lab@12345` | GenomeLab Karachi |
| Lab (verified) | `ncgseq@pbg.pk` | `Lab@12345` | NCG Sequencing Lahore |
| Lab (unverified) | `pendinglab@pbg.pk` | `Lab@12345` | pending — blocked surfaces |
| Supplier | `biosupplies@pbg.pk` | `Sup@12345` | BioSupplies Pakistan |
| Customer | `fatima@nibge.edu.pk` | `Cust@12345` | Dr. Fatima Noor · NIBGE |
| Customer | `omar@aku.edu` | `Cust@12345` | second customer account |

**Multi-role tip:** one browser = one session cookie. Use a **normal window +
incognito window + second browser** to watch both sides of a flow live.

**Notifications:** every flow below should also produce a bell notification on
the counterparty's side — check `/notifications` (or the bell in the portal
header) after each step.

---

## A. The master flow — RFQ → quotes → award → project → delivery

The core marketplace loop. Walk it once end-to-end.

1. **Customer** (`fatima@nibge.edu.pk` → `/dashboard/rfqs/new`)
   - Fill title, organism, sample count/type, category, requested output,
     deadline, budget hint.
   - Keep **Targeted routing** selected (goes live immediately). Submit.
   - Expected: lands on the RFQ detail page; status `Open`; "0 quotes".

2. **Lab** (`genomelab@pbg.pk` → `/lab/rfqs`)
   - "Routed to you" tab shows the new RFQ as a table row (title, ref, samples,
     deadline, budget, posted-by "Verified customer").
   - Notification received: "New RFQ routed to you: RFQ-XXXX".
   - Open it → full request detail; customer name is **masked** (org type +
     city only). Fill the sealed quote form (price, tax, TAT, platform,
     deliverables) → Submit.
   - Expected: quote saved; page now shows "Update your quote".

3. **Second lab** (`ncgseq@pbg.pk`) repeats step 2 with a different price.
   - Verify blindness: neither lab ever sees the other's price — only
     "N sealed" quote count.

4. **Customer** — notification "New quote on RFQ-XXXX — GenomeLab Karachi"
   arrives with price/TAT inline. Open `/dashboard/rfqs/[id]`
   - Both quotes rendered as comparison cards (provider org, city, platform,
     all-in price, TAT, scope/exclusions/notes, validity).
   - Click **Select this provider** on one quote.
   - Expected: RFQ → `Awarded`; project `PRJ-XXXX` created; redirected to the
     project page.

5. **Notifications fired:** winner lab gets "You were awarded PRJ-XXXX";
   losing lab gets "awarded — your quote wasn't selected".

6. **Winning lab** (`/lab/projects/[id]`)
   - Sees award card → **Accept project**. Status → `Sample awaited`, work-stage
     ladder created, due date set from quoted TAT.
   - Alternative test: **Decline** → customer is notified, RFQ reopens,
     other quotes restored to `Submitted`, customer can re-select.

7. **Customer** (`/dashboard/projects/[id]`) — "Mark samples shipped" with
   courier + tracking. Lab gets notified.

8. **Lab** — "Record sample receipt" with QC verdict (PASS / PARTIAL / FAIL).
   Status → `Sample received`, Accessioning stage completes, Sample QC
   activates. Customer notified.

9. **Lab** — advance work stages (`Analysis → Bioinformatics → Report`…) and/or
   overall status (`Work in progress`). Each change notifies the customer.

10. **Staged results** (key feature):
    - Lab uploads a file → appears as **draft, not released**. Customer does
      NOT see it yet (verify on customer project page — absent).
    - Lab clicks **Release** → status → `Results available`, customer
      notified, file visible + downloadable by customer.
    - Admin can see all files incl. drafts on `/admin/projects/[id]`.

11. **Invoices** — lab adds a milestone → "Invoice" → customer sees invoice,
    marks **Paid** → lab notified.

12. **Customer** — marks project **Complete**, optionally leaves a review
    (rating → lab notified, lands on lab profile/registry).

13. **Audit** — admin `/admin/audit` shows every step (RFQ_CREATED,
    QUOTE_SUBMITTED, QUOTE_SELECTED, STATUS_CHANGED, RESULT_RELEASED…).

---

## B. Request board (moderated open demand)

1. **Customer** → New RFQ → choose **Open request board** → submit.
   - Expected: amber banner "awaiting admin review"; admins notified
     ("Request-board post awaiting approval" with org + scope + deadline).

2. **Lab** — check `/lab/rfqs?tab=board`: the post is **absent** while
   pending; direct URL `/lab/rfqs/[id]` → 404.

3. **Admin** → `/admin/moderation` → Requests table shows the post with full
   detail (requester org/type/city/contact, scope, deadline, budget).
   - **Publish to board** → customer notified ("live on the board"), all
     verified labs notified ("New request on the board").
   - Lab board now lists it; detail page 200; labs can quote blind.

4. Reject path: submit another board post → **Reject** with a note → customer
   notified with the reason; post never appears to labs (except explicitly
   invited ones); customer sees red "not approved" banner on their RFQ list
   + detail.

---

## C. Service listing moderation

1. **Lab** → `/lab/services` → add a service (name, category, platform, TAT,
   starting price, **price visibility**: Public / Members / Quote-only,
   description).
   - Expected: listing shows "Awaiting admin review" badge; admins notified.

2. Before approval — check it is **invisible** on `/marketplace`,
   `/dashboard/marketplace` (services tab), `/registry/[id]`.

3. **Admin** → `/admin/moderation` → Services table (service, lab, category,
   price, TAT, visibility) → **Approve listing**.
   - Lab notified "Service live"; appears on all public surfaces per its
     price-visibility rule.

4. Edit path: lab edits an approved service → flips back to "Awaiting admin
   review" and disappears from the public catalog until re-approved.

5. Reject path: reject with note → lab notified with reason; red "Rejected:
   <note>" badge on their services page.

**Price-visibility spot checks** (on an approved listing):
- `PUBLIC` → visible to anonymous visitors on `/marketplace`.
- `MEMBERS` → anonymous + providers see "Members-only price"; signed-in
  customers see the price.
- `QUOTE_ONLY` → "Request a quote" instead of a price, for everyone.

---

## D. Supplies marketplace (enquiries)

1. **Customer** → `/dashboard/marketplace` → Supplies tab → "Send enquiry" on
   a product (qty + message).
   - **Supplier** notified ("New enquiry: … · buyer name + org + message").

2. **Supplier** (`biosupplies@pbg.pk` → `/supplier`) → Enquiries card shows
   buyer name, org, role, email, date, list price, message → reply with
   price + lead days + message → **Send offer**.
   - Buyer notified ("Supplier responded") with deep link to their portal.

3. **Customer** → "Your enquiries" card shows the offer (price, lead, reply).
   - Supplier marks **Fulfilled** → buyer notified "Enquiry fulfilled"; buyer
     sees green Delivered banner.

4. **Provider-as-buyer:** log in as `genomelab@pbg.pk` → `/lab/supplies` —
   same browse + enquiry flow works; notifications route to `/lab/supplies`.

5. **Admin** → `/admin/marketplace` sees all enquiries (Close/Reopen) and all
   products (Delist/Activate — delisted products vanish from supplies tabs).

---

## E. Verification & onboarding

1. **Signup** (`/biogateway`): pick role → (labs/suppliers) pick plan → org
   profile form → create account.
2. New lab/supplier lands `PENDING`: portal shows "verification in progress";
   RFQs/board/services surfaces show the locked state.
3. **Admin** → `/admin/verification` → Approve (optionally note).
   - Org notified "Verification approved — is live"; portal unlocks.
4. Reject/Suspend → org notified with the reason.

Unverified checks: `pendinglab@pbg.pk` sees empty RFQ inbox, no board, can't
submit quotes (server also rejects the action).

---

## F. Projects — deeper features

- **Messaging:** customer/lab chat on the project page incl. file attachments
  (private S3 → `/api/files/[key]`).
- **QC gate:** lab logs a QC record `PARTIAL`/`FAIL` → customer gets a
  decision prompt (`resolveQc`) to continue/stop.
- **Pause/resume:** lab can pause the clock (status shows paused on SLA);
  resume restarts the due-date countdown.
- **Lab internals:** lab-only fields (technician, internal notes) never render
  on the customer view.
- **Milestones:** add → invoice → customer pays → provider notified.
- **Complaints:** customer files on the project → admin sees it on
  `/admin/complaints` and the lab sees it flagged on their overview → admin
  resolves with a note → resolution visible to both parties.
- **Review:** customer rates a completed project → lab notified; rating rolls
  into the lab's registry score.

---

## G. Admin portal sweep

| Page | What to verify |
|---|---|
| `/admin` | KPI cards, recent activity |
| `/admin/verification` | approve/reject/suspend providers + suppliers; org gets notified |
| `/admin/moderation` | two tables: board RFQs + service listings; approve/reject with note |
| `/admin/users` | user/org directory |
| `/admin/subscriptions` | plans ($100/$300/$500), extend after renewal request, status changes |
| `/admin/rfqs` | all RFQs w/ Board column (routed/pending/live/rejected), CSV export |
| `/admin/transactions` | awarded values + platform fee; mark paid/refunded |
| `/admin/marketplace` | products delist/activate; enquiries close/reopen |
| `/admin/complaints` | status + resolution note |
| `/admin/audit` | every action logged w/ actor |
| `/admin/settings` | platform fee % (used by the next award) |
| `/admin/security` | TOTP setup (`ADMIN_MFA_REQUIRED=true` enforces) |
| `/api/admin/export/rfqs|transactions|audit` | CSV downloads |

---

## H. Marketplace & registry surfaces

- `/marketplace` — public browse, both tabs; price-visibility rules (C.5);
  CTAs gate to `/biogateway` when signed out.
- `/dashboard/marketplace` — Services tab with compare checkboxes → tray →
  "Request quotes" opens prefilled RFQ (`?invite=…&cat=…&title=…`).
- `/registry` + `/registry/[id]` — verified providers only, approved services
  only, storefront shows ratings.
- Theme toggle light/dark on every page (status pills readable in both).

---

## I. Isolation & security (negative tests)

| Test | Expected |
|---|---|
| Customer opens `/lab`, `/admin`, `/supplier` | Redirected away |
| Provider opens `/dashboard`, `/admin` | Redirected |
| Supplier opens `/dashboard`, `/lab`, `/admin` | Redirected |
| Lab opens pending board RFQ URL | 404 (unless invited) |
| Lab fetches another lab's quote data | Never rendered/fetched — count only |
| Lab opens customer-identifying info pre-award | Masked (org type + city only) |
| Customer opens unreleased result file URL | `403 Not yet released` |
| Signed-out user opens `/api/files/[key]` | `401` |
| Unverified lab submits quote (direct POST) | Error — server-side check |
| Provider downloads pending board RFQ attachment | 403 |
| `/dashboard/marketplace` as provider | Redirects to `/lab` |

---

## J. 10-minute smoke test

Minimum sanity pass after any deploy:

1. `/`, `/marketplace`, `/registry`, `/services`, `/biogateway` → 200
2. Customer login → `/dashboard` → RFQs list shows board badges
3. Lab login → `/lab/rfqs?tab=board` table renders, only APPROVED posts
4. Lab → `/lab/services` shows moderation badges; `/lab/supplies` shows products
5. Admin → `/admin/moderation` tables render; `/admin/rfqs` Board column present
6. Supplier → `/supplier` enquiries list renders with buyer org + dates
7. A released file downloads via `/api/files/[key]`; a draft returns 403

## Notification coverage map

| Event | Notified |
|---|---|
| Routed RFQ created | Matched + invited labs |
| Board RFQ created | All admins |
| Board RFQ approved | Customer + all verified labs |
| Board RFQ rejected | Customer (with reason) |
| Service created/edited | All admins |
| Service approved/rejected | Lab (with reason) |
| Quote submitted/updated | Customer (lab + price + TAT) |
| Quote withdrawn | Customer (lab + remaining count) |
| Quote selected | Winner (award) + losers (not selected) |
| RFQ declined by lab | Nobody — invisible by design |
| Project accepted/declined | Customer |
| Samples shipped/received | Lab / Customer |
| Status + stage changes | Customer |
| Result released | Customer |
| Milestone invoiced/paid | Customer / Lab |
| Complaint filed | (admin sees in queue) |
| Review submitted | Lab |
| Enquiry sent | Supplier (buyer + org + message) |
| Enquiry answered/fulfilled | Buyer |
| Provider/supplier verified | The org (decision + reason) |
| Renewal requested / extended | Admins / the org |

## Section K — Mobile responsiveness (375px + 320px viewports)

Open DevTools → device toolbar → iPhone SE / 375px, repeat key checks at 320px.

### K1. Public navbar
1. Hamburger button visible below `lg`; desktop links hidden
2. Tap hamburger → menu opens **below** the pill, does not push page content
3. Each section (Services / Multiomics / Bioinformatics / Resources / Company) shows a **chevron arrow**; tapping a section expands only that section (accordion)
4. Open "Services" (12 links) → menu body scrolls internally, never exceeds viewport bottom
5. Tap any link → navigates AND closes the menu
6. Reopen menu → all sections collapsed again
7. Login / Gateway Portal / theme toggle visible at menu bottom
8. Announcement bar stays one line (text truncates), Login/Contact/Portal links hidden below `sm`

### K2. Portal shell (all four roles)
1. Log in as each role on a 375px viewport
2. No sidebar visible — instead a sticky navy top bar: logo left, notification bell (unread badge) + hamburger right
3. Hamburger → slide-out drawer from the left with backdrop; tapping backdrop or X closes it
4. Drawer shows portal title, full nav list (scrollable if long), user name/email, Sign out, theme toggle
5. Tap a nav item → navigates and drawer auto-closes
6. Rotate to desktop width → fixed sidebar returns, top bar disappears (`lg` breakpoint)

### K3. Portal content
1. Every `PageHead` (title + subtitle + action buttons) wraps — buttons never collide with or clip the title
2. All admin tables (Users, RFQs, Transactions, Subscriptions, Marketplace, Audit, Moderation) scroll **horizontally inside the card** — page itself must not gain horizontal scroll
3. Stat-card grids stack to 1–2 columns; forms stack labels over inputs
4. `/lab/rfqs` table scrolls horizontally; quote CTAs reachable
5. `/supplier` header: org name + enquiry controls wrap without squeezing
6. `/marketplace` cards stack single-column, filters wrap
7. Check `document.documentElement.scrollWidth <= window.innerWidth` in console on every page — no body-level horizontal overflow anywhere

================================

How the platform flows — portal by portal
There are 4 roles: CUSTOMER, PROVIDER (lab), SUPPLIER, ADMIN. Each sees different things.

1. Subscription flow (provider/supplier)
Partner signs up → onboarding asks for plan (Basic/Pro/Custom)
→ Invoice auto-created (USD) → partner reports payment on Billing page
→ Admin confirms money received → subscription ACTIVE → paid features unlock
→ 30 days later → renewal invoice → repeat
→ Expires + 7-day grace → cron marks EXPIRED → features pause
Where it shows:

Partner portal → Billing in sidebar (/lab/billing or /supplier/billing)
Plan card at top shows status, days left, "request plan change" buttons
Admin → /admin/subscriptions — all subs, approve/extend/cancel, pending plan-change requests
Test it:

Log in as a lab account → /lab/billing → see invoice + "Report payment" form
Submit payment (pick JazzCash/bank, add ref) → payment shows PENDING
Log in as admin → /admin/finance → see the pending payment → Confirm
Back as lab → invoice shows PAID, subscription card shows ACTIVE
2. Marketplace payment flow (customer ↔ lab)
Customer posts RFQ → labs quote → customer selects quote
→ Project created → lab adds milestones → lab clicks "Invoice milestone"
→ Invoice (PKR) created for customer → customer clicks "Report paid"
→ Lab verifies on Billing → "Payments to verify" → Confirm
→ Milestone settles → project moves forward
→ Project completes → platform fee invoice goes to the LAB (admin-issued)
→ Admin records payout to lab (gross − fee = net)
Where it shows:

Customer → project page → milestones section → "Report paid" button (now with method + reference)
Customer → /dashboard/billing → all invoices from labs + subscription
Lab → /lab/billing → invoices they issued + payments to verify + payouts
Admin → /admin/transactions → project payments, fee invoicing
Admin → /admin/finance → create payout, confirm payments
Test it:

As customer: /dashboard/rfqs/new → submit RFQ
As lab: /lab/rfqs → quote it → customer selects quote
As lab: project page → add milestone → "Invoice" it
As customer: project page → milestone shows INVOICED → "Report paid" → pick method + ref
As lab: /lab/billing → "Payments to verify" → Confirm → milestone = PAID
As admin: /admin/transactions → completed## How the platform flows — portal by portal
You need 4 test accounts (one per role). If you don't have them, create via signup or ask me to seed test users.

1️⃣ CUSTOMER (client/researcher) — /dashboard
Flow: Post RFQ → get quotes → award project → milestones → pay → review

Feature	Where it shows
Post new RFQ	/dashboard/rfqs/new
Browse providers	/dashboard/marketplace
Project milestones	/dashboard/projects/[id] — "Report paid" button with method + reference
Invoices to pay	/dashboard/billing — subscription invoices from Syntax
Report payment	Billing page → "Report payment" → pick method, enter reference, upload receipt
Track payment status	Same invoice row shows PENDING → CONFIRMED/REJECTED
Rate provider	Project page after completion
2️⃣ PROVIDER (lab) — /lab
Flow: Subscribe → receive RFQs → quote → deliver → invoice milestones → get paid → payout

Feature	Where it shows
Subscription status	Top banner in /lab if expired/grace
Choose/upgrade plan	/lab/billing → plan card → "Request plan change"
Pay subscription	/lab/billing → invoice appears → Report payment
Incoming RFQs	/lab/rfqs — Pro/Custom labs see priority badge
Quote on RFQ	/lab/rfqs/[id]
Milestone billing	/lab/projects/[id] → "Invoice milestone" button
Invoices you issued	/lab/billing → "Invoices you issued" section
Verify customer payments	/lab/billing → "Payments to verify" → Confirm/Reject
Platform fee invoice	Admin issues it → shows in /lab/billing as payable
Payouts	/lab/billing → bottom section
Analytics	/lab/analytics (Pro feature)
3️⃣ SUPPLIER — /supplier
Same billing flow as lab but for product sales:

Feature	Where
Subscription + invoices	/supplier/billing
Products/enquiries	/supplier
4️⃣ ADMIN — /admin
Feature	Where
All subscriptions	/admin/subscriptions — see plan, status, "→ PRO requested" badges, renewal requests
Approve plan change	Click plan buttons in the row (clears the request)
Activate/extend sub	Same row → "Confirm payment" / "Renew +30 days"
Finance hub	/admin/finance — all invoices, confirm payments, create payouts
Record manual payment	Finance → invoice → "Record payment"
Transactions	/admin/transactions — project deals + fee invoices
Moderation	/admin/moderation — verify labs/suppliers
🧪 Test scenario (end-to-end)
1. Login as ADMIN → /admin/subscriptions
   → Find test lab → set plan PRO, status ACTIVE
   
2. Login as LAB → /lab/billing
   → See USD invoice ($300) → Report payment (JazzCash, ref TEST123)
   
3. Login as ADMIN → /admin/finance
   → Find that payment PENDING → Confirm it
   → Lab subscription invoice → PAID
   
4. Login as LAB → /lab/billing
   → Request plan change PRO → CUSTOM
   
5. Login as ADMIN → /admin/subscriptions
   → See "→ Custom requested" → approve → plan updated
   
6. Login as CUSTOMER → post RFQ → LAB quotes → customer awards
   → LAB adds milestone → "Invoice milestone"
   → CUSTOMER sees invoice in project → "Report paid"
   → LAB verifies in /lab/billing → milestone settles
⚡ Quick checks without full flow
Cron job: curl http://localhost:3000/api/cron/subscriptions → should return {"ok":true,...}
Invoice numbering: create 2 invoices quickly → numbers won't collide
Currency display: lab billing shows USD (subscription) and PKR (fees) separately