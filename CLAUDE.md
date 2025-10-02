# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Portfolio website for mobile app developer Won, hosted on GitHub Pages. The site showcases 29+ Flutter and native mobile apps with individual landing pages for each application.

## Architecture

### Core Files
- **[index.html](index.html)** — Main portfolio landing page containing all app listings and navigation
- **[styles.css](styles.css)** — Primary stylesheet with CSS custom properties in `:root` for theming
- **[script.js](script.js)** — Interactive behaviors: navigation toggle, mobile menu, show/more apps expansion, and scroll-based project highlighting
- **Legacy variants** (`styles_old.css`, `script_old.js`, `index_old.html`) — Kept for reference only; do not edit

### App Structure
Each app has its own directory (`AppHub/`, `SweetSleep/`, `GhostLens/`, etc.) containing:
- `index.html` — Individual app landing page with embedded styles, SEO meta tags, and download links
- `download/` subdirectory — App icon (`Icon.png`) and promotional assets

### Shared Assets
- **[appstore.png](appstore.png)** — App Store download badge (referenced as `../appstore.png` from app pages)
- **[googleplay.png](googleplay.png)** — Google Play download badge (referenced as `../googleplay.png` from app pages)

### Flutter Web Assets
- **[assets/](assets/)** directory contains Flutter web build artifacts
- Critical files: `AssetManifest.json`, `FontManifest.json`, `main.dart.js`
- Replace entire `assets/` directory when updating Flutter build to maintain manifest consistency

## Development Commands

### Local Preview
```bash
# Option 1: Python HTTP server
python3 -m http.server 8080

# Option 2: npx serve (mirrors GitHub Pages caching)
npx serve@latest .
```

### Flutter Build Integration
When updating Flutter web exports:
```bash
# In upstream Flutter project
flutter build web --release

# Copy output to this repo's assets/ directory
```

## Adding New Apps

1. **Create app directory structure:**
   ```bash
   cp -r GhostLens/ NewApp/
   ```

2. **Update app landing page** (`NewApp/index.html`):
   - Update `<title>` and all meta tags (SEO, Open Graph, Twitter Card)
   - Change app icon path to `download/Icon.png`
   - Update app store links (Apple App Store and Google Play)
   - Modify features section with app-specific content
   - Ensure download badges reference `../appstore.png` and `../googleplay.png`

3. **Replace app icon:**
   - Update `NewApp/download/Icon.png` with new 1024x1024 app icon

4. **Add to main portfolio:**
   - Open [index.html](index.html)
   - Find the `<div class="projects-container">` section
   - Add new `<article class="project-item">` with:
     - App icon path: `NewApp/download/Icon.png`
     - App name, description, and relevant tags
     - Link to app page: `href="NewApp/"`
   - All apps are visible by default (no show/more distinction)

5. **Update portfolio statistics** (optional):
   - Update `.sidebar-stats` counts in main index.html if adding substantial apps

## Styling Guidelines

- **Indentation**: 4 spaces for HTML, CSS, and JavaScript
- **Class naming**: lowercase with hyphens (`.main-container`, `.project-item`)
- **CSS variables**: Define in `:root` unless component-specific override needed
- **JavaScript**: Use query selectors with data attributes; avoid inline handlers

## Key Interactive Features

### Navigation System
- Section-based routing via hash links (`#projects`, `#about`, `#contact`)
- Active states managed by `script.js` navigation handlers
- Mobile menu toggle for responsive sidebar

### Project Highlighting
- Intersection Observer tracks visible project tiles
- Active row highlighting based on scroll position (`setActiveProject` function)
- "Show More/Less" toggle for additional apps with fade-in animations

## Testing

### Manual Testing Checklist
After making changes, verify:
1. Desktop and mobile widths (Chrome DevTools responsive mode)
2. Navigation highlighting works correctly
3. Section toggles function properly
4. Download links are accessible
5. "Show More Apps" expansion/collapse works

### Asset Updates
When updating Flutter assets:
- Clear browser cache or append query strings to `flutter_service_worker.js`
- Verify new bundle loads correctly

## Deployment
- **Hosting**: GitHub Pages
- **Branch**: Deploys automatically from `main` branch
- **Domain**: won-space.com (configured via `CNAME`)
- **Jekyll**: Minimal config in `_config.yml` (GitHub Pages default)
- **Verification**: `google162eca4edabef93b.html` for Google Search Console
- Always test locally before pushing to `main`

## Commit Style
Follow existing patterns from git history:
- Short, imperative summaries (e.g., "Update portfolio", "Add Sweet Sleep", "Restyle app feed grid")
- Group related changes into single commits
- For visual changes, document before/after in PR with screenshots

## Important Notes
- Do not commit credentials or analytics tokens (repo is public)
- Each app landing page must include proper SEO meta tags:
  - Open Graph tags for social media sharing
  - Twitter Card tags for Twitter previews
  - Descriptive meta descriptions and keywords
- Background color for card images without backgrounds: `#3A3A4C`
- App icons should be 1024x1024px PNG format
- App store links format:
  - Apple: `https://apps.apple.com/us/app/{app-name}/id{app-id}`
  - Google: `https://play.google.com/store/apps/details?id={package-id}`
