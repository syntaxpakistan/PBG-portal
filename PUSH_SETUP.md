# Push Notifications — Remaining Setup

Everything is built and working locally. These are the remaining
items to finish before push notifications work on the live site.

## 1. Vercel environment variables (REQUIRED — you fill in real values)

Add these in Vercel Dashboard → pbg-portal → Settings → Environment Variables
(Production + Preview):

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<PASTE_PUBLIC_KEY_HERE>
VAPID_PRIVATE_KEY=<PASTE_PRIVATE_KEY_HERE>
VAPID_SUBJECT=mailto:info@biotechnologygateway.com
```

- The public key is safe to expose (it's sent to browsers).
- The private key is in your local `.env.local` — copy it from there.
  NEVER commit it to git.
- `VAPID_SUBJECT` must be a `mailto:` address or `https:` URL that
  identifies you to push providers (required by the Web Push spec).

Already set (verify they exist in Vercel):
```
NEXT_PUBLIC_APP_URL=https://<your-production-domain>
BETTER_AUTH_URL=https://<your-production-domain>
DATABASE_URL=<neon-url>
```

## 2. Deploy

```
git push origin main   # Vercel auto-deploys
```

Then run the migration on production DB if it hasn't run:
already applied — migration `20261113174500_push_subscriptions` is in the repo.

## 3. Production test checklist

- [ ] Sign in on the live site → go to `/notifications`
- [ ] Click **Enable browser notifications** → Allow permission
- [ ] Click **Send a test push** → notification appears
- [ ] Click the notification → opens `/notifications`
- [ ] Switch tabs / minimize → send test → still appears (real push, not in-page)
- [ ] Trigger a real event (submit an RFQ as a client while a lab account
      is subscribed) → lab gets a push

## 4. Known platform limits

- **iPhone/iPad**: push only works after "Add to Home Screen" (Apple rule).
  Users open the installed PWA icon, then enable notifications.
- **Firefox**: works, but some Linux distros need notification daemon running.
- If a user clicks "Block", they must re-enable in browser site settings —
  the UI shows instructions for this.

## 5. Optional extras (not built — tell me if you want them)

- [ ] Auto-prompt banner asking users to enable push on first portal visit
- [ ] Per-notification-type opt-outs (e.g. "push me on payments only")
- [ ] Admin "broadcast push" tool
- [ ] Quiet hours / digest mode
