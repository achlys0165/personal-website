<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from "vue";
import { useLoop, useTresContext } from "@tresjs/core";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  FogExp2,
  GridHelper,
  Group,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  QuadraticBezierCurve3,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Vector3,
  WebGLRenderer,
} from "three";
import {
  evidenceNodes,
  evidenceConnections,
  relatedEvidence,
} from "./constellationData";

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
const context = useTresContext();
const loop = useLoop();
const group = new Group();
group.name = "Evidence constellation";
const viewDirection = new Vector3();
const target = new Vector3();
const projected = new Vector3();
let frame = 0;
let last = 0;
let elapsed = 0;
let mounted = false;
let draws = 0;
let compiled = false;
let preparing = false;

const panels = evidenceNodes.map((node) => {
  const material = new MeshBasicMaterial({
    color: node.featured ? "#71552c" : "#2c445b",
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const face = new Mesh(new PlaneGeometry(1, 1), material);
  const borderMaterial = new LineBasicMaterial({
    color: node.featured ? "#e9ae45" : "#7794ae",
    transparent: true,
    opacity: 0.65,
  });
  const border = new LineLoop(
    new BufferGeometry().setFromPoints([
      new Vector3(-0.5, -0.5, 0.01),
      new Vector3(0.5, -0.5, 0.01),
      new Vector3(0.5, 0.5, 0.01),
      new Vector3(-0.5, 0.5, 0.01),
    ]),
    borderMaterial,
  );
  const panel = new Group();
  panel.add(face, border);
  group.add(panel);
  const relation = node.relation
    ? new Line(
        new BufferGeometry().setFromPoints([new Vector3(), new Vector3()]),
        new LineDashedMaterial({
          color: "#e9ae45",
          dashSize: 0.06,
          gapSize: 0.04,
          transparent: true,
          opacity: 0.65,
        }),
      )
    : null;
  if (relation) group.add(relation);
  return {
    node,
    panel,
    material,
    borderMaterial,
    relation,
    base: new Vector3(),
    width: 1,
    height: 1,
  };
});
const glowCanvas = document.createElement("canvas");
glowCanvas.width = 64;
glowCanvas.height = 64;
const glowContext = glowCanvas.getContext("2d");
if (glowContext) {
  const gradient = glowContext.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,220,153,.65)");
  gradient.addColorStop(0.2, "rgba(233,174,69,.25)");
  gradient.addColorStop(1, "rgba(233,174,69,0)");
  glowContext.fillStyle = gradient;
  glowContext.fillRect(0, 0, 64, 64);
}
const glowTexture = new CanvasTexture(glowCanvas);
const connections = evidenceConnections.map(([from, to], index) => {
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(33 * 3), 3),
  );
  const material = new LineBasicMaterial({
    color: "#e9ae45",
    transparent: true,
    opacity: 0.6,
  });
  const line = new Line(geometry, material);
  const pulse = new Mesh(
    new SphereGeometry(0.028, 6, 4),
    new MeshBasicMaterial({ color: "#ffd794" }),
  );
  const glow = new Sprite(
    new SpriteMaterial({
      map: glowTexture,
      color: "#e9ae45",
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      opacity: 0.65,
    }),
  );
  glow.scale.set(0.38, 0.38, 1);
  group.add(line, pulse, glow);
  return {
    from,
    to,
    index,
    line,
    material,
    pulse,
    glow,
    curve: new QuadraticBezierCurve3(),
  };
});
let seed = 4096;
function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}
const particleCount = 110;
const particlePositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (random() - 0.5) * 26;
  particlePositions[i * 3 + 1] = (random() - 0.5) * 18;
  particlePositions[i * 3 + 2] = -3 - random() * 20;
}
const particles = new Points(
  new BufferGeometry().setAttribute(
    "position",
    new BufferAttribute(particlePositions, 3),
  ),
  new PointsMaterial({
    color: "#83a4bc",
    size: props.mobile ? 0.024 : 0.032,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
    depthWrite: false,
  }),
);
group.add(particles);
const grid = new GridHelper(44, 30, "#496c86", "#365168");
grid.position.set(0, -5.5, -9);
const gridMaterials = Array.isArray(grid.material)
  ? grid.material
  : [grid.material];
for (const material of gridMaterials) {
  material.transparent = true;
  material.opacity = 0.24;
  material.depthWrite = false;
}
group.add(grid);

function draw(delta: number, renderFrame = true) {
  if (!context.renderer.isInitialized.value) return;
  const camera = context.camera.activeCamera.value as
    | PerspectiveCamera
    | undefined;
  if (!camera) return;
  const width = context.sizes.width.value;
  const height = context.sizes.height.value;
  if (!width || !height) return;
  const moving = !props.reduced && !props.paused;
  if (moving) elapsed += Math.min(delta, 0.06);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  const vertical = 2 * Math.tan((42 * Math.PI) / 360) * 13;
  const horizontal = vertical * camera.aspect;
  const related = relatedEvidence(props.active);
  for (const item of panels) {
    const node = item.node;
    const factor = (13 - node.z) / 13;
    item.base.set(
      (node.x / 100 - 0.5) * horizontal * factor,
      (0.5 - node.y / 100) * vertical * factor,
      node.z,
    );
    item.panel.position.copy(item.base);
    if (moving)
      item.panel.position.y += Math.sin(elapsed * 0.45 + node.x) * 0.018;
    const element = props.elements.get(node.id);
    item.width = ((element?.offsetWidth ?? 150) / width) * horizontal * factor;
    item.height = ((element?.offsetHeight ?? 84) / height) * vertical * factor;
    const scale = props.active === node.id ? 1.025 : 1;
    item.panel.scale.set(item.width * scale, item.height * scale, 1);
    item.material.opacity = props.active && !related.has(node.id) ? 0.12 : 0.5;
    item.borderMaterial.opacity =
      props.active && related.has(node.id)
        ? 1
        : props.active && !related.has(node.id)
          ? 0.18
          : 0.65;
  }
  const focus = panels.find((p) => p.node.id === props.selected);
  const drift = moving ? (props.mobile ? 0.018 : 0.055) : 0;
  target.set(
    (props.mobile ? 0 : props.pointer.x * 0.12) +
      Math.sin(elapsed * 0.18) * drift,
    (props.mobile ? 0 : -props.pointer.y * 0.09) +
      Math.cos(elapsed * 0.14) * drift,
    focus ? 12.86 : 13,
  );
  if (focus) {
    target.x += focus.base.x * 0.06;
    target.y += focus.base.y * 0.04;
  }
  if (moving) camera.position.lerp(target, 1 - Math.exp(-3 * delta));
  else camera.position.copy(target);
  target.set(
    focus ? focus.base.x * 0.055 : 0,
    focus ? focus.base.y * 0.04 : 0,
    0,
  );
  if (moving) viewDirection.lerp(target, 1 - Math.exp(-3 * delta));
  else viewDirection.copy(target);
  camera.lookAt(viewDirection);
  camera.updateMatrixWorld();
  for (const item of panels) {
    item.panel.quaternion.copy(camera.quaternion);
    const angle = moving
      ? Math.sin(elapsed * 0.18 + item.node.y) * 0.022 + item.node.z * 0.028
      : 0;
    item.panel.rotateY(angle);
    const element = props.elements.get(item.node.id);
    if (element) {
      projected.copy(item.panel.position).project(camera);
      element.style.setProperty(
        "--project-x",
        (projected.x * 0.5 + 0.5 - item.node.x / 100) * width + "px",
      );
      element.style.setProperty(
        "--project-y",
        (-projected.y * 0.5 + 0.5 - item.node.y / 100) * height + "px",
      );
      element.style.setProperty(
        "--scene-scale",
        String((13 - item.node.z) / (camera.position.z - item.node.z)),
      );
      element.style.setProperty(
        "--scene-rotate",
        (angle * 180) / Math.PI + "deg",
      );
    }
    if (item.relation) {
      const positions = item.relation.geometry.getAttribute(
        "position",
      ) as BufferAttribute;
      positions.setXYZ(
        0,
        item.panel.position.x - item.width * 0.4,
        item.panel.position.y - item.height * 0.45,
        item.node.z,
      );
      positions.setXYZ(
        1,
        item.panel.position.x - item.width * 0.53,
        item.panel.position.y - item.height * 0.65,
        item.node.z,
      );
      positions.needsUpdate = true;
      item.relation.computeLineDistances();
    }
  }
  for (const connection of connections) {
    const from = panels.find((p) => p.node.id === connection.from)!;
    const to = panels.find((p) => p.node.id === connection.to)!;
    connection.curve.v0.copy(from.panel.position);
    connection.curve.v2.copy(to.panel.position);
    connection.curve.v1
      .copy(from.panel.position)
      .add(to.panel.position)
      .multiplyScalar(0.5);
    connection.curve.v1.z += 0.45;
    const positions = connection.line.geometry.getAttribute(
      "position",
    ) as BufferAttribute;
    for (let i = 0; i < 33; i++) {
      connection.curve.getPoint(i / 32, projected);
      positions.setXYZ(i, projected.x, projected.y, projected.z);
    }
    positions.needsUpdate = true;
    connection.line.geometry.computeBoundingSphere();
    const connected =
      !props.active ||
      connection.from === props.active ||
      connection.to === props.active;
    connection.material.opacity = connected ? 0.78 : 0.12;
    connection.pulse.visible = connected;
    connection.curve.getPoint(
      (elapsed * 0.13 + connection.index * 0.23) % 1,
      connection.pulse.position,
    );
    connection.glow.position.copy(connection.pulse.position);
    connection.glow.visible = !props.mobile && connected;
  }
  particles.geometry.setDrawRange(0, props.mobile ? 26 : 110);
  particles.rotation.y = moving ? Math.sin(elapsed * 0.07) * 0.06 : 0;
  particles.position.y = moving ? Math.sin(elapsed * 0.12) * 0.12 : 0;
  const renderer = context.renderer.instance as WebGLRenderer;
  if (renderFrame) {
    renderer.render(context.scene.value, camera);
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
  if (reset || !props.visible || props.paused || props.reduced) {
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
    emit("state", "preparing");
    // Parallel shader preparation avoids stalling the first interactive frame.
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
  () => [props.visible, props.reduced, props.paused],
  () => schedule(true),
);
watch(
  () => [
    props.active,
    props.selected,
    props.pointer.x,
    props.pointer.y,
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
  context.scene.value.fog = new FogExp2("#141b23", 0.041);
  schedule(true);
});
onBeforeUnmount(() => {
  mounted = false;
  cancelAnimationFrame(frame);
  glowTexture.dispose();
  loop.stop();
  context.scene.value.remove(group);
  context.scene.value.fog = null;
  group.traverse((object) => {
    const disposable = object as Mesh;
    disposable.geometry?.dispose();
    const materials = Array.isArray(disposable.material)
      ? disposable.material
      : [disposable.material];
    for (const material of materials) material?.dispose();
  });
});
</script>
<template></template>
