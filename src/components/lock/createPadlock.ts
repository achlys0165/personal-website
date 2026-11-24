import {
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  TorusGeometry,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export function createPadlock(light = false) {
  const lock = new Group();
  lock.name = "Procedural forensic padlock";
  const metal = light ? new MeshPhongMaterial({
    color: "#314353",
    specular: "#9bb6cc",
    shininess: 75,
  }) : new MeshStandardMaterial({
    color: "#314353",
    metalness: 0.7,
    roughness: 0.26,
  });
  const steel = light ? new MeshPhongMaterial({
    color: "#91a0af",
    specular: "#d0e1ed",
    shininess: 100,
  }) : new MeshStandardMaterial({
    color: "#91a0af",
    metalness: 0.85,
    roughness: 0.2,
  });
  const faceMetal = light ? new MeshPhongMaterial({
    color: "#1a2736",
    specular: "#71879b",
    shininess: 60,
  }) : new MeshStandardMaterial({
    color: "#1a2736",
    metalness: 0.55,
    roughness: 0.3,
  });
  const amber = new MeshBasicMaterial({ color: "#e9ae45" });
  const dark = new MeshBasicMaterial({ color: "#080e16" });
  const body = new Mesh(
    new RoundedBoxGeometry(2.65, 2.25, 1, light ? 2 : 4, 0.2),
    metal,
  );
  body.position.y = -0.25;
  body.name = "Bevelled dark metal body";
  lock.add(body);
  const frame = new Mesh(
    new RoundedBoxGeometry(2.28, 1.88, 0.045, 2, 0.12),
    amber,
  );
  frame.position.set(0, -0.25, 0.514);
  lock.add(frame);
  const face = new Mesh(
    new RoundedBoxGeometry(2.23, 1.83, 0.055, 2, 0.11),
    faceMetal,
  );
  face.position.set(0, -0.25, 0.545);
  lock.add(face);
  const keyhole = new Group();
  const hole = new Mesh(new CylinderGeometry(0.17, 0.17, 0.02, 24), dark);
  hole.rotation.x = Math.PI / 2;
  hole.position.y = 0.1;
  keyhole.add(hole);
  const stem = new Mesh(
    new RoundedBoxGeometry(0.15, 0.38, 0.02, 1, 0.025),
    dark,
  );
  stem.position.y = -0.1;
  keyhole.add(stem);
  keyhole.position.set(0, -0.25, 0.58);
  lock.add(keyhole);
  for (const x of [-1, 1]) {
    const screw = new Mesh(new CylinderGeometry(0.045, 0.045, 0.02, 12), steel);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(x, -0.98, 0.58);
    lock.add(screw);
  }
  const baseAccent = new Mesh(
    new RoundedBoxGeometry(1.4, 0.035, 0.035, 1, 0.01),
    amber,
  );
  baseAccent.position.set(0, -1.17, 0.57);
  lock.add(baseAccent);
  const shackle = new Group();
  shackle.name = "Opening shackle";
  shackle.position.set(0.85, 0.8, 0);
  const shackleParts = new Group();
  shackleParts.position.set(-0.85, -0.8, 0);
  shackle.add(shackleParts);
  const arch = new Mesh(
    new TorusGeometry(0.85, 0.15, light ? 10 : 16, light ? 28 : 48, Math.PI),
    steel,
  );
  arch.position.y = 1.5;
  shackleParts.add(arch);
  const seam = new Mesh(new TorusGeometry(0.85, 0.024, 6, 32, Math.PI), amber);
  seam.position.set(0, 1.5, 0.146);
  shackleParts.add(seam);
  const left = new Mesh(
    new CylinderGeometry(0.15, 0.15, 1, light ? 12 : 20),
    steel,
  );
  left.position.set(-0.85, 1, 0);
  shackleParts.add(left);
  const right = new Mesh(
    new CylinderGeometry(0.15, 0.15, 1.8, light ? 12 : 20),
    steel,
  );
  right.position.set(0.85, 0.6, 0);
  shackleParts.add(right);
  lock.add(shackle);
  return { lock, body, face, shackle, metal, steel, faceMetal, amber };
}
