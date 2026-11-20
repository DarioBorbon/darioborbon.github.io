import * as THREE from "three";
import { COLORS, GLASS, outerRadius } from "../dims";
import { clamp, easeOutBack, easeOutCubic, lerp, rng, smoothstep } from "../math";

/* ------------------------------------------------------------------ */
/* GARNISH — a pink grapefruit wheel notched onto the rim               */
/* ------------------------------------------------------------------ */
function citrusTexture() {
  const s = 512;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  const cx = s / 2;
  g.fillStyle = "#ff8a4d"; // rind
  g.beginPath(); g.arc(cx, cx, cx, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#fff1e4"; // pith
  g.beginPath(); g.arc(cx, cx, cx * 0.9, 0, Math.PI * 2); g.fill();
  const segs = 11;
  const r = rng(5);
  for (let i = 0; i < segs; i++) {
    const a0 = (i / segs) * Math.PI * 2 + 0.03;
    const a1 = ((i + 1) / segs) * Math.PI * 2 - 0.03;
    const grad = g.createRadialGradient(cx, cx, cx * 0.08, cx, cx, cx * 0.84);
    grad.addColorStop(0, "#ffc2b8");
    grad.addColorStop(0.5, COLORS.flesh);
    grad.addColorStop(1, "#e8324f");
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(cx + Math.cos((a0 + a1) / 2) * cx * 0.07, cx + Math.sin((a0 + a1) / 2) * cx * 0.07);
    g.arc(cx, cx, cx * 0.84, a0, a1);
    g.closePath();
    g.fill();
    // juice vesicles
    for (let k = 0; k < 40; k++) {
      const a = lerp(a0, a1, r());
      const rr = lerp(0.15, 0.8, r()) * cx;
      g.fillStyle = `rgba(255,${200 + r() * 55},${200 + r() * 40},${0.12 + r() * 0.2})`;
      g.beginPath();
      g.ellipse(cx + Math.cos(a) * rr, cx + Math.sin(a) * rr, 2 + r() * 5, 1 + r() * 2, a, 0, Math.PI * 2);
      g.fill();
    }
  }
  g.fillStyle = "#fff4ea";
  g.beginPath(); g.arc(cx, cx, cx * 0.06, 0, Math.PI * 2); g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function createGarnish() {
  const map = citrusTexture();
  const rind = new THREE.MeshPhysicalMaterial({ color: COLORS.rind, roughness: 0.55, sheen: 0.6, sheenColor: new THREE.Color("#ffd2b0"), envMapIntensity: 0.9 });
  const flesh = new THREE.MeshPhysicalMaterial({
    map, roughness: 0.32, clearcoat: 0.9, clearcoatRoughness: 0.15, envMapIntensity: 1.2,
    emissive: new THREE.Color("#ff6d7f"), emissiveMap: map, emissiveIntensity: 0.32, // backlit translucency
  });
  const geo = new THREE.CylinderGeometry(0.42, 0.42, 0.07, 72, 1);
  const wheel = new THREE.Mesh(geo, [rind, flesh, flesh]);
  wheel.rotation.x = Math.PI / 2; // stand the wheel up (faces ±Z)
  const holder = new THREE.Group();
  holder.add(wheel);

  // rest pose: radial plane, notched over the rim at angle A
  const A = 0.6; // radians around the glass (front-right, towards camera)
  const rimR = outerRadius(GLASS.height) - 0.02;
  const rest = new THREE.Vector3(Math.cos(A) * (rimR + 0.06), GLASS.height - 0.06, Math.sin(A) * (rimR + 0.06));
  const group = new THREE.Group();
  group.add(holder);
  group.visible = false;

  function update(p: number, t: number) {
    group.visible = p > 0.001;
    if (!group.visible) return;
    const e = easeOutCubic(clamp(p / 0.85));
    const settle = clamp((p - 0.7) / 0.3);
    holder.position.set(rest.x, lerp(rest.y + 2.4, rest.y, e) + Math.sin(settle * Math.PI) * 0.02, rest.z);
    // wheel plane contains the radial direction → rotate so its normal is tangent
    holder.rotation.set(0, -A + (1 - e) * 0.9, (1 - e) * 0.5 + Math.sin(t * 0.4) * 0.004);
    holder.scale.setScalar(lerp(0.92, 1, e));
  }
  return { group, update };
}

/* ------------------------------------------------------------------ */
/* SUGAR RIM — crystals wrapping the lip, revealed around the circle    */
/* ------------------------------------------------------------------ */
export function createRim(count = 1600) {
  const geo = new THREE.OctahedronGeometry(0.011, 0);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.12, metalness: 0, envMapIntensity: 2.6,
    iridescence: 0.4, iridescenceIOR: 1.6, clearcoat: 1, specularIntensity: 1,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const r = rng(9);
  const data: { a: number; y: number; rad: number; s: number; rot: THREE.Euler }[] = [];
  const pink = new THREE.Color("#ff9ec0"), white = new THREE.Color("#fff6f8");
  const col = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const onTop = r() < 0.18;
    const y = onTop ? GLASS.height - 0.005 : GLASS.height - Math.pow(r(), 1.6) * 0.15;
    const a = r() * Math.PI * 2;
    const rad = onTop ? outerRadius(GLASS.height) - r() * GLASS.wall : outerRadius(y) + 0.004;
    data.push({ a, y, rad, s: 0.6 + r() * 1.1, rot: new THREE.Euler(r() * 6, r() * 6, r() * 6) });
    col.copy(white).lerp(pink, r() * 0.8);
    mesh.setColorAt(i, col);
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), sc = new THREE.Vector3();
  let last = -1;
  function update(p: number) {
    mesh.visible = p > 0.001;
    if (!mesh.visible || Math.abs(p - last) < 0.001) return;
    last = p;
    for (let i = 0; i < count; i++) {
      const d = data[i];
      // reveal sweeps around the rim like a hand turning the glass in sugar
      const local = clamp(p * 1.35 - (d.a / (Math.PI * 2)) * 0.35);
      const s = easeOutBack(smoothstep(0, 1, local), 1.6) * d.s;
      pos.set(Math.cos(d.a) * d.rad, d.y, Math.sin(d.a) * d.rad);
      q.setFromEuler(d.rot);
      sc.setScalar(Math.max(0.0001, s));
      m4.compose(pos, q, sc);
      mesh.setMatrixAt(i, m4);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }
  mesh.renderOrder = 4;
  return { mesh, update };
}

/* ------------------------------------------------------------------ */
/* CONDENSATION — refractive droplets on the cold part of the glass     */
/* ------------------------------------------------------------------ */
export function createCondensation(count = 340) {
  const geo = new THREE.SphereGeometry(1, 14, 10);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, transmission: 1, roughness: 0.0, ior: 1.33, thickness: 0.05,
    envMapIntensity: 2.2, specularIntensity: 1, clearcoat: 1,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.renderOrder = 3;
  const r = rng(13);
  const drops = Array.from({ length: count }, (_, i) => ({
    a: r() * Math.PI * 2,
    y: 0.12 + r() * (GLASS.height - 0.5),
    size: 0.006 + Math.pow(r(), 3) * 0.018,
    delay: r(),
    run: i < 14 ? 0.05 + r() * 0.08 : 0, // a few droplets trickle down
  }));
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), sc = new THREE.Vector3();
  const up = new THREE.Vector3(0, 0, 1), n = new THREE.Vector3();
  function update(p: number, level: number, t: number, dt: number) {
    mesh.visible = p > 0.001;
    if (!mesh.visible) return;
    for (let i = 0; i < count; i++) {
      const d = drops[i];
      if (d.run > 0 && p > 0.6) {
        d.y -= d.run * dt;
        if (d.y < 0.1) d.y = level - 0.1;
      }
      const cold = d.y < level + 0.05 ? 1 : 0.15; // dew forms where the drink is
      const s = smoothstep(d.delay * 0.7, d.delay * 0.7 + 0.3, p) * d.size * cold;
      const rad = outerRadius(d.y) + s * 0.25;
      pos.set(Math.cos(d.a) * rad, d.y, Math.sin(d.a) * rad);
      n.set(Math.cos(d.a), 0, Math.sin(d.a));
      q.setFromUnitVectors(up, n);
      sc.set(s, s * (d.run > 0 ? 1.5 : 1.12), s * 0.4);
      m4.compose(pos, q, sc);
      mesh.setMatrixAt(i, m4);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }
  return { mesh, update };
}

/* ------------------------------------------------------------------ */
/* STIRRER — chrome bar spoon with a twisted shaft                      */
/* ------------------------------------------------------------------ */
function twistBump() {
  const c = document.createElement("canvas");
  c.width = 64; c.height = 512;
  const g = c.getContext("2d")!;
  for (let y = 0; y < 512; y++) {
    const v = 128 + Math.sin(y * 0.55) * 110;
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(0, y, 64, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 6);
  t.rotation = 0.35; // diagonal stripes read as a twist
  return t;
}

export function createStirrer() {
  const chrome = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 1, roughness: 0.16, envMapIntensity: 3.6, clearcoat: 0.6,
  });
  const twisted = chrome.clone();
  twisted.bumpMap = twistBump();
  twisted.bumpScale = 1.4;

  const L = 3.3;
  const spoon = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, L, 20, 1), twisted);
  shaft.position.y = L / 2;
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 16), chrome);
  bowl.scale.set(0.75, 1.25, 0.3);
  bowl.position.y = 0.04;
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.06, 24, 16), chrome);
  cap.scale.set(1, 1.6, 1);
  cap.position.y = L + 0.06;
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.012, 32), chrome);
  disc.position.y = L - 0.25;
  spoon.add(shaft, bowl, cap, disc);

  const group = new THREE.Group();
  group.add(spoon);
  group.visible = false;
  let angle = 0;
  const bottomY = GLASS.base + 0.12;

  /**
   * @param a   0..1 progress through the Arsenal beat
   * @returns   current stirring intensity 0..1
   */
  function update(a: number, final: number, t: number, dt: number, motionScale: number) {
    group.visible = a > 0.001;
    if (!group.visible) return 0;
    const appear = smoothstep(0.0, 0.2, a);
    const descend = smoothstep(0.18, 0.36, a);
    const stir = smoothstep(0.34, 0.44, a) * (1 - smoothstep(0.8, 0.9, a));
    const rest = smoothstep(0.86, 1.0, a);

    const hoverY = GLASS.height + 0.9;
    const startY = 7.5;
    let y = lerp(startY, hoverY, easeOutCubic(appear));
    y = lerp(y, bottomY, easeOutCubic(descend));

    angle += stir * dt * 4.2 * motionScale;
    const orbitR = 0.3 * stir;
    // resting lean against the rim once stirring stops
    // bottom slides toward the far side, shaft tilts until it touches the lip
    const leanA = -2.5;
    const lean = 0.39 * rest;
    const restX = -Math.cos(leanA) * 0.2 * rest, restZ = -Math.sin(leanA) * 0.2 * rest;
    const sway = Math.sin(t * 0.7) * 0.004 * final;
    spoon.position.set(Math.cos(angle) * orbitR + restX, y, Math.sin(angle) * orbitR + restZ);
    spoon.rotation.set(lean * Math.sin(leanA) + sway, angle * 1.4 * stir, -lean * Math.cos(leanA) + (1 - appear) * 0.3);
    return stir;
  }
  return { group, update };
}
