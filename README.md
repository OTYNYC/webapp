# OTY NYC Website

A Bun-managed Next.js site for Orthodox Tewahedo Youth in New York City.

## Local Preview

```sh
bun run dev
```

## Build

```sh
bun run build
```

Run the production server after a build with:

```sh
bun run preview
```

## Admin Publishing

The admin dashboard lives at `/admin`. It has sign-in only; there is no public account creation.

Required environment variables:

- `ADMIN_PASSWORD`: password for admin sign-in
- `ADMIN_SESSION_SECRET`: secret used to sign the admin session cookie

Optional environment variables:

- `ADMIN_USERNAME`: require a specific username in addition to the password
- `GITHUB_CONTENT_TOKEN`: GitHub token with repository contents read/write access
- `GITHUB_CONTENT_REPO`: repository in `owner/repo` format, if it cannot be inferred from Vercel
- `GITHUB_CONTENT_BRANCH`: branch to commit content updates to, defaults to the Vercel branch or `main`

When GitHub content variables are present, saving in `/admin` commits the JSON content files under `content/`.
If the repo is connected to Vercel, that commit starts a new deployment automatically.

Admin image uploads are saved under `public/assets/uploads/`. In production, uploads also use `GITHUB_CONTENT_TOKEN`
to commit the image file to GitHub before the content form is saved.

## Deployment

This should deploy on Vercel as a Next.js project so the admin API routes can run.

- Build command: `bun run build`

Vercel can also detect the Next.js app automatically from `package.json` and `bun.lock`.
