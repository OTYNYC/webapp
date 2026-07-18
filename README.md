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
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token for runtime content and image storage

Optional environment variables:

- `ADMIN_USERNAME`: require a specific username in addition to the password

When `BLOB_READ_WRITE_TOKEN` is present, saving in `/admin` writes the editable public site content to Vercel Blob at
`content/site-content.json`. The public homepage and calendar page read from Blob at request time, so admin edits do
not create GitHub commits or trigger full redeployments.

Admin image uploads use direct browser-to-Blob uploads. The admin API verifies the signed-in session and issues a
short-lived upload token, then the browser sends the image directly to Vercel Blob. Images are saved as public Blob
files and are capped at 25 MB.

Local development without Blob credentials falls back to the checked-in JSON files for content. Image uploads require
Blob credentials.

## Calendar (Google Calendar)

`/calendar` renders a custom month-view calendar backed by a live Google Calendar, with a click-into-day modal
showing each event's time, location, description, and any image/file attachments.

Required environment variables:

- `GOOGLE_CALENDAR_API_KEY`: Google Cloud API key with the Calendar API enabled
- `GOOGLE_CALENDAR_ID`: the calendar's ID from Google Calendar Settings > Integrate calendar

The calendar must be public ("Make available to public") for API-key-only access to work. Without both variables
set, `/calendar` renders a setup notice instead of erroring.

Image attachments only render inline if the underlying Google Drive file is shared "Anyone with the link" -
otherwise the attachment still shows as a downloadable link. Event descriptions are rendered as plain text (not
HTML) since calendar organizers are an untrusted input source for the site's rendering.

## Deployment

This should deploy on Vercel as a Next.js project so the admin API routes can run.

- Build command: `bun run build`

Vercel can also detect the Next.js app automatically from `package.json` and `bun.lock`.
