<script setup lang="ts">
import { markRaw } from "vue";
import { TresCanvas } from "@tresjs/core";
import { NoToneMapping, PerspectiveCamera } from "three";
import ConstellationObjects from "./ConstellationObjects.vue";
const props = defineProps<{
  stage: HTMLElement;
  elements: Map<string, HTMLElement>;
  visible: boolean;
  reduced: boolean;
  mobile: boolean;
  paused: boolean;
  pointer: { x: number; y: number };
  active: string | null;
  selected: string | null;
}>();
const emit = defineEmits<{ ready: []; failed: []; state: [value: string] }>();
const camera = markRaw(new PerspectiveCamera(42, 1, 0.1, 80));
camera.position.set(0, 0, 13);
</script>
<template>
  <TresCanvas
    aria-hidden="true"
    :tabindex="-1"
    :camera="camera"
    :dpr="[1, mobile ? 1.25 : 2]"
    :antialias="!mobile"
    :alpha="false"
    clear-color="#141b23"
    :tone-mapping="NoToneMapping"
    render-mode="manual"
    :shadows="false"
    @error="emit('failed')"
  >
    <ConstellationObjects
      v-bind="props"
      @state="emit('state', $event)"
      @ready="emit('ready')"
      @failed="emit('failed')"
    />
  </TresCanvas>
</template>
