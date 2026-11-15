# FoxMad Studios website

Single-page studio site: plain HTML, CSS and JavaScript, no build step.

- `index.html`: page content
- `styles.css`: design tokens (from the FoxMad style sheet), layout and animations
- `main.js`: scroll reveals, nav behaviour, hero embers and pointer glow
- `assets/`: logo and icons

## Preview locally

```bash
npx http-server@14.1.1 -p 5173 -c-1
```

Then open http://localhost:5173.

## Gravity Post links that are waiting

The site currently shows only Gravity Post. Three links are shown as "coming soon" until they go public:

- Steam store page (waiting for Valve's review): https://store.steampowered.com/app/5598990/
- itch.io demo: https://foxmadstudios.itch.io/gravity-post
- Press kit: https://foxmadstudios.itch.io/gravity-post-press-kit

Each one has the ready-made link in an HTML comment next to it in `index.html`; swap the "coming soon" span for that link when the page is public.

## Still to do

- Absolute URL for the `og:image` share preview once the domain is known
