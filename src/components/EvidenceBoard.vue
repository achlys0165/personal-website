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
import {
  evidenceNodes,
  evidenceConnections,
  relatedEvidence,
  type EvidenceId,
} from "./evidence/constellationData";

const root = ref<HTMLDivElement | null>(null);
const stage = ref<HTMLDivElement | null>(null);
const elements = new Map<string, HTMLElement>();
const Scene = shallowRef<Component | null>(null);
const ready = ref(false);
const visible = ref(false);
const tabVisible = ref(true);
const reduced = ref(false);
const mobile = ref(false);
const paused = ref(false);
const hovered = ref<EvidenceId | null>(null);
const selected = ref<EvidenceId | null>(null);
const pointer = reactive({ x: 0, y: 0 });
const running = ref("fallback");
const closeButton = ref<HTMLButtonElement | null>(null);
const active = computed(() => selected.value ?? hovered.value);
const related = computed(() => relatedEvidence(active.value));
const current = computed(() =>
  evidenceNodes.find((n) => n.id === selected.value),
);
const lines = evidenceConnections.map(([from, to]) => ({
  from: evidenceNodes.find((n) => n.id === from)!,
  to: evidenceNodes.find((n) => n.id === to)!,
}));
let observer: IntersectionObserver | undefined;
let disposed = false;
let loading = false;
let timer: ReturnType<typeof setTimeout> | undefined;
let firstPaint = 0;
let secondPaint = 0;
let motionQuery: MediaQueryList | undefined;
let smallQuery: MediaQueryList | undefined;

function settings() {
  reduced.value = motionQuery?.matches ?? false;
  const device = navigator as Navigator & { deviceMemory?: number };
  mobile.value =
    !!smallQuery?.matches ||
    (device.hardwareConcurrency > 0 && device.hardwareConcurrency <= 4) ||
    (device.deviceMemory !== undefined && device.deviceMemory <= 4);
}
function resetPositions() {
  for (const node of evidenceNodes) {
    const el = elements.get(node.id);
    if (el) {
      el.style.left = node.x + "%";
      el.style.top = node.y + "%";
      el.style.removeProperty("--scene-scale");
      el.style.removeProperty("--scene-rotate");
      el.style.removeProperty("--project-x");
      el.style.removeProperty("--project-y");
    }
  }
}
function fallback() {
  if (disposed) return;
  ready.value = false;
  Scene.value = null;
  running.value = "fallback";
  resetPositions();
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
    const module = await import("./evidence/ConstellationCanvas.vue");
    if (!disposed) Scene.value = markRaw(module.default);
  } catch {
    fallback();
  }
}
function scheduleLoad() {
  if (loading || timer || firstPaint || secondPaint) return;
  firstPaint = requestAnimationFrame(() => {
    firstPaint = 0;
    secondPaint = requestAnimationFrame(() => {
      secondPaint = 0;
      timer = setTimeout(() => {
        timer = undefined;
        void load();
      }, 350);
    });
  });
}
function tabChange() {
  tabVisible.value = !document.hidden;
}
function move(event: PointerEvent) {
  if (!stage.value || mobile.value || reduced.value) return;
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
async function open(id: EvidenceId) {
  selected.value = id;
  await nextTick();
  closeButton.value?.focus({ preventScroll: true });
}
async function close() {
  const id = selected.value;
  selected.value = null;
  await nextTick();
  if (id) elements.get(id)?.focus({ preventScroll: true });
}

onMounted(() => {
  motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  smallQuery = window.matchMedia("(max-width: 700px), (pointer: coarse)");
  settings();
  tabChange();
  motionQuery.addEventListener("change", settings);
  smallQuery.addEventListener("change", settings);
  document.addEventListener("visibilitychange", tabChange);
  observer = new IntersectionObserver(
    (entries) => {
      visible.value = entries.some((e) => e.isIntersecting);
      if (visible.value) scheduleLoad();
    },
    { threshold: 0 },
  );
  if (root.value) observer.observe(root.value);
  stage.value?.addEventListener("webglcontextlost", fallback, true);
});
onBeforeUnmount(() => {
  disposed = true;
  observer?.disconnect();
  clearTimeout(timer);
  cancelAnimationFrame(firstPaint);
  cancelAnimationFrame(secondPaint);
  motionQuery?.removeEventListener("change", settings);
  smallQuery?.removeEventListener("change", settings);
  document.removeEventListener("visibilitychange", tabChange);
  stage.value?.removeEventListener("webglcontextlost", fallback, true);
});
</script>

<template>
  <div
    ref="root"
    class="evidence-board constellation-shell"
    :class="{ 'scene-ready': ready, 'motion-reduced': reduced }"
    :data-rendering="running"
    @keydown.esc.stop.prevent="close"
  >
    <div class="board-header metadata">
      <span>Connected evidence</span><span>Evidence constellation</span>
    </div>
    <div
      ref="stage"
      class="constellation-stage"
      @pointermove="move"
      @pointerleave="
        pointer.x = 0;
        pointer.y = 0;
        hovered = null;
      "
    >
      <component
        :is="Scene"
        v-if="Scene && stage"
        :stage="stage"
        :elements="elements"
        :visible="visible && tabVisible"
        :reduced="reduced"
        :mobile="mobile"
        :paused="paused"
        :pointer="pointer"
        :active="active"
        :selected="selected"
        @ready="ready = true"
        @failed="fallback"
        @state="running = $event"
      />
      <svg
        v-if="!ready"
        class="static-wires"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line
          v-for="line in lines"
          :key="line.from.id + line.to.id"
          :x1="line.from.x"
          :y1="line.from.y"
          :x2="line.to.x"
          :y2="line.to.y"
        />
      </svg>
      <ul class="constellation-cards" aria-label="Evidence constellation nodes">
        <li v-for="node in evidenceNodes" :key="node.id">
          <a
            :ref="
              (el) => {
                if (el) elements.set(node.id, el as HTMLElement);
              }
            "
            :href="node.href"
            class="evidence-node constellation-card"
            :class="{
              featured: node.featured,
              tool: ['vue', 'python', 'shared'].includes(node.id),
              highlighted: active === node.id,
              connected: !!active && related.has(node.id),
              muted: active && !related.has(node.id),
            }"
            :style="{ left: node.x + '%', top: node.y + '%' }"
            :aria-expanded="selected === node.id"
            :aria-controls="selected === node.id ? 'evidence-info' : undefined"
            @click.prevent="open(node.id)"
            @pointerenter="hovered = node.id"
            @focus="hovered = node.id"
            @blur="hovered = null"
          >
            <span class="thumbnail-placeholder" aria-hidden="true">{{
              ["vue", "python", "shared"].includes(node.id)
                ? "Logo pending"
                : "Image pending"
            }}</span>
            <strong>{{ node.title }}</strong
            ><small>{{ node.detail }}</small>
            <span v-if="node.relation" class="relation-note">{{
              node.relation
            }}</span>
          </a>
        </li>
      </ul>
    </div>
    <div class="constellation-footer">
      <div class="connection-legend">
        <span><i></i>Solid: shared tech</span
        ><span><i class="dashed"></i>Dashed: built for / won at</span>
      </div>
      <button
        v-if="ready && !reduced"
        type="button"
        class="motion-toggle"
        :aria-pressed="paused"
        @click="paused = !paused"
      >
        {{ paused ? "Resume motion" : "Pause motion" }}
      </button>
    </div>
    <div
      v-if="current"
      id="evidence-info"
      class="evidence-info"
      role="dialog"
      aria-modal="false"
      aria-labelledby="evidence-info-title"
    >
      <button
        ref="closeButton"
        class="info-close"
        type="button"
        aria-label="Close evidence details"
        @click="close"
      >
        ×</button
      ><span class="metadata">Evidence detail</span>
      <h3 id="evidence-info-title">{{ current.title }}</h3>
      <p>{{ current.description }}</p>
      <p class="info-stack">
        {{
          current.stack.length
            ? current.stack.join(" / ")
            : "Team competition · September 2026"
        }}
      </p>
      <div class="info-links">
        <a :href="current.href" class="text-link" @click="selected = null">{{
          current.id === "ctf"
            ? "View CTF result"
            : current.id === "shared"
              ? "JSP case study"
              : "View case study"
        }}</a
        ><a
          v-if="current.id === 'shared'"
          href="#studyhub"
          class="text-link"
          @click="selected = null"
          >StudyHub case study</a
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.constellation-shell {
  background: #141b23;
  background-image: none;
  overflow: hidden;
  contain: layout paint style;
}
.constellation-shell .board-header {
  z-index: 2;
  pointer-events: none;
}
.constellation-stage {
  position: absolute;
  inset: 48px 0 74px;
}
.constellation-cards {
  position: absolute;
  inset: 0;
  list-style: none;
  padding: 0;
  margin: 0;
  pointer-events: none;
}
.constellation-cards > li {
  list-style: none;
}
.constellation-card {
  --scene-scale: 1;
  --hover-scale: 1;
  display: block;
  pointer-events: auto;
  cursor: pointer;
  width: min(166px, 43%);
  height: 84px;
  padding: 10px 13px;
  background: #1b2735ed;
  border: 1px solid #596c81;
  border-radius: 5px;
  transform: translate(-50%, -50%)
    translate(var(--project-x, 0px), var(--project-y, 0px)) perspective(650px)
    rotateY(var(--scene-rotate, 0deg))
    scale(calc(var(--scene-scale) * var(--hover-scale)));
  transition:
    opacity 0.25s,
    border-color 0.25s,
    background-color 0.25s;
  box-shadow: 0 8px 20px #0005;
  will-change: transform;
}
.constellation-card::after {
  display: none;
}
.constellation-card strong {
  font-size: 13px;
  line-height: 1.3;
}
.constellation-card small {
  font-size: 11px;
  line-height: 1.4;
  margin-top: 3px;
  color: #c4cfdb;
}
.constellation-card.featured {
  box-shadow:
    0 0 18px #e9ae4510,
    0 8px 20px #0005;
  width: min(180px, 45%);
  height: 92px;
  border-color: #d6a448;
  background: #30291def;
}
.constellation-card.tool {
  width: min(132px, 37%);
  height: 64px;
  background: #15202cec;
  padding: 8px 10px;
}
.tool strong {
  font-size: 12px;
}
.tool small {
  font-size: 10px;
}
.thumbnail-placeholder {
  display: block;
  color: #bac8d8;
  font: 9px/1.3 var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 5px;
  padding-left: 8px;
  border-left: 2px solid #8a9fb6;
}
.featured .thumbnail-placeholder {
  border-color: #e9ae45;
  color: #efd6a3;
}
.constellation-card.highlighted {
  --hover-scale: 1.035;
  border-color: #f3bf64;
  background: #353125fa;
  z-index: 3;
}
.constellation-card.connected {
  border-color: #e9ae45;
}
.constellation-card.muted {
  opacity: 1;
  border-color: #354452;
  background: #15202c;
  box-shadow: none;
}
.constellation-card.muted strong,
.constellation-card.muted small {
  color: #aeb8c5;
}
.relation-note {
  position: absolute;
  left: 0;
  top: calc(100% + 4px);
  display: flex;
  align-items: center;
  gap: 4px;
  color: #f2cf92;
  font: 9px/1.3 var(--mono);
  white-space: nowrap;
}
.relation-note::before {
  content: "";
  width: 13px;
  border-top: 1px dashed #e9ae45;
}
.static-wires {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.static-wires line {
  stroke: #c39649;
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}
.constellation-footer {
  position: absolute;
  bottom: 13px;
  left: 18px;
  right: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.connection-legend {
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: #bac7d7;
  font: 10px/1.4 var(--mono);
}
.connection-legend span {
  display: flex;
  gap: 7px;
  align-items: center;
}
.connection-legend i {
  width: 17px;
  border-top: 1px solid #e9ae45;
}
.connection-legend i.dashed {
  border-top-style: dashed;
}
.motion-toggle {
  border: 1px solid #65768c;
  background: #1b2735;
  color: #e1e8f1;
  border-radius: 3px;
  padding: 8px;
  min-height: 36px;
  font: 10px var(--mono);
}
.evidence-info {
  position: absolute;
  z-index: 5;
  inset: auto 14px 14px;
  background: #121c28fa;
  border: 1px solid #e9ae45;
  border-radius: 5px;
  box-shadow: 0 12px 50px #0009;
  padding: 20px 45px 20px 20px;
  backdrop-filter: blur(10px);
}
.evidence-info .metadata {
  color: #e9ae45;
  font-size: 10px;
}
.evidence-info h3 {
  font-size: 1.15rem;
  letter-spacing: -0.02em;
  margin: 10px 0;
}
.evidence-info p {
  font-size: 0.875rem;
  line-height: 1.7;
  color: #d4dce7;
  margin: 0 0 10px;
}
.evidence-info .info-stack {
  font: 11px/1.6 var(--mono);
  color: #edcc94;
}
.evidence-info a {
  font-size: 0.8125rem;
}
.info-links {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.info-close {
  position: absolute;
  top: 9px;
  right: 9px;
  width: 34px;
  height: 34px;
  background: #253347;
  border: 1px solid #6b7b8e;
  border-radius: 3px;
  font-size: 22px;
}
.constellation-shell:deep(canvas) {
  display: block;
  outline: none;
}
@media (max-width: 700px) {
  .constellation-card.featured {
    box-shadow: none;
  }
  .constellation-shell {
    height: 480px;
  }
  .constellation-stage {
    inset: 43px 0 74px;
  }
  .constellation-card {
    height: 80px;
    padding: 8px 9px;
  }
  .constellation-card.featured {
    height: 86px;
  }
  .constellation-card strong {
    font-size: 12px;
  }
  .constellation-card small {
    font-size: 10px;
  }
  .constellation-card.tool {
    height: 64px;
    padding: 8px;
  }
  .tool strong {
    font-size: 11px;
  }
  .tool small {
    font-size: 10px;
  }
  .thumbnail-placeholder {
    font-size: 8px;
    margin-bottom: 4px;
  }
  .relation-note {
    font-size: 8px;
  }
  .constellation-footer {
    left: 12px;
    right: 12px;
    bottom: 12px;
  }
  .connection-legend {
    font-size: 9px;
  }
  .motion-toggle {
    font-size: 9px;
    padding: 7px;
  }
  .evidence-info {
    padding: 16px 42px 16px 16px;
  }
  .evidence-info h3 {
    font-size: 1rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  .constellation-card {
    transition: none;
    will-change: auto;
  }
}
</style>
