<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from "vue";
import { useLoop, useTresContext } from "@tresjs/core";
import {
  AdditiveBlending,
  AmbientLight,
  CanvasTexture,
  PointLight,
  Sprite,
  SpriteMaterial,
  BufferAttribute,
  BufferGeometry,
  DirectionalLight,
  FogExp2,
  GridHelper,
  Group,
  HemisphereLight,
  Mesh,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  WebGLRenderer,
} from "three";
import { createPadlock } from "./createPadlock";
import { createForensicLens } from "./forensicLens";
import { unlockProgress } from "../../lockState";
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
const context = useTresContext();
const loop = useLoop();
// Tres schedules an initial draw even in manual mode; wait for our async shader warmup.
const restoreRender = loop.render((notify) => {
  notify();
  loop.stop();
});
const group = new Group();
const model = createPadlock(props.mobile);
const forensic = createForensicLens(model, props.mobile);
group.add(model.lock, forensic.inner.lock, forensic.lens);
model.lock.rotation.set(0.08, -0.32, 0);
group.add(new AmbientLight("#9bb6cc", 1));
group.add(new HemisphereLight("#d0e1ed", "#19212b", 1));
const key = new DirectionalLight("#fff2da", 6);
key.position.set(4, 6, 5);
group.add(key);
const rim = new DirectionalLight("#9abbd8", 5);
rim.position.set(-4, 3, 2);
group.add(rim);
const grid = new GridHelper(30, 26, "#47627b", "#2a3f52");
grid.position.set(0, -2, -5);
for (const m of Array.isArray(grid.material)
  ? grid.material
  : [grid.material]) {
  m.transparent = true;
  m.opacity = 0.23;
}
group.add(grid);
const orbitPositions = new Float32Array(12 * 3);
const orbit = new Points(
  new BufferGeometry().setAttribute(
    "position",
    new BufferAttribute(orbitPositions, 3),
  ),
  new PointsMaterial({
    color: "#e9ae45",
    size: 0.038,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    toneMapped: false,
  }),
);
group.add(orbit);
const glowCanvas = document.createElement("canvas");
glowCanvas.width = 64;
glowCanvas.height = 64;
const glowContext = glowCanvas.getContext("2d");
if (glowContext) {
  const gradient = glowContext.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(233,174,69,.45)");
  gradient.addColorStop(0.3, "rgba(233,174,69,.14)");
  gradient.addColorStop(1, "rgba(233,174,69,0)");
  glowContext.fillStyle = gradient;
  glowContext.fillRect(0, 0, 64, 64);
}
const glowTexture = new CanvasTexture(glowCanvas);
const glowMaterial = new SpriteMaterial({
  map: glowTexture,
  color: "#e9ae45",
  blending: AdditiveBlending,
  transparent: true,
  depthWrite: false,
  opacity: 0.4,
});
const stripGlow = new Sprite(glowMaterial);
stripGlow.position.set(0, -1.17, 0.6);
stripGlow.scale.set(2.6, 0.3, 1);
model.lock.add(stripGlow);
const warm = new PointLight("#e9ae45", 0.3, 5, 2);
warm.position.set(0, 0, 2);
group.add(warm);
const dustPositions = new Float32Array(100 * 3);
let seed = 313;
const random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
for (let i = 0; i < 100; i++) {
  dustPositions[i * 3] = (random() - 0.5) * 17;
  dustPositions[i * 3 + 1] = (random() - 0.5) * 11;
  dustPositions[i * 3 + 2] = -2 - random() * 17;
}
const dust = new Points(
  new BufferGeometry().setAttribute(
    "position",
    new BufferAttribute(dustPositions, 3),
  ),
  new PointsMaterial({
    color: "#8bacc5",
    size: 0.025,
    opacity: 0.6,
    transparent: true,
    depthWrite: false,
  }),
);
group.add(dust);
let frame = 0,
  last = 0,
  elapsed = 0,
  mounted = false,
  compiled = false,
  preparing = false,
  draws = 0,
  opening = 0;
function draw(delta: number, render = true) {
  const camera = context.camera.activeCamera.value as
    | PerspectiveCamera
    | undefined;
  if (!camera || !context.renderer.isInitialized.value) return;
  const moving = !props.paused && !props.reduced;
  if (moving) elapsed += Math.min(delta, 0.06);
  const blend = moving ? 1 - Math.exp(-4 * Math.min(delta, 0.06)) : 1;
  const yaw =
    -0.32 +
    elapsed * 0.035 +
    props.rotation.y +
    (!props.mobile ? props.pointer.x * 0.12 : 0);
  const pitch =
    0.08 + props.rotation.x + (!props.mobile ? -props.pointer.y * 0.07 : 0);
  model.lock.rotation.y += (yaw - model.lock.rotation.y) * blend;
  model.lock.rotation.x += (pitch - model.lock.rotation.x) * blend;
  opening = unlockProgress(opening, props.unlocked, delta, !moving);
  model.shackle.position.y = 0.8 + opening * 0.58;
  model.shackle.rotation.y = -opening * 0.85;
  forensic.inner.lock.rotation.copy(model.lock.rotation);
  forensic.inner.shackle.position.copy(model.shackle.position);
  forensic.inner.shackle.rotation.copy(model.shackle.rotation);
  camera.position.set(0, 0.45 + opening * 0.15, 7.4 + opening * 0.8);
  camera.lookAt(0, 0.45 + opening * 0.15, 0);
  camera.updateMatrixWorld();
  forensic.update(
    camera,
    context.sizes.width.value,
    context.sizes.height.value,
    (context.renderer.instance as WebGLRenderer).getPixelRatio(),
    props.pointer,
    props.lens,
  );
  props.stage.dataset.unlock = opening.toFixed(3);
  props.stage.dataset.yaw = model.lock.rotation.y.toFixed(4);
  props.stage.dataset.lens = props.lens ? "active" : "inactive";
  warm.intensity = props.lens || props.unlocked ? 1.4 : 0.3;
  stripGlow.visible = !props.mobile;
  glowMaterial.opacity = props.lens || props.unlocked ? 0.75 : 0.3;
  const orbitCount = props.mobile ? 6 : 12;
  orbit.geometry.setDrawRange(0, orbitCount);
  const positions = orbit.geometry.getAttribute("position") as BufferAttribute;
  for (let i = 0; i < orbitCount; i++) {
    const angle = elapsed * 0.16 + (i * Math.PI * 2) / orbitCount;
    positions.setXYZ(
      i,
      Math.cos(angle) * 1.85,
      0.25 + Math.sin(angle * 2) * 0.6,
      Math.sin(angle) * 1.35,
    );
  }
  positions.needsUpdate = true;
  orbit.geometry.computeBoundingSphere();
  dust.geometry.setDrawRange(0, props.mobile ? 24 : 100);
  dust.rotation.y = Math.sin(elapsed * 0.06) * 0.05;
  dust.position.y = Math.sin(elapsed * 0.1) * 0.1;
  if (render) {
    (context.renderer.instance as WebGLRenderer).render(
      context.scene.value,
      camera,
    );
    props.stage.dataset.frames = String(++draws);
    if (draws === 1) emit("ready");
  }
}
function tick(now: number) {
  frame = 0;
  if (!props.visible) return;
  const interval = props.mobile ? 50 : 1000 / 30;
  if (!last || now - last >= interval - 1) {
    draw(last ? (now - last) / 1000 : 1 / 30);
    last = now;
  }
  if (!props.reduced && !props.paused) frame = requestAnimationFrame(tick);
}
function schedule(reset = false) {
  if (!mounted) return;
  loop.stop();
  if (reset || !props.visible || props.reduced || props.paused) {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
  }
  if (!props.visible) {
    emit("state", "paused");
    return;
  }
  if (!compiled) {
    if (
      preparing ||
      !context.renderer.isInitialized.value ||
      !context.camera.activeCamera.value
    )
      return;
    preparing = true;
    draw(0, false);
    forensic.prepare();
    emit("state", "preparing");
    (context.renderer.instance as WebGLRenderer)
      .compileAsync(context.scene.value, context.camera.activeCamera.value)
      .then(() => {
        if (!mounted) return;
        compiled = true;
        preparing = false;
        schedule(true);
      })
      .catch(() => {
        if (mounted) emit("failed");
      });
    return;
  }
  if (props.paused || props.reduced) {
    draw(0);
    emit("state", "static");
    return;
  }
  if (!frame) frame = requestAnimationFrame(tick);
  emit("state", "running");
}
watch(
  () => [props.visible, props.paused, props.reduced],
  () => schedule(true),
);
watch(
  () => [
    props.pointer.x,
    props.pointer.y,
    props.rotation.x,
    props.rotation.y,
    props.unlocked,
    props.lens,
    context.sizes.width.value,
    context.sizes.height.value,
    context.renderer.isInitialized.value,
    context.camera.activeCamera.value,
  ],
  () => schedule(),
);
onMounted(() => {
  mounted = true;
  context.scene.value.add(group);
  context.scene.value.fog = new FogExp2("#141b23", 0.038);
  schedule(true);
});
onBeforeUnmount(() => {
  mounted = false;
  cancelAnimationFrame(frame);
  restoreRender();
  glowTexture.dispose();
  loop.stop();
  context.scene.value.remove(group);
  context.scene.value.fog = null;
  group.traverse((object) => {
    const item = object as Mesh;
    item.geometry?.dispose();
    for (const material of Array.isArray(item.material)
      ? item.material
      : [item.material])
      material?.dispose();
  });
});
</script>
<template></template>
