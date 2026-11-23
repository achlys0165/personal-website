<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
const props = defineProps<{ label: string }>();
const goal = Number.parseInt(props.label, 10);
const count = ref(goal);
const root = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | undefined;
let frame = 0;
onMounted(() => {
  if (
    !root.value ||
    !Number.isFinite(goal) ||
    window.matchMedia("(prefers-reduced-motion: reduce), (max-width: 700px)")
      .matches
  )
    return;
  observer = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) {
      cancelAnimationFrame(frame);
      count.value = goal;
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      count.value = Math.round(goal * Math.min(1, (now - start) / 650));
      if (count.value < goal) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    observer?.disconnect();
  });
  observer.observe(root.value);
});
onBeforeUnmount(() => {
  observer?.disconnect();
  cancelAnimationFrame(frame);
});
</script>
<template>
  <span ref="root" class="rank-label"
    ><span class="sr-only">{{ label }}</span
    ><span aria-hidden="true"
      ><strong>{{ count }}</strong
      >{{ label.replace(/^\d+/, "") }}</span
    ></span
  >
</template>
