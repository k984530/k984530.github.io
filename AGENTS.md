# Repository Guidelines

## Project Structure & Module Organization
- `index.html` hosts the portfolio landing page and links each featured app section. Update this file when adding or reordering projects.
- `styles.css` and `script.js` drive the shared layout interactions; legacy variants (`styles_old.css`, `script_old.js`) are kept only for reference and should not be edited unless you intend to revive the old layout.
- Each product directory (`Anypick/`, `AppHub/`, `SweetSleep/`, etc.) contains an app-specific `index.html` plus promo assets under `download/`. Add new apps by cloning an existing directory and adjusting copy, imagery, and links.
- `assets/` stores the Flutter web export that powers embedded demos. Replace the entire directory when updating the Flutter build to keep manifests in sync (`AssetManifest.json`, `FontManifest.json`, and `main.dart.js`).

## Build, Test, and Development Commands
- `python3 -m http.server 8080` — serves the site locally from the repo root for quick verification.
- `npx serve@latest .` — alternative static preview that mirrors GitHub Pages caching headers.
- `flutter build web --release` (run in the upstream Flutter project) — regenerates the artifact bundle expected under `assets/` before copying it here.

## Coding Style & Naming Conventions
- Use 4-space indentation in HTML, CSS, and JS to match the current formatting.
- Prefer lowercase, hyphen-separated class names (`.main-container`, `.project-card`). Keep CSS custom properties (`--primary-color`) scoped to `:root` unless a component-level override is needed.
- Keep JavaScript modular: attach behavior through query selectors on existing data attributes instead of inline handlers.

## Testing Guidelines
- After edits, open the local preview on desktop and mobile widths (Chrome dev tools) to confirm navigation highlights, section toggles, and download links.
- When swapping Flutter assets, clear the browser cache or bump `flutter_service_worker.js` query strings to validate the latest bundle loads.
- Document any manual test results in the pull request if the change affects UX or assets.

## Commit & Pull Request Guidelines
- Follow the existing history: short, imperative summaries (`Update portfolio`, `Add Sweet Sleep`). Group related asset updates into a single commit when possible.
- Pull requests should include a concise summary, impacted directories, and before/after screenshots or GIFs for visual changes. Link GitHub issues when relevant and note any manual checks you performed.

## Asset & Deployment Notes
- Do not commit store credentials or analytics tokens; this repo is public. Deployment happens automatically via GitHub Pages on push to `main`, so verify the local preview before merging.
