import * as THREE from "three";

/**
 * STUDIO — the invisible photo studio.
 * 1. A procedural HDR environment made of emissive "softboxes" (strip lights)
 *    baked through PMREM: this is what draws the long crisp reflections on the
 *    glass, exactly like a product shoot.
 * 2. A backlight "sweep": a screen-space glow that always sits behind the glass,
 *    so liquids and ice refract light (liquids are lit from behind in ads).
 * 3. A dark lacquered floor that fades to black, with a contact shadow and a
 *    coloured caustic pool (light focused through the drink).
 */

export function createEnvironment(renderer: THREE.WebGLRenderer) {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x000000);
  const box = (w: number, h: number, color: THREE.ColorRepresentation, intensity: number) => {
    const m = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
    m.color.multiplyScalar(intensity);
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  };
  const add = (mesh: THREE.Mesh, x: number, y: number, z: number) => {
    mesh.position.set(x, y, z);
    mesh.lookAt(0, 1.2, 0);
    env.add(mesh);
  };
  // key strips left & right (the signature vertical highlights)
  add(box(0.9, 9, 0xffffff, 4.5), -5.5, 2.5, 1.8);
  add(box(0.6, 9, 0xfff3ee, 3.2), 5.5, 2.5, -0.8);
  // big soft top light
  add(box(6, 4, 0xffffff, 1.6), 0, 7, 0.5);
  // pink rim strip behind — brand accent in every reflection
  add(box(9, 0.5, 0xff3d8b, 4), 0, 2.2, -6);
  add(box(0.4, 6, 0xff5c9d, 3), -3, 2, -5);
  // faint front fill & small kicker for sparkle
  add(box(7, 1.2, 0xffffff, 0.35), 0, 0.4, 6);
  add(box(0.5, 0.5, 0xffffff, 12), 3.2, 4.2, 3.4);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const rt = pmrem.fromScene(env, 0.015);
  pmrem.dispose();
  env.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    }
  });
  return rt.texture;
}

/** Screen-space backlight. Lives on a huge sphere so it is "opaque" and
 * therefore visible to the transmission pass (liquids/ice refract it). */
/** Shared screen-space glow so floor and backdrop meet without a seam. */
const GLOW_GLSL = /* glsl */ `
  uniform vec2 uCenter; uniform vec2 uRes; uniform float uRadius;
  uniform vec3 uColor; uniform float uIntensity; uniform float uTime;
  vec3 studioGlow() {
    vec2 p = gl_FragCoord.xy / uRes.y;
    vec2 c = uCenter * vec2(uRes.x / uRes.y, 1.0);
    vec2 d = p - c;
    d.x *= 1.25;
    float r = length(d) / uRadius;
    float core = exp(-r * r * 1.4);
    float halo = exp(-r * 0.9) * 0.22;
    float breathe = 0.97 + 0.03 * sin(uTime * 0.6);
    vec3 col = uColor * (core + halo) * uIntensity * breathe;
    col += vec3(0.20, 0.015, 0.07) * exp(-r * 0.45) * 0.22 * uIntensity;
    return col;
  }
`;

export type GlowUniforms = ReturnType<typeof createBackdrop>["uniforms"];

export function createBackdrop() {
  const uniforms = {
    uCenter: { value: new THREE.Vector2(0.5, 0.5) },
    uRes: { value: new THREE.Vector2(1, 1) },
    uRadius: { value: 0.35 },
    uColor: { value: new THREE.Color("#ffe2ea") },
    uIntensity: { value: 0.5 },
    uTime: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    vertexShader: /* glsl */ `
      void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: GLOW_GLSL + /* glsl */ `
      void main() { gl_FragColor = vec4(studioGlow(), 1.0); }
    `,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(60, 32, 16), mat);
  mesh.renderOrder = -10;
  mesh.frustumCulled = false;
  return { mesh, uniforms };
}

function radialTexture(stops: [number, string][], size = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => grad.addColorStop(o, col));
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createFloor(glow: GlowUniforms) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x060608, roughness: 0.42, metalness: 0, envMapIntensity: 0.22 });
  mat.defines = { USE_UV: "" };
  mat.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, glow);
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", "#include <common>\n" + GLOW_GLSL)
      .replace(
        "#include <opaque_fragment>",
        `// infinity cove: lacquer near the glass, dissolving into the backlight
         float fd = length(vUv - 0.5) * 2.0;
         float sweep = smoothstep(0.06, 0.42, fd);
         outgoingLight = mix(outgoingLight, studioGlow() * 0.92, sweep);
         #include <opaque_fragment>`
      );
  };
  const floor = new THREE.Mesh(new THREE.CircleGeometry(9, 64), mat);
  floor.rotation.x = -Math.PI / 2;
  group.add(floor);

  // contact shadow
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 3.4),
    new THREE.MeshBasicMaterial({
      map: radialTexture([[0, "rgba(0,0,0,0.95)"], [0.35, "rgba(0,0,0,0.6)"], [1, "rgba(0,0,0,0)"]]),
      transparent: true, depthWrite: false,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.002;
  group.add(shadow);

  // caustic pool — light focused through the drink onto the floor
  const causticMat = new THREE.MeshBasicMaterial({
    map: radialTexture([[0, "rgba(255,255,255,1)"], [0.25, "rgba(255,255,255,0.45)"], [1, "rgba(255,255,255,0)"]]),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color("#ff6aa0"), opacity: 0,
  });
  const caustic = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.6), causticMat);
  caustic.rotation.x = -Math.PI / 2;
  caustic.position.set(0.15, 0.004, 1.15);
  group.add(caustic);

  return { group, causticMat };
}
