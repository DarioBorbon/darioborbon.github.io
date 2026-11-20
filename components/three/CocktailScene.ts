import * as THREE from "three";
import { GLASS, LIQUID, COLORS, innerRadius } from "./dims";
import { clamp, damp, lerp, smoothstep } from "./math";
import { shotAt, ingredientsAt, pourEnvelope, fillCurve } from "./director";
import { createEnvironment, createBackdrop, createFloor } from "./parts/stage";
import { createGlass } from "./parts/glass";
import { createLiquid, createPourStream } from "./parts/liquid";
import { createIce } from "./parts/ice";
import { createBubbles, createDust } from "./parts/bubbles";
import { createGarnish, createRim, createCondensation, createStirrer } from "./parts/details";
import { createPost } from "./parts/post";

/**
 * CocktailScene — one renderer, one scene, one camera, fully imperative.
 * React only mounts it and feeds it the story position; everything else
 * (timing, interpolation, quality) lives here for total control.
 */
export type SceneOptions = {
  mobile: boolean;
  reducedMotion: boolean;
  onReady?: () => void;
  onQuality?: (tier: number) => void;
};

const QUALITY = [
  { dpr: 2, bloom: true, msaa: 4 },
  { dpr: 1.5, bloom: true, msaa: 4 },
  { dpr: 1.15, bloom: true, msaa: 2 },
  { dpr: 0.9, bloom: false, msaa: 0 },
];

const tmpV = new THREE.Vector3();
const tmpV2 = new THREE.Vector3();
const tmpBuf = new THREE.Vector2();
const tmpPos = new THREE.Vector3();
const WHITE = new THREE.Color(1, 1, 1);
const liquorCol = new THREE.Color(COLORS.liquor);
const mixedCol = new THREE.Color(COLORS.mixed);
const tonicCol = new THREE.Color("#fff3f6");
const glowNeutral = new THREE.Color("#ffc9d9");
const glowRose = new THREE.Color("#ff8fb6");

export class CocktailScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(30, 1, 0.05, 200);
  private post: ReturnType<typeof createPost>;
  private parts: {
    backdrop: ReturnType<typeof createBackdrop>;
    floor: ReturnType<typeof createFloor>;
    glass: ReturnType<typeof createGlass>;
    liquid: ReturnType<typeof createLiquid>;
    stream: ReturnType<typeof createPourStream>;
    ice: ReturnType<typeof createIce>;
    bubbles: ReturnType<typeof createBubbles>;
    dust: ReturnType<typeof createDust>;
    garnish: ReturnType<typeof createGarnish>;
    rim: ReturnType<typeof createRim>;
    drops: ReturnType<typeof createCondensation>;
    stirrer: ReturnType<typeof createStirrer>;
  };
  private drink = new THREE.Group();
  private opts: SceneOptions;
  private raf = 0;
  private running = false;
  private last = 0;
  private time = 0;
  private sTarget = 0;
  private s = 0;
  private pointer = new THREE.Vector2();
  private pointerSmooth = new THREE.Vector2();
  private swirl = 0;
  private swirlPhase = 0;
  private tier = 0;
  private frameEMA = 1 / 60;
  private slowFrames = 0;
  private readyFired = false;
  private width = 1;
  private height = 1;
  private camPos = new THREE.Vector3();
  private camTarget = new THREE.Vector3();
  private camInit = false;

  constructor(private canvas: HTMLCanvasElement, opts: SceneOptions) {
    this.opts = opts;
    this.tier = opts.mobile ? 2 : 0;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance", stencil: false });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.setClearColor(0x050506, 1);

    this.scene.environment = createEnvironment(this.renderer);
    this.scene.environmentIntensity = 1;

    const backdrop = createBackdrop();
    const floor = createFloor(backdrop.uniforms);
    const glass = createGlass();
    const liquid = createLiquid();
    const stream = createPourStream();
    const ice = createIce();
    const bubbles = createBubbles(opts.mobile ? 280 : 520);
    const dust = createDust(opts.mobile ? 120 : 260);
    const garnish = createGarnish();
    const rim = createRim(opts.mobile ? 900 : 1600);
    const drops = createCondensation(opts.mobile ? 180 : 340);
    const stirrer = createStirrer();
    this.parts = { backdrop, floor, glass, liquid, stream, ice, bubbles, dust, garnish, rim, drops, stirrer };

    // a single warm key light for garnish / metal sparkle (env does the rest)
    const key = new THREE.DirectionalLight(0xffeef2, 1.4);
    key.position.set(-3, 6, 2);
    const rimLight = new THREE.DirectionalLight(0xff6aa0, 1.1);
    rimLight.position.set(2, 3, -5);

    this.drink.add(glass.group, liquid.mesh, ice.group, bubbles.points, garnish.group, rim.mesh, drops.mesh, stirrer.group);
    this.scene.add(backdrop.mesh, floor.group, this.drink, stream.mesh, dust.points, key, rimLight);

    this.post = createPost(this.renderer, this.scene, this.camera);
    this.resize();
  }

  /* ---------------- public API ---------------- */
  setStory(s: number) {
    this.sTarget = s;
  }
  setPointer(x: number, y: number) {
    this.pointer.set(x, y);
  }
  setReducedMotion(v: boolean) {
    this.opts.reducedMotion = v;
  }
  setMobile(v: boolean) {
    this.opts.mobile = v;
    this.resize();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.frame(dt);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.width = w;
    this.height = h;
    const q = QUALITY[this.tier];
    const dpr = Math.min(window.devicePixelRatio || 1, q.dpr, this.opts.mobile ? 1.5 : 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.post.composer.setPixelRatio(dpr);
    this.post.composer.setSize(w, h);
    this.post.bloom.enabled = q.bloom;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const buf = this.renderer.getDrawingBufferSize(tmpBuf);
    this.parts.backdrop.uniforms.uRes.value.set(buf.x, buf.y);
  }

  dispose() {
    this.stop();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    this.scene.environment?.dispose();
    this.post.composer.dispose();
    this.renderer.dispose();
  }

  /* ---------------- frame ---------------- */
  private frame(dt: number) {
    const reduced = this.opts.reducedMotion;
    const timeScale = reduced ? 0.45 : 1;
    this.time += dt * timeScale;
    const t = this.time;

    // smooth the scroll position: native scroll stays accessible, the
    // scene glides behind it with critically-damped easing
    this.s = damp(this.s, this.sTarget, reduced ? 9 : 4.2, dt);
    if (Math.abs(this.s - this.sTarget) < 1e-4) this.s = this.sTarget;
    const s = this.s;

    const I = ingredientsAt(s);
    const P = this.parts;

    /* ---- liquid ---- */
    const liqFill = fillCurve(I.liquor);
    const mixFill = fillCurve(I.mixer);
    const level = LIQUID.floor + (LIQUID.liquorTop - LIQUID.floor) * liqFill + (LIQUID.fullTop - LIQUID.liquorTop) * mixFill;
    const mixRatio = mixFill;
    const pourL = pourEnvelope(I.liquor);
    const pourM = pourEnvelope(I.mixer);

    const lu = P.liquid.uniforms;
    lu.uLevel.value = level;
    lu.uTime.value = t;
    P.liquid.mesh.visible = level > LIQUID.floor + 0.004;
    P.liquid.mat.attenuationColor.copy(liquorCol).lerp(mixedCol, mixRatio);
    P.liquid.mat.attenuationDistance = lerp(0.32, 1.25, mixRatio);

    /* ---- stirrer & swirl ---- */
    const stir = P.stirrer.update(I.arsenal, I.finale, t, dt, reduced ? 0.35 : 1);
    this.swirl = damp(this.swirl, stir, stir > this.swirl ? 2.5 : 1.1, dt); // liquid keeps spinning after the spoon stops
    this.swirlPhase += this.swirl * dt * 3.2 * timeScale;
    lu.uSwirl.value = this.swirl * (reduced ? 0.6 : 1);
    lu.uSwirlPhase.value = this.swirlPhase;
    lu.uAgit.value = Math.max(pourL, pourM * 0.8) + this.swirl * 0.25;

    /* ---- pour stream ---- */
    const pouring = pourL > 0.001 ? I.liquor : pourM > 0.001 ? I.mixer : -1;
    if (pouring >= 0) {
      const topY = 7;
      const head = lerp(topY, level, smoothstep(0, 0.12, pouring));
      const tail = lerp(topY, level, smoothstep(0.86, 1, pouring));
      const len = Math.max(0.0001, tail - head);
      const R = innerRadius(level);
      P.stream.mesh.visible = head < tail - 0.01 || len > 0.01;
      P.stream.mesh.position.set(lu.uPour.value.x * R, tail, lu.uPour.value.y * R);
      P.stream.mesh.scale.set(1, len, 1);
      P.stream.uniforms.uTime.value = t;
      P.stream.uniforms.uWidth.value = 0.4 + 0.6 * (pourL > 0.001 ? pourL : pourM);
      if (pourL > 0.001) {
        P.stream.mat.attenuationColor.copy(liquorCol);
        P.stream.mat.attenuationDistance = 0.16;
      } else {
        P.stream.mat.attenuationColor.copy(tonicCol);
        P.stream.mat.attenuationDistance = 2.5;
      }
    } else {
      P.stream.mesh.visible = false;
    }

    /* ---- ice, bubbles ---- */
    P.ice.update(I.ice, level, this.swirl * 3.2, t, dt);
    P.ice.tint.uTint.value.copy(liquorCol).lerp(mixedCol, mixRatio).lerp(WHITE, 0.35 + mixRatio * 0.3);

    const bu = P.bubbles.uniforms;
    bu.uTime.value = t;
    bu.uLevel.value = level;
    bu.uSwirlPhase.value = this.swirlPhase;
    bu.uFizz.value = clamp(smoothstep(0, 0.35, I.mixer) * (0.7 + 0.3 * pourM) + this.swirl * 0.15);

    /* ---- garnish, rim, dew, atmosphere ---- */
    P.garnish.update(I.garnish, t);
    P.rim.update(I.rim);
    P.drops.update(I.condensation, level, t, dt);
    P.glass.uniforms.uFog.value = I.condensation * 0.9;
    P.dust.uniforms.uTime.value = t;
    P.dust.uniforms.uAmount.value = I.atmosphere * 0.85 + I.finale * 0.2;

    // finished drink: a slow, confident turntable
    if (!reduced) this.drink.rotation.y += dt * 0.1 * I.finale;

    /* ---- camera ---- */
    const shot = shotAt(s);
    const mobile = this.opts.mobile;
    tmpV.set(...shot.target);
    const pos = tmpPos.set(...shot.pos).sub(tmpV);
    // narrower screens: pull back so the glass keeps its share of the frame
    const aspect = this.width / Math.max(1, this.height);
    if (mobile) pos.multiplyScalar(Math.max(1.35, 0.75 / aspect));
    else if (aspect < 1.6) pos.multiplyScalar(Math.sqrt(1.6 / aspect));
    pos.applyAxisAngle(THREE.Object3D.DEFAULT_UP, shot.orbit);
    if (!reduced) {
      // breathing + pointer parallax, tiny on purpose
      this.pointerSmooth.lerp(this.pointer, 1 - Math.exp(-3 * dt));
      pos.x += Math.sin(t * 0.21) * 0.05 + this.pointerSmooth.x * 0.18;
      pos.y += Math.sin(t * 0.17) * 0.035 - this.pointerSmooth.y * 0.1;
    }
    this.camPos.copy(tmpV).add(pos);
    this.camTarget.copy(tmpV);
    if (!this.camInit) this.camInit = true;
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camTarget);
    this.camera.fov = shot.fov + (mobile ? 2 : 0);
    const w = this.width, h = this.height;
    const shiftX = mobile ? 0 : shot.shift;
    const shiftY = mobile ? 0.22 : 0;
    this.camera.setViewOffset(w, h, (-shiftX * w) / 2, (shiftY * h) / 2, w, h);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    /* ---- backlight follows the glass on screen ---- */
    const bd = P.backdrop.uniforms;
    tmpV.set(0, 1.35, 0).project(this.camera);
    bd.uCenter.value.set(tmpV.x * 0.5 + 0.5, tmpV.y * 0.5 + 0.5);
    const top = tmpV2.set(0, GLASS.height, 0).project(this.camera).y;
    const bottom = tmpV.set(0, 0, 0).project(this.camera).y;
    bd.uRadius.value = clamp(Math.abs(top - bottom) * 0.5 * 0.42, 0.08, 0.6);
    bd.uColor.value.copy(glowNeutral).lerp(glowRose, clamp(liqFill * 0.6 + mixFill * 0.2));
    bd.uIntensity.value = shot.glow;
    bd.uTime.value = t;

    // caustic pool brightens with the amount of coloured liquid
    const fillAmt = (level - LIQUID.floor) / (LIQUID.fullTop - LIQUID.floor);
    P.floor.causticMat.opacity = fillAmt * 0.5 * shot.glow;
    P.floor.causticMat.color.copy(liquorCol).lerp(mixedCol, mixRatio);

    // point sizes depend on buffer height & fov
    const buf = this.renderer.getDrawingBufferSize(tmpBuf);
    const px = buf.y / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2));
    bu.uPx.value = px;
    P.dust.uniforms.uPx.value = px;

    this.post.lens.uniforms.uTime.value = t;
    this.post.composer.render(dt);

    if (!this.readyFired) {
      this.readyFired = true;
      requestAnimationFrame(() => this.opts.onReady?.());
    }
    this.adapt(dt);
  }

  /** Adaptive quality: if frames are consistently slow, step down once per
   * trigger. Never steps back up, to avoid visible oscillation. */
  private adapt(dt: number) {
    this.frameEMA = lerp(this.frameEMA, dt, 0.05);
    if (this.frameEMA > 1 / 42) this.slowFrames++;
    else this.slowFrames = Math.max(0, this.slowFrames - 2);
    if (this.slowFrames > 90 && this.tier < QUALITY.length - 1) {
      this.tier++;
      this.slowFrames = 0;
      this.frameEMA = 1 / 60;
      this.resize();
      this.opts.onQuality?.(this.tier);
    }
  }
}
