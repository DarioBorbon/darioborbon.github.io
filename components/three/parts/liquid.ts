import * as THREE from "three";
import { GLASS, LIQUID, innerRadius } from "../dims";

/**
 * LIQUID — one unit-cylinder template that the vertex shader stretches to the
 * current fill level and the glass's tapered inner wall. The top cap is a set
 * of concentric rings, so it can bend into a vortex (stirring) or ripple
 * around the pour point, with analytic normals for moving reflections.
 * No fluid simulation: directed animation + shading, like a commercial.
 */
const SURFACE_GLSL = /* glsl */ `
uniform float uLevel, uFloor, uRb, uRt, uYb, uYt;
uniform float uTime, uSwirl, uSwirlPhase, uAgit;
uniform vec2 uPour;
float liqH(vec2 p) {            // p in unit-disc coords
  float r = length(p);
  float th = atan(p.y, p.x);
  float h = 0.0;
  // vortex: dips in the centre, climbs at the wall
  h += -uSwirl * 0.2 * pow(1.0 - r, 2.0) + uSwirl * 0.05 * pow(r, 4.0);
  // spiral arms catch the light while stirring
  h += uSwirl * 0.012 * sin(th * 3.0 - r * 9.0 + uSwirlPhase * 2.0) * r;
  // pour ripples
  float d = length(p - uPour);
  h += uAgit * 0.03 * sin(d * 26.0 - uTime * 14.0) * exp(-d * 3.2);
  h += uAgit * 0.012 * sin(th * 5.0 + uTime * 3.0) * r;
  // idle micro-motion
  h += 0.0025 * sin(p.x * 7.0 + uTime * 0.9) * sin(p.y * 6.0 - uTime * 0.7);
  return h;
}
float radiusAt(float y) { return mix(uRb, uRt, clamp((y - uYb) / (uYt - uYb), 0.0, 1.0)) - 0.012; }
`;

function template() {
  // profile: bottom centre → bottom edge → top edge → rings to top centre
  const pts: THREE.Vector2[] = [new THREE.Vector2(0.0001, 0), new THREE.Vector2(1, 0)];
  for (let i = 0; i <= 8; i++) pts.push(new THREE.Vector2(1, i / 8));
  for (let i = 1; i <= 14; i++) pts.push(new THREE.Vector2(1 - i / 14 + 0.0001, 1.0001));
  return new THREE.LatheGeometry(pts, 96);
}

export function createLiquid() {
  const uniforms = {
    uLevel: { value: LIQUID.floor },
    uFloor: { value: LIQUID.floor },
    uRb: { value: innerRadius(GLASS.base) },
    uRt: { value: innerRadius(GLASS.height) },
    uYb: { value: GLASS.base },
    uYt: { value: GLASS.height },
    uTime: { value: 0 },
    uSwirl: { value: 0 },
    uSwirlPhase: { value: 0 },
    uAgit: { value: 0 },
    uPour: { value: new THREE.Vector2(0.18, 0.1) },
  };

  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 1,
    roughness: 0.04,
    ior: 1.34,
    thickness: 1.4,
    attenuationColor: new THREE.Color("#9d0f43"),
    attenuationDistance: 0.35,
    specularIntensity: 1,
    envMapIntensity: 1.6,
    clearcoat: 0.4,
    depthWrite: false,
  });
  mat.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, uniforms);
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\n" + SURFACE_GLSL)
      .replace(
        "#include <beginnormal_vertex>",
        `vec3 objectNormal = vec3(normal);
         float yy = mix(uFloor, uLevel, clamp(position.y, 0.0, 1.0));
         float rr = radiusAt(yy);
         vec3 liqPos = vec3(position.x * rr, yy, position.z * rr);
         if (position.y > 1.00005) {
           vec2 p = position.xz;
           liqPos.y = uLevel + liqH(p);
           float e = 0.02;
           float hx = (liqH(p + vec2(e, 0.0)) - liqH(p - vec2(e, 0.0))) / (2.0 * e * rr);
           float hz = (liqH(p + vec2(0.0, e)) - liqH(p - vec2(0.0, e))) / (2.0 * e * rr);
           objectNormal = normalize(vec3(-hx, 1.0, -hz));
         } else if (position.y > 0.999) {
           // wall's top ring follows the meniscus at the wall
           liqPos.y = uLevel + liqH(normalize(position.xz + 1e-5));
         }
         #ifdef USE_TANGENT
           vec3 objectTangent = vec3(tangent.xyz);
         #endif`
      )
      .replace("#include <begin_vertex>", "vec3 transformed = liqPos;");
  };

  const mesh = new THREE.Mesh(template(), mat);
  mesh.renderOrder = 1;
  mesh.frustumCulled = false;
  return { mesh, mat, uniforms };
}

/**
 * POUR STREAM — a thin open tube from above the frame into the glass.
 * Its head travels down when a pour starts and its tail falls in when it ends,
 * which sells the physics more than any simulation would.
 */
export function createPourStream() {
  const uniforms = { uTime: { value: 0 }, uWidth: { value: 1 } };
  const geo = new THREE.CylinderGeometry(1, 1, 1, 20, 40, true);
  geo.translate(0, -0.5, 0); // top at y=0, bottom at y=-1
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 1,
    roughness: 0.02,
    ior: 1.34,
    thickness: 0.25,
    attenuationColor: new THREE.Color("#9d0f43"),
    attenuationDistance: 0.18,
    envMapIntensity: 2,
    specularIntensity: 1,
    depthWrite: false,
  });
  mat.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, uniforms);
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTime; uniform float uWidth;")
      .replace(
        "#include <begin_vertex>",
        `vec3 transformed = vec3(position);
         float yN = -position.y;                         // 0 top → 1 bottom
         float w = mix(0.034, 0.022, yN) * uWidth;       // thins as it accelerates
         w *= 1.0 + 0.18 * sin(position.y * 60.0 + uTime * 30.0);
         transformed.xz *= w;
         transformed.x += sin(position.y * 9.0 + uTime * 11.0) * 0.006 * yN;`
      );
  };
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 1;
  mesh.frustumCulled = false;
  mesh.visible = false;
  return { mesh, mat, uniforms };
}
