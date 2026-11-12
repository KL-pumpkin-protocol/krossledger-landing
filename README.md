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

Login and signup use PocketBase at `https://auth.hexcros.com` (`VITE_POCKETBASE_URL` overrides it). Signed-in users open `#/app` and submit a ledger. The browser calls `POST /api/krossledger/instances` on PocketBase. The hook in `pocketbase/pb_hooks/krossledger.pb.js` adds the fleet API key and calls `https://fleet.hexcros.com/v1/instances`. Copy that file into the server `pb_hooks` directory and set `FLEET_API_KEY` (and `GHCR_USERNAME` / `GHCR_TOKEN` if the registry credentials should stay off the form).

## Structure

- `src/components/ui.jsx` – shared primitives (reveal animations, magnetic button, spotlight card, counters, sliders)
- `src/sections/*.jsx` – one file per page section
