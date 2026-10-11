# Jan Sultan’s Portfolio

A Vue 3 portfolio built with Vite and TypeScript, featuring Jan’s cybersecurity, AI automation, and web application projects. Includes category filters, an interactive profile terminal, project overviews, mobile navigation, and an optional Konami animation.

## Run locally

Requires Node.js 22.

```sh
npm ci
npm run dev
```

The development site runs at http://localhost:3000.

```sh
npm run lint
npm run build
npm run preview
```

The production site is generated in `dist/`.

## Deploy to Vercel

1. Import `achlys0165/personal-website` into Vercel as a new project.
2. Use the repository root as the root directory and `main` as the production branch.
3. Deploy. The included `vercel.json` selects Vite, installs with `npm ci`, builds with `npm run build`, and publishes `dist/`. Node.js 22 is set in `package.json`.

Navigation uses section anchors such as `/#experience`, so no route rewrites are needed. The contact form requires the service configuration below.

Vercel can deploy subsequent pushes to the connected production branch automatically. See [Vercel’s Vite documentation](https://vercel.com/docs/frameworks/frontend/vite).

## Edit the portfolio

- `src/App.vue`: Page content and Vue interactions.
- `src/profile.ts`: Public profile, real projects, skills, experience, education, and courses. Expand the project summaries and scope here when documentation is ready.
- `src/index.css`: Shared styles and responsive layouts.
- `index.html`: Site metadata and Vue entry point.

The contact form sends a JSON request to `/api/contact`, a Vercel Node.js function. Messages are sent through Resend to `jansultan670@gmail.com`; the visitor’s address is used only as Reply-To. Direct email links and email copying are also available.

## Configure email and spam protection

1. In [Resend](https://resend.com/docs/dashboard/domains/introduction), verify a sender domain and create a sending API key. The verified address is the sender; Jan’s Gmail remains the recipient. Cloudflare Turnstile does not require moving your website’s DNS to Cloudflare.
2. Create a managed [Cloudflare Turnstile widget](https://developers.cloudflare.com/turnstile/get-started/) and add your actual production hostname. Copy its public site key and private secret key.
3. Create an [Upstash Redis database](https://upstash.com/docs/redis/overall/getstarted), then copy its REST URL and REST token. One shared database provides the rate limit across Vercel function instances.
4. In Vercel → Project → Settings → Environment Variables, add the following for Production. Use separate credentials and exact allowed hostnames if enabling Preview or Development.

| Variable | Value |
| --- | --- |
| `VITE_TURNSTILE_SITE_KEY` | Public Turnstile site key; the only credential included in the browser build |
| `TURNSTILE_SECRET_KEY` | Private Turnstile secret |
| `RESEND_API_KEY` | Private sending API key |
| `CONTACT_FROM_EMAIL` | Verified sender, such as `Jan <contact@your-domain.com>` |
| `CONTACT_ALLOWED_ORIGINS` | Exact site origins, e.g. `https://your-site.vercel.app,https://your-domain.com`; no wildcards or paths |
| `UPSTASH_REDIS_REST_URL` | Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Private Redis REST token |

5. Redeploy after saving the variables. Vite reads the public site key during the build. Submit one real message and confirm it arrives in Jan’s inbox; check Resend’s delivery status if it does not.

Never put private credentials in a `VITE_` variable or commit them. `.env.example` contains names only; actual `.env` files are ignored. The form stays disabled when its public site key is missing, and the API refuses submissions when server settings are incomplete.

Each IP may make 3 valid-format attempts per 10-minute sliding window. Invalid or expired Turnstile tokens also consume an attempt. The limit uses an HMAC of the Vercel edge IP rather than storing the raw IP in Redis. Responses above the limit use HTTP 429 and `Retry-After`; the form displays a wait time. Redis errors or timeouts block sending rather than bypassing the limit.

The API also validates the origin, Turnstile hostname and `contact` action, field lengths, body size, and a hidden bot field. It uses a fixed recipient and plain-text email to prevent visitor-controlled recipients or HTML. Secret keys, token contents, and messages are not logged. Resend and Cloudflare receive the data needed to provide their respective services.

## Verify locally

```sh
npm test
npm run build
```

Tests mock provider responses and cover accepted messages, input validation, bot checks, rate limits, service failures, and missing configuration. They do not send real email or prove live provider credentials work.

`npm run dev` and `npm run preview` serve the frontend only. To exercise the Vercel function locally, use `npx vercel dev` with a local ignored environment file, allow your localhost origin, and authorize the localhost hostname in your development Turnstile widget. Use development credentials, and keep Cloudflare test keys out of Production. The API expects `x-vercel-forwarded-for`, which Vercel sets at its edge; a bare frontend server cannot emulate production email delivery.

Profile details come from Jan’s resume and portfolio brief. Project entries describe known work without invented achievements, deployment claims, or documentation links. Source links are shown only for known repositories.
