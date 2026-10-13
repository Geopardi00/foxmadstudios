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

## Still to do before launch

- Real contact email (currently `hello@example.com`)
- Real social links (Discord, Bluesky, YouTube placeholders)
- Absolute URL for the `og:image` share preview once the domain is known
