# Jan Sultan / jan.sec

A dark, evidence-led portfolio for a Cybersecurity & Forensics student at Asia Pacific College. Selected work leads with the TOP Church worship presentation system and WebCTF-Auto, followed by JSP Engineering Services and StudyHub.

## Run and verify

Node.js 22 is required.

```sh
npm ci
npm run dev
npm run build
npm test
npm run preview
```

Development runs on port 3000. The production build uses Vue's server renderer at build time to put all portfolio content in `dist/index.html`, then hydrates the few client interactions. No runtime rendering service is needed. The build asserts that the main content and contact link exist in the generated HTML and that published copy contains no em dashes.

## Deployment

The GitHub repository is `achlys0165/personal-website`. Vercel uses the repository root, Node 22, `npm ci`, `npm run build`, and `dist/`, as configured in `vercel.json`. The canonical URL is `https://jan-sec.vercel.app/`. Update it in `index.html`, `public/robots.txt`, and `public/sitemap.xml` if the domain changes.

The visible contact section uses a mailto link and copy-email button. It needs no service keys. Visitors can read the entire page and use email and project links without JavaScript. Public Sans and Space Grotesk Latin WOFF2 subsets are self-hosted with their licenses in `public/fonts/`. Moving connections and the event marquee pause off-screen. Mobile and reduced-motion modes use static alternatives. There is no canvas/WebGL runtime, video download, or extra animation library. The 1200 x 630 social card is `public/og-image.png`.

## Content and source

- `src/App.vue`: page structure, approved hero/About prose, navigation, and copy-email interaction.
- `src/caseStudies.ts`: four case studies, scope diagrams, project-specific skills, and explicitly marked missing evidence.
- `src/profile.ts`: existing profile, project scope, repository links, competition results, and courses. Historical records are retained; the current visual views are rendered.
- `src/index.css`: charcoal/amber/steel tokens, self-hosted fonts, responsive layout, focus and reduced-motion styles.
- `src/components/EvidenceBoard.vue`: draggable HTML/SVG project board with keyboard movement and ordinary anchor links.
- `src/components/SkillGraph.vue`: tool-to-project connections and contextual project links.
- `src/components/ExperienceLog.vue`: scrollable work history with a keyboard-accessible range scrubber.
- `src/components/RankLabel.vue` and `FlagHunt.vue`: CTF result animation and a local, source-discoverable flag challenge.
- `src/visualState.ts`: tested node boundaries and flag checking.
- `src/entry-server.ts` and `scripts/prerender.mjs`: build-time HTML rendering.
- `index.html`: metadata, canonical URL, structured data, and image cards.

The framed case-study diagrams describe supplied project scope; screenshot and recording slots are explicitly marked pending. They are not screenshots or measured proof of deployment. Existing source links are preserved; unknown public links are visibly marked as pending.

## Outstanding evidence and questions

Every visible placeholder is listed below. Replace it only with Jan's supplied information.

| Area | Placeholder / question |
| --- | --- |
| TOP Church worship system | Approved screenshots, public repository or live link if shareable, tradeoffs behind the web/desktop split, and usage/outcome evidence. What did you decide, and what changed for the team? |
| WebCTF-Auto | Project date, public link if shareable, sample Markdown/JSON report, a worked challenge example, findings, and a decision note about automation versus manual review. Which example can be published? |
| JSP Engineering Services | Approved screenshots, public live URL if one exists, consultation-flow decision note, client feedback and launch evidence. What information can the client allow you to share? |
| StudyHub | Project date, screenshots, demo/live URL if available, handling/evaluation of generated material and malformed responses, and a documented example. What was your specific decision and learning? |
| Music Ministry Management / NFC attendance | Detailed case studies are pending documentation. Supply role, decisions, evidence, dates, and shareable assets before expanding them. |
| Hack the Beat | Competition date. |
| JISSA-APC membership | Membership dates. |
| Writeups | Article links/content. The section is a structure for challenge context, investigation steps, evidence, and lessons; it contains no invented article titles. |

No project metrics, testimonials, certification IDs, team sizes, or unverified live links have been added.

## Dark redesign verification

Checked on 24 November 2026 against the local production build, using headless Edge:

- Lighthouse 12.8.2: mobile performance 99, accessibility 100, SEO 100; desktop performance 100, accessibility 100, SEO 100.
- No horizontal overflow at 360, 390, 768, 1024, and 1440 pixels; mobile navigation and clipboard copying passed.
- All four case studies and the mailto link remain readable with JavaScript disabled. Hydration produced no browser errors.
- Board dragging and keyboard movement, project-linked skills, the timeline scrubber, marquee pause, correct/incorrect flag submissions, off-screen motion pausing, reduced motion, and font loading passed the browser checks. The generated social image is 1200 x 630.
- All 13 tests passed, including the retained API tests and the new board-boundary/flag tests. Dependency audit after the build-tool updates reported zero advisories.

These are local lab results, not a claim about real-user connection speeds or a complete manual WCAG conformance audit.

## Retained contact API

`api/contact.ts`, `server/contact.ts`, and their 11 tests retain the previously implemented Resend/Turnstile/Upstash endpoint. The current UI does not call it. It remains closed to submissions until configured, and its validations and shared rate limit are unchanged.

If a verified form is restored later, set `RESEND_API_KEY`, a verified `CONTACT_FROM_EMAIL`, `TURNSTILE_SECRET_KEY`, exact `CONTACT_ALLOWED_ORIGINS`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN` privately in Vercel. The endpoint expects a Turnstile token with action `contact`, a matching hostname, and Vercel's edge IP header. `.env.example` documents the configuration names; never commit private keys. The current mailto contact does not depend on this setup.
