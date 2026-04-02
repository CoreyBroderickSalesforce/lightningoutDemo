# Lightning Out POC Website

Self-contained static website POC for demonstrating Salesforce Lightning Out hosting behavior.

## What this includes

- `index.html`: support-portal-style landing page with visual tiles and manual Session ID input.
- `host.html`: rate-tool-style page with a Lightning Out mount container.
- `assets/js/app.js`: validates and stores Session ID in `sessionStorage`, then redirects.
- `assets/js/host.js`: reads Session ID, handles missing-session guard, and initializes Lightning Out when configured.
- `assets/js/lightning-config.js`: central place for endpoint/app/component/script configuration.
- `assets/css/styles.css` and `assets/img/*`: local styling and graphics with no external asset dependency.

## Run locally

You can open `index.html` directly, or run a static server:

```bash
python3 -m http.server 8080
```

Then browse to `http://localhost:8080`.

## Configure Lightning Out

Edit `assets/js/lightning-config.js`:

- `lightningOutScriptUrl`: URL to `lightning.out.js`.
- `lightningEndPoint`: Salesforce domain endpoint.
- `lightningApp`: Aura app name used for Lightning Out.
- `componentName`: component to render.
- `componentAttributes`: attributes passed to component.

For this POC:

1. Open the landing page and enter a valid Session ID manually.
2. Submit to go to `host.html`.
3. The host page uses that Session ID from `sessionStorage`.

## Deploy to GitHub Pages

1. Push this folder contents to a GitHub repository.
2. In repository settings, enable GitHub Pages from your selected branch (typically `main`) and root folder.
3. Visit the generated GitHub Pages URL.

## Styling reference links

- [Canada Post Home](https://www.canadapost-postescanada.ca/)
- [Canada Post Support](https://www.canadapost-postescanada.ca/cpc/en/support.page)
- [Canada Post Find a Rate](https://www.canadapost-postescanada.ca/cpc/en/tools/find-a-rate.page)
