<script setup lang="ts">
import { computed, ref } from "vue";
import { constrainNode } from "../visualState";

const board = ref<HTMLDivElement | null>(null);
const active = ref("hymn");
const nodes = ref([
  {
    id: "hymn",
    title: "TOP Church",
    detail: "Worship presentation",
    kind: "project",
    x: 27,
    y: 24,
    href: "#hymn",
    icon: "slides",
  },
  {
    id: "webctf-auto",
    title: "WebCTF-Auto",
    detail: "Python source review",
    kind: "project",
    x: 73,
    y: 43,
    href: "#webctf-auto",
    icon: "source",
  },
  {
    id: "jsp",
    title: "JSP Engineering",
    detail: "Client website",
    kind: "project",
    x: 26,
    y: 72,
    href: "#jsp",
    icon: "web",
  },
  {
    id: "studyhub",
    title: "StudyHub",
    detail: "Gemini study tools",
    kind: "project",
    x: 73,
    y: 83,
    href: "#studyhub",
    icon: "study",
  },
  {
    id: "vue",
    title: "Vue + Tauri",
    detail: "Web / desktop",
    kind: "tool",
    x: 26,
    y: 44,
    href: "#skills",
    icon: "",
  },
  {
    id: "python",
    title: "Python",
    detail: "Review / reports",
    kind: "tool",
    x: 74,
    y: 18,
    href: "#skills",
    icon: "",
  },
  {
    id: "shared",
    title: "React + Node.js",
    detail: "Web applications",
    kind: "tool",
    x: 30,
    y: 88,
    href: "#skills",
    icon: "",
  },
  {
    id: "ctf",
    title: "JISSA × Resecurity",
    detail: "1st Runner-Up · Team",
    kind: "ctf",
    x: 73,
    y: 64,
    href: "#experience",
    icon: "flag",
  },
]);
// Connections describe the project scope supplied by Jan, rather than a network topology.
const pairs = [
  ["hymn", "vue"],
  ["webctf-auto", "python"],
  ["jsp", "shared"],
  ["studyhub", "shared"],
];
const lines = computed(() =>
  pairs.map(([from, to]) => ({
    from: nodes.value.find((n) => n.id === from)!,
    to: nodes.value.find((n) => n.id === to)!,
  })),
);
let drag: {
  id: string;
  pointer: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  moved: boolean;
} | null = null;
let suppressClick = false;
function start(event: PointerEvent, id: string) {
  if (
    event.button !== 0 ||
    event.pointerType === "touch" ||
    window.matchMedia("(prefers-reduced-motion: reduce), (max-width: 700px)")
      .matches
  )
    return;
  suppressClick = false;
  const node = nodes.value.find((n) => n.id === id)!;
  drag = {
    id,
    pointer: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    x: node.x,
    y: node.y,
    moved: false,
  };
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
}
function move(event: PointerEvent) {
  if (!drag || drag.pointer !== event.pointerId || !board.value) return;
  const box = board.value.getBoundingClientRect();
  if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 5)
    drag.moved = true;
  if (!drag.moved) return;
  const node = nodes.value.find((n) => n.id === drag!.id)!;
  Object.assign(
    node,
    constrainNode(
      drag.x + ((event.clientX - drag.startX) / box.width) * 100,
      drag.y + ((event.clientY - drag.startY) / box.height) * 100,
    ),
  );
}
function stop() {
  suppressClick = !!drag?.moved;
  drag = null;
}
function follow(event: MouseEvent) {
  if (suppressClick) {
    event.preventDefault();
    suppressClick = false;
  }
}
function keymove(event: KeyboardEvent, id: string) {
  const delta: Record<string, [number, number]> = {
    ArrowLeft: [-3, 0],
    ArrowRight: [3, 0],
    ArrowUp: [0, -3],
    ArrowDown: [0, 3],
  };
  if (
    !delta[event.key] ||
    window.matchMedia("(prefers-reduced-motion: reduce), (max-width: 700px)")
      .matches
  )
    return;
  event.preventDefault();
  const node = nodes.value.find((n) => n.id === id)!;
  Object.assign(
    node,
    constrainNode(node.x + delta[event.key][0], node.y + delta[event.key][1]),
  );
}
</script>

<template>
  <div
    class="evidence-board"
    ref="board"
    @pointermove="move"
    @pointerup="stop"
    @pointercancel="stop"
  >
    <div class="board-header metadata">
      <span>Connected evidence</span><span>Software / security</span>
    </div>
    <svg
      class="board-wires"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        v-for="line in lines"
        :key="line.from.id + line.to.id"
        :class="{ linked: line.from.id === active || line.to.id === active }"
        :d="`M${line.from.x},${line.from.y} C${line.from.x},${(line.from.y + line.to.y) / 2} ${line.to.x},${(line.from.y + line.to.y) / 2} ${line.to.x},${line.to.y}`"
      />
    </svg>
    <a
      v-for="node in nodes"
      :key="node.id"
      :href="node.href"
      class="evidence-node"
      :class="[`node-${node.kind}`, { selected: active === node.id }]"
      :style="{ left: node.x + '%', top: node.y + '%' }"
      @pointerdown="start($event, node.id)"
      @dragstart.prevent
      @click="follow"
      @pointerenter="active = node.id"
      @focus="active = node.id"
      @keydown="keymove($event, node.id)"
    >
      <svg
        v-if="node.icon"
        viewBox="0 0 32 32"
        class="node-icon"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <template v-if="node.icon === 'slides'">
          <rect x="4" y="5" width="24" height="17" rx="2" />
          <path d="M10 27h12M16 22v5M9 11h14M9 16h9" />
        </template>
        <template v-else-if="node.icon === 'source'">
          <path d="M11 9 4 16l7 7M21 9l7 7-7 7M18 5l-4 22" />
        </template>
        <template v-else-if="node.icon === 'web'">
          <rect x="3" y="5" width="26" height="23" rx="2" />
          <path d="M3 12h26M8 9h2M13 9h2M9 18h14M9 23h8" />
        </template>
        <template v-else-if="node.icon === 'study'">
          <path
            d="M16 9C12 6 6 6 3 8v18c4-2 9-2 13 1 4-3 9-3 13-1V8c-3-2-9-2-13 1Zm0 0v18M7 12l5 1M7 17l5 1M21 13l4-1M21 18l4-1"
          />
        </template>
        <template v-else>
          <path d="M8 29V4c6-4 10 4 17 0v14c-7 4-11-4-17 0" />
        </template>
      </svg>
      <span
        ><strong>{{ node.title }}</strong
        ><small>{{ node.detail }}</small></span
      >
    </a>
    <p class="board-help metadata">
      <span class="desktop-drag"
        >Drag nodes · Arrow keys move focused nodes · </span
      >Select to explore
    </p>
  </div>
</template>
