// «Көршінің баласы» as one three.js scene: sky (day / dawn-sunset / moonlit night), steppe heightfield, far mountains,
// the aul — two white houses with tin roofs, one plank fence between the yards, the тапшан, barns, haystacks,
// gardens with hidden weeds, poplars — and the cast. update(id, f, camera) poses everything for shot `id` at frame f.
// Sky, light rig, clouds and the card pipeline come from the bridge template (via the Aral short).
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Kit } from "./build";
import { rep, ctex, rng, planksHD, beamHD, cloudHD } from "./paint";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, twoTone, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx, stage } from "./cast";
import { FPS, SHOTS, ShotDef, camAt, terrainH, FENCE, HOUSE_A, HOUSE_B, TAPSHAN, HAY_A, HAY_B, GARDEN_A, GARDEN_B, smooth } from "./story";

export const loadKit = () => Promise.resolve({} as Kit);
/** [Motion speed test] cost knobs set by the composition before the World is built */
export const SPEED = { shadow: 2048 };

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
/** near-white grass/earth detail; vertex colours carry the hue */
const groundDetail = () => {
  const t = ctex("aulGround", 1024, 1024, (g, r) => {
    g.fillStyle = "#f2f0e6"; g.fillRect(0, 0, 1024, 1024);
    g.lineCap = "round";
    for (let i = 0; i < 7000; i++) {
      const x = r() * 1024, y = r() * 1024, l = 6 + r() * 14, v = 190 + Math.floor(r() * 55);
      g.strokeStyle = `rgba(${v - 30},${v},${v - 60},0.55)`; g.lineWidth = 2 + r() * 2;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 6, y - l); g.stroke();
    }
    for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(${140 + r() * 40},${120 + r() * 30},${90 + r() * 30},0.45)`; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 3 + r() * 6, 2 + r() * 4, r() * 3, 0, 7); g.fill(); }
  });
  return rep(t, 1, 1);
};
const houseTex = (key: string, door: boolean) => ctex(key, 1024, 512, (g, r) => {
  g.fillStyle = "#f3efe6"; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(150,130,110,${r() * 0.08})`; g.fillRect(r() * 1024, r() * 512, 3 + r() * 16, 2 + r() * 10); }
  g.fillStyle = "#8a7a6a"; g.fillRect(0, 440, 1024, 72); // plinth
  const win = (x: number) => {
    g.fillStyle = "#2f6fb0"; g.fillRect(x - 14, 150, 148, 196);
    g.fillStyle = "#cfe6f5"; g.fillRect(x, 164, 120, 168);
    g.fillStyle = "#2f6fb0"; g.fillRect(x + 56, 164, 8, 168); g.fillRect(x, 238, 120, 8);
    g.fillStyle = "#f3efe6"; g.fillRect(x - 24, 346, 168, 16);
  };
  if (door) { win(120); win(760); g.fillStyle = "#6a4a2e"; g.fillRect(452, 160, 120, 280); g.fillStyle = "#2f6fb0"; g.fillRect(440, 148, 144, 14); g.fillStyle = "#d9a441"; g.fillRect(546, 300, 12, 12); }
  else { win(200); win(680); }
});
const rugTex = () => ctex("rug", 512, 512, (g) => {
  g.fillStyle = "#b8322c"; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "#f2c94c"; g.lineWidth = 14; g.strokeRect(30, 30, 452, 452);
  g.fillStyle = "#1f3f73";
  for (const [x, y] of [[256, 256], [140, 140], [372, 140], [140, 372], [372, 372]]) { g.beginPath(); g.moveTo(x, y - 60); g.lineTo(x + 60, y); g.lineTo(x, y + 60); g.lineTo(x - 60, y); g.closePath(); g.fill(); }
  g.fillStyle = "#f2c94c"; g.beginPath(); g.arc(256, 256, 22, 0, 7); g.fill();
});
const hayTex = () => ctex("hay", 512, 512, (g, r) => {
  g.fillStyle = "#d9b45a"; g.fillRect(0, 0, 512, 512);
  g.lineCap = "round";
  for (let i = 0; i < 2600; i++) { const v = r(); g.strokeStyle = v < 0.5 ? "rgba(240,206,120,0.7)" : "rgba(170,130,60,0.6)"; g.lineWidth = 2 + r() * 2; const x = r() * 512, y = r() * 512, a = (r() - 0.5) * 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 26, y + Math.sin(a) * 26); g.stroke(); }
});

const cyl = (r: number, h: number, seg = 10) => { const g = new THREE.CylinderGeometry(r, r, h, seg); g.translate(0, h / 2, 0); return g; };
/** gable roof (prism along x) over a w x d footprint, eaves at y0, ridge at y0 + rh */
const gable = (w: number, d: number, y0: number, rh: number, over = 0.5) => {
  const sh = new THREE.Shape([new THREE.Vector2(-d / 2 - over, 0), new THREE.Vector2(d / 2 + over, 0), new THREE.Vector2(0, rh)]);
  const g = new THREE.ExtrudeGeometry(sh, { depth: w + 2 * over, bevelEnabled: false });
  g.rotateY(Math.PI / 2); g.translate(-(w / 2 + over), y0, 0);
  return g;
};
const SUN_SHOT: Record<number, { az?: number; el?: number }> = {
  1: { az: 110, el: 40 }, 4: { az: 130, el: 10 }, 6: { az: 22, el: 26 },
  9: { az: 140, el: 12 }, 10: { az: 140, el: 12 }, 11: { az: 150, el: 12 }, 12: { az: 145, el: 12 }, 13: { az: 120, el: 12 }, 14: { az: 145, el: 12 }, 15: { az: 30, el: 8 },
};

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunDisc: THREE.Sprite; private sunHalo: THREE.Sprite;
  private sunCache = new Map<number, THREE.Vector3>();
  private cloudMaps: Record<"day" | "golden" | "night", THREE.Texture[]>;
  private clouds: THREE.Mesh[] = [];
  private glow: THREE.Mesh[] = [];
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();

  constructor(_kit: Kit) {
    const R = this.root;
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
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(3000, 48, 24), this.skyMat);
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
    const day = [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud));
    this.cloudMaps = { day, golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)), night: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.night.cloud)) };
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.3, d = 1500 + (i % 3) * 200;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 360 + (i % 4) * 90;
      m.position.set(Math.cos(a) * d, 260 + (i % 4) * 90, Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }

    // ---- ground: steppe heightfield; yard earth, paths and garden soil by vertex colour ----
    const SZ = 1800, N = 220;
    const tg = new THREE.PlaneGeometry(SZ, SZ, N, N); tg.rotateX(-Math.PI / 2);
    const pa = tg.attributes.position as THREE.BufferAttribute, uv = tg.attributes.uv as THREE.BufferAttribute;
    const col = new Float32Array(pa.count * 3), r = rng(21), c = new THREE.Color();
    const grass = new THREE.Color("#8fb04e"), dry = new THREE.Color("#c4b469"), earth = new THREE.Color("#c9a77a"), soil = new THREE.Color("#7a5434");
    const inRect = (x: number, z: number, g: { x0: number; x1: number; z0: number; z1: number }, m = 0) => x > g.x0 - m && x < g.x1 + m && z > g.z0 - m && z < g.z1 + m;
    for (let i = 0; i < pa.count; i++) {
      const x = pa.getX(i), z = pa.getZ(i);
      pa.setY(i, terrainH(x, z)); uv.setXY(i, x / 6, z / 6);
      const n1 = 0.5 + 0.5 * Math.sin(x * 0.05 + Math.sin(z * 0.04) * 2) * Math.sin(z * 0.045 + Math.sin(x * 0.03));
      c.copy(grass).lerp(dry, 0.25 + 0.5 * n1 * smooth(Math.hypot(x, z) / 160));
      const yard = Math.max(smooth(1 - Math.hypot((x - HOUSE_A[0]) / 16, (z - HOUSE_A[2] - 8) / 14)), smooth(1 - Math.hypot((x - HOUSE_B[0]) / 16, (z - HOUSE_B[2] - 8) / 14)));
      c.lerp(earth, 0.75 * yard);
      if (inRect(x, z, GARDEN_A, 0.5) || inRect(x, z, GARDEN_B, 0.5)) c.copy(soil);
      c.offsetHSL(0, 0, (r() - 0.5) * 0.03);
      col.set([c.r, c.g, c.b], i * 3);
    }
    tg.setAttribute("color", new THREE.BufferAttribute(col, 3));
    tg.computeVertexNormals();
    const ground = new THREE.Mesh(tg, lam("aulGround", () => ({ map: groundDetail(), vertexColors: true })));
    ground.receiveShadow = true; ground.matrixAutoUpdate = false; R.add(ground);

    // ---- far mountains (snow caps by vertex colour) ----
    {
      const mr = rng(9), list: THREE.BufferGeometry[] = [];
      for (let k = 0; k < 9; k++) {
        const g = new THREE.IcosahedronGeometry(1, 3), p = g.attributes.position as THREE.BufferAttribute;
        const w = 260 + mr() * 220, h = 160 + mr() * 160, x = -1100 + k * 270 + (mr() - 0.5) * 120, z = -900 - mr() * 300;
        const cc = new Float32Array(p.count * 3), rock = new THREE.Color("#6f7f9c"), snow = new THREE.Color("#f4f6fa"), cl = new THREE.Color();
        for (let i = 0; i < p.count; i++) {
          let px = p.getX(i), py = p.getY(i), pz = p.getZ(i);
          const nn = 1 + 0.18 * Math.sin(px * 5 + k) * Math.cos(pz * 4 + k * 2) + 0.08 * Math.sin(py * 9);
          px *= nn; pz *= nn; py = Math.max(0, py) * nn;
          p.setXYZ(i, x + px * w, py * h - 8, z + pz * w * 0.6);
          cl.copy(rock).lerp(snow, smooth((py - 0.62) / 0.12)); cc.set([cl.r, cl.g, cl.b], i * 3);
        }
        g.setAttribute("color", new THREE.BufferAttribute(cc, 3)); g.computeVertexNormals();
        list.push(g.toNonIndexed());
      }
      for (const g of list) { const m = new THREE.Mesh(g, lam("mountain", () => ({ color: "#ffffff", vertexColors: true }))); m.matrixAutoUpdate = false; R.add(m); }
    }

    // ---- the aul (static batch) ----
    const b = new Batch();
    const wood = lam("wood", () => ({ map: rep(beamHD(), 1, 1) }));
    const planks = lam("planks", () => ({ map: rep(planksHD(), 1, 1) }));
    const wallA = lam("houseA", () => ({ map: houseTex("houseFront", true) })), wallS = lam("houseS", () => ({ map: houseTex("houseSide", false) }));
    const roofA = lam("roofGreen", () => ({ color: "#3f8a5a" })), roofB = lam("roofRed", () => ({ color: "#b8463a" }));
    const plaster = lam("plaster", () => ({ color: "#efe9dc" }));
    const tin = twoTone(new THREE.MeshPhongMaterial({ color: "#8a9096", specular: "#9aa0a6", shininess: 40 }), 0.15);
    for (const [hp, roof] of [[HOUSE_A, roofA], [HOUSE_B, roofB]] as const) {
      const [x, , z] = hp, w = 11, d = 7, h = 3.2;
      // front wall with door and windows faces +z; side walls textured with windows
      b.add(boxGeo(V(x - w / 2, -0.3, z - d / 2), V(x + w / 2, h, z + d / 2), 0), plaster);
      const front = new THREE.PlaneGeometry(w, h + 0.3); front.translate(x, (h - 0.3) / 2, z + d / 2 + 0.02); b.add(front, wallA);
      for (const s of [-1, 1]) { const side = new THREE.PlaneGeometry(d, h + 0.3); side.rotateY(s * Math.PI / 2); side.translate(x + s * (w / 2 + 0.02), (h - 0.3) / 2, z); b.add(side, wallS); }
      b.add(gable(w, d, h, 2.0, 0.6), roof, new THREE.Matrix4().makeTranslation(x, 0, z));
      b.add(boxGeo(V(x - 0.9, 0, z + d / 2), V(x + 0.9, 0.22, z + d / 2 + 1.1)), plaster); // door step
      b.add(cyl(0.3, 1.6, 8), tin, new THREE.Matrix4().makeTranslation(x + 3, h + 1.0, z - 1));
      // barn behind, haystack, bench
      b.add(boxGeo(V(x - 4 + Math.sign(x) * 6, 0, z - 12), V(x + 4 + Math.sign(x) * 6, 2.8, z - 7), 3), planks);
      b.add(boxGeo(V(x - 4.3 + Math.sign(x) * 6, 2.8, z - 12.3), V(x + 4.3 + Math.sign(x) * 6, 3.0, z - 6.7)), tin);
      b.add(boxGeo(V(x - 2, 0.42, z + d / 2 + 2.4), V(x + 0.4, 0.5, z + d / 2 + 2.9)), wood);
      for (const dx of [-1.8, 0.2]) b.add(boxGeo(V(x + dx, 0, z + d / 2 + 2.45), V(x + dx + 0.1, 0.42, z + d / 2 + 2.85)), wood);
    }
    // the fence: planks with small gaps and two rails, along x = 0
    {
      const n = Math.floor((FENCE.z1 - FENCE.z0) / 0.17), g = boxGeo(V(-0.035, 0, -0.065), V(0.035, FENCE.h, 0.065), 0);
      const fence = new THREE.InstancedMesh(g, wood, n), q = new THREE.Quaternion();
      for (let i = 0; i < n; i++) {
        const z = FENCE.z0 + i * 0.17, hh = 1 + 0.04 * Math.sin(i * 2.3);
        fence.setMatrixAt(i, new THREE.Matrix4().compose(V(FENCE.x, 0, z), q, V(1, hh, 1)));
      }
      fence.castShadow = true; fence.receiveShadow = true; R.add(fence);
      for (const y of [0.35, 1.05]) b.add(boxGeo(V(-0.1, y, FENCE.z0), V(-0.035, y + 0.09, FENCE.z1)), wood);
      for (let z = FENCE.z0; z <= FENCE.z1; z += 3) b.add(boxGeo(V(-0.09, 0, z - 0.06), V(0.09, FENCE.h + 0.12, z + 0.06)), wood);
    }
    // the тапшан: platform, rug, pillows, blanket
    {
      const [x, , z] = TAPSHAN;
      b.add(boxGeo(V(x - 1.2, 0.42, z - 1.0), V(x + 1.2, 0.52, z + 1.0), 1), planks);
      for (const [dx, dz] of [[-1.1, -0.9], [1.1, -0.9], [-1.1, 0.9], [1.1, 0.9]]) b.add(boxGeo(V(x + dx - 0.06, 0, z + dz - 0.06), V(x + dx + 0.06, 0.42, z + dz + 0.06)), wood);
      b.add(boxGeo(V(x - 1.12, 0.52, z - 0.92), V(x + 1.12, 0.56, z + 0.92), 0), lam("rug", () => ({ map: rugTex() })));
      for (const dx of [-0.75, 0.75]) { const pl = new THREE.CylinderGeometry(0.16, 0.16, 0.7, 12); pl.rotateX(Math.PI / 2); pl.translate(x + dx, 0.72, z - 0.75); b.add(pl, lam("pillow", () => ({ color: "#2f6fb0" }))); }
    }
    // haystacks
    for (const [hx, , hz] of [HAY_A, HAY_B]) { const hg = new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2); hg.scale(2.3, 2.4, 2.0); hg.translate(hx, 0, hz); b.add(hg, lam("hay", () => ({ map: hayTex() }))); }
    // poplars around the aul
    {
      const pr = rng(4), trunk = lam("trunk", () => ({ color: "#7a5a3c" })), leaf = lam("poplar", () => ({ color: "#5e9a48" }));
      for (const [x, z] of [[-34, -22], [-30, -6], [33, -24], [36, -8], [-40, 14], [42, 12], [-6, -30], [8, -32]]) {
        const h = 9 + pr() * 4;
        b.add(cyl(0.22, 2.2, 8), trunk, new THREE.Matrix4().makeTranslation(x, 0, z));
        const cr = new THREE.SphereGeometry(1, 14, 10); cr.scale(1.5, h * 0.42, 1.5); cr.translate(x, 2.0 + h * 0.4, z); b.add(cr, leaf);
      }
    }
    b.build(R);

    // ---- gardens: neat rows (instanced) with small weeds hiding between them ----
    {
      const gr = rng(17), bush: THREE.Matrix4[] = [], weed: THREE.Matrix4[] = [], q = new THREE.Quaternion();
      for (const G of [GARDEN_A, GARDEN_B]) for (let x = G.x0 + 0.8; x < G.x1; x += 1.4) for (let z = G.z0 + 0.4; z < G.z1; z += 0.55) {
        const s = 0.32 + gr() * 0.1;
        bush.push(new THREE.Matrix4().compose(V(x, s * 0.75, z), q, V(s, s * 0.8, s)));
        if (gr() < 0.35) weed.push(new THREE.Matrix4().compose(V(x + 0.7 * (gr() > 0.5 ? 1 : -1), 0.26, z + (gr() - 0.5) * 0.3), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, gr() * 6, (gr() - 0.5) * 0.4)), V(0.13, 0.52, 0.13)));
      }
      for (let k = 0; k < 26; k++) { // the close-up patch (shot 13b looks at 18.2, 13.6)
        const a = k * 2.4, rr = 0.25 + 0.09 * k;
        weed.push(new THREE.Matrix4().compose(V(18.2 + Math.cos(a) * rr, 0.24, 13.6 + Math.sin(a) * rr * 0.8), new THREE.Quaternion().setFromEuler(new THREE.Euler((gr() - 0.5) * 0.5, gr() * 6, (gr() - 0.5) * 0.5)), V(0.11, 0.5 + 0.2 * gr(), 0.11)));
      }
      const bm = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), lam("gardenLeaf", () => ({ color: "#4f9a3a" })), bush.length);
      const wm = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 4), lam("weed", () => ({ color: "#8a7428" })), weed.length);
      bush.forEach((m, i) => bm.setMatrixAt(i, m)); weed.forEach((m, i) => wm.setMatrixAt(i, m));
      for (const im of [bm, wm]) { im.castShadow = true; im.receiveShadow = true; R.add(im); }
    }

    // ---- night window glow (unlit warm quads on the house fronts) ----
    const glowM = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.6, 0.8) });
    for (const [x, , z] of [HOUSE_A, HOUSE_B]) for (const dx of [-3.7, 3.0]) {
      const q2 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.1), glowM);
      q2.position.set(x + dx + 0.3, 1.5, z + 3.5 + 0.04); q2.layers.set(NOINK); q2.visible = false;
      this.glow.push(q2); R.add(q2);
    }
  }

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
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = c.near ?? 0.3; cam.far = 4000; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    const K = LOOK[s.light], sunDir = this.shotSun(id, s, L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    let Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 140);
    if (s.light === "golden") Rr = Math.max(Rr, 24);
    this.sun.position.copy(focus).addScaledVector(sunDir, 400); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 900; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    const fk = s.fogK ?? 1;
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear * fk; this.fog.far = L.fogFar * fk * 1.6;
    scene.fog = this.fog; scene.background = null;
    // sun disc (golden) or the moon (night)
    const showSun = s.light !== "day";
    this.sunDisc.visible = this.sunHalo.visible = showSun;
    if (showSun) {
      const moon = s.light === "night";
      this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 2400);
      this.sunDisc.scale.setScalar(2 * 2400 * Math.tan(THREE.MathUtils.degToRad(moon ? 2.4 : 1.7)));
      (this.sunDisc.material as THREE.SpriteMaterial).color.setRGB(moon ? 1.6 : 6.0, moon ? 1.55 : 4.4, moon ? 1.35 : 2.4);
      this.sunHalo.position.copy(this.sunDisc.position); this.sunHalo.scale.setScalar(2 * 2400 * Math.tan(THREE.MathUtils.degToRad(moon ? 10 : 24)));
      (this.sunHalo.material as THREE.SpriteMaterial).color.set(L.sunDisc).multiplyScalar(moon ? 0.5 : 1.3);
    }
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i], mat = m.material as THREE.MeshBasicMaterial;
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
      mat.map = this.cloudMaps[s.light][i % 4];
    }
    for (const g of this.glow) g.visible = s.light === "night";

    // ---- cast + effects ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const st = stage(id, f, { pos: cam.position, right, sun: sunDir });
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5 * sc2))) continue;
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
    void t;
    return focus;
  }
}
