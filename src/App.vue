<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, type ObjectDirective } from 'vue';
import { categories, courses, experience, profile, projects, securityActivities, skillGroups, type Category, type Project } from './profile';

const mobileOpen = ref(false);
const projectCategory = ref<Category>('Cybersecurity');
const filteredProjects = computed(() => projects.filter(project => project.category === projectCategory.value));
const timelineEntries = [...experience.map(item => ({ ...item, achievement: '' })), ...securityActivities];
const activeDetail = ref<Project | null>(null);
const modalCloseButton = ref<HTMLButtonElement | null>(null);
const cursorGlow = ref<HTMLDivElement | null>(null);
const breachCanvas = ref<HTMLCanvasElement | null>(null);
const breachActive = ref(false);
const terminalLog = ref<HTMLDivElement | null>(null);
const terminalInput = ref('');
const terminalCleared = ref(false);
const terminalEntries = ref<{ command: string; lines: string[]; warning: boolean }[]>([]);
const currentYear = new Date().getFullYear();
const contactTopics = [...categories, 'Work Opportunity', 'General Message'];
const contact = reactive({ name: '', email: '', topic: 'Web App', message: '' });
const copyStatus = ref('');
let copyTimer: ReturnType<typeof setTimeout> | undefined;

const focusAreas = [
  { title: 'Cybersecurity', description: 'CTF practice, web security learning, and a foundation in networking and forensics.' },
  { title: 'AI Automation', description: 'AI-assisted study tools and workflows that turn repetitive work into useful outcomes.' },
  { title: 'Web Apps', description: 'Applications for businesses, ministry teams, and learning, built with modern web tools.' },
];

function handleContactSubmit() {
  const subject = `${contact.topic} — ${contact.name.trim()}`;
  const body = `Name: ${contact.name.trim()}\nEmail: ${contact.email.trim()}\nTopic: ${contact.topic}\n\n${contact.message.trim()}`;
  window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

async function copyEmail() {
  if (copyTimer) clearTimeout(copyTimer);
  try {
    await navigator.clipboard.writeText(profile.email);
    copyStatus.value = 'Email address copied.';
  } catch {
    copyStatus.value = `You can copy it here: ${profile.email}`;
  }
  copyTimer = setTimeout(() => { copyStatus.value = ''; }, 5000);
}

const terminalResponses: Record<string, string[]> = {
  help: ['Available commands:', 'whoami — About Jan', 'skills — Tools and focus areas', 'projects — Project list',
    'education — Studies and graduation', 'courses — Courses and credentials', 'contact — Email and profiles', 'clear — Clear terminal'],
  whoami: [profile.name, profile.role, profile.location, 'Focus: Cybersecurity · AI Automation · Web Apps'],
  skills: skillGroups.map(group => `${group.title}: ${group.tags.join(', ')}`),
  projects: projects.map(project => `[${project.category}] ${project.title}`),
  education: [profile.school, profile.education, `Expected graduation: ${profile.graduation}`],
  courses: courses.map(course => `${course.title} — ${course.provider}`),
  contact: [`Email: ${profile.email}`, `GitHub: ${profile.github}`, `LinkedIn: ${profile.linkedin}`],
  flag: ['[+] FLAG{jan_builds_and_keeps_learning}'],
  'cat flag.txt': ['[+] FLAG{jan_builds_and_keeps_learning}'],
};

async function handleTerminalCommand() {
  const command = terminalInput.value.trim();
  if (!command) return;
  terminalInput.value = '';
  if (command.toLowerCase() === 'clear') {
    terminalCleared.value = true;
    terminalEntries.value = [];
    return;
  }
  const lines = Object.hasOwn(terminalResponses, command.toLowerCase()) ? terminalResponses[command.toLowerCase()] : undefined;
  terminalEntries.value.push({ command,
    lines: lines ?? [`Command not recognized: '${command}'. Type 'help' for available commands.`], warning: !lines });
  await nextTick();
  if (terminalLog.value) terminalLog.value.scrollTop = terminalLog.value.scrollHeight;
}

let previousFocus: HTMLElement | null = null;
let previousOverflow = '';
async function openDetail(item?: Project) {
  if (!item) return;
  if (!activeDetail.value) {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    previousOverflow = document.body.style.overflow;
  }
  activeDetail.value = item;
  document.body.style.overflow = 'hidden';
  await nextTick();
  modalCloseButton.value?.focus();
}
function closeModal() {
  if (!activeDetail.value) return;
  activeDetail.value = null;
  document.body.style.overflow = previousOverflow;
  previousFocus?.focus();
}
function closeMobileNav() { mobileOpen.value = false; }

let revealObserver: IntersectionObserver | null = null;
const vReveal: ObjectDirective<HTMLElement> = {
  mounted(el) {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('revealed');
      return;
    }
    revealObserver ??= new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.1 });
    revealObserver.observe(el);
  },
  unmounted(el) { revealObserver?.unobserve(el); },
};

function moveCursor(event: MouseEvent) {
  if (!cursorGlow.value) return;
  cursorGlow.value.style.opacity = '1';
  cursorGlow.value.style.left = `${event.clientX}px`;
  cursorGlow.value.style.top = `${event.clientY}px`;
}
function hideCursor() { if (cursorGlow.value) cursorGlow.value.style.opacity = '0'; }

let matrixAnimation: number | null = null;
function triggerBreachMatrix() {
  if (breachActive.value || !breachCanvas.value) return;
  const canvas = breachCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  breachActive.value = true;
  const chars = '01JANSULTAN0123456789ABCDEF$#@!<>{}[]/*';
  const drops = Array.from({ length: Math.floor(canvas.width / 14) }, () => Math.floor(Math.random() * -50));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function draw() {
    if (!ctx) return;
    ctx.fillStyle = 'rgba(10, 10, 13, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FF2E93';
    ctx.font = '14px monospace';
    drops.forEach((drop, index) => {
      ctx.fillText(chars.charAt(Math.floor(Math.random() * chars.length)), index * 14, drop * 14);
      drops[index] = drop * 14 > canvas.height && Math.random() > 0.975 ? 0 : drop + 1;
    });
    if (!reducedMotion) matrixAnimation = requestAnimationFrame(draw);
  }
  draw();
}
function closeEasterEgg() {
  breachActive.value = false;
  if (matrixAnimation !== null) cancelAnimationFrame(matrixAnimation);
  matrixAnimation = null;
}

const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') { closeModal(); closeMobileNav(); closeEasterEgg(); return; }
  if (activeDetail.value && event.key === 'Tab') {
    const controls = Array.from(document.querySelectorAll<HTMLElement>('#detailModal button, #detailModal a[href]'));
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
    return;
  }
  if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
  if (event.key.toLowerCase() === konamiSequence[konamiIndex].toLowerCase()) {
    konamiIndex++;
    if (konamiIndex === konamiSequence.length) { triggerBreachMatrix(); konamiIndex = 0; }
  } else konamiIndex = 0;
}

onMounted(() => {
  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', moveCursor, { passive: true });
    document.addEventListener('mouseleave', hideCursor);
  }
  document.addEventListener('keydown', handleKeydown);
});
onBeforeUnmount(() => {
  if (copyTimer) clearTimeout(copyTimer);
  revealObserver?.disconnect();
  window.removeEventListener('mousemove', moveCursor);
  document.removeEventListener('mouseleave', hideCursor);
  document.removeEventListener('keydown', handleKeydown);
  closeEasterEgg();
  closeModal();
});
</script>

<template>
  <div class="ambient-grid" aria-hidden="true"></div>
  <div class="scanlines" aria-hidden="true"></div>
  <div class="cursor-glow" ref="cursorGlow" aria-hidden="true"></div>
  <canvas id="breach-canvas" ref="breachCanvas" :class="{ active: breachActive }" aria-hidden="true"></canvas>
  <div class="breach-banner" :class="{ active: breachActive }">
    <div class="secret-heading">[+] EASTER EGG UNLOCKED</div>
    <p>You found the hidden corner of Jan’s portfolio.</p>
    <button class="btn btn-primary" @click="closeEasterEgg">Back to Portfolio</button>
  </div>

  <header class="navbar">
    <div class="site-container navbar-inner">
      <a href="#hero" class="brand-mark" aria-label="Jan Sultan — Home">
        <span>jan<span class="accent">.sec</span></span>
      </a>
      <nav aria-label="Main navigation">
        <ul class="nav-links">
          <li><a href="#about" class="nav-link">About</a></li>
          <li><a href="#skills" class="nav-link">Skills</a></li>
          <li><a href="#projects" class="nav-link">Projects</a></li>
          <li><a href="#experience" class="nav-link">Experience</a></li>
        </ul>
      </nav>
      <div class="nav-actions">
        <a href="#contact" class="btn btn-primary">Get in Touch</a>
        <button class="menu-toggle" id="menuToggleBtn" @click="mobileOpen = !mobileOpen" aria-label="Toggle navigation menu" aria-controls="mobileDrawer" :aria-expanded="mobileOpen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
        </button>
      </div>
    </div>
  </header>
  <nav class="mobile-drawer" id="mobileDrawer" :class="{ open: mobileOpen }" :inert="!mobileOpen" :aria-hidden="!mobileOpen" aria-label="Mobile navigation">
    <a href="#about" @click="closeMobileNav">About</a>
    <a href="#skills" @click="closeMobileNav">Skills</a>
    <a href="#projects" @click="closeMobileNav">Projects</a>
    <a href="#experience" @click="closeMobileNav">Experience & Education</a>
    <a href="#contact" @click="closeMobileNav">Contact</a>
  </nav>

  <main>
    <section class="hero-section" id="hero">
      <div class="site-container">
        <div class="hero-grid">
          <div>
            <div class="status-pill"><span class="status-beacon"></span>Computer Science · Cybersecurity & Forensics</div>
            <p class="hero-intro">Hi, I’m {{ profile.name }}.</p>
            <h1 class="hero-title">Securing systems.<br>Building applications.<br><span class="highlight">Automating workflows.</span></h1>
            <p class="hero-role">{{ profile.introduction }}</p>
            <div class="hero-ctas">
              <a href="#projects" class="btn btn-primary">Explore Projects <span aria-hidden="true">→</span></a>
            </div>
            <div class="hero-socials" aria-label="My profiles and email">
              <a :href="profile.github" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Jan Sultan on GitHub" title="GitHub">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
              </a>
              <a :href="profile.linkedin" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Jan Sultan on LinkedIn" title="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2ZM8 19H5V9h3Zm-1.5-12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3ZM19 19h-3v-5c0-3-3-3-3 0v5h-3V9h3v1.5c1-2 6-3 6 3Z" /></svg>
              </a>
              <a :href="`mailto:${profile.email}`" class="social-link" aria-label="Email Jan Sultan" title="Email">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></svg>
              </a>
            </div>
          </div>
          <div class="terminal-window">
            <div class="terminal-header">
              <div class="terminal-dots" aria-hidden="true"><span class="terminal-dot close"></span><span class="terminal-dot min"></span><span class="terminal-dot max"></span></div>
              <div class="terminal-title">jan@portfolio:~</div>
              <div class="terminal-actions-quick">PROFILE</div>
            </div>
            <div class="terminal-body" id="terminalLog" ref="terminalLog" aria-live="polite">
              <div v-if="!terminalCleared" class="terminal-line"><span class="t-prompt">$</span><span class="t-cmd">whoami</span></div>
              <div v-if="!terminalCleared" class="t-output">
                <div><span class="t-key">[+] Name:</span> {{ profile.name }}</div>
                <div><span class="t-key">[+] Focus:</span> Cybersecurity · AI Automation · Web Apps</div>
                <div><span class="t-key">[+] Studies:</span> {{ profile.education }}</div>
                <div><span class="t-key">[+] School:</span> {{ profile.school }}</div>
                <div><span class="t-key">[+] Location:</span> {{ profile.location }}</div>
                <div><span class="t-key">[+] Stack:</span> Vue · React · Tailwind · Supabase</div>
              </div>
              <template v-for="(entry, index) in terminalEntries" :key="index">
                <div class="terminal-line"><span class="t-prompt">$</span><span class="t-cmd">{{ entry.command }}</span></div>
                <div class="t-output" :class="{ 't-warning': entry.warning }"><div v-for="(line, lineIndex) in entry.lines" :key="lineIndex">{{ line }}</div></div>
              </template>
            </div>
            <form class="portfolio-terminal-form" @submit.prevent="handleTerminalCommand">
              <span class="t-prompt">$</span>
              <input id="terminalCliInput" v-model="terminalInput" class="terminal-cli-input" aria-label="Terminal command" placeholder="Type 'help', 'projects', 'skills'..." autocomplete="off" :spellcheck="false">
              <button type="submit" class="terminal-exec-btn">Exec</button>
            </form>
          </div>
        </div>
        <div class="stats-strip reveal-on-scroll" v-reveal>
          <div class="stat-item"><div class="stat-num">3<span class="accent">.</span></div><div class="stat-label">Cybersecurity · AI Automation · Web Apps</div></div>
          <div class="stat-item"><div class="stat-num">9<span class="accent">th</span></div><div class="stat-label">SEEN 2025 CTF Challenge</div></div>
          <div class="stat-item"><div class="stat-num">10<span class="accent">th</span></div><div class="stat-label">Hack the Beat JISSA CTF</div></div>
          <div class="stat-item"><div class="stat-num">2028</div><div class="stat-label">Expected BS Computer Science graduation</div></div>
        </div>
      </div>
    </section>

    <section id="about">
      <div class="site-container">
        <div class="section-kicker">01. About Me</div>
        <h2 class="section-heading">Curiosity in security. Purpose in what I build.</h2>
        <p class="section-description">From CTF challenges to tools for classrooms, businesses, and church teams.</p>
        <div class="about-grid">
          <div class="about-prose reveal-on-scroll" v-reveal>
            <p>I’m <strong>{{ profile.name }}</strong>, based in {{ profile.location }}. I’m studying Computer Science at {{ profile.school }}, with a specialization in <strong>Cybersecurity and Forensics</strong> and expected graduation in {{ profile.graduation }}.</p>
            <p>I learn security through coursework and CTF practice, and put my development skills into applications people can use. My projects include worship presentation tools, ministry management systems, an engineering company website, and an AI-assisted study app.</p>
            <p>I’m a member of JISSA–APC and volunteered at PhilSec 2026, supporting registration, attendees, and event operations.</p>
            <a href="#projects" class="btn btn-secondary">See My Projects <span aria-hidden="true">→</span></a>
          </div>
          <div class="pillars-list reveal-on-scroll" v-reveal>
            <div v-for="(area, index) in focusAreas" :key="area.title" class="pillar-card">
              <div class="pillar-head"><div class="pillar-icon" aria-hidden="true">0{{ index + 1 }}</div><h3 class="pillar-title">{{ area.title }}</h3></div>
              <p class="pillar-desc">{{ area.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="skills">
      <div class="site-container">
        <div class="section-kicker">02. Skills & Learning</div>
        <h2 class="section-heading">The tools behind my work.</h2>
        <p class="section-description">A mix of hands-on development, cybersecurity coursework, and ongoing learning.</p>
        <div class="skills-grid">
          <article v-for="group in skillGroups" :key="group.title" class="skill-category-card reveal-on-scroll" v-reveal>
            <div class="skill-category-header"><h3 class="skill-category-title">{{ group.title }}</h3></div>
            <p class="skill-group-note">{{ group.note }}</p>
            <div class="skill-items-wrap"><span v-for="tag in group.tags" :key="tag" class="skill-tag">{{ tag }}</span></div>
          </article>
        </div>
      </div>
    </section>

    <section id="projects">
      <div class="site-container">
        <div class="section-kicker">03. Selected Projects</div>
        <h2 class="section-heading">Things I’ve worked on.</h2>
        <p class="section-description">Security practice, AI-assisted workflows, and applications built around everyday needs.</p>
        <div class="project-filters" role="group" aria-label="Project categories">
          <button v-for="category in categories" :key="category" type="button" class="project-filter" :class="{ active: projectCategory === category }" :aria-pressed="projectCategory === category" @click="projectCategory = category">
            {{ category }} <span class="category-count">{{ projects.filter(project => project.category === category).length }}</span>
          </button>
        </div>
        <p class="project-selection" role="status" aria-live="polite">{{ filteredProjects.length }} {{ filteredProjects.length === 1 ? 'project' : 'projects' }} in {{ projectCategory }}</p>
        <div class="projects-grid">
          <article v-for="project in filteredProjects" :key="project.id" class="project-card reveal-on-scroll" v-reveal>
            <div>
              <div class="project-top-meta"><span class="project-domain">{{ project.category }}</span><span class="project-status">{{ project.kind }}</span></div>
              <h3 class="project-title">{{ project.title }}</h3>
              <p class="project-summary">{{ project.summary }}</p>
              <div class="project-tags"><span v-for="technology in project.technologies" :key="technology" class="skill-tag">{{ technology }}</span></div>
            </div>
            <div class="project-actions">
              <button class="project-link-btn" :aria-label="`Read about ${project.title}`" @click="openDetail(project)">Project Overview <span aria-hidden="true">→</span></button>
              <a v-if="project.source" :href="project.source" class="project-repo-link" target="_blank" rel="noopener noreferrer" :aria-label="`${project.title} source code`">Source ↗</a>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section id="experience">
      <div class="site-container">
        <div class="section-kicker">04. Experience & Credentials</div>
        <h2 class="section-heading">Experience & Certifications</h2>
        <p class="section-description">Development work, CTF competitions, and cybersecurity community involvement alongside my studies and course credentials.</p>

        <h3 class="subsection-heading">Experience Timeline</h3>
        <div class="timeline-track experience-timeline">
          <article v-for="item in timelineEntries" :key="item.organization" class="timeline-entry reveal-on-scroll" v-reveal>
            <div class="timeline-dot"></div>
            <div class="timeline-entry-header">
              <div class="activity-heading">
                <h4 class="timeline-role">{{ item.role }}</h4>
                <span v-if="item.achievement" class="activity-achievement">{{ item.achievement }}</span>
              </div>
              <p v-if="item.dates" class="timeline-date">{{ item.dates }}</p>
            </div>
            <div class="timeline-org">{{ item.organization }}</div>
            <p class="timeline-body">{{ item.description }}</p>
          </article>
        </div>

        <div class="experience-credentials">
          <h3 class="subsection-heading">Courses & Education</h3>
          <div class="credentials-grid">
            <article v-for="course in courses" :key="course.title" class="credential-card reveal-on-scroll" v-reveal>
              <div class="credential-meta"><span class="credential-provider">{{ course.provider }}</span></div>
              <h4 class="credential-title">{{ course.title }}</h4>
              <p class="credential-description">{{ course.description }}</p>
              <p class="credential-type">Course credential</p>
            </article>
            <article class="credential-card reveal-on-scroll" v-reveal>
              <div class="credential-meta"><span class="credential-provider">{{ profile.school }}</span></div>
              <h4 class="credential-title">BS Computer Science</h4>
              <p class="credential-description">Specialization in Cybersecurity and Forensics.</p>
              <p class="credential-type">Expected graduation: {{ profile.graduation }}</p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section id="contact">
      <div class="site-container">
        <div class="section-kicker">05. Get in Touch</div>
        <h2 class="section-heading">Let’s build something useful.</h2>
        <p class="section-description">Have a project, opportunity, or idea to discuss? Send me a message.</p>
        <div class="contact-grid">
          <div class="contact-card reveal-on-scroll" v-reveal>
            <form id="contactForm" @submit.prevent="handleContactSubmit">
              <div class="form-group"><label for="contactName" class="form-label">Your Name *</label><input id="contactName" v-model="contact.name" class="form-input" autocomplete="name" placeholder="Your name" required></div>
              <div class="form-group"><label for="contactEmail" class="form-label">Email Address *</label><input id="contactEmail" v-model="contact.email" type="email" class="form-input" autocomplete="email" placeholder="Your email address" required></div>
              <div class="form-group"><label for="contactTopic" class="form-label">What’s it about?</label><select id="contactTopic" v-model="contact.topic" class="form-select"><option v-for="topic in contactTopics" :key="topic">{{ topic }}</option></select></div>
              <div class="form-group"><label for="contactMessage" class="form-label">Message *</label><textarea id="contactMessage" v-model="contact.message" class="form-textarea" placeholder="Tell me about your project or idea…" required></textarea></div>
              <button type="submit" class="btn btn-primary contact-submit">Open Email Draft <span aria-hidden="true">↗</span></button>
              <p class="contact-note">Opens your email app with the details above.</p>
            </form>
          </div>
          <div class="direct-channels reveal-on-scroll" v-reveal>
            <div class="channel-list">
              <a :href="`mailto:${profile.email}`" class="channel-row"><span class="channel-label">Email</span><span class="channel-val">{{ profile.email }}</span></a>
              <a :href="profile.github" class="channel-row" target="_blank" rel="noopener noreferrer"><span class="channel-label">GitHub</span><span class="channel-val">achlys0165 ↗</span></a>
              <a :href="profile.linkedin" class="channel-row" target="_blank" rel="noopener noreferrer"><span class="channel-label">LinkedIn</span><span class="channel-val">Jan Sultan ↗</span></a>
            </div>
            <div><button class="btn btn-secondary" @click="copyEmail">Copy Email Address</button><p class="contact-note" role="status" aria-live="polite">{{ copyStatus }}</p></div>
            <p class="contact-location">Based in {{ profile.location }}.</p>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="site-container footer-inner">
      <p class="footer-copy">© {{ currentYear }} {{ profile.name }} · Cybersecurity, AI Automation & Web Apps.</p>
      <div class="footer-links"><a href="#hero" class="footer-link">Back to Top ↑</a><a href="#projects" class="footer-link">Projects</a><a href="#contact" class="footer-link">Contact</a><button class="easter-egg-hint secret-trigger" @click="triggerBreachMatrix" aria-label="Open portfolio easter egg" title="Try ↑ ↑ ↓ ↓ ← → ← → B A">[↑↑↓↓←→←→BA]</button></div>
    </div>
  </footer>

  <div id="detailModal" class="modal-backdrop" :class="{ open: activeDetail }" role="dialog" aria-modal="true" :aria-hidden="!activeDetail" aria-labelledby="modalTitle" @click.self="closeModal">
    <div class="modal-card">
      <button ref="modalCloseButton" class="modal-close" @click="closeModal" aria-label="Close dialog">✕</button>
      <div class="modal-kicker">{{ activeDetail?.category }} · {{ activeDetail?.kind }}</div>
      <h3 class="modal-title" id="modalTitle">{{ activeDetail?.title }}</h3>
      <div class="modal-body" v-if="activeDetail">
        <p>{{ activeDetail.summary }}</p><h4>Project Scope</h4>
        <ul class="project-scope"><li v-for="item in activeDetail.scope" :key="item">{{ item }}</li></ul>
        <h4>Tools & Technologies</h4><div class="project-tags"><span v-for="technology in activeDetail.technologies" :key="technology" class="skill-tag">{{ technology }}</span></div>
        <a v-if="activeDetail.source" :href="activeDetail.source" class="btn btn-secondary modal-source" target="_blank" rel="noopener noreferrer">View Source Code ↗</a>
      </div>
    </div>
  </div>
</template>
