# KrossLedger landing page

Marketing site for KrossLedger, built with React, Tailwind CSS, Framer Motion and Lucide icons (Vite).

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Deploy

Every push to `main` builds the site and publishes it to GitHub Pages via `.github/workflows/deploy.yml`.

One-time setup:
1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Custom domain (Hostinger): in **Settings → Pages → Custom domain**, enter your domain and enable **Enforce HTTPS**.
   In Hostinger DNS, add:
   - `A` records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` record for `www` → `kl-pumpkin-protocol.github.io`

## Accounts

Login and signup use PocketBase at `https://auth.hexcros.com` (`VITE_POCKETBASE_URL` overrides it). Signed-in users open `#/app` and submit a ledger. The browser calls `POST /api/krossledger/instances` on PocketBase. The hook in `pocketbase/pb_hooks/krossledger.pb.js` adds the fleet API key and calls `https://fleet.hexcros.com/v1/instances`.

Copy these into the PocketBase data directory and restart:

- `pocketbase/pb_hooks/krossledger.pb.js` → `pb_hooks/`
- `pocketbase/pb_migrations/1794787200_create_krossledger_instances.js` → `pb_migrations/`
- `pocketbase/pb_migrations/1794790000_add_instance_id.js` → `pb_migrations/`
- `pocketbase/pb_migrations/1794800000_add_machine_status.js` → `pb_migrations/`

Set `FLEET_API_KEY` (and `GHCR_USERNAME` / `GHCR_TOKEN` if the registry credentials should stay off the form). Set `FLEET_WEBHOOK_SECRET` to the same value as pk-fleet `PK_FLEET_POCKET_WEBHOOK_SECRET`. pk-fleet then POSTs create and terminate status to `/api/krossledger/fleet/webhook`, which writes `instance_id`, `provisioning_state`, `readiness`, and `ec2_state` on that user's row. A `terminated` or `failed` machine is no longer shown as the user's ledger.

After the fleet accepts the ledger, that account has one ledger. `#/app` hides the form and shows `https://{name}.krossledger.com`, a 5-minute countdown from the accept time, and a health line. A mark on the bar shows the usual ready time at 3 minutes. When the countdown reaches zero it is removed. **Open ledger** stays closed until `/health` is up, then it opens that address. The name is the ledger slug. The browser stores that accept locally and also reads `GET /api/krossledger/instances/mine`. The PocketBase row stores the fleet `instance_id` and machine status for that user. When pk-fleet reports the machine as terminated or failed, that route says there is no ledger and the form is shown again. A PocketBase superuser who logs in opens `#/app` as an admin dashboard instead of the form. It links to the PocketBase UI and lists fleet instances, refreshing every minute. Delete asks for confirmation, then terminates that `instance_id`. The fleet key stays on the server. Health checks go through `GET /api/krossledger/instances/health`, which calls `https://{name}.krossledger.com/health`. If health is still down five minutes after accept, the hook sends one email to `KROSSLEDGER_ALERT_EMAIL`. Until that variable is set, it writes the same failure to the PocketBase log once. `KROSSLEDGER_DOMAIN` overrides the `krossledger.com` suffix, and `VITE_LEDGER_DOMAIN` must match it in the frontend.

## Structure

- `src/components/ui.jsx` – shared primitives (reveal animations, magnetic button, spotlight card, counters, sliders)
- `src/sections/*.jsx` – one file per page section
