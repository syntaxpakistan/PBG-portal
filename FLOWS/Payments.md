Payment System Report — How It Works Today & My Recommendation
Current state (what's built)
Subscriptions (recurring revenue)

All 3 roles pay monthly: Basic $100 / Pro $300 / Custom $500
Invoice auto-issued → user reports payment (bank/JazzCash/EasyPaisa) → admin confirms → ACTIVE
30-day cycles, 7-day grace, cron auto-expires
Transaction fees (per project)

When customer awards a quote → Transaction record created with:
quotedValue = quote price + tax (PKR)
feePercent = 3.5% (configurable in /admin/settings)
feeAmount = quotedValue × 3.5%
Milestones: lab invoices customer → customer reports payment → lab confirms → milestone settles
Platform fee is invoiced to the lab afterward (issueFeeInvoice) — the lab pays Syntax its commission
Payouts: admin records settlements owed to partners (gross − fees = net)
⚠️ The gap you're pointing at
Right now, money flows client → lab directly. Syntax never touches it — the lab confirms receipt and owes the 3.5% fee afterward. Problems:

Client pays a lab directly → if lab ghosts/delivers bad work, client has little recourse
Lab could under-report or delay paying the platform fee
No proof Syntax actually brokers the deal
Your escrow idea — my honest assessment
Client pays Syntax → Syntax holds → releases to lab on completion is the right model for a trusted marketplace. It solves fraud on both sides:

Client protected: money only released when milestones verified
Lab protected: Syntax guarantees payment (vs chasing clients)
Syntax earns trust + the fee is collected upfront, not invoiced later
BUT — it requires real payment infrastructure we don't have yet:

A payment gateway (Stripe/Paddle for USD subs, PayFast/EasyPay/JazzCash API or a local gateway like XPay for PKR)
An internal wallet/ledger per user (funds held, milestone releases, refunds, disputes)
Legal: holding client funds = money transmission — needs terms + possibly EMI/payment institution compliance in Pakistan
Recommended path (phased)
Phase 1 — now (manual escrow, no gateway):
Keep the current flow but change who confirms: client reports payment to Syntax admin (not the lab), admin verifies receipt into Syntax's account, releases milestone to lab via payout. You become the honest broker manually — works today with bank transfers, zero new code mostly (just change confirmPayment routing for milestone invoices to admins).

Phase 2 — gateway integration:

Subscriptions: Stripe/Paddle (USD) — auto-charge monthly, real dunning
Project payments: PKR gateway (JazzCash/EasyPaisa API or bank) into Syntax escrow account
Wallet ledger: WalletTransaction table — hold, release per milestone, refund on dispute
Auto-release on milestone completion + admin override for disputes
Phase 3 — polish:

Dispute resolution workflow, partial refunds, multi-currency settlement
Fee structure suggestion
Subscription: $100/$300/$500 (as-is)
Transaction: keep ~3.5% on lab side, or move to client-side fee (e.g., 5% added to invoice) — client-side is easier to enforce in escrow since you hold the money anyway
Suppliers: same model when they sell products (enquiry → order → escrow → release)

----------------------------------

2. Settings tab analysis — what to add
Right now it's just one number. Based on everything hardcoded across the portals, here's what deserves a settings section, in priority order:

💰 Commercial (highest value)
Setting	Currently	Why
Plan prices ($100/$300/$500)	Hardcoded in plans.ts	Change pricing without deploy
Grace period days	Hardcoded 7	Tune dunning
Invoice due window	Hardcoded 7 days in 4 places	Payment terms
Separate supplier fee %	Doesn't exist	Suppliers will need their own rate
Currency display (USD/PKR)	Mixed hardcoded	Localization
⚙️ Operations
Setting	Currently	Why
RFQ rate limit (15/day)	Hardcoded	Stop spam / allow power users
Board posts require moderation	Hardcoded ON	Toggle for trusted clients
Quote validity default	Per-quote	Set platform default
Payout schedule	Manual	Weekly/monthly auto-reminder
Milestone payment terms	Hardcoded 14-day due	Net-7/Net-15 options
🔔 Notifications
Setting	Currently	Why
Email toggles per event	Always on	Payment confirmed, RFQ routed, expiry warning
Admin digest frequency	Instant	Daily summary option
🛡️ Trust & safety
Setting	Currently	Why
Upload max size/type	Check files.ts	Receipts vs result files limits
Session timeout	Auth default	Security policy
Announcement banner	None	Platform-wide notices ("scheduled maintenance")
🧩 Integrations (future)
Payment gateway keys (Stripe/PKR gateway) — when you add real payments
CRON secret display/rotation
Email sender (Resend) status check