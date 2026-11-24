<script setup lang="ts">
import { onBeforeUnmount, ref, type ObjectDirective } from "vue";
import { courses, profile, securityActivities } from "./profile";
import { caseStudies } from "./caseStudies";
import EvidenceBoard from "./components/EvidenceBoard.vue";
import HeroDesk from "./components/HeroDesk.vue";
import SkillGraph from "./components/SkillGraph.vue";
import ExperienceLog from "./components/ExperienceLog.vue";
import FlagHunt from "./components/FlagHunt.vue";
import RankLabel from "./components/RankLabel.vue";
import { portfolioFlag } from "./visualState";

const mobileOpen = ref(false);
const marqueePaused = ref(false);
const vInview: ObjectDirective<HTMLElement> = {
  mounted(el) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries)
        entry.target.classList.toggle("is-inview", entry.isIntersecting);
    });
    observer.observe(el);
    (el as HTMLElement & { cleanup?: () => void }).cleanup = () =>
      observer.disconnect();
  },
  unmounted(el) {
    (el as HTMLElement & { cleanup?: () => void }).cleanup?.();
  },
};
function tilt(event: PointerEvent) {
  if (
    window.matchMedia("(prefers-reduced-motion: reduce), (hover: none)").matches
  )
    return;
  const el = event.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();
  el.style.setProperty(
    "--tilt-x",
    ((event.clientY - rect.top) / rect.height) * -5 + 2.5 + "deg",
  );
  el.style.setProperty(
    "--tilt-y",
    ((event.clientX - rect.left) / rect.width) * 5 - 2.5 + "deg",
  );
}
function untilt(event: PointerEvent) {
  const el = event.currentTarget as HTMLElement;
  el.style.setProperty("--tilt-x", "0deg");
  el.style.setProperty("--tilt-y", "0deg");
}
const copyStatus = ref("");
let copyTimer: ReturnType<typeof setTimeout> | undefined;
async function copyEmail() {
  try {
    await navigator.clipboard.writeText(profile.email);
    copyStatus.value = "Email address copied.";
  } catch {
    copyStatus.value = `Copy this address: ${profile.email}`;
  }
  if (copyTimer) clearTimeout(copyTimer);
  copyTimer = setTimeout(() => {
    copyStatus.value = "";
  }, 5000);
}
onBeforeUnmount(() => {
  if (copyTimer) clearTimeout(copyTimer);
});
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header wrap">
    <a class="wordmark" href="#hero" aria-label="jan.sec | Jan Sultan home"
      >jan<span>.sec</span></a
    >
    <nav class="desktop-nav" aria-label="Main navigation">
      <a href="#projects">Selected work</a
      ><a href="#experience">CTF & community</a><a href="#about">About</a
      ><a href="#contact">Contact</a>
    </nav>
    <span class="header-note metadata">Taguig, Philippines</span>
    <button
      class="menu-toggle"
      :aria-expanded="mobileOpen"
      aria-controls="mobile-nav"
      @click="mobileOpen = !mobileOpen"
      @keydown.esc="mobileOpen = false"
    >
      {{ mobileOpen ? "Close" : "Menu" }}
    </button>
    <nav
      v-if="mobileOpen"
      id="mobile-nav"
      class="mobile-nav"
      aria-label="Mobile navigation"
      @keydown.esc="mobileOpen = false"
    >
      <a href="#projects" @click="mobileOpen = false">Selected work</a
      ><a href="#experience" @click="mobileOpen = false">CTF & community</a
      ><a href="#about" @click="mobileOpen = false">About</a
      ><a href="#contact" @click="mobileOpen = false">Contact</a>
    </nav>
  </header>

  <main id="main">
    <section id="hero" class="hero wrap" aria-labelledby="hero-title">
      <div class="hero-eyebrow metadata">
        <span>Computer Science / Asia Pacific College</span
        ><span>Expected graduation 2028</span>
      </div>
      <div class="hero-scene">
        <div class="hero-copy">
          <h1 id="hero-title">
            Jan <span>Sultan<span class="name-period">.</span></span>
          </h1>
          <div class="hero-bottom">
            <p class="hero-introduction">
              I’m a Cybersecurity &amp; Forensics student at Asia Pacific
              College, building software for clients and TOP Church while
              competing in CTFs.
            </p>
            <div class="hero-actions">
              <a class="button" href="#projects">View work</a
              ><a class="text-link" href="#contact">Contact me</a>
            </div>
          </div>
        </div>
        <HeroDesk />
      </div>
      <div class="hero-index metadata">
        <span>A record of software built and challenges investigated.</span
        ><a href="#projects">Read the selected work below</a>
      </div>
    </section>

    <section
      id="projects"
      class="work-section wrap"
      aria-labelledby="work-title"
    >
      <div class="section-heading">
        <p class="eyebrow">Selected work</p>
        <h2 id="work-title">
          From worship slides<br />to web challenge source.
        </h2>
        <p>What I built, who it was for, and the details I can share.</p>
      </div>
      <article
        v-for="(study, index) in caseStudies"
        :id="study.project.id"
        :key="study.project.id"
        class="case-study"
        v-inview
        :aria-labelledby="`case-title-${index}`"
      >
        <div class="case-index metadata">
          <span class="evidence-tag">Evidence / 0{{ index + 1 }}</span
          ><span>{{ study.label }}</span>
        </div>
        <div class="case-layout">
          <div class="case-copy">
            <p class="project-name">{{ study.project.title }}</p>
            <h3 :id="`case-title-${index}`">{{ study.title }}</h3>
            <p class="case-role">
              {{ study.role }}<br /><span class="metadata">{{
                study.dates
              }}</span>
            </p>
            <dl class="case-details">
              <div>
                <dt>The problem</dt>
                <dd>{{ study.problem }}</dd>
              </div>
              <div>
                <dt>My role</dt>
                <dd>{{ study.contribution }}</dd>
              </div>
              <div>
                <dt>Decisions & learning</dt>
                <dd
                  :class="{
                    placeholder: study.decision.startsWith(
                      'Decision note pending',
                    ),
                  }"
                >
                  {{ study.decision }}
                </dd>
              </div>
              <div>
                <dt>What came out of it</dt>
                <dd>{{ study.outcome }}</dd>
              </div>
            </dl>
            <p class="stack">
              <span class="metadata">Stack</span
              >{{ study.project.technologies.join(" / ") }}
            </p>
            <a
              v-if="study.project.source"
              class="text-link project-source"
              :href="study.project.source"
              target="_blank"
              rel="noopener noreferrer"
              >View {{ study.project.title }} source<span class="sr-only">
                (opens in a new tab)</span
              ></a
            >
            <p v-else class="placeholder link-placeholder">
              Public link pending
            </p>
          </div>
          <figure
            class="project-exhibit"
            @pointermove="tilt"
            @pointerleave="untilt"
          >
            <div class="frame-chrome" aria-hidden="true">
              <i></i><i></i><i></i><span>{{ study.project.title }}</span>
            </div>
            <div class="exhibit-head metadata">
              <span>{{
                study.project.id === "hymn"
                  ? "TOP Church"
                  : study.project.id === "jsp"
                    ? "JSP Engineering"
                    : study.project.title
              }}</span
              ><span>Scope diagram</span>
            </div>
            <div class="workflow" :class="`workflow-${index}`">
              <div
                v-for="(step, stepIndex) in study.flow"
                :key="step"
                class="workflow-step"
              >
                <span class="metadata">0{{ stepIndex + 1 }}</span
                ><span>{{ step }}</span>
              </div>
            </div>
            <div class="asset-pending">
              <span class="metadata">Asset pending</span>
              <p>
                {{
                  index === 0
                    ? "Screenshots and a slide-generation recording"
                    : index === 1
                      ? "A real sample report and recorded run"
                      : "Approved project screenshots"
                }}
              </p>
            </div>
            <figcaption>{{ study.caption }}</figcaption>
          </figure>
        </div>
      </article>
      <div id="supporting-work" class="supporting-work">
        <p class="eyebrow">Also built for ministry teams</p>
        <p>
          <strong>Music Ministry Management</strong> brings together musician
          schedules, setlists, notifications, and accounts. An
          <strong>NFC attendance system</strong> pairs attendance capture with a
          Supabase-backed web dashboard. Detailed case studies are pending
          documentation.
        </p>
      </div>
    </section>

    <section
      id="evidence-map"
      class="wrap evidence-map-section"
      aria-labelledby="evidence-map-title"
    >
      <div>
        <p class="eyebrow">Project / skills map</p>
        <h2 id="evidence-map-title">Connected evidence.</h2>
        <p class="map-intro">
          Explore the connections between my projects, tools, and CTF result.
        </p>
      </div>
      <EvidenceBoard v-inview :data-evidence="portfolioFlag" />
    </section>

    <section
      id="experience"
      class="community-section"
      v-inview
      aria-labelledby="community-title"
    >
      <div class="wrap">
        <div class="section-heading">
          <p class="eyebrow">CTF & community</p>
          <h2 id="community-title">
            CTFs with JISSA.<br />Volunteering at PhilSec.
          </h2>
          <p>
            I compete in CTFs and take part in the local security community.
          </p>
        </div>
        <div class="event-marquee" :class="{ paused: marqueePaused }">
          <div class="event-track" aria-hidden="true">
            <span v-for="copy in 2" :key="copy"
              >JISSA–APC × Resecurity <b>/</b> SEEN 2025 <b>/</b> Hack the Beat
              <b>/</b> PhilSec 2026 <b>/</b></span
            >
          </div>
          <button
            type="button"
            @click="marqueePaused = !marqueePaused"
            :aria-pressed="marqueePaused"
          >
            {{ marqueePaused ? "Resume event motion" : "Pause event motion" }}
          </button>
        </div>
        <div
          class="ledger-scroll"
          tabindex="0"
          role="region"
          aria-label="CTF results and community involvement"
        >
          <table class="ledger">
            <caption class="sr-only">
              CTF results and community participation
            </caption>
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">Event / organizer</th>
                <th scope="col">My involvement</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="activity in securityActivities" :key="activity.role">
                <td class="metadata">{{ activity.dates || "Date pending" }}</td>
                <th scope="row">
                  {{
                    activity.role === "Student Volunteer"
                      ? "PhilSec 2026"
                      : activity.role
                  }}<span class="organizer">{{ activity.organization }}</span>
                </th>
                <td :class="{ placement: !!activity.achievement }">
                  <RankLabel
                    v-if="activity.achievement"
                    :label="activity.achievement"
                  /><span v-else>Student volunteer</span>
                </td>
              </tr>
              <tr>
                <td class="metadata">Dates pending</td>
                <th scope="row">
                  JISSA–APC<span class="organizer">Asia Pacific College</span>
                </th>
                <td>Member</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ExperienceLog />
        <div id="writeups" class="writeups">
          <div>
            <p class="eyebrow">Investigation notes</p>
            <h3>Web CTF investigation notes.</h3>
          </div>
          <div>
            <p>
              I’ll use this space for challenge context, investigation steps,
              evidence, and what I learned.
            </p>
            <p class="placeholder">
              Writeups pending. Links and articles to be added.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section
      id="about"
      class="about-section wrap"
      aria-labelledby="about-title"
    >
      <div>
        <p class="eyebrow">About</p>
        <h2 id="about-title">Based in Taguig.<br />Studying at APC.</h2>
        <dl class="about-facts">
          <div>
            <dt>Based in</dt>
            <dd>{{ profile.location }}</dd>
          </div>
          <div>
            <dt>Studying</dt>
            <dd>
              {{ profile.school }}<br />BS Computer Science<br />Cybersecurity &
              Forensics<br />Expected graduation {{ profile.graduation }}
            </dd>
          </div>
        </dl>
      </div>
      <div class="about-prose">
        <p>
          I’m based in Taguig, Metro Manila, and study Computer Science at Asia
          Pacific College, specializing in Cybersecurity & Forensics. I expect
          to graduate in 2028.
        </p>
        <p>
          My work includes a website for JSP Engineering Services and a worship
          presentation system for TOP Church. The church system combines a Vue
          web app with a Tauri desktop client, generates slides from tagged
          lyrics, and supports remote setlist management.
        </p>
        <p>
          Alongside development, I compete in CTFs and build WebCTF-Auto to
          support first-pass source review. I’m looking for internships and
          freelance web development work.
        </p>
        <a class="text-link" href="#contact">Talk to me about an opportunity</a>
      </div>
    </section>

    <section
      id="skills"
      class="skills-section wrap"
      aria-labelledby="skills-title"
    >
      <div class="section-heading">
        <p class="eyebrow">Tools in practice</p>
        <h2 id="skills-title">
          Vue for worship slides.<br />Python for source review.
        </h2>
      </div>
      <SkillGraph v-inview />
      <div class="courses">
        <h3>Coursework</h3>
        <ul>
          <li v-for="course in courses" :key="course.title">
            {{ course.title }}<span>{{ course.provider }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section
      id="contact"
      class="contact-section"
      aria-labelledby="contact-title"
    >
      <div class="wrap contact-layout">
        <div>
          <p class="eyebrow">Contact</p>
          <h2 id="contact-title">Have a project<br />or internship in mind?</h2>
          <p>
            I’m looking for internships and freelance web development work.
            Email me with the details.
          </p>
        </div>
        <div class="contact-details">
          <a class="email-link" :href="`mailto:${profile.email}`">{{
            profile.email
          }}</a
          ><button class="copy-button" @click="copyEmail">
            Copy email address
          </button>
          <p class="copy-status" role="status" aria-live="polite">
            {{ copyStatus }}
          </p>
          <div class="profile-links">
            <a :href="profile.github" target="_blank" rel="noopener noreferrer"
              >GitHub<span class="sr-only"> (opens in a new tab)</span></a
            ><a
              :href="profile.linkedin"
              target="_blank"
              rel="noopener noreferrer"
              >LinkedIn<span class="sr-only"> (opens in a new tab)</span></a
            >
          </div>
        </div>
      </div>
    </section>
  </main>
  <div class="wrap flag-wrap"><FlagHunt /></div>
  <footer class="site-footer wrap">
    <p>Jan Sultan / {{ profile.location }}</p>
    <a href="#hero">Back to the top</a><span class="metadata">jan.sec</span>
  </footer>
</template>

<style scoped>
.evidence-map-section {
  display: grid;
  grid-template-columns: 1fr 1.04fr;
  gap: 60px;
  align-items: center;
  padding-bottom: 80px;
}
.map-intro {
  max-width: 410px;
  color: var(--muted);
  margin-top: 25px;
}
@media (max-width: 900px) {
  .evidence-map-section {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}
</style>
