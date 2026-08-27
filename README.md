# Worksheet Wizard

Create a custom maths, spelling, handwriting, or puzzle worksheet in 30 seconds.

Frontend-only. PDFs generated in the browser.

**Live:** https://giriteja94495.github.io/worksheet-wizard/

Pushes to `main` rebuild the `gh-pages` branch via `.github/workflows/pages.yml`. If that URL 404s, GitHub Pages is off for this repo: **Settings → Pages → Build and deployment → Deploy from a branch → `gh-pages` / `/ (root)`**.

Optional Firebase Hosting (same Vite `dist/`): `npx firebase-tools deploy --only hosting` against project `worksheet-wizard-giri`.
