import * as THREE from "three";
import { GLASS } from "../dims";

/**
 * GLASS — a heavy-based highball.
 *
 * Why not `transmission`? Transmissive objects can't see other transmissive
 * objects through them, so the drink would vanish behind the wall. Instead the
 * glass is a reflection-only shell blended with premultiplied alpha:
 * reflections are ADDED at full strength while the background is only slightly
 * darkened by Fresnel. On a black studio set this reads as crystal.
 */
function profile(): THREE.Vector2[] {
  const { height: H, rOutBottom: rb, rOutTop: rt, wall: w, base } = GLASS;
  const pts: THREE.Vector2[] = [];
  const P = (x: number, y: number) => pts.push(new THREE.Vector2(x, y));
  // underside (slight hollow foot)
  P(0.0001, 0.035);
  P(rb - 0.16, 0.03);
  P(rb - 0.06, 0.0);
  // bevelled heel
  for (let i = 0; i <= 6; i++) {
    const a = (-Math.PI / 2) + (i / 6) * (Math.PI / 2);
    P(rb - 0.05 + Math.cos(a) * 0.05, 0.05 + Math.sin(a) * 0.05);
  }
  // outer wall
  const steps = 18;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    P(rb + (rt - rb) * t, 0.05 + (H - 0.05 - w / 2) * t);
  }
  // rounded lip
  for (let i = 1; i < 10; i++) {
    const a = (i / 10) * Math.PI;
    P(rt - w / 2 + Math.cos(a) * (w / 2), H - w / 2 + Math.sin(a) * (w / 2));
  }
  // inner wall going down
  const irt = rt - w, irb = rb - w * 1.25;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    P(irt + (irb - irt) * t, H - w / 2 - (H - w / 2 - base - 0.08) * t);
  }
  // inner fillet into the floor
  for (let i = 1; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2);
    P(irb - 0.08 + Math.cos(a) * 0.08, base + 0.08 - Math.sin(a) * 0.08);
  }
  P(0.0001, base - 0.012);
  return pts;
}

export function createGlass() {
  const geo = new THREE.LatheGeometry(profile(), 128);
  geo.computeVertexNormals();

  const uniforms = {
    uFog: { value: 0 },          // condensation frost
    uEdge: { value: new THREE.Color("#ffd6e4") },
  };

  const make = (side: THREE.Side) => {
    const m = new THREE.MeshPhysicalMaterial({
      color: 0x000000,
      roughness: 0.035,
      metalness: 0,
      ior: 1.5,
      envMapIntensity: 2.4,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      specularIntensity: 1,
      transparent: true,
      depthWrite: false,
      side,
    });
    m.blending = THREE.CustomBlending;
    m.blendSrc = THREE.OneFactor;
    m.blendDst = THREE.OneMinusSrcAlphaFactor;
    m.onBeforeCompile = (s) => {
      s.uniforms.uFog = uniforms.uFog;
      s.uniforms.uEdge = uniforms.uEdge;
      s.vertexShader = s.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWPos;")
        .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvWPos = (modelMatrix * vec4(transformed,1.0)).xyz;");
      s.fragmentShader = s.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform float uFog; uniform vec3 uEdge; varying vec3 vWPos;\nfloat gHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}")
        .replace(
          "#include <opaque_fragment>",
          `float ndv = abs(dot(normalize(geometryNormal), normalize(geometryViewDir)));
           float fres = pow(1.0 - ndv, 3.0);
           float lum = dot(outgoingLight, vec3(0.2126, 0.7152, 0.0722));
           // frost: soft mottled film on the cold part of the glass
           float frostMask = uFog * (1.0 - smoothstep(1.6, 2.2, vWPos.y));
           float speck = gHash(floor(vWPos.xy * vec2(140.0, 160.0)) + floor(vWPos.z * 140.0));
           vec3 frost = vec3(0.9, 0.86, 0.9) * frostMask * (0.035 + speck * 0.02);
           vec3 col = outgoingLight + fres * uEdge * 0.22 + frost;
           float a = clamp(0.035 + fres * 0.55 + lum * 0.5 + frostMask * 0.08, 0.0, 1.0);
           gl_FragColor = vec4(col, a);`
        )
        .replace("#include <premultiplied_alpha_fragment>", "");
    };
    return m;
  };

  const back = new THREE.Mesh(geo, make(THREE.BackSide));
  back.renderOrder = 10;
  const front = new THREE.Mesh(geo, make(THREE.FrontSide));
  front.renderOrder = 20;

  const group = new THREE.Group();
  group.add(back, front);
  return { group, uniforms };
}
