
## Build & Deploy

### Requirements
- **Node.js** 18+
- **Google Chrome** installed at `/Applications/Google Chrome.app` (required for prerendering)

### Deploy process
```bash
npm run build   # builds Vite bundle + prerenders all 10 routes via react-snap
NETLIFY_AUTH_TOKEN=$(cat ~/.openclaw/secrets/netlify-token.txt) netlify deploy --prod --dir=dist --site=211f53bc-ba90-4c68-8eb1-78028ad9bf49
```

### Adding a new route
When adding a new page, update all three of these or the new route will serve an empty shell to Googlebot:
1. `src/App.jsx` — add the `<Route>`
2. `package.json` → `reactSnap.include` — add the path
3. `public/sitemap.xml` — add the `<url>` entry

### Prerendering
react-snap uses the local Chrome installation to render each route at build time and writes static HTML to `dist/`. This means:
- Every crawler (Googlebot, Bingbot, etc.) gets full HTML content on first fetch
- Build requires Chrome on the build machine — not compatible with standard CI environments without additional setup
- Build adds ~30 seconds for the prerender step

### Edge Function
`netlify/edge-functions/prerender.js` provides belt-and-suspenders meta tag injection for bot requests. It's a secondary layer — the static HTML files are the primary fix.
