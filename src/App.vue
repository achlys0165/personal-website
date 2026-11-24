<script setup lang="ts">
import { onBeforeUnmount, ref, type ObjectDirective } from "vue";
import { courses, profile, securityActivities } from "./profile";
import { caseStudies } from "./caseStudies";
import HeroShield from "./components/HeroShield.vue";
import RenderAsset from "./components/RenderAsset.vue";
import EvidenceBoard from "./components/EvidenceBoard.vue";
import SkillGraph from "./components/SkillGraph.vue";
import ExperienceLog from "./components/ExperienceLog.vue";
import FlagHunt from "./components/FlagHunt.vue";
import RankLabel from "./components/RankLabel.vue";
import { portfolioFlag } from "./visualState";
const mobileOpen = ref(false);
const motionPaused = ref(false);
const copyStatus = ref("");
let copyTimer: ReturnType<typeof setTimeout> | undefined;
const vInview: ObjectDirective<HTMLElement> = {
  mounted(el) {
    const observer = new IntersectionObserver(
      ([entry]) => el.classList.toggle("is-inview", entry.isIntersecting),
      { threshold: 0.08 },
    );
    observer.observe(el);
    (el as HTMLElement & { cleanup?: () => void }).cleanup = () =>
      observer.disconnect();
  },
  unmounted(el) {
    (el as HTMLElement & { cleanup?: () => void }).cleanup?.();
  },
};
const buildCards = [
  {
    icon: "code-laptop",
    title: "Church & ministry apps",
    copy: "Software for the people behind the service. The TOP Church worship system combines Vue and Tauri; ministry tools bring schedules, setlists, and attendance together.",
    stack: "Vue.js / Tauri / Supabase",
    href: "#hymn",
    link: "Explore the church projects",
  },
  {
    icon: "network-globe",
    title: "Client websites",
    copy: "Responsive websites shaped around a real business. For JSP Engineering Services, I work on the company website, consultation forms, and automated email workflows.",
    stack: "React / Node.js / Resend",
    href: "#jsp",
    link: "See the JSP project",
  },
  {
    icon: "ai-chip",
    title: "AI & security tooling",
    copy: "Tools that help me study and investigate. StudyHub uses Gemini to generate study materials; WebCTF-Auto uses Python for a first pass through web challenge source.",
    stack: "Gemini / TypeScript / Python",
    href: "#studyhub",
    link: "Explore the tools",
  },
];
const projectArt = ["code-laptop", "padlock-key", "network-globe", "ai-chip"];
async function copyEmail() {
  try {
    await navigator.clipboard.writeText(profile.email);
    copyStatus.value = "Email address copied.";
  } catch {
    copyStatus.value = "Copy this address: " + profile.email;
  }
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => {
    copyStatus.value = "";
  }, 5000);
}
onBeforeUnmount(() => clearTimeout(copyTimer));
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header wrap">
    <a class="wordmark" href="#hero" aria-label="jan.sec | Jan Sultan home"
      ><span class="logo-mark" aria-hidden="true"
        ><svg width="20" height="24" viewBox="0 0 20 24" fill="none">
          <path
            d="M10 8v10c0 3-2 4-5 3"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
          />
          <circle cx="10" cy="3" r="1.7" fill="currentColor" />
          <circle cx="16" cy="19" r="1.5" fill="currentColor" /></svg></span
      >jan<span>.sec</span></a
    >
    <nav class="desktop-nav" aria-label="Main navigation">
      <a href="#build">What I build</a><a href="#projects">Selected work</a
      ><a href="#experience">CTF & community</a><a href="#about">About</a>
    </nav>
    <a class="header-contact" href="#contact"
      >Let’s talk <span aria-hidden="true">↗</span></a
    >
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
      <a href="#build" @click="mobileOpen = false">What I build</a
      ><a href="#projects" @click="mobileOpen = false">Selected work</a
      ><a href="#experience" @click="mobileOpen = false">CTF & community</a
      ><a href="#about" @click="mobileOpen = false">About</a
      ><a href="#contact" @click="mobileOpen = false">Contact</a>
    </nav>
  </header>
  <main id="main" :class="{ 'motion-paused': motionPaused }">
    <section id="hero" class="hero wrap" aria-labelledby="hero-title">
      <div class="hero-scene">
        <div class="hero-copy">
          <p class="eyebrow hero-kicker">
            <span aria-hidden="true"></span>Student. Builder. CTF competitor.
          </p>
          <h1 id="hero-title">
            Jan<br />Sultan<span class="name-period">.</span>
          </h1>
          <p class="hero-introduction">
            I’m a Cybersecurity &amp; Forensics student at Asia Pacific College,
            building software for clients and TOP Church while competing in
            CTFs.
          </p>
          <div class="hero-actions">
            <a class="button" href="#projects"
              >View work <span aria-hidden="true">↗</span></a
            ><a class="button button-outline" href="#contact">Contact me</a>
          </div>
          <p class="hero-location metadata">
            Taguig, Philippines <span aria-hidden="true">/</span> Computer
            Science at APC
          </p>
        </div>
        <HeroShield />
      </div>
    </section>
    <section class="stats-section wrap" aria-label="CTF results and education">
      <div class="stats-row">
        <div>
          <span class="metadata">JISSA–APC × Resecurity · 2026</span
          ><strong>1st <span>Runner-Up</span></strong>
          <p>Team result · September</p>
        </div>
        <div>
          <span class="metadata">SEEN 2025</span
          ><strong>9th<span> Place</span></strong>
          <p>GDG &amp; CyberPH</p>
        </div>
        <div>
          <span class="metadata">Hack the Beat</span
          ><strong>10th<span> Place</span></strong>
          <p>JISSA CTF competition</p>
        </div>
        <div>
          <span class="metadata">Asia Pacific College</span
          ><strong>2028</strong>
          <p>Expected graduation</p>
        </div>
      </div>
    </section>
    <section
      id="build"
      class="build-section wrap"
      aria-labelledby="build-title"
      v-inview
    >
      <div class="section-heading heading-split">
        <div>
          <p class="eyebrow">What I build</p>
          <h2 id="build-title">
            Built to be useful.<br /><span>Made to be explored.</span>
          </h2>
        </div>
        <p>
          Church software, client websites, and tools that turn curiosity into
          something I can use.
        </p>
      </div>
      <div class="build-grid">
        <article
          v-for="card in buildCards"
          :key="card.title"
          class="build-card"
        >
          <div class="card-art"><RenderAsset :name="card.icon" /></div>
          <p class="metadata build-stack">{{ card.stack }}</p>
          <h3>{{ card.title }}</h3>
          <p>{{ card.copy }}</p>
          <a class="card-link" :href="card.href"
            >{{ card.link }} <span aria-hidden="true">↗</span></a
          >
        </article>
      </div>
    </section>
    <section
      id="projects"
      class="work-section wrap"
      aria-labelledby="work-title"
    >
      <div class="section-heading heading-split">
        <div>
          <p class="eyebrow">Selected work</p>
          <h2 id="work-title">
            From an idea<br />to something <span>working.</span>
          </h2>
        </div>
        <p>
          A closer look at what I built, who it was for, and the scope I can
          share.
        </p>
      </div>
      <article
        v-for="(study, index) in caseStudies"
        :id="study.project.id"
        :key="study.project.id"
        class="case-study"
        v-inview
        :aria-labelledby="'case-title-' + index"
      >
        <div class="case-layout">
          <figure class="project-exhibit">
            <div class="frame-chrome" aria-hidden="true">
              <i></i><i></i><i></i><span>{{ study.project.title }}</span
              ><b>↗</b>
            </div>
            <div class="project-screen">
              <span class="metadata screen-label">{{ study.label }}</span
              ><RenderAsset :name="projectArt[index]" />
              <div class="capture-placeholder">
                <strong>Project screenshot pending</strong
                ><span>Illustration only · not a project capture</span>
              </div>
            </div>
            <figcaption>{{ study.caption }}</figcaption>
          </figure>
          <div class="case-copy">
            <p class="eyebrow">{{ study.label }}</p>
            <h3 :id="'case-title-' + index">{{ study.project.title }}</h3>
            <p class="case-summary">{{ study.title }}</p>
            <p class="case-role">
              {{ study.role }}<span class="metadata">{{ study.dates }}</span>
            </p>
            <dl class="case-details">
              <div>
                <dt>Problem</dt>
                <dd>{{ study.problem }}</dd>
              </div>
              <div>
                <dt>My role</dt>
                <dd>{{ study.contribution }}</dd>
              </div>
              <div>
                <dt>Outcome</dt>
                <dd>{{ study.outcome }}</dd>
              </div>
            </dl>
            <p class="stack">
              <span class="metadata">Built with</span
              >{{ study.project.technologies.join(" / ") }}
            </p>
            <div class="case-links">
              <a
                v-if="study.project.source"
                class="text-link project-source"
                :href="study.project.source"
                target="_blank"
                rel="noopener noreferrer"
                >View source ↗<span class="sr-only">
                  (opens in a new tab)</span
                ></a
              ><span v-else class="placeholder link-placeholder"
                >Public link pending</span
              >
              <details class="project-notes">
                <summary>Scope &amp; learning</summary>
                <p>{{ study.decision }}</p>
                <ol>
                  <li v-for="step in study.flow" :key="step">{{ step }}</li>
                </ol>
              </details>
            </div>
          </div>
        </div>
      </article>
      <div id="supporting-work" class="supporting-work">
        <div>
          <p class="eyebrow">Also built for ministry teams</p>
          <h3>The work around<br />the worship service.</h3>
        </div>
        <p>
          <strong>Music Ministry Management</strong> brings together musician
          schedules, setlists, notifications, and accounts. An
          <strong>NFC attendance system</strong> pairs attendance capture with a
          Supabase-backed web dashboard. Detailed case studies are pending
          documentation.
        </p>
      </div>
      <details id="evidence-map" class="evidence-disclosure">
        <summary>
          <span
            ><span class="metadata">Projects / tools / CTFs</span
            ><strong>Explore the connected evidence</strong></span
          ><span aria-hidden="true">＋</span>
        </summary>
        <div class="evidence-map-inner">
          <p>Connections between my projects, tools, and CTF result.</p>
          <EvidenceBoard :data-evidence="portfolioFlag" />
        </div>
      </details>
    </section>
    <section
      id="experience"
      class="community-section"
      aria-labelledby="community-title"
      v-inview
    >
      <div class="wrap">
        <div class="community-heading">
          <div class="section-heading">
            <p class="eyebrow">CTF &amp; community</p>
            <h2 id="community-title">
              A little competition.<br />A lot of <span>learning.</span>
            </h2>
            <p>
              I compete in CTFs and take part in the local security community.
            </p>
          </div>
          <div class="community-art"><RenderAsset name="ctf-flag" /></div>
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
            </tbody>
          </table>
        </div>
        <div class="community-notes">
          <div>
            <span class="metadata">Community</span>
            <p>JISSA–APC <small>Member · Asia Pacific College</small></p>
          </div>
          <div>
            <span class="metadata">Industry involvement</span>
            <p>PhilSec 2026 <small>Student volunteer</small></p>
          </div>
          <div>
            <span class="metadata">Coursework</span>
            <p>
              AWS Academy <small>Cloud Architecting / Cloud Foundations</small>
            </p>
          </div>
          <div>
            <span class="metadata">Coursework</span>
            <p>Cisco Networking Academy <small>Networking Basics</small></p>
          </div>
        </div>
        <ExperienceLog />
        <details id="writeups" class="notes-disclosure">
          <summary>
            Web CTF investigation notes
            <span class="metadata">Writeups pending</span>
          </summary>
          <p>
            Challenge context, investigation steps, evidence, and what I
            learned. Links and articles will be added when documentation is
            ready.
          </p>
        </details>
      </div>
    </section>
    <section
      id="about"
      class="about-section wrap"
      aria-labelledby="about-title"
      v-inview
    >
      <div class="about-visual">
        <div class="about-render"><RenderAsset name="padlock-key" /></div>
        <div class="about-fact-card">
          <span class="metadata">Currently studying</span
          ><strong>BS Computer Science</strong>
          <p>Cybersecurity &amp; Forensics<br />Asia Pacific College</p>
          <span class="metadata">Expected graduation · 2028</span>
        </div>
      </div>
      <div class="about-prose">
        <p class="eyebrow">About me</p>
        <h2 id="about-title">
          A student mindset.<br />A builder’s <span>curiosity.</span>
        </h2>
        <p>
          I’m based in Taguig, Metro Manila, and study Computer Science at Asia
          Pacific College, specializing in Cybersecurity &amp; Forensics. I
          expect to graduate in 2028.
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
        <a class="text-link" href="#contact"
          >Talk to me about an opportunity ↗</a
        >
      </div>
    </section>
    <section
      id="skills"
      class="skills-section wrap"
      aria-label="Tools and coursework"
    >
      <details class="tools-disclosure">
        <summary>
          <span>Tools, tied to the work.</span
          ><span aria-hidden="true">＋</span>
        </summary>
        <SkillGraph />
        <div class="courses">
          <h3>Coursework</h3>
          <ul>
            <li v-for="course in courses" :key="course.title">
              {{ course.title }}<span>{{ course.provider }}</span>
            </li>
          </ul>
        </div>
      </details>
    </section>
    <section
      id="contact"
      class="contact-section"
      aria-labelledby="contact-title"
    >
      <div class="wrap">
        <div class="contact-layout">
          <div>
            <p class="eyebrow">Let’s connect</p>
            <h2 id="contact-title">
              Have something<br />in <span>mind?</span>
            </h2>
            <p>
              I’m looking for internships and freelance web development work.
              Email me with the details.
            </p>
            <a class="button" :href="'mailto:' + profile.email"
              >Send an email <span aria-hidden="true">↗</span></a
            >
          </div>
          <div class="contact-details">
            <span class="metadata">A good place to start</span
            ><a class="email-link" :href="'mailto:' + profile.email">{{
              profile.email
            }}</a
            ><button class="copy-button" @click="copyEmail">
              Copy email address
            </button>
            <p class="copy-status" role="status" aria-live="polite">
              {{ copyStatus }}
            </p>
            <div class="profile-links">
              <a
                :href="profile.github"
                target="_blank"
                rel="noopener noreferrer"
                >GitHub ↗<span class="sr-only"> (opens in a new tab)</span></a
              ><a
                :href="profile.linkedin"
                target="_blank"
                rel="noopener noreferrer"
                >LinkedIn ↗<span class="sr-only">
                  (opens in a new tab)</span
                ></a
              >
            </div>
          </div>
        </div>
      </div>
    </section>
    <div class="wrap flag-wrap"><FlagHunt /></div>
    <div class="wrap page-motion">
      <button
        type="button"
        :aria-pressed="motionPaused"
        @click="motionPaused = !motionPaused"
      >
        {{ motionPaused ? "Resume section motion" : "Pause section motion" }}
      </button>
    </div>
  </main>
  <footer class="site-footer wrap">
    <a class="wordmark" href="#hero">jan<span>.sec</span></a>
    <p>Built by Jan Sultan. Still learning, always building.</p>
    <a href="#hero">Back to top ↑</a>
  </footer>
</template>
