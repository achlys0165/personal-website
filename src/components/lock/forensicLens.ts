import {
  CircleGeometry,
  DoubleSide,
  Group,
  Material,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  RingGeometry,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";
import { createPadlock } from "./createPadlock";

export function createForensicLens(
  model: ReturnType<typeof createPadlock>,
  light: boolean,
) {
  const uniforms = {
    uLensCenter: { value: new Vector2() },
    uLensRadius: { value: 1 },
    uLensOn: { value: 0 },
  };
  const originals = new Set<Material>();
  model.lock.traverse((object) => {
    if (object instanceof Mesh)
      for (const material of Array.isArray(object.material)
        ? object.material
        : [object.material])
        originals.add(material);
  });
  for (const material of originals) {
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.fragmentShader =
        "uniform vec2 uLensCenter; uniform float uLensRadius; uniform float uLensOn;\n" +
        shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <clipping_planes_fragment>",
        "#include <clipping_planes_fragment>\nif(uLensOn > 0.5 && distance(gl_FragCoord.xy,uLensCenter)<uLensRadius) discard;",
      );
    };
    material.customProgramCacheKey = () =>
      `forensic-cutaway-v1-${material.type}`;
  }
  const circuit = new ShaderMaterial({
    uniforms,
    side: DoubleSide,
    toneMapped: false,
    vertexShader:
      "varying vec3 vLocal; void main(){vLocal=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader: `uniform vec2 uLensCenter;uniform float uLensRadius;uniform float uLensOn;varying vec3 vLocal;
    float trace(float v,float target){return 1.-smoothstep(.014,.035,abs(v-target));}
    void main(){
      if(uLensOn<.5 || distance(gl_FragCoord.xy,uLensCenter)>uLensRadius)discard;
      vec2 p=vLocal.xy*5.5;vec2 tile=fract(p);vec2 cell=floor(p);
      float selector=step(.5,fract(sin(dot(cell,vec2(12.9898,78.233)))*43758.5453));
      float h=trace(tile.y,.35)*step(.12,tile.x)*step(tile.x,.85);
      float v=trace(tile.x,.85)*step(.35,tile.y)*step(tile.y,.9);
      float pad=1.-smoothstep(.045,.075,length(tile-vec2(.85,.35)));
      float cross=trace(tile.x,.2)*step(.12,tile.y)*step(tile.y,.7);
      float tracks=max(max(h,v),max(pad,cross*selector));
      float grid=max(trace(tile.x,0.),trace(tile.y,0.))*.12;
      vec3 color=mix(vec3(.007,.022,.035),vec3(.8,.42,.08),max(tracks,grid));
      gl_FragColor=vec4(color,1.);
      #include <colorspace_fragment>
    }`,
  });
  const inner = createPadlock(light);
  const discarded = new Set<Material>();
  inner.lock.traverse((object) => {
    if (object instanceof Mesh) {
      for (const material of Array.isArray(object.material)
        ? object.material
        : [object.material])
        discarded.add(material);
      object.material = circuit;
    }
  });
  for (const material of discarded) material.dispose();
  inner.lock.scale.setScalar(0.985);
  const lens = new Group();
  lens.name = "Forensic inspection lens";
  const glass = new Mesh(
    new CircleGeometry(0.98, light ? 32 : 64),
    new MeshBasicMaterial({
      color: "#a7c9dd",
      transparent: true,
      opacity: 0.055,
      depthWrite: false,
      depthTest: false,
      side: DoubleSide,
    }),
  );
  glass.renderOrder = 20;
  const casing = new Mesh(
    new RingGeometry(1, 1.065, light ? 32 : 64),
    new MeshBasicMaterial({
      color: "#8199ad",
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      depthTest: false,
      side: DoubleSide,
    }),
  );
  casing.renderOrder = 21;
  const rim = new Mesh(
    new RingGeometry(0.985, 1.005, light ? 32 : 64),
    new MeshBasicMaterial({
      color: "#e9ae45",
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      depthTest: false,
      side: DoubleSide,
    }),
  );
  rim.renderOrder = 22;
  lens.add(glass, casing, rim);
  const projected = new Vector3();
  const direction = new Vector3();
  function update(
    camera: PerspectiveCamera,
    width: number,
    height: number,
    dpr: number,
    pointer: { x: number; y: number },
    active: boolean,
  ) {
    uniforms.uLensOn.value = active ? 1 : 0;
    uniforms.uLensCenter.value.set(
      (pointer.x * 0.5 + 0.5) * width * dpr,
      (-pointer.y * 0.5 + 0.5) * height * dpr,
    );
    const radius = Math.min(width, height) * (light ? 0.18 : 0.17);
    uniforms.uLensRadius.value = radius * dpr;
    projected.set(pointer.x, -pointer.y, 0.5).unproject(camera);
    direction.copy(projected).sub(camera.position).normalize();
    lens.position
      .copy(camera.position)
      .addScaledVector(direction, (1.7 - camera.position.z) / direction.z);
    lens.quaternion.copy(camera.quaternion);
    const worldRadius =
      (radius / height) *
      2 *
      Math.tan((camera.fov * Math.PI) / 360) *
      (camera.position.z - 1.7);
    lens.scale.setScalar(worldRadius);
    lens.visible = active;
    inner.lock.visible = active;
  }
  return {
    inner,
    lens,
    update,
    prepare() {
      lens.visible = true;
      inner.lock.visible = true;
    },
  };
}
