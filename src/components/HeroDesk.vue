<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { caseStudies } from "../caseStudies";
import { heroFlag } from "../visualState";

const root = ref<HTMLElement | null>(null);
const frame = ref<HTMLDivElement | null>(null);
const video = ref<HTMLVideoElement | null>(null);
const closeButton = ref<HTMLButtonElement | null>(null);
const reduced = ref(true);
const visible = ref(false);
const tabVisible = ref(true);
const paused = ref(false);
const loaded = ref(false);
const playing = ref(false);
const failed = ref(false);
const webpReady = ref(false);
const failedSources = new Set<string>();
const panel = ref<"work" | "flag" | null>(null);
const animate = computed(
  () => !reduced.value && visible.value && tabVisible.value && !paused.value,
);
let observer: IntersectionObserver | undefined;
let motion: MediaQueryList | undefined;
let trigger: HTMLElement | null = null;
let pinned = false;
let hoverTimer: ReturnType<typeof setTimeout> | undefined;
let disposed = false;

function settings() {
  reduced.value = motion?.matches ?? true;
}
function visibility() {
  tabVisible.value = !document.hidden;
}
async function syncPlayback() {
  if (!animate.value) {
    video.value?.pause();
    playing.value = false;
    return;
  }
  loaded.value = true;
  await nextTick();
  if (disposed || !animate.value || failed.value || !video.value) return;
  video.value.muted = true;
  try {
    await video.value.play();
  } catch (error) {
    if (animate.value && (error as DOMException).name !== "AbortError")
      failed.value = true;
  }
}
watch(animate, syncPlayback);
function videoError() {
  failed.value = true;
  playing.value = false;
}
function sourceError(format: string) {
  failedSources.add(format);
  if (failedSources.size === 2) videoError();
}
function clearHover() {
  clearTimeout(hoverTimer);
}
function preview(event: PointerEvent) {
  clearHover();
  if (
    pinned ||
    event.pointerType !== "mouse" ||
    !matchMedia("(hover: hover)").matches
  )
    return;
  trigger = event.currentTarget as HTMLElement;
  panel.value = "work";
}
function open(kind: "work" | "flag", event: MouseEvent) {
  clearHover();
  trigger = event.currentTarget as HTMLElement;
  panel.value = kind;
  pinned = true;
  void nextTick(() => closeButton.value?.focus({ preventScroll: true }));
}
function close(restore = true) {
  clearHover();
  panel.value = null;
  pinned = false;
  if (restore) void nextTick(() => trigger?.focus({ preventScroll: true }));
}
function leave() {
  if (!pinned && !root.value?.contains(document.activeElement))
    hoverTimer = setTimeout(() => close(false), 200);
}
function outside(event: PointerEvent) {
  if (panel.value && !root.value?.contains(event.target as Node)) close(false);
}
onMounted(() => {
  motion = matchMedia("(prefers-reduced-motion: reduce)");
  settings();
  visibility();
  motion.addEventListener("change", settings);
  document.addEventListener("visibilitychange", visibility);
  document.addEventListener("pointerdown", outside);
  observer = new IntersectionObserver(([entry]) => {
    visible.value = entry.isIntersecting;
  });
  if (frame.value) observer.observe(frame.value);
});
onBeforeUnmount(() => {
  disposed = true;
  clearHover();
  video.value?.pause();
  observer?.disconnect();
  motion?.removeEventListener("change", settings);
  document.removeEventListener("visibilitychange", visibility);
  document.removeEventListener("pointerdown", outside);
});
</script>

<template>
  <figure
    ref="root"
    class="desk-scene"
    @pointerenter="clearHover"
    @pointerleave="leave"
    @keydown.esc.stop.prevent="close()"
  >
    <div
      ref="frame"
      class="desk-frame"
      :data-motion="animate ? (failed ? 'webp' : 'video') : 'poster'"
    >
      <img
        class="desk-media desk-poster"
        src="/media/jan-desk-poster.webp"
        width="640"
        height="360"
        fetchpriority="high"
        alt="Pixel-art Jan in a green hoodie at his desk, with two monitors, a keyboard, and a warm mug at dusk."
      />
      <video
        v-if="loaded && !failed"
        ref="video"
        class="desk-media desk-animation"
        :class="{ 'is-playing': animate && playing }"
        width="640"
        height="360"
        poster="/media/jan-desk-poster.webp"
        autoplay
        loop
        muted
        playsinline
        preload="none"
        aria-hidden="true"
        @playing="playing = true"
        @error="videoError"
      >
        <source
          src="/media/jan-desk.webm"
          type="video/webm"
          @error="sourceError('webm')"
        />
        <source
          src="/media/jan-desk.mp4"
          type="video/mp4"
          @error="sourceError('mp4')"
        />
      </video>
      <img
        v-if="failed && animate"
        class="desk-media desk-animation"
        :class="{ 'is-playing': webpReady }"
        src="/media/jan-desk-animated.webp"
        width="640"
        height="360"
        alt=""
        aria-hidden="true"
        @load="webpReady = true"
        @error="webpReady = false"
      />
      <span class="lamp-glow" aria-hidden="true"></span>
      <button
        type="button"
        class="desk-hotspot monitor-hotspot"
        aria-label="Monitor: explore selected work"
        aria-haspopup="dialog"
        aria-controls="desk-panel"
        :aria-expanded="panel === 'work'"
        @pointerenter="preview"
        @click="open('work', $event)"
      >
        <span class="hotspot-label">Selected work</span>
      </button>
      <button
        type="button"
        class="desk-hotspot keyboard-hotspot"
        aria-label="Inspect the keyboard"
        aria-haspopup="dialog"
        aria-controls="desk-panel"
        :aria-expanded="panel === 'flag'"
        @click="open('flag', $event)"
      >
        <span class="hotspot-label">Inspect</span>
      </button>
      <a
        href="#contact"
        class="desk-hotspot mug-hotspot"
        aria-label="Mug: contact Jan"
        @click="close(false)"
        ><span class="hotspot-label">Let’s talk</span></a
      >
    </div>
    <aside
      v-show="panel"
      id="desk-panel"
      class="desk-panel"
      role="dialog"
      aria-modal="false"
      :aria-label="panel === 'flag' ? 'Hidden desk discovery' : 'Selected work'"
      @pointerenter="clearHover"
    >
      <button
        ref="closeButton"
        type="button"
        class="close-panel"
        aria-label="Close desk panel"
        @click="close()"
      >
        ×
      </button>
      <div v-show="panel === 'work'">
        <p class="eyebrow">On my monitor</p>
        <h3>Selected work.</h3>
        <ul>
          <li v-for="study in caseStudies" :key="study.project.id">
            <a :href="`#${study.project.id}`" @click="close(false)"
              ><span>{{ study.project.title }}</span
              ><span aria-hidden="true">↗</span></a
            >
          </li>
        </ul>
      </div>
      <div v-show="panel === 'flag'">
        <p class="eyebrow">A little discovery</p>
        <h3>You found me.</h3>
        <code>{{ heroFlag }}</code>
        <a class="text-link" href="#contact" @click="close(false)"
          >Let’s talk ↗</a
        >
      </div>
    </aside>
    <p class="sr-only" role="status" aria-live="polite">
      {{
        panel === "flag"
          ? `You found the hidden flag: ${heroFlag}. Use the Let’s talk link to contact Jan.`
          : ""
      }}
    </p>
    <figcaption class="desk-caption metadata">
      <span>Explore the desk.</span
      ><button
        v-if="!reduced"
        type="button"
        :aria-pressed="paused"
        @click="paused = !paused"
      >
        {{ paused ? "Play scene" : "Pause scene" }}
      </button>
    </figcaption>
  </figure>
</template>

<style scoped>
.desk-scene {
  position: relative;
  margin: 0;
  min-width: 0;
  width: 100%;
  max-width: 640px;
  justify-self: center;
}
.desk-frame {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px solid #666070;
  border-radius: 10px;
  background: #24222c;
  box-shadow:
    0 20px 70px #0004,
    -12px -6px 45px #e9ae450c;
  isolation: isolate;
}
.desk-media {
  display: block;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}
.desk-animation {
  opacity: 0;
  pointer-events: none;
}
.desk-animation.is-playing {
  opacity: 1;
}
.lamp-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at 0 35%, #e9ae4518, transparent 48%);
  mix-blend-mode: screen;
}
.desk-hotspot {
  position: absolute;
  display: block;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 5px;
  min-width: 44px;
  min-height: 44px;
  transform: translate(-50%, -50%);
  cursor: pointer;
  padding: 0;
  text-decoration: none;
  touch-action: manipulation;
}
.monitor-hotspot {
  left: 27%;
  top: 47%;
  width: 43%;
  height: 40%;
}
.keyboard-hotspot {
  left: 42%;
  top: 80%;
  width: 23%;
  height: 17%;
}
.mug-hotspot {
  left: 56%;
  top: 63%;
  width: 8%;
  height: 15%;
}
.desk-hotspot:focus-visible {
  outline: 3px solid #f3bf69;
  outline-offset: 2px;
  background: #e9ae4510;
}
.hotspot-label {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  width: max-content;
  max-width: 150px;
  font: 11px/1.4 var(--mono);
  color: #fff4df;
  background: #25222df5;
  border: 1px solid #b39467;
  padding: 6px 9px;
  border-radius: 4px;
  opacity: 0;
  pointer-events: none;
}
.desk-hotspot:focus-visible .hotspot-label {
  opacity: 1;
}
@media (hover: hover) {
  .desk-hotspot:hover {
    border-color: #f3bf69c0;
    background: #e9ae4510;
  }
  .desk-hotspot:hover .hotspot-label {
    opacity: 1;
  }
}
.desk-panel {
  position: absolute;
  z-index: 4;
  right: 14px;
  top: 38%;
  width: min(340px, calc(100% - 28px));
  padding: 23px;
  border: 1px solid #b39467;
  border-radius: 8px;
  background: #211f2afc;
  color: #f0f3f5;
  box-shadow: 0 16px 45px #0007;
}
.desk-panel .eyebrow {
  font-size: 10px;
  margin-bottom: 9px;
  padding-right: 25px;
  color: #f3bf69;
}
.desk-panel h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
}
.close-panel {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: #f0f3f5;
  font-size: 26px;
}
.desk-panel ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.desk-panel li + li {
  border-top: 1px solid #514b5b;
}
.desk-panel li a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding-block: 10px;
  font-size: 13px;
  line-height: 1.4;
  text-decoration: none;
}
.desk-panel a:hover {
  color: #f3bf69;
}
.desk-panel code {
  display: block;
  margin-bottom: 20px;
  color: #f3bf69;
  font: 13px/1.8 var(--mono);
  overflow-wrap: anywhere;
}
.desk-panel .text-link {
  display: inline-block;
  padding-block: 10px;
  font-size: 14px;
}
.desk-caption {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  min-height: 48px;
  color: #c2bacb;
  font-size: 11px;
}
.desk-caption button {
  min-height: 44px;
  padding: 8px 0 8px 14px;
  border: 0;
  background: transparent;
  color: #f0d0a1;
  font: inherit;
  text-decoration: underline;
  text-underline-offset: 4px;
}
@media (max-width: 900px) {
  .desk-panel {
    position: relative;
    top: auto;
    right: auto;
    margin-top: 12px;
    width: 100%;
    box-shadow: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .desk-animation {
    display: none;
  }
}
</style>
