This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Database migrations

Project content lives in Postgres. Apply pending migrations (idempotent) with:

```bash
DB_URL=postgres://... npm run db:migrate
```

## Admin panel

A small built-in CMS lives at [`/admin`](http://localhost:3000/admin). It lets you create,
edit, reorder and delete projects, with every text field editable in both
Spanish and English, plus the cover image and the gallery (captions per
language). Images can be uploaded straight to Cloudinary from the form or
pasted as existing `res.cloudinary.com` URLs. Saving a project revalidates the
public pages immediately.

Setup:

1. Run the migrations (`npm run db:migrate`) - `0003_admin_panel.sql` adds the
   defaults/unique indexes the panel relies on.
2. Generate the password hash and put it in the environment:

   ```bash
   npm run admin:hash-password
   # -> ADMIN_PASSWORD_HASH=scrypt.v1....
   ```

   `ADMIN_PASSWORD` (plain text) also works for local development.
   Optionally set `ADMIN_SESSION_SECRET`; otherwise the session cookie is
   signed with a key derived from the password hash.
3. For uploads, set `CLOUDINARY_URL` (or `CLOUDINARY_CLOUD_NAME`,
   `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`). Without it the form still
   works with pasted URLs.

See `.env.example` for the full list of variables. `/admin` is never
localized or indexed, and every request to it (pages, server actions and the
upload API) is checked against the signed, HttpOnly session cookie.

## Runtime logs

Server-side events are emitted as one-line JSON through `console.info`,
`console.warn`, and `console.error`. Vercel captures these automatically in
the deployment's runtime logs; local development prints the same entries in
the terminal.

Useful admin events include `admin.login.attempt`, `admin.login.rejected`,
`admin.login.success`, `admin.login.verification_error`, and
`admin.login.session_error`. Login diagnostics include only the credential
source and whether the hash has the expected format. Passwords, hashes,
cookies, and form bodies are never logged.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
