# Enso Social — Website

> **"Your life, not a scoreboard."**
>
> Enso is a private social app for family and real friends — no like counts, no followers, no algorithm, no search. This is the public site at [ensosocial.app](https://ensosocial.app): the landing page, legal pages, and the open-in-app fallbacks for connect and group links.
>
> The app is free on the [App Store](https://apps.apple.com/app/id6805994959); Android is coming soon to Google Play.

---

## Project Structure

```text
EnsoSocial-Website/
├── index.html              # Landing page
├── home.css                # Landing page styles (only index.html loads it)
├── assets/screens/         # App screenshots as WebP (640px wide), shown in CSS phone frames
├── styles.css              # Shared styles for the legal, fallback and 404 pages
├── legal.css               # Legal pages + open-in-app fallback cards
├── script.js               # Scroll reveals, smooth scroll, iOS App Store links
├── connect.html            # /c/:code fallback (noindex) — opens enso://c/<code>
├── group.html              # /g/:code fallback (noindex) — opens enso://g/<code>
├── terms.html, privacy.html, safety.html, community-guidelines.html,
│   law-enforcement.html, child-safety.html
│                           # GENERATED from the app repo (enso/scripts/export-legal) — don't edit here
├── delete-account.html     # Required by Google Play
├── sms-opt-in.html         # Required for SMS carrier registration
├── .well-known/            # apple-app-site-association + assetlinks.json (universal links — don't move)
├── vercel.json             # Clean URLs, /c and /g rewrites, security headers
└── .vercelignore           # Keeps README, supabase/ etc. out of the deployment
```

The site is plain HTML/CSS/JS — no build step and no runtime dependencies.

---

## Local Development

```bash
# Closest to production (clean URLs + /c and /g rewrites)
npx vercel dev

# Quick static preview (use the .html paths, e.g. /privacy.html)
python3 -m http.server 8000
```

---

## Deployment

Push to `main`; Vercel deploys the repo root as-is.

---

## Retired: beta signup

Until September 2026 the landing page collected beta signups (name + email) straight into the Supabase `beta_signups` table, with failures logged to `error_logs`. The form has been removed now that the app is live. Those tables are pending cleanup once the launch emails to signups have gone out.
