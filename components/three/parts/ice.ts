import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { GLASS } from "../dims";
import { clamp, easeInCubic, rng } from "../math";

/**
 * ICE — three hand-cut cubes. Each has a slightly irregular rounded geometry,
 * a procedural bump map (internal fractures / frost) and a shader tint that
 * colours whatever part of the cube is under the liquid line.
 * Motion is directed: a scroll-scrubbed fall with a settle, buoyancy as the
 * glass fills, and an orbit when the stirrer spins.
 */
function crackTexture(seed: number) {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, size, size);
  const r = rng(seed);
  for (let i = 0; i < 900; i++) {
    const v = 110 + r() * 40;
    g.fillStyle = `rgba(${v},${v},${v},0.25)`;
    g.beginPath();
    g.arc(r() * size, r() * size, 1 + r() * 7, 0, Math.PI * 2);
    g.fill();
  }
  g.lineWidth = 1.2;
  for (let i = 0; i < 9; i++) {
    g.strokeStyle = `rgba(255,255,255,${0.15 + r() * 0.25})`;
    g.beginPath();
    let x = r() * size, y = r() * size;
    g.moveTo(x, y);
    for (let k = 0; k < 6; k++) {
      x += (r() - 0.5) * 70;
      y += (r() - 0.5) * 70;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

type Cube = {
  mesh: THREE.Mesh;
  rest: THREE.Vector3;
  restRot: THREE.Euler;
  startY: number;
  delay: number;
  orbitR: number;
  orbitA: number;
  buoy: number; // offset below liquid line when floating
};

export function createIce() {
  const group = new THREE.Group();
  const tint = {
    uLevel: { value: -10 },
    uTint: { value: new THREE.Color("#ff9fbd") },
  };

  const r = rng(7);
  const restData: [number, number, number, number, number, number][] = [
    // x, y, z, rx, ry, rz  (y = resting centre on the empty glass floor)
    [-0.2, GLASS.base + 0.3, 0.12, 0.08, 0.4, -0.06],
    [0.24, GLASS.base + 0.32, -0.14, -0.1, -0.3, 0.12],
    [0.0, GLASS.base + 0.86, 0.04, 0.35, 0.9, 0.22],
  ];
  const cubes: Cube[] = [];

  restData.forEach((d, i) => {
    const geo = new RoundedBoxGeometry(0.56, 0.54 + r() * 0.06, 0.55, 5, 0.075);
    // hand-cut irregularity
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let k = 0; k < pos.count; k++) {
      v.fromBufferAttribute(pos, k);
      const n = Math.sin(v.x * 7 + i) * Math.cos(v.y * 6 - i) * Math.sin(v.z * 5 + i * 2);
      v.multiplyScalar(1 + n * 0.035);
      pos.setXYZ(k, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();

    const bump = crackTexture(11 + i);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 1,
      roughness: 0.1,
      ior: 1.31,
      thickness: 0.55,
      attenuationColor: new THREE.Color("#eef6ff"),
      attenuationDistance: 2.5,
      specularIntensity: 1,
      envMapIntensity: 2.6,
      clearcoat: 0.8,
      clearcoatRoughness: 0.05,
      bumpMap: bump,
      bumpScale: 0.6,
      emissive: new THREE.Color("#ffe9f0"),
      emissiveIntensity: 0.05,
    });
    mat.onBeforeCompile = (s) => {
      Object.assign(s.uniforms, tint);
      s.vertexShader = s.vertexShader
        .replace("#include <common>", "#include <common>\nvarying float vWY;")
        .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvWY = (modelMatrix * vec4(transformed,1.0)).y;");
      s.fragmentShader = s.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform float uLevel; uniform vec3 uTint; varying float vWY;")
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
           float sub = 1.0 - smoothstep(uLevel - 0.03, uLevel + 0.01, vWY);
           diffuseColor.rgb *= mix(vec3(1.0), uTint, sub);`
        );
    };
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 2;
    mesh.visible = false;
    group.add(mesh);
    cubes.push({
      mesh,
      rest: new THREE.Vector3(d[0], d[1], d[2]),
      restRot: new THREE.Euler(d[3], d[4], d[5]),
      startY: 4.6 + i * 0.9,
      delay: i * 0.22,
      orbitR: Math.hypot(d[0], d[2]),
      orbitA: Math.atan2(d[2], d[0]),
      buoy: 0.34 + i * 0.05,
    });
  });

  let stirAngle = 0;

  /**
   * @param drop 0..1 scroll progress of the ice beat
   * @param level current liquid height
   * @param stirSpeed angular speed from the stirrer (rad/s)
   */
  function update(drop: number, level: number, stirSpeed: number, t: number, dt: number) {
    tint.uLevel.value = level > GLASS.base + 0.01 ? level : -10;
    stirAngle += stirSpeed * dt * 0.55;
    cubes.forEach((c, i) => {
      const p = clamp((drop - c.delay) / 0.56);
      c.mesh.visible = p > 0;
      if (!c.mesh.visible) return;
      // fall: accelerate (gravity), land, then a tiny settle bounce
      const fall = easeInCubic(Math.min(1, p / 0.82));
      let y = c.startY + (c.rest.y - c.startY) * fall;
      if (p > 0.82) {
        const b = (p - 0.82) / 0.18;
        y = c.rest.y + Math.sin(b * Math.PI) * 0.06 * (1 - b);
      }
      // buoyancy: once submerged, cubes float just under the surface line
      const liquidOn = level > GLASS.base + 0.05;
      if (liquidOn && p >= 1) {
        const floatY = Math.min(level - c.buoy + 0.12 * i, GLASS.height - 0.42);
        y = Math.max(c.rest.y, floatY) + Math.sin(t * 0.8 + i * 2.1) * 0.012;
      }
      const a = c.orbitA + stirAngle * (1 - i * 0.12);
      const radius = c.orbitR + Math.min(0.08, stirSpeed * 0.01);
      c.mesh.position.set(Math.cos(a) * radius, y, Math.sin(a) * radius);
      const spin = (1 - p) * 2.2;
      c.mesh.rotation.set(
        c.restRot.x + spin + Math.sin(t * 0.5 + i) * 0.02 * (liquidOn ? 1 : 0),
        c.restRot.y + spin * 0.7 + stirAngle * 0.8,
        c.restRot.z + spin * 0.4
      );
    });
  }

  return { group, update, tint };
}
