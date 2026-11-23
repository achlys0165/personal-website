<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { courses, profile, securityActivities } from './profile';
import { appliedSkills, caseStudies } from './caseStudies';

const mobileOpen = ref(false);
const copyStatus = ref('');
let copyTimer: ReturnType<typeof setTimeout> | undefined;
async function copyEmail() {
  try {
    await navigator.clipboard.writeText(profile.email);
    copyStatus.value = 'Email address copied.';
  } catch {
    copyStatus.value = `Copy this address: ${profile.email}`;
  }
  if (copyTimer) clearTimeout(copyTimer);
  copyTimer = setTimeout(() => { copyStatus.value = ''; }, 5000);
}
onBeforeUnmount(() => { if (copyTimer) clearTimeout(copyTimer); });
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header wrap">
    <a class="wordmark" href="#hero" aria-label="Jan Sultan home">jan<span>.sec</span></a>
    <nav class="desktop-nav" aria-label="Main navigation">
      <a href="#projects">Selected work</a><a href="#contact">Contact</a>
    </nav>
    <span class="header-note metadata">Taguig, Philippines</span>
    <button class="menu-toggle" :aria-expanded="mobileOpen" aria-controls="mobile-nav" @click="mobileOpen = !mobileOpen" @keydown.esc="mobileOpen = false">{{ mobileOpen ? 'Close' : 'Menu' }}</button>
    <nav v-if="mobileOpen" id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation" @keydown.esc="mobileOpen = false">
      <a href="#projects" @click="mobileOpen = false">Selected work</a><a href="#contact" @click="mobileOpen = false">Contact</a>
    </nav>
  </header>

  <main id="main">
    <section id="hero" class="hero wrap" aria-labelledby="hero-title">
      <div class="hero-eyebrow metadata"><span>Computer Science / Asia Pacific College</span><span>Expected graduation 2028</span></div>
      <h1 id="hero-title">Jan Sultan<span class="name-period">.</span></h1>
      <div class="hero-bottom">
        <p class="hero-introduction">I’m a Cybersecurity & Forensics student at Asia Pacific College, building software for clients and TOP Church while competing in CTFs.</p>
        <div class="hero-actions"><a class="button" href="#projects">View work</a><a class="text-link" href="#contact">Contact me</a></div>
      </div>
      <div class="hero-index metadata"><span>A record of software built and challenges investigated.</span><a href="#projects">Read the selected work below</a></div>
    </section>

    <section id="projects" class="work-section wrap" aria-labelledby="work-title">
      <div class="section-heading"><p class="eyebrow">Selected work</p><h2 id="work-title">From worship slides<br>to web challenge source.</h2><p>What I built, who it was for, and the details I can share.</p></div>
      <article v-for="(study, index) in caseStudies" :id="study.project.id" :key="study.project.id" class="case-study" :aria-labelledby="`case-title-${index}`">
        <div class="case-index metadata"><span class="evidence-tag">Evidence / 0{{ index + 1 }}</span><span>{{ study.label }}</span></div>
        <div class="case-layout">
          <div class="case-copy">
            <p class="project-name">{{ study.project.title }}</p>
            <h3 :id="`case-title-${index}`">{{ study.title }}</h3>
            <p class="case-role">{{ study.role }}<br><span class="metadata">{{ study.dates }}</span></p>
            <dl class="case-details">
              <div><dt>The problem</dt><dd>{{ study.problem }}</dd></div>
              <div><dt>My role</dt><dd>{{ study.contribution }}</dd></div>
              <div><dt>Decisions & learning</dt><dd :class="{ placeholder: study.decision.startsWith('Decision note pending') }">{{ study.decision }}</dd></div>
              <div><dt>What came out of it</dt><dd>{{ study.outcome }}</dd></div>
            </dl>
            <p class="stack"><span class="metadata">Stack</span>{{ study.project.technologies.join(' / ') }}</p>
            <a v-if="study.project.source" class="text-link project-source" :href="study.project.source" target="_blank" rel="noopener noreferrer">View {{ study.project.title }} source<span class="sr-only"> (opens in a new tab)</span></a>
            <p v-else class="placeholder link-placeholder">Public link pending</p>
          </div>
          <figure class="project-exhibit">
            <div class="exhibit-head metadata"><span>{{ study.project.id === 'hymn' ? 'TOP Church' : study.project.id === 'jsp' ? 'JSP Engineering' : study.project.title }}</span><span>Workflow</span></div>
            <div class="workflow" :class="`workflow-${index}`">
              <div v-for="(step, stepIndex) in study.flow" :key="step" class="workflow-step"><span class="metadata">0{{ stepIndex + 1 }}</span><span>{{ step }}</span></div>
            </div>
            <figcaption>{{ study.caption }}</figcaption>
          </figure>
        </div>
      </article>
      <div class="supporting-work"><p class="eyebrow">Also built for ministry teams</p><p><strong>Music Ministry Management</strong> brings together musician schedules, setlists, notifications, and accounts. An <strong>NFC attendance system</strong> pairs attendance capture with a Supabase-backed web dashboard. Detailed case studies are pending documentation.</p></div>
    </section>

    <section id="contact" class="wrap" style="padding-block:60px"><h2>Contact Jan</h2><p><a :href="`mailto:${profile.email}`">{{ profile.email }}</a></p></section>
  </main>
  <footer class="site-footer wrap"><p>Jan Sultan / {{ profile.location }}</p><a href="#hero">Back to the top</a><span class="metadata">jan.sec</span></footer>
</template>
