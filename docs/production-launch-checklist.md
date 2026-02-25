# Bullpen Production Launch Checklist (usebullpen.com)

This checklist is optimized for fast MVP launch with safe defaults.

## Target Architecture

- Landing: Vercel (`usebullpen.com`)
- Dashboard: Vercel (`app.usebullpen.com`)
- Backend/data: Convex Cloud (prod deployment)
- Agent runtime: OpenClaw Gateway on VPS

---

## 1) Preflight (Code + Repo)

- [ ] Main branch green on CI
- [ ] `pnpm install` succeeds at repo root
- [ ] `pnpm --filter @bullpen/landing build` succeeds
- [ ] `pnpm --filter @bullpen/dashboard build` succeeds
- [ ] No hardcoded secrets in code

Commands:

```bash
cd /home/mihbot/bullpen
pnpm install
pnpm --filter @bullpen/landing build
pnpm --filter @bullpen/dashboard build
```

---

## 2) Convex Production

- [ ] Create/select Convex prod deployment
- [ ] Set Convex env vars required by dashboard functions
- [ ] Deploy schema/functions to prod

Commands:

```bash
# in repo root
npx convex deploy
```

Collect and record:

- `NEXT_PUBLIC_CONVEX_URL=https://<prod>.convex.cloud`
- `NEXT_PUBLIC_CONVEX_SITE_URL=https://<prod>.convex.site`
- `CONVEX_DEPLOYMENT=prod:<deployment-name>`

---

## 3) Vercel Projects

Create two Vercel projects from the same repo:

### A) Landing project

- Root Directory: `apps/landing`
- Domain: `usebullpen.com`
- Optional redirect: `www.usebullpen.com` -> `usebullpen.com`

### B) Dashboard project

- Root Directory: `apps/dashboard`
- Domain: `app.usebullpen.com`

---

## 4) Required Environment Variables

## Dashboard (Vercel: app.usebullpen.com)

Required:

- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CONVEX_SITE_URL`
- `OPENCLAW_GATEWAY_URL` (e.g. `ws://<vps-host>:18789`)
- `OPENCLAW_GATEWAY_TOKEN`
- `BULLPEN_WEBHOOK_URL` (e.g. `https://app.usebullpen.com`)

Auth/Billing (when enabled):

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_SPRINT`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_SCALE`

Optional:

- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL=https://app.usebullpen.com`
- `NEXT_PUBLIC_LANDING_URL=https://usebullpen.com`

## Landing (Vercel: usebullpen.com)

- `NEXT_PUBLIC_APP_URL=https://app.usebullpen.com`
- Any marketing/analytics keys used by landing app

---

## 5) DNS

At your registrar for `usebullpen.com`:

- [ ] Point apex `usebullpen.com` to Vercel landing project
- [ ] Point `app.usebullpen.com` to Vercel dashboard project
- [ ] (Optional) `www.usebullpen.com` CNAME to Vercel + redirect to apex

Use Vercel-provided records exactly.

---

## 6) OpenClaw Wiring (VPS)

- [ ] Confirm gateway is healthy: `openclaw status`
- [ ] Confirm dashboard can reach gateway URL/token from Vercel runtime
- [ ] Validate task dispatch end-to-end from dashboard

Smoke test flow:

1. Create test task in dashboard
2. Dispatch task
3. Confirm session spawn in OpenClaw
4. Confirm webhook result updates task state

---

## 7) Monitoring + Feedback

- [ ] Add Sentry to landing + dashboard
- [ ] Add uptime checks for:
  - `https://usebullpen.com`
  - `https://app.usebullpen.com`
  - `https://app.usebullpen.com/api/health` (if implemented)
- [ ] Add in-app feedback capture (or fallback Google Form)
- [ ] Route critical alerts to Discord notifications channel

---

## 8) Launch Sequence

1. Deploy Convex prod
2. Deploy dashboard to Vercel (with prod env)
3. Deploy landing to Vercel
4. Configure domains + verify HTTPS
5. Run smoke tests
6. Invite first beta cohort (10-20 users)

---

## 9) Rollback Plan

- Keep previous Vercel deployment ready for instant rollback
- Keep previous Convex schema snapshot/migration notes
- If dispatch fails, disable task dispatch button + show maintenance notice

---

## Owner-only Checkpoints

You likely need to do these manually:

- Stripe live keys/webhook setup
- Registrar DNS edits
- Any first-time account-level auth prompts (Vercel/Convex)
