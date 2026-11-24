# Jan Sultan / jan.sec

A pre-rendered Vue portfolio for Jan Sultan, a Cybersecurity & Forensics student at Asia Pacific College. The visual direction uses deep navy, amber calls to action, electric-blue lighting, and original glossy illustrations. The content covers church/ministry software, client websites, AI-assisted tools, security tooling, CTF results, coursework, and community involvement.

## Run and verify

Use Node.js 22.

```sh
npm ci
npm run dev
npm run build
npm test
npm run preview
```

Development runs on port 3000. The build renders real portfolio content into `dist/index.html`, then Vue hydrates the interactions. No runtime SSR service is needed. The build asserts required content and contact information and rejects em dashes in published copy.

## Deployment and SEO

Repository: `achlys0165/personal-website`. Vercel uses the repository root, Node 22, `npm ci`, `npm run build`, and `dist/`, as configured in `vercel.json`. Canonical domain: `https://jan-sec.vercel.app/`. Update `index.html`, `public/robots.txt`, and `public/sitemap.xml` if that domain changes. Metadata includes the page title, description, canonical URL, Person structured data, and a 1200 x 630 social image at `public/og-image.png`.

The visible contact UI uses mailto and a copy-email button; it needs no private service keys. Direct email and source links work without JavaScript. Public Sans and Space Grotesk are self-hosted, with licences in `public/fonts/`.

## Artwork delivery

- `public/art/manifest.json` lists the six core illustrations plus a supporting glass cube. Every final PNG master and responsive transparent WebP variant has a filename, exact byte size, dimensions, and final/placeholder status.
- `assets/artwork/` contains optimized transparent PNG masters and a README recording the prompt set and source. These are original AI-generated illustrations made with OpenAI's built-in image generation tool. No externally sourced models, stock artwork, or partner logos are used; no third-party stock licence applies.
- The shield uses 640/960/1280 px WebP variants. Other images use 160/320/640 px variants. The hero is eager/high-priority; other images are lazy. The hero needs no realtime 3D library.
- The shield and supporting cubes use capped CSS motion and gentle pointer parallax. Motion pauses off-screen, when the tab is hidden, or via the pause control. Reduced motion disables animation and parallax. Section reveals run only when in view.
- Real project screenshots have not been supplied. The four device frames explicitly say screenshot pending and identify their images as illustrations, not project captures. Nothing generated is presented as software evidence.

## Source map

- `src/App.vue`: page structure, real project/category copy, approved CTF/graduation stats, navigation, and email copying.
- `src/redesign.css`: navy/amber/blue visual layer and responsive layouts, layered over shared styles in `src/index.css`.
- `src/components/HeroShield.vue` and `RenderAsset.vue`: accessible shield discovery, motion lifecycle, responsive image delivery.
- `src/profile.ts`: public profile, projects, results, experience, and coursework.
- `src/caseStudies.ts`: project problems, contributions, outcomes, stacks, and missing evidence.
- `src/components/EvidenceBoard.vue` and `evidence/`: the preserved eight-subject project map, inside an expandable section under Selected work. Its optional 3D scene loads only when opened and visible; semantic HTML and a static fallback remain available.
- `src/components/SkillGraph.vue` and `ExperienceLog.vue`: project-linked skills and a keyboard-accessible work-log scrubber.
- `src/components/FlagHunt.vue` and `src/visualState.ts`: the exact supplied hero flag, a local submission reward, and retained evidence flag support.
- `src/entry-server.ts` and `scripts/prerender.mjs`: build-time HTML rendering.

The stats row repeats only Jan's approved results: JISSA-APC x Resecurity 1st Runner-Up team result in September 2026, SEEN 2025 9th place, Hack the Beat 10th place, and expected graduation in 2028. AWS Academy and Cisco Networking Academy are described as coursework, not claimed professional certifications. Community affiliations use text rather than unapproved logos.

## Outstanding project evidence

| Area | Still needed |
| --- | --- |
| TOP Church worship system | Approved screenshots, recording, shareable public link, decisions and usage/outcome evidence. |
| WebCTF-Auto | Project date, shareable link, real sample report, worked challenge example, findings and decision note. |
| JSP Engineering Services | Approved screenshots, public launch link, client feedback, consultation-flow decisions and launch evidence. |
| StudyHub | Project date, screenshots, public demo, evaluation and a documented example. |
| Ministry management / NFC attendance | Detailed role, decisions, dates, evidence and shareable assets before expanding into full case studies. |
| Hack the Beat / JISSA-APC membership | Competition date and membership dates. |
| Writeups | Challenge documentation and article links. |

No invented metrics, testimonials, team members, credential IDs, or unverified live project URLs are published.

## Retained contact API

`api/contact.ts`, `server/contact.ts`, and their 11 tests retain the existing Resend/Turnstile/Upstash endpoint. The visible mailto UI does not call it. It stays closed to submissions until configured; its validation and shared rate limit are unchanged.

If a verified form is restored, set `RESEND_API_KEY`, a verified `CONTACT_FROM_EMAIL`, `TURNSTILE_SECRET_KEY`, exact `CONTACT_ALLOWED_ORIGINS`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN` privately in Vercel. It expects a Turnstile token with action `contact`, matching hostname, and Vercel's edge IP header. `.env.example` documents these names. Never commit secrets.

## Verification

Checked on 24 November 2026 against the local production build in headless Edge:

- Final mobile Lighthouse: performance 97, accessibility 100, SEO 100. LCP 2.3 seconds, total blocking time 130 ms, cumulative layout shift 0. The visible-label audit also passes.
- Desktop and mobile checks pass for hero discovery, three build cards, approved stats, four case studies, the preserved evidence map, CTF/community ledger, About, project-linked skills, working email links, clipboard copying, and exact hero-flag submission.
- No document overflow at 360, 390, 768, 1024, or 1440 px, including the open evidence map at 360 px. Mobile navigation, keyboard Enter/Escape and focus restoration pass.
- Motion pauses off-screen, in hidden tabs, and via controls. Reduced motion disables floating and parallax. The hero requests no WebGL code; the optional evidence scene stays unloaded until its section is opened.
- JavaScript-disabled HTML retains all four case studies, eight evidence subjects, hero artwork, and direct email links. No browser errors were observed.
- The production build and all 16 tests pass, including asset-manifest integrity, both accepted flags, evidence relationships, and retained contact API validation/rate-limit tests.

These are local lab results, not physical-device measurements or a complete manual accessibility audit. Project captures and the other evidence listed above remain pending.
