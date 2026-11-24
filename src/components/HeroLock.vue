<script setup lang="ts">
import {
  computed,
  markRaw,
  nextTick,
  onBeforeUnmount,
  onErrorCaptured,
  onMounted,
  reactive,
  ref,
  shallowRef,
  type Component,
} from "vue";
import { heroLockFlag, clampLockTilt } from "../lockState";
const control = ref<HTMLButtonElement | null>(null);
const unlocked = ref(false),
  hovered = ref(false),
  focused = ref(false);
const lens = computed(() =>
  mobile.value
    ? unlocked.value || focused.value
    : hovered.value || focused.value,
);
const root = ref<HTMLDivElement | null>(null);
const stage = ref<HTMLDivElement | null>(null);
const Scene = shallowRef<Component | null>(null);
const ready = ref(false),
  visible = ref(false),
  tabVisible = ref(true),
  mobile = ref(false),
  reduced = ref(false),
  paused = ref(false);
const state = ref("fallback");
const streams = ["Jan", "Sultan", "Vue", "Python"].map((word) =>
  Array.from(word).map((character) =>
    character.charCodeAt(0).toString(16).toUpperCase(),
  ),
);
const pointer = reactive({ x: 0, y: 0 });
const rotation = reactive({ x: 0, y: 0 });
let observer: IntersectionObserver | undefined;
let motion: MediaQueryList | undefined;
let small: MediaQueryList | undefined;
let first = 0,
  second = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
let disposed = false,
  loading = false;
function settings() {
  reduced.value = motion?.matches ?? false;
  const device = navigator as Navigator & { deviceMemory?: number };
  mobile.value =
    !!small?.matches ||
    (device.hardwareConcurrency > 0 && device.hardwareConcurrency <= 4) ||
    (device.deviceMemory !== undefined && device.deviceMemory <= 4);
}
function tab() {
  tabVisible.value = !document.hidden;
}
function fallback() {
  if (disposed) return;
  ready.value = false;
  Scene.value = null;
  state.value = "fallback";
}
onErrorCaptured(() => {
  fallback();
  return false;
});
async function load() {
  if (loading || disposed || !visible.value) return;
  loading = true;
  try {
    if (!("WebGL2RenderingContext" in window)) return;
    const module = await import("./lock/LockCanvas.vue");
    if (!disposed) Scene.value = markRaw(module.default);
  } catch {
    fallback();
  }
}
function schedule() {
  if (loading || first || second || timer) return;
  first = requestAnimationFrame(() => {
    first = 0;
    second = requestAnimationFrame(() => {
      second = 0;
      timer = setTimeout(() => {
        timer = undefined;
        void load();
      }, 350);
    });
  });
}
let drag: {
  id: number;
  x: number;
  y: number;
  rx: number;
  ry: number;
  moved: boolean;
} | null = null;
let suppressClick = false;
function down(event: PointerEvent) {
  suppressClick = false;
  if (event.button !== 0) return;
  if (mobile.value || event.pointerType === "touch") {
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      rx: rotation.x,
      ry: rotation.y,
      moved: false,
    };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }
}
function move(event: PointerEvent) {
  if (drag && drag.id === event.pointerId) {
    const dx = event.clientX - drag.x,
      dy = event.clientY - drag.y;
    if (Math.hypot(dx, dy) > 6) drag.moved = true;
    if (drag.moved) {
      rotation.y = drag.ry + dx * 0.008;
      rotation.x = clampLockTilt(drag.rx + dy * 0.003);
    }
    return;
  }
  if (!stage.value || mobile.value) return;
  const rect = stage.value.getBoundingClientRect();
  pointer.x = Math.max(
    -1,
    Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1),
  );
  pointer.y = Math.max(
    -1,
    Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1),
  );
}
function up() {
  suppressClick = !!drag?.moved;
  drag = null;
}
function toggle() {
  if (suppressClick) {
    suppressClick = false;
    return;
  }
  unlocked.value = !unlocked.value;
}
function relock() {
  unlocked.value = false;
  void nextTick(() => control.value?.focus({ preventScroll: true }));
}
function keyboard(event: KeyboardEvent) {
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    relock();
    return;
  }
  const delta: Record<string, [number, number]> = {
    ArrowLeft: [-0.12, 0],
    ArrowRight: [0.12, 0],
    ArrowUp: [0, -0.12],
    ArrowDown: [0, 0.12],
  };
  if (delta[event.key]) {
    event.preventDefault();
    pointer.x = Math.max(-0.8, Math.min(0.8, pointer.x + delta[event.key][0]));
    pointer.y = Math.max(-0.8, Math.min(0.8, pointer.y + delta[event.key][1]));
  }
}
onMounted(() => {
  motion = matchMedia("(prefers-reduced-motion: reduce)");
  small = matchMedia("(max-width:700px), (pointer:coarse)");
  settings();
  tab();
  motion.addEventListener("change", settings);
  small.addEventListener("change", settings);
  document.addEventListener("visibilitychange", tab);
  observer = new IntersectionObserver((entries) => {
    visible.value = entries.some((entry) => entry.isIntersecting);
    if (visible.value) schedule();
  });
  if (root.value) observer.observe(root.value);
  stage.value?.addEventListener("webglcontextlost", fallback, true);
});
onBeforeUnmount(() => {
  disposed = true;
  observer?.disconnect();
  cancelAnimationFrame(first);
  cancelAnimationFrame(second);
  clearTimeout(timer);
  motion?.removeEventListener("change", settings);
  small?.removeEventListener("change", settings);
  document.removeEventListener("visibilitychange", tab);
  stage.value?.removeEventListener("webglcontextlost", fallback, true);
});
</script>
<template>
  <div
    ref="root"
    class="hero-lock"
    @keydown.esc.stop.prevent="relock"
    :class="{
      'motion-active': ready && visible && tabVisible && !paused && !reduced,
    }"
    :data-rendering="state"
  >
    <div class="lock-heading metadata">
      <span>Security / forensic inspection</span><span>jan.sec</span>
    </div>
    <div ref="stage" class="lock-stage">
      <div class="hex-field" aria-hidden="true">
        <div
          v-for="(stream, index) in streams"
          :key="index"
          class="hex-column"
          :style="{ '--column': index }"
        >
          <span v-for="repeat in 2" :key="repeat"
            ><span v-for="(byte, byteIndex) in stream" :key="byteIndex">{{
              byte
            }}</span></span
          >
        </div>
      </div>
      <component
        :is="Scene"
        v-if="Scene && stage"
        :stage="stage"
        :visible="visible && tabVisible"
        :mobile="mobile"
        :reduced="reduced"
        :paused="paused"
        :pointer="pointer"
        :rotation="rotation"
        :unlocked="unlocked"
        :lens="lens"
        @ready="ready = true"
        @failed="fallback"
        @state="state = $event"
      />
      <svg
        v-if="!ready"
        class="lock-fallback"
        viewBox="0 0 400 460"
        role="img"
        aria-label="Dark metal padlock with an amber edge"
      >
        <defs>
          <linearGradient id="lock-metal" x2="1" y2="1">
            <stop stop-color="#657788" />
            <stop offset=".45" stop-color="#223345" />
            <stop offset="1" stop-color="#101923" />
          </linearGradient>
        </defs>
        <g
          :transform="
            unlocked ? 'translate(0 -25) rotate(-12 279 210)' : undefined
          "
        >
          <path
            d="M121 210v-70a79 79 0 0 1 158 0v70"
            fill="none"
            stroke="#71879b"
            stroke-width="27"
          />
          <path
            d="M121 210v-70a79 79 0 0 1 158 0"
            fill="none"
            stroke="#e9ae45"
            stroke-width="3"
          />
        </g>
        <rect
          x="74"
          y="196"
          width="252"
          height="217"
          rx="23"
          fill="url(#lock-metal)"
          stroke="#71879b"
        />
        <rect
          x="95"
          y="216"
          width="210"
          height="177"
          rx="15"
          fill="#192737"
          stroke="#e9ae45"
        />
        <circle cx="200" cy="294" r="16" fill="#080e16" />
        <path d="M193 304h14v30h-14z" fill="#080e16" />
        <path d="M140 382h120" stroke="#e9ae45" stroke-width="3" />
      </svg>
      <button
        type="button"
        ref="control"
        class="model-control"
        aria-label="Forensic padlock. Enter toggles unlock. Escape relocks. Arrow keys move the lens."
        aria-describedby="lock-instructions"
        :aria-pressed="unlocked"
        @pointerenter="hovered = !mobile"
        @pointerleave="hovered = false"
        @pointerdown="down"
        @pointermove="move"
        @pointerup="up"
        @pointercancel="
          drag = null;
          suppressClick = false;
        "
        @focus="
          focused = ($event.currentTarget as HTMLElement).matches(
            ':focus-visible',
          )
        "
        @blur="focused = false"
        @click="toggle"
        @keydown="keyboard"
      ></button>
    </div>
    <div v-show="unlocked" class="lock-reveal">
      <span class="unlock-label">UNLOCKED</span><code>{{ heroLockFlag }}</code
      ><a href="#contact">Let’s talk</a>
    </div>
    <p class="sr-only" role="status" aria-live="polite">
      {{
        unlocked
          ? "Padlock unlocked. " +
            heroLockFlag +
            ". Contact Jan using the Let’s talk link."
          : "Padlock locked."
      }}
    </p>
    <div class="lock-footer">
      <span id="lock-instructions" class="metadata">{{
        mobile
          ? "Drag to rotate · Tap to unlock"
          : "Hover to inspect · Click to unlock"
      }}</span
      ><button
        v-if="ready && !reduced"
        type="button"
        :aria-pressed="paused"
        @click="paused = !paused"
      >
        {{ paused ? "Resume motion" : "Pause motion" }}
      </button>
    </div>
  </div>
</template>
<style scoped>
.hero-lock {
  position: relative;
  height: 580px;
  min-width: 0;
  background: #141b23;
  border: 1px solid #34404e;
  border-radius: 5px;
  overflow: hidden;
  contain: layout paint style;
}
.lock-heading {
  position: absolute;
  top: 18px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  color: #aeb8c5;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  z-index: 2;
}
.lock-heading span:first-child {
  color: #e9ae45;
}
.lock-stage {
  position: absolute;
  inset: 45px 0 65px;
}
.lock-fallback {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 20px;
  pointer-events: none;
}
.lock-footer {
  position: absolute;
  bottom: 15px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}
.lock-footer > span {
  font-size: 10px;
  color: #aeb8c5;
}
.lock-footer button {
  background: #1b2735;
  border: 1px solid #65768c;
  border-radius: 3px;
  padding: 8px;
  color: #e1e8f1;
  font: 10px var(--mono);
  min-height: 36px;
}
.model-control {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  background: transparent;
  cursor: crosshair;
  touch-action: pan-y;
}
.model-control:focus-visible {
  outline: 2px solid #e9ae45;
  outline-offset: -7px;
}
.lock-reveal {
  position: absolute;
  z-index: 4;
  bottom: 70px;
  right: 18px;
  left: 18px;
  max-width: 365px;
  margin-left: auto;
  border: 1px solid #e9ae45;
  background: #101b27f5;
  border-radius: 5px;
  padding: 18px;
  box-shadow: 0 10px 35px #0007;
}
.unlock-label {
  display: block;
  color: #e9ae45;
  font: 600 11px var(--mono);
  letter-spacing: 0.15em;
  margin-bottom: 10px;
  animation: unlock-arrive 0.55s ease-out;
}
.lock-reveal code {
  display: block;
  color: #f0f3f5;
  font: 13px/1.6 var(--mono);
  overflow-wrap: anywhere;
}
.lock-reveal a {
  display: inline-block;
  margin-top: 10px;
  color: #e9ae45;
  font-size: 13px;
}
@keyframes unlock-arrive {
  from {
    transform: translateY(5px);
  }
  to {
    transform: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .unlock-label {
    animation: none;
  }
}
.hero-lock:deep(canvas) {
  display: block;
  outline: none;
  position: absolute;
  inset: 0;
  z-index: 1;
}
.model-control {
  z-index: 3;
}
.lock-fallback {
  z-index: 2;
}
.hex-field {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  opacity: 0.22;
  mask-image: linear-gradient(transparent, #000 25%, #000 75%, transparent);
}
.hex-column {
  position: absolute;
  top: calc(var(--column) * 7%);
  left: calc(4% + var(--column) * 30%);
  color: #8dacc3;
  font: 10px/2 var(--mono);
  animation: hex-fall calc(28s + var(--column) * 3s) linear infinite;
  animation-play-state: paused;
}
.hex-column > span,
.hex-column > span > span {
  display: block;
}
.motion-active .hex-column {
  animation-play-state: running;
}
@keyframes hex-fall {
  from {
    transform: translateY(-50%);
  }
  to {
    transform: translateY(0);
  }
}
@media (max-width: 700px) {
  .hex-column:nth-child(2),
  .hex-column:nth-child(3) {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .hex-column {
    animation: none;
  }
}
@media (max-width: 900px) {
  .hero-lock {
    height: 560px;
  }
}
@media (max-width: 700px) {
  .hero-lock {
    height: 480px;
    margin-inline: -6px;
  }
  .lock-heading {
    font-size: 9px;
    left: 14px;
    right: 14px;
  }
  .lock-stage {
    inset: 42px 0 70px;
  }
  .lock-footer {
    left: 14px;
    right: 14px;
  }
  .lock-footer > span {
    font-size: 9px;
    max-width: 165px;
  }
  .lock-footer button {
    font-size: 9px;
  }
}
</style>
