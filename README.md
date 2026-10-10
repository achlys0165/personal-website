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

No environment variables or API keys are required. Navigation uses section anchors such as `/#experience`, so no route rewrites are needed.

Vercel can deploy subsequent pushes to the connected production branch automatically. See [Vercel’s Vite documentation](https://vercel.com/docs/frameworks/frontend/vite).

## Edit the portfolio

- `src/App.vue`: Page content and Vue interactions.
- `src/profile.ts`: Public profile, real projects, skills, experience, education, and courses. Expand the project summaries and scope here when documentation is ready.
- `src/index.css`: Shared styles and responsive layouts.
- `index.html`: Site metadata and Vue entry point.

The contact form validates the required fields and opens an email draft addressed to Jan in the visitor’s email app. It does not send messages through a server. Email copying is also supported.

Profile details come from Jan’s resume and portfolio brief. Project entries describe known work without invented achievements, deployment claims, or documentation links. Source links are shown only for known repositories.
