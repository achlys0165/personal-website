<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, nextTick } from "vue";
import RenderAsset from "./RenderAsset.vue";
import { heroFlag } from "../visualState";
const root = ref<HTMLElement | null>(null);
const control = ref<HTMLButtonElement | null>(null);
const found = ref(false);
const paused = ref(false);
let observer: IntersectionObserver | undefined;
let media: MediaQueryList | undefined;
let visible = false;
function state() {
  if (media?.matches) reset();
  root.value?.classList.toggle(
    "motion-active",
    visible && !document.hidden && !media?.matches && !paused.value,
  );
}
function tilt(event: PointerEvent) {
  if (media?.matches || event.pointerType !== "mouse" || paused.value) return;
  const rect = root.value!.getBoundingClientRect();
  root.value!.style.setProperty(
    "--pointer-x",
    ((event.clientX - rect.left) / rect.width - 0.5) * 14 + "px",
  );
  root.value!.style.setProperty(
    "--pointer-y",
    ((event.clientY - rect.top) / rect.height - 0.5) * 10 + "px",
  );
}
function reset() {
  root.value?.style.setProperty("--pointer-x", "0px");
  root.value?.style.setProperty("--pointer-y", "0px");
}
function pause() {
  paused.value = !paused.value;
  reset();
  state();
}
function close() {
  if (!found.value) return;
  found.value = false;
  void nextTick(() => control.value?.focus({ preventScroll: true }));
}
onMounted(() => {
  media = matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", state);
  document.addEventListener("visibilitychange", state);
  observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    state();
  });
  if (root.value) observer.observe(root.value);
});
onBeforeUnmount(() => {
  observer?.disconnect();
  media?.removeEventListener("change", state);
  document.removeEventListener("visibilitychange", state);
});
</script>
<template>
  <div
    ref="root"
    class="hero-art"
    @pointermove="tilt"
    @pointerleave="reset"
    @keydown.esc.stop.prevent="close"
  >
    <div class="hero-orbit orbit-one" aria-hidden="true"></div>
    <div class="hero-orbit orbit-two" aria-hidden="true"></div>
    <RenderAsset
      name="glass-cube"
      class="glass-cube cube-one"
      sizes="80px"
      aria-hidden="true"
    />
    <RenderAsset
      name="glass-cube"
      class="glass-cube cube-two"
      sizes="100px"
      aria-hidden="true"
    />
    <span class="light-orb" aria-hidden="true"></span>
    <div class="shield-layer">
      <RenderAsset
        name="shield-hero"
        hero
        alt="A sculptural blue-glass security shield with a brushed metal rim and amber circuitry."
      /><button
        ref="control"
        class="shield-keyhole"
        type="button"
        aria-label="Inspect the shield’s amber keyhole"
        aria-controls="shield-discovery"
        :aria-expanded="found"
        @click="found = !found"
      >
        <span class="sr-only">Inspect the keyhole</span>
      </button>
    </div>
    <div
      v-show="found"
      id="shield-discovery"
      class="shield-discovery"
      role="status"
    >
      <span class="metadata">Hidden in plain sight</span
      ><strong>You found me.</strong><code>{{ heroFlag }}</code>
      <div>
        <a href="#contact">Let’s talk ↗</a
        ><button type="button" aria-label="Close flag discovery" @click="close">
          Close
        </button>
      </div>
    </div>
    <div class="art-caption metadata">
      <span>Curiosity is a good starting point.</span
      ><button type="button" :aria-pressed="paused" @click="pause">
        {{ paused ? "Resume motion" : "Pause motion" }}
      </button>
    </div>
  </div>
</template>
