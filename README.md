# 520i G30 Obsidian

Immersive single-page WebGL landing page for a stylized glossy black 520i G30-inspired sedan. The car is built procedurally with three.js geometry and custom materials; it does not use official BMW CAD, logo assets, or downloaded proprietary meshes.

## Run and build

```bash
npm install
npm run build
npm run preview -- --host 0.0.0.0 --port 8787
```

Static output is written to `dist/`.

## Serve dist on warren-tpe-01 port 8787

```bash
npm install
npm run build
python3 -m http.server 8787 -d dist
```

## Notes

- Procedural stylized mesh only.
- No official BMW mesh, CAD, CDN asset, or logo artwork.
