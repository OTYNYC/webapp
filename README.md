# OTY NYC Website

A Bun-managed Next.js site for Orthodox Tewahedo Youth in New York City.

## Local Preview

```sh
bun run dev
```

## Static Build

```sh
bun run build
```

The static export output is `out/`.

## Deployment

This can deploy on Vercel as a Next.js project. Because `next.config.mjs` uses `output: "export"`, the same build can also deploy as static files on Netlify, Cloudflare Pages, GitHub Pages, or any static host.

- Build command: `bun run build`
- Output directory: `out`

Vercel can also detect the Next.js app automatically from `package.json` and `bun.lock`.
