import * as THREE from "three";
import { GLASS, innerRadius } from "../dims";
import { rng } from "../math";

/**
 * BUBBLES — GPU points rendered as tiny refractive rings.
 * 70% rise through the liquid (speed varies with size), 30% cling to the
 * inner wall like real tonic. All motion is computed in the vertex shader.
 */
export function createBubbles(count = 520) {
  const r = rng(3);
  const seeds = new Float32Array(count * 4);
  const kind = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    seeds[i * 4 + 0] = r() * Math.PI * 2; // angle
    seeds[i * 4 + 1] = Math.sqrt(r());    // radial position 0..1
    seeds[i * 4 + 2] = r();               // phase
    seeds[i * 4 + 3] = r();               // size / speed
    kind[i] = r() < 0.3 ? 1 : 0;          // 1 = clings to wall
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  geo.setAttribute("aKind", new THREE.BufferAttribute(kind, 1));

  const uniforms = {
    uTime: { value: 0 },
    uFizz: { value: 0 },
    uLevel: { value: GLASS.base },
    uFloor: { value: GLASS.base },
    uRb: { value: innerRadius(GLASS.base) },
    uRt: { value: innerRadius(GLASS.height) },
    uYb: { value: GLASS.base },
    uYt: { value: GLASS.height },
    uSwirlPhase: { value: 0 },
    uPx: { value: 1 },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute vec4 aSeed; attribute float aKind;
      uniform float uTime, uFizz, uLevel, uFloor, uRb, uRt, uYb, uYt, uSwirlPhase, uPx;
      varying float vA;
      float radiusAt(float y){ return mix(uRb, uRt, clamp((y-uYb)/(uYt-uYb),0.0,1.0)); }
      void main(){
        float depth = max(uLevel - uFloor, 0.0);
        float size = aSeed.w;
        float y; float rad; float ang = aSeed.x;
        if (aKind > 0.5) {
          y = uFloor + aSeed.z * depth * 0.96;
          rad = radiusAt(y) - 0.012;
          ang += uSwirlPhase * 0.25;
        } else {
          float speed = 0.18 + size * 0.38;
          float cyc = fract(aSeed.z + uTime * speed / max(depth, 0.2));
          y = uFloor + cyc * depth;
          rad = (radiusAt(y) - 0.05) * aSeed.y;
          ang += uSwirlPhase + sin(uTime * 2.0 + aSeed.z * 30.0) * 0.08;
        }
        vec3 p = vec3(cos(ang) * rad, y, sin(ang) * rad);
        p.x += sin(uTime * 3.0 + aSeed.z * 40.0) * 0.006 * (1.0 - aKind);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float s = mix(0.010, 0.026, size * size) * (aKind > 0.5 ? 0.6 : 1.0);
        gl_PointSize = s * uPx / -mv.z;
        float edge = smoothstep(0.0, 0.04, uLevel - y) * smoothstep(0.0, 0.02, y - uFloor);
        float on = step(aSeed.z, uFizz * (aKind > 0.5 ? 1.0 : 1.15));
        vA = edge * on * step(0.02, depth);
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vA;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c) * 2.0;
        if (d > 1.0) discard;
        float ring = smoothstep(1.0, 0.8, d) * smoothstep(0.35, 0.8, d);
        float spec = smoothstep(0.32, 0.0, length(c - vec2(-0.16, -0.16)));
        float a = (ring * 0.55 + spec * 0.9) * vA;
        gl_FragColor = vec4(vec3(1.0, 0.95, 0.97) * a, a);
      }
    `,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 15;
  return { points, uniforms };
}

/** DUST & BOKEH — slow motes in the light beam, for the atmosphere beat. */
export function createDust(count = 260) {
  const r = rng(21);
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (r() - 0.5) * 9;
    pos[i * 3 + 1] = r() * 5;
    pos[i * 3 + 2] = (r() - 0.5) * 7;
    seed[i] = r();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  const uniforms = { uTime: { value: 0 }, uAmount: { value: 0 }, uPx: { value: 1 }, uColor: { value: new THREE.Color("#ffc4d6") } };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aSeed; uniform float uTime, uAmount, uPx; varying float vA;
      void main(){
        vec3 p = position;
        p.y = mod(p.y + uTime * (0.03 + aSeed * 0.05), 5.0);
        p.x += sin(uTime * 0.2 + aSeed * 20.0) * 0.3;
        p.z += cos(uTime * 0.15 + aSeed * 13.0) * 0.3;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float near = smoothstep(0.5, 3.0, -mv.z);
        gl_PointSize = (0.02 + aSeed * 0.05) * uPx / -mv.z * (1.0 + (1.0 - near) * 4.0);
        vA = uAmount * (0.25 + 0.75 * fract(aSeed * 7.3)) * mix(0.25, 1.0, near);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying float vA;
      void main(){
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float a = smoothstep(1.0, 0.0, d) * vA * 0.5;
        gl_FragColor = vec4(uColor * a, a);
      }
    `,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 30;
  return { points, uniforms };
}
