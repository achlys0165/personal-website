<script setup lang="ts">
import { ref } from "vue";
import { experience } from "../profile";
const selected = ref(0);
const log = ref<HTMLDivElement | null>(null);
function scrub(index: number) {
  selected.value = index;
  const entry = log.value?.children[index] as HTMLElement | undefined;
  if (entry && log.value)
    log.value.scrollTo({
      top: entry.offsetTop,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
}
function track() {
  if (!log.value) return;
  const scroll = log.value.scrollTop;
  selected.value = Math.round(
    (scroll / (log.value.scrollHeight - log.value.clientHeight || 1)) *
      (experience.length - 1),
  );
}
</script>
<template>
  <div class="experience-log">
    <div class="log-heading">
      <div>
        <p class="eyebrow">Development experience</p>
        <h3>The work behind the projects.</h3>
      </div>
      <span class="metadata"
        >{{ String(selected + 1).padStart(2, "0") }} /
        {{ String(experience.length).padStart(2, "0") }}</span
      >
    </div>
    <div class="log-controls">
      <label for="experience-scrub" class="metadata">Browse the work log</label
      ><input
        id="experience-scrub"
        type="range"
        min="0"
        :max="experience.length - 1"
        :value="selected"
        :aria-valuetext="experience[selected].organization"
        @input="scrub(Number(($event.target as HTMLInputElement).value))"
      />
    </div>
    <div
      ref="log"
      class="log-entries"
      tabindex="0"
      role="region"
      aria-label="Development work log, scroll for more entries"
      @scroll.passive="track"
    >
      <article
        v-for="(entry, index) in experience"
        :key="entry.organization"
        class="log-entry"
      >
        <span class="log-line metadata">{{
          String(index + 1).padStart(2, "0")
        }}</span>
        <div>
          <p class="metadata">{{ entry.dates.replace(" — ", " to ") }}</p>
          <h4>{{ entry.role }}</h4>
          <p class="log-org">{{ entry.organization }}</p>
          <p>{{ entry.description }}</p>
        </div>
      </article>
    </div>
  </div>
</template>
