// «Арал» as one three.js scene: sky, one heightfield (steppe + two sea basins), two water planes (north / south level),
// river + irrigation canal, the harbour (pier, sheds, cannery), four trawlers that float or sit in the sand, the cotton
// field, the 2005 dam, and the bathtub yard of the analogy. update(id, f, camera) poses everything for shot `id` at
// frame f (pure function of id + f). Look, light rig, sky and water shader come from the bridge template.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Kit } from "./build";
import { rep, ctex, rng, planksHD, beamHD, stoneHD, waterNear, waterFar, cloudHD } from "./paint";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, LFB, twoTone, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx, stage } from "./cast";
import {
  FPS, SHOTS, ShotDef, V3, camAt, levels, terrainH, SHIPS, DRAFT, SETTLE, PIER, RIVER, CANAL, COTTON, BATH, BATH_Y, DAM_Z, DAM_X0, DAM_X1, BOAT,
  bathState, glide, smooth,
} from "./story";

export const loadKit = () => Promise.resolve({} as Kit);

// ---------------- painted textures ----------------
const discTex = () => ctex("sunDisc", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
const haloTex = () => ctex("sunHalo", 256, 256, (g) => {
  const im = g.createImageData(256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const u = Math.hypot(x - 127.5, y - 127.5) / 128;
    const a = (0.55 * Math.exp(-((u / 0.25) ** 2)) + 0.35 * Math.exp(-((u / 0.6) ** 2))) * (1 - Math.min(1, Math.max(0, (u - 0.8) / 0.2)));
    const i = (y * 256 + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = 255; im.data[i + 3] = Math.round(255 * Math.min(1, a));
  }
  g.putImageData(im, 0, 0);
});
/** near-white detail for the ground (vertex colours carry the hue): sand grain, pebbles, dry cracks as dark tints */
const groundDetail = () => {
  const t = ctex("groundDetail", 1024, 1024, (g, r) => {
    g.fillStyle = "#f4efe6"; g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 9000; i++) { const v = 205 + Math.floor(r() * 50); g.fillStyle = `rgba(${v},${v - 8},${v - 22},0.55)`; g.fillRect(r() * 1024, r() * 1024, 2 + r() * 3, 2 + r() * 3); }
    g.strokeStyle = "rgba(120,96,70,0.38)"; g.lineCap = "round";
    for (let i = 0; i < 70; i++) { // polygonal mud cracks
      let x = r() * 1024, y = r() * 1024; g.lineWidth = 2 + r() * 3; g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 140; y += (r() - 0.5) * 140; g.lineTo(x, y); }
      g.stroke();
    }
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${150 + r() * 40},${120 + r() * 30},${90 + r() * 30},0.5)`; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 3 + r() * 6, 2 + r() * 4, r() * 3, 0, 7); g.fill(); }
  });
  return rep(t, 1, 1);
};
const rustTex = (fresh: boolean) => ctex(fresh ? "hullFresh" : "hullRust", 1024, 512, (g, r) => {
  // hull side, u along the length, v from keel (bottom) to deck (top)
  if (fresh) {
    g.fillStyle = "#2f5f78"; g.fillRect(0, 0, 1024, 512);
    g.fillStyle = "#b8392f"; g.fillRect(0, 380, 1024, 132); // red antifouling below the waterline
    g.fillStyle = "#f2efe6"; g.fillRect(0, 0, 1024, 46); // white sheer strake
    for (let i = 0; i < 18; i++) { g.fillStyle = "rgba(0,0,0,0.06)"; g.fillRect(i * 58, 46, 3, 334); }
  } else {
    g.fillStyle = "#8a4a2c"; g.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 2600; i++) { const v = r(); g.fillStyle = v < 0.5 ? `rgba(160,82,40,${0.3 + r() * 0.4})` : v < 0.8 ? `rgba(92,48,30,${0.3 + r() * 0.4})` : `rgba(70,96,104,${0.25 + r() * 0.3})`; g.beginPath(); g.ellipse(r() * 1024, r() * 512, 4 + r() * 22, 3 + r() * 10, r(), 0, 7); g.fill(); }
    for (let i = 0; i < 40; i++) { const x = r() * 1024; const gr = g.createLinearGradient(0, 40, 0, 300); gr.addColorStop(0, "rgba(120,50,20,0.55)"); gr.addColorStop(1, "rgba(120,50,20,0)"); g.fillStyle = gr; g.fillRect(x, 40, 6 + r() * 10, 220 + r() * 120); }
    g.fillStyle = "rgba(60,74,80,0.55)"; g.fillRect(0, 0, 1024, 40);
  }
});
const cabinTex = (fresh: boolean) => ctex(fresh ? "cabinFresh" : "cabinRust", 512, 256, (g, r) => {
  g.fillStyle = fresh ? "#f1ede4" : "#c9b8a2"; g.fillRect(0, 0, 512, 256);
  if (!fresh) for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(130,70,40,${r() * 0.35})`; g.fillRect(r() * 512, r() * 256, 3 + r() * 14, 2 + r() * 20); }
  for (let i = 0; i < 4; i++) { g.fillStyle = fresh ? "#2c4a62" : "#2a2a2c"; g.fillRect(36 + i * 120, 70, 70, 60); g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(40 + i * 120, 74, 24, 52); }
});
const facadeTex = (key: string, wall: string, win: string) => ctex(key, 512, 512, (g, r) => {
  g.fillStyle = wall; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.05})`; g.fillRect(r() * 512, r() * 512, 2 + r() * 8, 2 + r() * 8); }
  for (let fy = 0; fy < 2; fy++) for (let fx = 0; fx < 3; fx++) {
    const x = 50 + fx * 160, y = 70 + fy * 230;
    g.fillStyle = "#3d3a38"; g.fillRect(x - 6, y - 6, 92, 132);
    g.fillStyle = win; g.fillRect(x, y, 80, 120);
    g.fillStyle = "#f4f1ea"; g.fillRect(x + 37, y, 6, 120); g.fillRect(x, y + 50, 80, 6);
  }
});
const strawTex = () => { const t = ctex("straw", 64, 512, (g) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? "#ffffff" : "#e2403a"; g.fillRect(0, i * 32, 64, 32); } }); return rep(t, 1, 6); };

// ---------------- geometry helpers ----------------
const quadUp = (x0: number, x1: number, z0: number, z1: number, y: number, u = 1, v = 1) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z1, x1, y, z0, x0, y, z0], 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, u, 0, u, v, 0, 0, u, v, 0, v], 2));
  return g;
};
/** flat ribbon (water strip) along a polyline at height y */
const ribbon = (pts: V3[], w: number, y: number) => {
  const pos: number[] = [], nor: number[] = [], uv: number[] = [];
  const L = (i: number) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; const dx = b[0] - a[0], dz = b[2] - a[2], n = Math.hypot(dx, dz) || 1; return [-dz / n, dx / n]; };
  for (let i = 0; i + 1 < pts.length; i++) {
    const [nx0, nz0] = L(i), [nx1, nz1] = L(i + 1), a = pts[i], b = pts[i + 1];
    const p = [[a[0] + nx0 * w, a[2] + nz0 * w], [a[0] - nx0 * w, a[2] - nz0 * w], [b[0] - nx1 * w, b[2] - nz1 * w], [b[0] + nx1 * w, b[2] + nz1 * w]];
    for (const k of [0, 1, 2, 0, 2, 3]) { pos.push(p[k][0], y, p[k][1]); nor.push(0, 1, 0); uv.push(0, 0); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  return g;
};
const cyl = (r: number, h: number, seg = 10) => { const g = new THREE.CylinderGeometry(r, r, h, seg); g.translate(0, h / 2, 0); return g; };
const rounded = (w: number, d: number, rr: number) => {
  const s = new THREE.Shape(), x = -w / 2, y = -d / 2;
  s.moveTo(x + rr, y); s.lineTo(x + w - rr, y); s.quadraticCurveTo(x + w, y, x + w, y + rr); s.lineTo(x + w, y + d - rr);
  s.quadraticCurveTo(x + w, y + d, x + w - rr, y + d); s.lineTo(x + rr, y + d); s.quadraticCurveTo(x, y + d, x, y + d - rr); s.lineTo(x, y + rr); s.quadraticCurveTo(x, y, x + rr, y);
  return s;
};

type Mats = Record<string, THREE.Material>;
const SUN_SHOT: Record<number, { az?: number; el?: number }> = { 2: { az: 150, el: 14 }, 3: { az: 150, el: 22 }, 8: { az: 120, el: 40 }, 11: { az: 140, el: 18 }, 12: { az: 130, el: 40 }, 14: { az: 30, el: 9 } };

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private WU: Record<string, THREE.IUniform>;
  private sunDisc: THREE.Sprite; private sunHalo: THREE.Sprite;
  private sunCache = new Map<number, THREE.Vector3>();
  private cloudMaps: Record<"day" | "golden", THREE.Texture[]>;
  private clouds: THREE.Mesh[] = [];
  private waterN: THREE.Mesh; private waterS: THREE.Mesh;
  private riverUp: THREE.Mesh; private riverDown: THREE.Mesh; private canal: THREE.Mesh; private gate: THREE.Mesh;
  private ships: { g: THREE.Group; hull: THREE.Mesh; cabin: THREE.Mesh }[] = [];
  private hullMats: { fresh: THREE.Material; rust: THREE.Material; cabFresh: THREE.Material; cabRust: THREE.Material };
  private dam: THREE.Mesh;
  private rowboat = new THREE.Group();
  private bath = { g: new THREE.Group(), water: new THREE.Mesh(), small: new THREE.Mesh(), stream: new THREE.Mesh(), spout: new THREE.Group(), divider: new THREE.Mesh(), straw: new THREE.Mesh(), streamAway: new THREE.Mesh() };
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();

  constructor(_kit: Kit) {
    const R = this.root, M: Mats = {};
    // ---- sky + light (template) ----
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el));
          c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el));
          c = mix(c, c4, smoothstep(e.z, e.w, el));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(4000, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    R.add(this.sky);
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: discTex(), color: new THREE.Color(6.0, 4.4, 2.4), fog: false, depthWrite: false }));
    this.sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), color: new THREE.Color(1, 1, 1), fog: false, depthWrite: false, depthTest: true, transparent: true, blending: THREE.AdditiveBlending }));
    this.sunDisc.renderOrder = -0.5; this.sunHalo.renderOrder = 5;
    for (const m of [this.sunDisc, this.sunHalo]) { m.frustumCulled = false; m.layers.set(NOINK); R.add(m); }
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(SPEED.shadow, SPEED.shadow);
    R.add(this.hemi, this.sun, this.sun.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)) };
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.3, d = 2200 + (i % 3) * 300;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 520 + (i % 4) * 120;
      m.position.set(Math.cos(a) * d, 420 + (i % 4) * 130, Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }

    // ---- ground: one heightfield, hue by vertex colour (steppe / shore sand / salt-white seabed) ----
    const SZ = 2800, N = 280;
    const tg = new THREE.PlaneGeometry(SZ, SZ, N, N); tg.rotateX(-Math.PI / 2);
    const pa = tg.attributes.position as THREE.BufferAttribute, uv = tg.attributes.uv as THREE.BufferAttribute;
    const col = new Float32Array(pa.count * 3), r = rng(11), c = new THREE.Color();
    const steppe = new THREE.Color("#c9b071"), green = new THREE.Color("#93a35a"), sand = new THREE.Color("#e6d2a0"), mud = new THREE.Color("#c7ad84"), salt = new THREE.Color("#f3efe4");
    for (let i = 0; i < pa.count; i++) {
      const x = pa.getX(i), z = pa.getZ(i), h = terrainH(x, z);
      pa.setY(i, h); uv.setXY(i, x / 7, z / 7);
      const n1 = 0.5 + 0.5 * Math.sin(x * 0.021 + Math.sin(z * 0.017) * 2) * Math.sin(z * 0.019 + Math.sin(x * 0.013));
      if (h > 0.25) c.copy(steppe).lerp(green, 0.35 * n1 + 0.4 * smooth((520 - Math.abs(z - 470)) / 140) * smooth((x - 600) / 200));
      else c.copy(sand).lerp(mud, 0.5 * n1).lerp(salt, smooth((-h - 3) / 6) * (0.35 + 0.55 * (n1 > 0.55 ? 1 : 0)));
      c.offsetHSL(0, 0, (r() - 0.5) * 0.03);
      col.set([c.r, c.g, c.b], i * 3);
    }
    tg.setAttribute("color", new THREE.BufferAttribute(col, 3));
    tg.computeVertexNormals();
    M.ground = lam("ground", () => ({ map: groundDetail(), vertexColors: true }));
    const ground = new THREE.Mesh(tg, M.ground); ground.receiveShadow = true; ground.castShadow = false; ground.matrixAutoUpdate = false;
    R.add(ground);

    // ---- water: north + south planes (template river shader), river and canal strips ----
    const wNear = waterNear(), wFar = waterFar();
    for (const t of [wNear, wFar]) { t.colorSpace = THREE.NoColorSpace; t.anisotropy = 16; t.needsUpdate = true; }
    this.WU = {
      wNearC: { value: new THREE.Color() }, wMidC: { value: new THREE.Color() }, wFarC: { value: new THREE.Color() },
      wCrest: { value: new THREE.Color() }, wTrough: { value: new THREE.Color() }, wGlint: { value: new THREE.Color() },
      wShade: { value: new THREE.Vector3(0.5, 0.56, 0.72) }, wNearTex: { value: wNear }, wFarTex: { value: wFar }, wTime: { value: 0 },
    };
    const waterM = new THREE.MeshLambertMaterial({ color: 0xffffff });
    waterM.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, this.WU);
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWP;")
        .replace("#include <project_vertex>", "#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", WATER_DECL)
        .replace("#include <map_fragment>", WATER_COL)
        .replace("#include <lights_fragment_begin>", "float sunVis = 1.0;\n" + LFB)
        .replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\n  reflectedLight.directDiffuse = diffuseColor.rgb * mix(wShade, vec3(1.0), sunVis);\n  reflectedLight.indirectDiffuse = vec3(0.0);");
    };
    waterM.customProgramCacheKey = () => "aralSea1";
    this.waterN = new THREE.Mesh(quadUp(-1400, 1400, DAM_Z, 1400, 0), waterM);
    this.waterS = new THREE.Mesh(quadUp(-1400, 1400, -1400, DAM_Z, 0), waterM);
    this.riverUp = new THREE.Mesh(ribbon(RIVER.slice(0, 3), 24, 0), waterM);
    this.riverDown = new THREE.Mesh(ribbon(RIVER.slice(2), 24, 0), waterM);
    this.canal = new THREE.Mesh(ribbon(CANAL, 7.5, 0), waterM);
    for (const w of [this.waterN, this.waterS, this.riverUp, this.riverDown, this.canal]) { w.receiveShadow = true; R.add(w); }

    // ---- static batch: harbour, pier, river gate, cotton rows, bathtub yard ----
    const b = new Batch();
    M.wood = lam("wood", () => ({ map: rep(beamHD(), 1, 1) }));
    M.planks = lam("planks", () => ({ map: rep(planksHD(), 1, 1) }));
    M.concrete = lam("concrete", () => ({ map: stoneHD("concreteHD", ["#c9c4b8", "#c2bdb0", "#cfcabe", "#bab4a7"], "#a49e92") }));
    M.roofTin = lam("roofTin", () => ({ color: "#6f7d86" }));
    M.whiteWall = lam("facW", () => ({ map: facadeTex("facW", "#e9e1cf", "#3b6378") }));
    M.ochreWall = lam("facO", () => ({ map: facadeTex("facO", "#d9b779", "#2f5468") }));
    M.brickWall = lam("facB", () => ({ map: facadeTex("facB", "#b4654a", "#2f5468") }));
    M.iron = twoTone(new THREE.MeshPhongMaterial({ color: "#3d414c", specular: "#8a8a8a", shininess: 60 }), 0.15);
    // pier: deck from the shore out over the shelf, posts down to the seabed
    const P = PIER;
    b.add(boxGeo(V(P.x - P.w / 2, P.y - 0.25, P.z1), V(P.x + P.w / 2, P.y, P.z0), 2), M.planks);
    for (let z = P.z1 + 1; z <= P.z0; z += 4) for (const sx of [-1, 1]) {
      const x = P.x + sx * (P.w / 2 - 0.25), gy = terrainH(x, z);
      b.add(cyl(0.22, P.y - gy, 8), M.wood, new THREE.Matrix4().makeTranslation(x, gy - 0.5, z));
    }
    for (let z = P.z1 + 2; z <= P.z1 + 30; z += 7) b.add(cyl(0.18, 0.45, 8), M.iron, new THREE.Matrix4().makeTranslation(P.x + (z % 2 ? 1.6 : -1.6), P.y, z));
    // harbour sheds and blocks on the shore (Soviet port town): simple boxes with window facades, flat tin roofs
    const blocks: [number, number, number, number, number, THREE.Material][] = [
      [-38, 652, 26, 12, 9, M.whiteWall], [-4, 664, 18, 12, 12, M.ochreWall], [36, 650, 30, 14, 7, M.brickWall],
      [-80, 676, 22, 14, 15, M.whiteWall], [74, 690, 20, 14, 12, M.ochreWall], [-120, 650, 16, 10, 6, M.brickWall], [118, 662, 24, 12, 9, M.whiteWall],
    ];
    for (const [x, z, w, d, h, m] of blocks) {
      const gy = terrainH(x, z) - 0.3;
      b.add(boxGeo(V(x - w / 2, gy, z - d / 2), V(x + w / 2, gy + h, z + d / 2), 6), m);
      b.add(boxGeo(V(x - w / 2 - 0.3, gy + h, z - d / 2 - 0.3), V(x + w / 2 + 0.3, gy + h + 0.5, z + d / 2 + 0.3)), M.roofTin);
    }
    // cannery chimney + a harbour crane
    { const gy = terrainH(60, 700); b.add(cyl(1.6, 26, 14), M.brickWall, new THREE.Matrix4().makeTranslation(60, gy, 700)); }
    { const gy = terrainH(-14, 612);
      b.add(boxGeo(V(-15, gy, 610), V(-13, gy + 16, 612)), M.iron);
      b.add(boxGeo(V(-15, gy + 15, 611), V(-1, gy + 16, 612.2)), M.iron);
      b.add(boxGeo(V(-2.2, gy + 9, 611.2), V(-1.8, gy + 15, 611.6)), M.iron); }
    // river gate (sluice) where the canal leaves the river
    { const [gx, , gz] = CANAL[0]; const gy = terrainH(gx + 30, gz);
      for (const dz of [-28, 28]) b.add(boxGeo(V(gx - 34, gy - 2.5, gz + dz - 3), V(gx - 26, gy + 3.5, gz + dz + 3)), M.concrete);
      b.add(boxGeo(V(gx - 32, gy + 3.5, gz - 30), V(gx - 28, gy + 4.3, gz + 30)), M.concrete); }
    // bathtub yard ground details: a fence and a yurt behind the tub
    { const [bx, , bz] = BATH; const gy = BATH_Y;
      for (let i = 0; i < 14; i++) b.add(boxGeo(V(bx - 9 + i * 1.4, gy - 0.2, bz - 6.2), V(bx - 8.88 + i * 1.4, gy + 1.2, bz - 6.08)), M.wood);
      b.add(boxGeo(V(bx - 9, gy + 0.7, bz - 6.2), V(bx + 9.2, gy + 0.82, bz - 6.1)), M.wood);
      M.felt = lam("felt", () => ({ color: "#efe7d4" }));
      M.feltDark = lam("feltDark", () => ({ color: "#8a3a2a" }));
      const yurt = cyl(3.2, 2.3, 28); b.add(yurt, M.felt, new THREE.Matrix4().makeTranslation(bx - 6, gy - 0.1, bz - 12));
      const cone = new THREE.ConeGeometry(3.4, 1.9, 28); cone.translate(0, 0.95, 0); b.add(cone, M.felt, new THREE.Matrix4().makeTranslation(bx - 6, gy + 2.2, bz - 12));
      b.add(boxGeo(V(bx - 6.6, gy - 0.1, bz - 8.95), V(bx - 5.4, gy + 1.7, bz - 8.8)), M.feltDark); }
    b.build(R);

    // ---- cotton field: instanced bushes with white bolls ----
    {
      const rows: THREE.Matrix4[] = [], bolls: THREE.Matrix4[] = [], rr = rng(5), q = new THREE.Quaternion();
      for (let x = COTTON.x0; x < COTTON.x1; x += 2.2) for (let z = COTTON.z0; z < COTTON.z1; z += 0.9) {
        const gy = terrainH(x, z), s = 0.45 + rr() * 0.2;
        rows.push(new THREE.Matrix4().compose(V(x + rr() * 0.3, gy + s * 0.8, z), q, V(s, s * 0.9, s)));
        for (let k = 0; k < 3; k++) bolls.push(new THREE.Matrix4().compose(V(x + (rr() - 0.5) * 0.6, gy + s * 1.3 + rr() * 0.2, z + (rr() - 0.5) * 0.6), q, V(0.16, 0.16, 0.16)));
      }
      const bush = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), lam("cottonLeaf", () => ({ color: "#4f8a3a" })), rows.length);
      const boll = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), lam("cottonBoll", () => ({ color: "#fbf8f1" })), bolls.length);
      rows.forEach((m, i) => bush.setMatrixAt(i, m)); bolls.forEach((m, i) => boll.setMatrixAt(i, m));
      for (const im of [bush, boll]) { im.castShadow = true; im.receiveShadow = true; R.add(im); }
    }

    // ---- river gate leaf (moves), the dam (grows) ----
    this.gate = new THREE.Mesh(boxGeo(V(-0.6, -2.2, -25), V(0.6, 1.2, 25)), M.concrete);
    this.gate.position.set(CANAL[0][0] - 30, terrainH(CANAL[0][0] - 30, CANAL[0][2] + 26), CANAL[0][2]); this.gate.rotation.y = 0;
    this.gate.castShadow = true; R.add(this.gate);
    this.dam = new THREE.Mesh(boxGeo(V(0, -12, -6), V(1, -1.0, 6), 3), M.concrete);
    this.dam.position.set(DAM_X0, 0, DAM_Z); this.dam.castShadow = true; this.dam.receiveShadow = true; R.add(this.dam);

    // ---- ships: one hull model, four clones that float or sit ----
    this.hullMats = {
      fresh: lam("hullFresh", () => ({ map: rustTex(true) })), rust: lam("hullRust", () => ({ map: rustTex(false) })),
      cabFresh: lam("cabFresh", () => ({ map: cabinTex(true) })), cabRust: lam("cabRust", () => ({ map: cabinTex(false) })),
    };
    const hullShape = new THREE.Shape([new THREE.Vector2(-11, -3), new THREE.Vector2(7, -3), new THREE.Vector2(11.5, 0), new THREE.Vector2(7, 3), new THREE.Vector2(-11, 3)]);
    const hullG = new THREE.ExtrudeGeometry(hullShape, { depth: 3.6, bevelEnabled: true, bevelThickness: 0.25, bevelSize: 0.35, bevelSegments: 2 });
    hullG.rotateX(-Math.PI / 2); // extrusion now goes up (+y) from the keel at y = 0
    { const p = hullG.attributes.position as THREE.BufferAttribute, u = hullG.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) u.setXY(i, (p.getX(i) + 11.5) / 23, 1 - p.getY(i) / 3.6); }
    const deckG = boxGeo(V(-10.6, 3.55, -2.6), V(7.2, 3.7, 2.6), 2);
    const cabinG = boxGeo(V(-9.5, 3.7, -2.0), V(-3.5, 6.2, 2.0), 0);
    const roofG = boxGeo(V(-9.8, 6.2, -2.3), V(-3.2, 6.45, 2.3));
    const mastG = cyl(0.16, 8, 8); mastG.translate(1.5, 3.7, 0);
    const boomG = new THREE.CylinderGeometry(0.1, 0.1, 6, 6); boomG.rotateZ(Math.PI / 2.6); boomG.translate(4.0, 8.2, 0);
    const stackG = cyl(0.55, 2.0, 12); stackG.translate(-6.5, 6.4, 0);
    const shipModel = (): { g: THREE.Group; hull: THREE.Mesh; cabin: THREE.Mesh } => {
      const g = new THREE.Group();
      const hull = new THREE.Mesh(hullG, this.hullMats.fresh), cabin = new THREE.Mesh(cabinG, this.hullMats.cabFresh);
      const parts = [hull, cabin, new THREE.Mesh(deckG, M.planks), new THREE.Mesh(roofG, M.roofTin), new THREE.Mesh(mastG, M.iron), new THREE.Mesh(boomG, M.iron), new THREE.Mesh(stackG, M.iron)];
      for (const m of parts) { m.castShadow = true; m.receiveShadow = true; g.add(m); }
      return { g, hull, cabin };
    };
    for (let i = 0; i < SHIPS.length; i++) { const s = shipModel(); this.ships.push(s); R.add(s.g); }

    // ---- rowboat (shots 9-10) ----
    {
      const sh = new THREE.Shape([new THREE.Vector2(-1.7, -0.62), new THREE.Vector2(1.0, -0.62), new THREE.Vector2(1.8, 0), new THREE.Vector2(1.0, 0.62), new THREE.Vector2(-1.7, 0.62)]);
      const outerB = sh, innerB = new THREE.Path([new THREE.Vector2(-1.55, -0.48), new THREE.Vector2(0.95, -0.48), new THREE.Vector2(1.6, 0), new THREE.Vector2(0.95, 0.48), new THREE.Vector2(-1.55, 0.48)]);
      outerB.holes.push(innerB);
      const wallsB = new THREE.ExtrudeGeometry(outerB, { depth: 0.6, bevelEnabled: false }); wallsB.rotateX(-Math.PI / 2);
      const floorB = new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-1.6, -0.5), new THREE.Vector2(1.0, -0.5), new THREE.Vector2(1.65, 0), new THREE.Vector2(1.0, 0.5), new THREE.Vector2(-1.6, 0.5)])); floorB.rotateX(-Math.PI / 2); floorB.translate(0, 0.08, 0);
      const boatM = lam("boatWood", () => ({ color: "#9a6a3a" })), boatIn = lam("boatIn", () => ({ color: "#c79a62" }));
      for (const [g2, m2] of [[wallsB, boatM], [floorB, boatIn], [boxGeo(V(-0.25, 0.3, -0.5), V(0.15, 0.36, 0.5)), boatIn]] as const) { const mm = new THREE.Mesh(g2, m2); mm.castShadow = true; mm.receiveShadow = true; this.rowboat.add(mm); }
      this.rowboat.position.set(BOAT[0], 0, BOAT[2]); this.rowboat.rotation.y = 0.5;
      R.add(this.rowboat);
    }
    // ---- bathtub (analogy yard) ----
    {
      const bt = this.bath, gy = BATH_Y;
      const enamel = lam("enamel", () => ({ color: "#f6f3ec" }));
      const outer = rounded(2.0, 0.95, 0.42), inner = rounded(1.78, 0.74, 0.34); outer.holes.push(inner);
      const wallsG = new THREE.ExtrudeGeometry(outer, { depth: 0.62, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 10 });
      wallsG.rotateX(-Math.PI / 2);
      const floorG = new THREE.ShapeGeometry(rounded(1.8, 0.76, 0.34), 8); floorG.rotateX(-Math.PI / 2); floorG.translate(0, 0.04, 0);
      const walls = new THREE.Mesh(wallsG, enamel), floor = new THREE.Mesh(floorG, enamel);
      for (const m of [walls, floor]) { m.castShadow = true; m.receiveShadow = true; bt.g.add(m); }
      const brass = twoTone(new THREE.MeshPhongMaterial({ color: "#c9a24a", specular: "#fff1c0", shininess: 70 }), 0.2);
      for (const [x, z] of [[-0.8, -0.32], [0.8, -0.32], [-0.8, 0.32], [0.8, 0.32]]) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), brass); f.position.set(x, -0.05, z); bt.g.add(f); }
      // water planes (main and the small compartment behind the divider)
      const wMain = new THREE.ShapeGeometry(rounded(1.76, 0.72, 0.33), 8); wMain.rotateX(-Math.PI / 2);
      bt.water = new THREE.Mesh(wMain, waterM); bt.g.add(bt.water);
      const wSmall = new THREE.ShapeGeometry(rounded(0.5, 0.72, 0.2), 6); wSmall.rotateX(-Math.PI / 2); wSmall.translate(-0.62, 0, 0);
      bt.small = new THREE.Mesh(wSmall, waterM); bt.g.add(bt.small);
      // faucet at the -x end: post, spout (turns), stream
      const post = new THREE.Mesh(cyl(0.05, 1.05, 10), brass); post.position.set(-1.12, -0.05, 0); bt.g.add(post);
      bt.spout.position.set(-1.12, 0.98, 0); bt.g.add(bt.spout);
      const spoutG = new THREE.CylinderGeometry(0.04, 0.04, 0.32, 8); spoutG.rotateZ(Math.PI / 2); spoutG.translate(0.16, 0, 0);
      bt.spout.add(new THREE.Mesh(spoutG, brass));
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), brass); knob.position.set(0, 0.08, 0); bt.spout.add(knob);
      const streamM = new THREE.MeshBasicMaterial({ color: "#9fdcf2", transparent: true, opacity: 0.85, depthWrite: false });
      bt.stream = new THREE.Mesh(cyl(0.032, 1, 8), streamM); bt.stream.layers.set(NOINK); bt.g.add(bt.stream);
      bt.streamAway = new THREE.Mesh(cyl(0.032, 1, 8), streamM); bt.streamAway.layers.set(NOINK); bt.g.add(bt.streamAway);
      // divider plank
      bt.divider = new THREE.Mesh(boxGeo(V(-0.03, 0, -0.38), V(0.03, 0.66, 0.38)), M.wood); bt.divider.castShadow = true; bt.g.add(bt.divider);
      // cotton pot next to the faucet (where the water goes when the tap is turned)
      const pot = new THREE.Mesh(cyl(0.28, 0.4, 14), lam("pot", () => ({ color: "#b0583a" }))); pot.position.set(-1.55, -0.05, 0.55); bt.g.add(pot);
      const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 1), lam("cottonLeaf", () => ({ color: "#4f8a3a" }))); leaf.position.set(-1.55, 0.6, 0.55); bt.g.add(leaf);
      for (let k = 0; k < 5; k++) { const bo = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 1), lam("cottonBoll", () => ({ color: "#fbf8f1" }))); bo.position.set(-1.55 + Math.cos(k * 1.3) * 0.25, 0.75 + (k % 2) * 0.12, 0.55 + Math.sin(k * 1.3) * 0.25); bt.g.add(bo); }
      // the straw the sun drinks through (from the tub up into the sky)
      const strawM = new THREE.MeshBasicMaterial({ map: strawTex() });
      bt.straw = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 10), strawM); bt.straw.layers.set(NOINK); bt.g.add(bt.straw);
      bt.g.position.set(BATH[0], gy + 0.1, BATH[2]);
      R.add(bt.g);
    }
  }

  /** camera-relative sun, frozen per shot (template) */
  private shotSun(id: number, s: ShotDef, L: LightPreset) {
    let v = this.sunCache.get(id);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) {
      const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
      fx += x / n; fz += z / n;
    }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(SUN_SHOT[id]?.az ?? L.az), el = THREE.MathUtils.degToRad(SUN_SHOT[id]?.el ?? L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, s = SHOTS[id - 1], L = LIGHTS[s.light];
    // ---- camera ----
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = c.near ?? 0.3; cam.far = 6000; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- light rig (template) ----
    const K = LOOK[s.light], sunDir = this.shotSun(id, s, L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    let Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 260);
    if (s.light === "golden") Rr = Math.max(Rr, 30);
    this.sun.position.copy(focus).addScaledVector(sunDir, 600); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 1400; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...LOOK[s.light].bounce); TONE.uSat.value = LOOK[s.light].sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    // ---- sky, fog (scaled per shot for the aerials), sun disc, clouds ----
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    const fk = s.fogK ?? 1;
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear * fk; this.fog.far = L.fogFar * fk;
    scene.fog = this.fog; scene.background = null;
    const showSun = s.light === "golden";
    this.sunDisc.visible = this.sunHalo.visible = showSun;
    if (showSun) {
      this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 3000);
      this.sunDisc.scale.setScalar(2 * 3000 * Math.tan(THREE.MathUtils.degToRad(1.7)));
      this.sunHalo.position.copy(this.sunDisc.position); this.sunHalo.scale.setScalar(2 * 3000 * Math.tan(THREE.MathUtils.degToRad(24)));
      (this.sunHalo.material as THREE.SpriteMaterial).color.set(L.sunDisc).multiplyScalar(1.3);
    }
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i], mat = m.material as THREE.MeshBasicMaterial;
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
      mat.map = this.cloudMaps[s.light][i % 4];
    }
    const W = this.WU, wc = K.water;
    untone(wc.near, W.wNearC.value); untone(wc.mid, W.wMidC.value); untone(wc.far, W.wFarC.value);
    untone(wc.crest, W.wCrest.value); untone(wc.trough, W.wTrough.value); untone(wc.glint, W.wGlint.value);
    W.wShade.value.set(...wc.shade); W.wTime.value = t * 0.4;

    // ---- sea levels, river, canal, gate, dam ----
    const lv = levels(id, f);
    this.waterN.position.y = lv.n; this.waterS.position.y = lv.s;
    this.waterN.visible = lv.n > -11.9; this.waterS.visible = lv.s > -29;
    const turned = id < 5 ? 0 : id > 5 ? 1 : glide((f - 500) / 40); // the river goes to the cotton from shot 5 on
    this.riverUp.position.y = -0.55;
    this.riverDown.position.y = -0.55 - 1.6 * turned; this.riverDown.visible = turned < 0.98;
    this.canal.position.y = -0.4 - 1.0 * (1 - turned); this.canal.visible = turned > 0.02;
    this.gate.rotation.y = (1 - turned) * 1.4;
    this.dam.visible = lv.dam > 0.001;
    this.dam.scale.x = Math.max(0.001, (DAM_X1 - DAM_X0) * lv.dam);
    // ---- ships: float while there is water under the keel, else sit rolled in the sand ----
    const rusty = s.era === "dry" || s.era === "now" || s.era === "low" || s.era === "dam" || (s.era === "retreat" && id === 7);
    for (let i = 0; i < SHIPS.length; i++) {
      const sp = SHIPS[i], sh = this.ships[i], gy = terrainH(sp.x, sp.z);
      const water = sp.z > DAM_Z ? lv.n : lv.s;
      let y = water - DRAFT, roll = 0.02 * Math.sin(t * 1.3 + i), pitch = 0.015 * Math.sin(t * 1.1 + i * 2);
      const grounded = water - DRAFT < gy + 0.2;
      if (grounded) { y = gy + 0.2 - 0.6; roll = sp.roll; pitch = 0.03; }
      if (id === 7 && i === SETTLE.ship) { // settles on "кемелер құмға отырды"
        const k = glide((f - SETTLE.f) / SETTLE.dur);
        y = gy - 0.2 - 0.6 * k; roll = sp.roll * k; pitch = 0.03 * k;
      }
      sh.g.position.set(sp.x, y, sp.z); sh.g.rotation.set(pitch, sp.yaw, roll, "YXZ"); sh.g.scale.setScalar(sp.s);
      sh.hull.material = rusty ? this.hullMats.rust : this.hullMats.fresh; sh.cabin.material = rusty ? this.hullMats.cabRust : this.hullMats.cabFresh;
    }
    // ---- rowboat ----
    this.rowboat.visible = id === 9 || id === 10;
    this.rowboat.position.y = lv.n - 0.28 + 0.03 * Math.sin(t * 1.7); this.rowboat.rotation.z = 0.03 * Math.sin(t * 1.3);
    // ---- bathtub ----
    const bs = bathState(f), bt = this.bath, depth = 0.56;
    bt.g.visible = id === 11 || (id === 10 && f > 1140) || (id === 12 && f < 1550);
    bt.water.position.y = 0.06 + depth * bs.main; bt.water.visible = bs.main > 0.02;
    bt.small.position.y = 0.06 + depth * bs.small; bt.small.visible = bs.divider > 0.98;
    bt.water.scale.set(bs.divider > 0.98 ? 0.995 : 1, 1, 1);
    bt.spout.rotation.y = bs.away * 2.2;
    const spoutTip = new THREE.Vector3(0.32, 0, 0).applyAxisAngle(V(0, 1, 0), bs.away * 2.2).add(V(-1.12, 0.98, 0));
    const into = bs.away < 0.5;
    const top = spoutTip.y - 0.02, bottom = into ? 0.06 + depth * (bs.divider > 0.98 ? bs.small : bs.main) : 0.42;
    bt.stream.visible = bs.flow > 0 && into; bt.streamAway.visible = bs.flow > 0 || (bs.away > 0.5 && f < 1462);
    bt.streamAway.visible = bt.streamAway.visible && !into;
    for (const m of [bt.stream, bt.streamAway]) { m.position.set(spoutTip.x, bottom, spoutTip.z); m.scale.set(1, Math.max(0.01, top - bottom), 1); }
    bt.divider.position.set(-0.35, 0.06 + 1.2 * (1 - bs.divider), 0); bt.divider.visible = bs.divider > 0.01 || f > 1420;
    // straw from the water up to the sun card (shot 11 at f 1282-1420)
    bt.straw.visible = bs.straw > 0;
    if (bs.straw > 0) {
      const a = V(0.3, 0.06 + depth * bs.main, 0.05), bTop = V(1.5, 12.0, -22.0);
      const mid = a.clone().add(bTop).multiplyScalar(0.5), len = a.distanceTo(bTop);
      bt.straw.position.copy(mid); bt.straw.scale.set(1, len, 1);
      bt.straw.quaternion.setFromUnitVectors(V(0, 1, 0), bTop.clone().sub(a).normalize());
    }

    // ---- cast + effects ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const st = stage(id, f, { pos: cam.position, right, sun: sunDir }, lv);
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      a.mesh.castShadow = L.actorShadow;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    const fused: Fx[] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e2 = this.fx(fi++);
      e2.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e2.use(!!p.soft);
      e2.mesh.visible = true;
      e2.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e2.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { e2.mesh.quaternion.copy(cam.quaternion); e2.mesh.rotateZ(p.rot ?? 0); }
      e2.mesh.scale.set(p.w, p.h, 1);
      fused.push(e2);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e3 of fused) e3.bind();
    return focus;
  }
}

/** [Motion speed test] cost knobs set by the composition before the World is built */
export const SPEED = { shadow: 2048 };

const WATER_DECL = `#include <common>
varying vec3 vWP;
uniform vec3 wNearC, wMidC, wFarC, wCrest, wTrough, wGlint, wShade;
uniform sampler2D wNearTex, wFarTex;
uniform float wTime;`;
const WATER_COL = `
  vec3 wV = vWP - cameraPosition;
  float wd = length(wV);
  float wDep = asin(clamp(-wV.y / wd, 0.0, 1.0));
  float wf = 1.0 - smoothstep(0.0, 0.42, wDep);
  vec3 wc = mix(mix(wNearC, wMidC, smoothstep(0.0, 0.55, wf)), wFarC, smoothstep(0.55, 1.0, wf));
  vec2 wp = vWP.xz + vec2(0.35 * wTime, 0.2 * wTime);
  vec4 mk = mix(texture2D(wNearTex, wp / 8.0), texture2D(wFarTex, wp / 40.0 + 0.37), smoothstep(25.0, 90.0, wd));
  wc = mix(wc, wTrough, mk.g * 0.6);
  wc = mix(wc, wCrest, mk.r * 0.7);
  wc = mix(wc, wGlint, mk.b * (0.3 + 0.5 * wf));
  diffuseColor.rgb = wc;`;

