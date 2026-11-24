<script setup lang="ts">
import { markRaw, unref } from "vue";
import { TresCanvas, type TresRendererSetupContext } from "@tresjs/core";
import { ACESFilmicToneMapping, PerspectiveCamera, WebGLRenderer } from "three";
import LockObjects from "./LockObjects.vue";
const props = defineProps<{
  stage: HTMLElement;
  visible: boolean;
  mobile: boolean;
  reduced: boolean;
  paused: boolean;
  pointer: { x: number; y: number };
  rotation: { x: number; y: number };
  unlocked: boolean;
  lens: boolean;
}>();
const emit = defineEmits<{ ready: []; failed: []; state: [value: string] }>();
const camera = markRaw(new PerspectiveCamera(35, 1, 0.1, 70));
camera.position.set(0, 0.45, 7.4);
camera.lookAt(0, 0.45, 0);
function createRenderer({ canvas }: TresRendererSetupContext) {
  const renderer = new WebGLRenderer({
    canvas: unref(canvas),
    antialias: !props.mobile,
    alpha: true,
  });
  const resize = renderer.setSize.bind(renderer);
  // Width and height arrive separately; avoid reallocating a zero-height GPU buffer.
  renderer.setSize = (width, height, updateStyle) => {
    if (width > 0 && height > 0) resize(width, height, updateStyle);
  };
  return renderer;
}
</script>
<template>
  <TresCanvas
    aria-hidden="true"
    :tabindex="-1"
    :camera="camera"
    :renderer="createRenderer"
    :dpr="[1, mobile ? 1.25 : 2]"
    :antialias="!mobile"
    :alpha="true"
    :clear-alpha="0"
    clear-color="#141b23"
    :tone-mapping="ACESFilmicToneMapping"
    :tone-mapping-exposure="1.1"
    render-mode="manual"
    :shadows="false"
    @error="emit('failed')"
    ><LockObjects
      v-bind="props"
      @ready="emit('ready')"
      @failed="emit('failed')"
      @state="emit('state', $event)"
  /></TresCanvas>
</template>
