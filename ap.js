import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/*
  Cosmic Birthday Date
  --------------------
  Pure procedural 3D: no image assets required.
  The world is intentionally cinematic/stylized rather than a scientific simulator.
  Research-backed factual anchors live in RESEARCH and are shown in the Facts modal.
*/

const GIFT = {
  name: "Darling",
  message:
    "Out of every star, every road, every city and every possible universe, " +
    "this is still the one where I would choose you. Happy Birthday."
};

const RESEARCH = {
  galaxy: {
    title: "Milky Way",
    points: [
      "The Milky Way is a barred spiral galaxy containing hundreds of billions of stars.",
      "The Solar System sits in the Orion Arm / Orion Spur, between the Sagittarius and Perseus arms.",
      "The Galactic Center is about 26,000 light-years away and contains the supermassive black hole Sagittarius A*.",
      "NASA describes the galaxy as containing enormous quantities of gas, dust and dark matter; dense central regions also contain massive star clusters."
    ],
    source: "NASA Science — Milky Way Center, Milky Way Bulge, Solar System Facts"
  },
  solar: {
    title: "Solar System",
    points: [
      "The Solar System has one star, eight planets, five officially named dwarf planets, hundreds of moons, and thousands of asteroids and comets.",
      "Planet order outward from the Sun: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.",
      "Earth is the third planet from the Sun at about 149.7 million km (1 AU).",
      "The Solar System formed about 4.6 billion years ago from a dense cloud of gas and dust."
    ],
    source: "NASA Science — Solar System Facts; Planet Sizes and Locations"
  },
  india: {
    title: "India",
    points: [
      "India's mainland can be thought of in four major physical regions: the great mountain zone, the Ganga–Indus plains, the desert region, and the southern peninsula.",
      "The virtual India layer uses stylized terrain and major river/region cues rather than pretending to be a survey-grade GIS model."
    ],
    source: "National Portal of India — Physical Features"
  },
  indore: {
    title: "Indore",
    points: [
      "Indore is on the Malwa Plateau at about 553 m above sea level.",
      "The city lies on the banks of the Saraswati and Khan rivulets.",
      "Official district tourism highlights Rajwada, Lalbagh Palace, Kanch Mandir, Khajrana Temple and other sites."
    ],
    source: "District Indore, Government of Madhya Pradesh — About District / Tourist Places"
  },
  patna: {
    title: "Patna",
    points: [
      "Patna is strongly associated with the Ganga riverfront and a very deep historical layer including Pataliputra.",
      "Golghar was built in 1786 as a granary; the Bihar tourism portal gives its height as 29 m and notes its 145-step spiral staircase.",
      "Other official tourism highlights include Gandhi Ghat, Takht Sri Patna Sahib, Kumhrar, Gandhi Maidan, Bapu Tower and more."
    ],
    source: "District Patna, Government of Bihar; Bihar Tourism"
  }
};

const ZONES = [
  { id: "galaxy", label: "Galaxy", title: "Somewhere in the Milky Way",
    copy: "A journey that starts roughly 26,000 light-years from our galaxy's center." },
  { id: "solar", label: "Solar System", title: "Then, home",
    copy: "Eight planets, one Sun — and one tiny blue world that matters very much to us." },
  { id: "earth", label: "Earth", title: "One planet, many countries",
    copy: "Continents, oceans, cities and millions of individual stories." },
  { id: "india", label: "India", title: "A whole country in one breath",
    copy: "Mountains, plains, peninsula, rivers, lights, food and roads." },
  { id: "city", label: "The Cities", title: "Where our date becomes real",
    copy: "Pick Indore or Patna. Then walk together to the little café waiting at the end." }
];

const state = {
  zoneIndex: 0,
  city: "indore",
  running: true,
  sound: true,
  gameActive: false,
  score: 0,
  starsToCollect: 5,
  collected: 0,
  complete: false,
  elapsed: 0
};

const THREE_NS = THREE;

// Renderer -----------------------------------------------------------
const canvas = document.querySelector("#scene");
const renderer = new THREE_NS.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE_NS.SRGBColorSpace;
renderer.toneMapping = THREE_NS.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE_NS.PCFSoftShadowMap;

const scene = new THREE_NS.Scene();
scene.fog = new THREE_NS.FogExp2(0x070914, 0.0022);

const camera = new THREE_NS.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.05, 8000);
camera.position.set(0, 28, 72);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 2;
controls.maxDistance = 5000;
controls.enabled = true;

const root = new THREE_NS.Group();
scene.add(root);

const ambience = new THREE_NS.Group();
root.add(ambience);

const layers = {};
for (const z of ZONES) {
  layers[z.id] = new THREE_NS.Group();
  root.add(layers[z.id]);
  layers[z.id].visible = false;
}

// Utility ------------------------------------------------------------
const clock = new THREE_NS.Clock();
const tmpV = new THREE_NS.Vector3();
const tmpV2 = new THREE_NS.Vector3();

function mat(color, roughness = 0.65, metalness = 0, emissive = 0x000000, eIntensity = 0) {
  return new THREE_NS.MeshStandardMaterial({
    color, roughness, metalness, emissive, emissiveIntensity: eIntensity
  });
}
function glowMat(color, intensity = 3) {
  return new THREE_NS.MeshBasicMaterial({ color, transparent: true, opacity: 0.88, blending: THREE_NS.AdditiveBlending, depthWrite: false });
}
function addGlowSphere(parent, radius, color, position, scale = 1) {
  const g = new THREE_NS.Group();
  const core = new THREE_NS.Mesh(new THREE_NS.SphereGeometry(radius, 18, 18), mat(color, .5, .1, color, 1.2));
  const halo = new THREE_NS.Mesh(new THREE_NS.SphereGeometry(radius * 2.3, 18, 18), glowMat(color));
  g.add(core, halo);
  g.position.copy(position);
  g.scale.setScalar(scale);
  parent.add(g);
  return g;
}
function makeStars(parent, count, radius, spread = 1, colors = [0xffffff, 0x9fd8ff, 0xffcba1]) {
  const positions = new Float32Array(count * 3);
  const cols = new Float32Array(count * 3);
  const colorObjs = colors.map(c => new THREE_NS.Color(c));
  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = radius * Math.pow(Math.random(), .45) * spread;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    const c = colorObjs[(Math.random() * colorObjs.length) | 0];
    cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
  }
  const geo = new THREE_NS.BufferGeometry();
  geo.setAttribute("position", new THREE_NS.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE_NS.BufferAttribute(cols, 3));
  const pm = new THREE_NS.PointsMaterial({
    size: radius > 100 ? .65 : .14, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: .92, depthWrite: false
  });
  const pts = new THREE_NS.Points(geo, pm);
  parent.add(pts);
  return pts;
}

// Lighting -----------------------------------------------------------
const key = new THREE_NS.DirectionalLight(0xffffff, 2.1);
key.position.set(60, 110, 30);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
scene.add(key);
scene.add(new THREE_NS.HemisphereLight(0x9bbcff, 0x06070d, 0.7));

// Galaxy -------------------------------------------------------------
function buildGalaxy() {
  const g = layers.galaxy;
  makeStars(g, 5200, 3000, 1, [0xffffff, 0xb9cfff, 0xffd5aa, 0x9fe7ff]);

  const starCount = 18000;
  const pos = new Float32Array(starCount * 3);
  const col = new Float32Array(starCount * 3);
  const cc = [0xffffff, 0xd6e7ff, 0xffb98a, 0x9ce6ff, 0xf4bfff].map(c => new THREE_NS.Color(c));
  for (let i = 0; i < starCount; i++) {
    const arm = i % 4;
    const r = 35 + Math.pow(Math.random(), .7) * 1550;
    const t = (r / 1550) * Math.PI * 4.5 + (arm * Math.PI / 2) + (Math.random() - .5) * 0.34;
    const thickness = 55 * (1 - r / 1750) + 8;
    pos[i*3] = Math.cos(t) * r + (Math.random() - .5) * thickness;
    pos[i*3+1] = (Math.random() - .5) * (thickness * .16);
    pos[i*3+2] = Math.sin(t) * r + (Math.random() - .5) * thickness;
    const c = cc[(Math.random() * cc.length) | 0];
    col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
  }
  const geo = new THREE_NS.BufferGeometry();
  geo.setAttribute("position", new THREE_NS.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE_NS.BufferAttribute(col, 3));
  const pts = new THREE_NS.Points(geo, new THREE_NS.PointsMaterial({
    size: 1.7, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: .8, depthWrite: false
  }));
  g.add(pts);

  const bulge = addGlowSphere(g, 70, 0xff9f4a, new THREE_NS.Vector3(0, 0, 0), 1.9);
  bulge.userData.tag = "galactic-bulge";

  const bh = new THREE_NS.Group();
  const horizon = new THREE_NS.Mesh(
    new THREE_NS.SphereGeometry(24, 36, 36),
    new THREE_NS.MeshBasicMaterial({ color: 0x010102 })
  );
  const disk = new THREE_NS.Mesh(
    new THREE_NS.TorusGeometry(40, 4.5, 16, 120),
    new THREE_NS.MeshStandardMaterial({ color: 0xffb25a, emissive: 0xff5a19, emissiveIntensity: 4, roughness: .3, metalness: .05 })
  );
  disk.rotation.x = Math.PI / 2.0;
  bh.add(horizon, disk);
  bh.position.set(0, 2, 0);
  g.add(bh);

  // Nebulae + clusters: layered translucent blobs.
  const nebulae = [
    { p:[280,18,-170], s:85, c:0x8f54ff },
    { p:[-420,-8,220], s:120, c:0x42d9ff },
    { p:[650,24,180], s:95, c:0xff5aa5 },
    { p:[-780,5,-100], s:150, c:0x6355ff },
  ];
  for (const n of nebulae) {
    const neb = new THREE_NS.Mesh(
      new THREE_NS.SphereGeometry(n.s, 32, 32),
      new THREE_NS.MeshBasicMaterial({ color:n.c, transparent:true, opacity:.05, blending:THREE_NS.AdditiveBlending, depthWrite:false })
    );
    neb.position.set(...n.p);
    g.add(neb);
  }

  for (let k = 0; k < 12; k++) {
    const cluster = new THREE_NS.Group();
    const center = new THREE_NS.Vector3(
      (Math.random() - .5) * 1200, (Math.random() - .5) * 90, (Math.random() - .5) * 1200
    );
    for (let i = 0; i < 65; i++) {
      const p = new THREE_NS.Vector3(
        (Math.random() - .5) * 32,
        (Math.random() - .5) * 18,
        (Math.random() - .5) * 32
      ).add(center);
      const s = new THREE_NS.Mesh(new THREE_NS.SphereGeometry(.8 + Math.random()*.8, 8, 8), glowMat(0xaedbff));
      s.position.copy(p);
      cluster.add(s);
    }
    g.add(cluster);
  }
}
buildGalaxy();

// Solar system -------------------------------------------------------
const PLANETS = [
  ["Mercury", .28, 6, 0x9a8f84],
  ["Venus", .55, 9, 0xd6aa76],
  ["Earth", .58, 13, 0x2d7de7],
  ["Mars", .38, 17, 0xb54b36],
  ["Jupiter", 1.45, 24, 0xd6a16b],
  ["Saturn", 1.2, 31, 0xd9bd7a],
  ["Uranus", .78, 39, 0x7bd8dc],
  ["Neptune", .76, 47, 0x3c67de]
];

function ring(parent, radius, color=0xffffff, opacity=.15) {
  const pts = [];
  for (let i = 0; i <= 128; i++) {
    const a = i/128*Math.PI*2;
    pts.push(new THREE_NS.Vector3(Math.cos(a)*radius, 0, Math.sin(a)*radius));
  }
  const geo = new THREE_NS.BufferGeometry().setFromPoints(pts);
  const line = new THREE_NS.LineLoop(geo, new THREE_NS.LineBasicMaterial({color, transparent:true, opacity}));
  parent.add(line);
  return line;
}
function buildSolar() {
  const g = layers.solar;
  makeStars(g, 2500, 1500, 1, [0xffffff, 0xb8d7ff, 0xffd0a8]);
  addGlowSphere(g, 2.7, 0xff9d32, new THREE_NS.Vector3(0, 0, 0), 1.8);

  const systemGroup = new THREE_NS.Group();
  g.add(systemGroup);
  for (const [name, size, orbit, color] of PLANETS) {
    ring(systemGroup, orbit, 0xc8d5ff, .1);
    const p = new THREE_NS.Group();
    const sphere = new THREE_NS.Mesh(new THREE_NS.SphereGeometry(size, 24, 24), mat(color, .8, .05, color, name === "Earth" ? .05 : 0));
    p.add(sphere);
    if (name === "Saturn") {
      const r = new THREE_NS.Mesh(new THREE_NS.RingGeometry(1.8, 3.0, 64), new THREE_NS.MeshBasicMaterial({
        color:0xf5d6ad, side:THREE_NS.DoubleSide, transparent:true, opacity:.82
      }));
      r.rotation.x = Math.PI / 2;
      p.add(r);
    }
    p.position.x = orbit;
    p.userData.name = name;
    systemGroup.add(p);
  }
  const label = makeTextSprite("EARTH — third planet", 0x9ff4ff, 30);
  label.position.set(13, 3.2, 0);
  systemGroup.add(label);
}
function makeTextSprite(text, color = 0xffffff, size = 32) {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 128;
  const ctx = c.getContext("2d");
  ctx.font = `700 ${size}px Inter, sans-serif`;
  ctx.fillStyle = `#${new THREE_NS.Color(color).getHexString()}`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, 512, 64);
  const tex = new THREE_NS.CanvasTexture(c);
  tex.colorSpace = THREE_NS.SRGBColorSpace;
  const sprite = new THREE_NS.Sprite(new THREE_NS.SpriteMaterial({map:tex, transparent:true, depthWrite:false}));
  sprite.scale.set(18, 2.25, 1);
  return sprite;
}
buildSolar();

// Earth --------------------------------------------------------------
function buildEarth() {
  const g = layers.earth;
  makeStars(g, 1800, 1000, 1, [0xffffff, 0xb7d4ff]);
  const earth = new THREE_NS.Group();
  earth.position.set(0,0,0);
  g.add(earth);
  const sphere = new THREE_NS.Mesh(
    new THREE_NS.SphereGeometry(24, 72, 72),
    mat(0x2b73cf, .82, .05, 0x061d3f, .25)
  );
  earth.add(sphere);
  const clouds = new THREE_NS.Mesh(
    new THREE_NS.SphereGeometry(24.55, 72, 72),
    new THREE_NS.MeshBasicMaterial({color:0xdfefff, transparent:true, opacity:.08, blending:THREE_NS.AdditiveBlending, depthWrite:false})
  );
  earth.add(clouds);

  // Stylized continent patches, enough to communicate the globe layer.
  const land = [
    {x:-.18,y:.12,sx:.32,sy:.23,c:0x4f9b5b},
    {x:.12,y:.18,sx:.24,sy:.28,c:0x6eaa63},
    {x:.28,y:-.08,sx:.16,sy:.2,c:0x5b8c53},
    {x:-.42,y:-.2,sx:.2,sy:.32,c:0x769456},
    {x:.45,y:.27,sx:.14,sy:.18,c:0x4d8758}
  ];
  for (const d of land) {
    const patch = new THREE_NS.Mesh(
      new THREE_NS.CircleGeometry(7, 28),
      new THREE_NS.MeshBasicMaterial({color:d.c, transparent:true, opacity:.8, side:THREE_NS.DoubleSide})
    );
    patch.scale.set(d.sx, d.sy, 1);
    const lat = d.y * Math.PI * .8;
    const lon = d.x * Math.PI;
    patch.position.set(
      24.1 * Math.cos(lat) * Math.sin(lon),
      24.1 * Math.sin(lat),
      24.1 * Math.cos(lat) * Math.cos(lon)
    );
    patch.lookAt(patch.position.clone().multiplyScalar(2));
    earth.add(patch);
  }

  const indiaMarker = addGlowSphere(g, .9, 0xffd27a, new THREE_NS.Vector3(11.6, 5.8, 20.6), 1.1);
  indiaMarker.add(makeTextSprite("INDIA", 0xffe5b0, 26));
  indiaMarker.children[2].position.set(0, 2.3, 0);
}
buildEarth();

// India --------------------------------------------------------------
const INDIA_OUTLINE = [
  [78.0, 35.0], [81.5, 32.5], [88.5, 30.5], [91.0, 27.5], [97.0, 27.2],
  [95.0, 23.5], [93.0, 22.0], [92.0, 19.0], [88.5, 21.0], [86.5, 22.5],
  [84.0, 22.0], [82.5, 24.0], [80.5, 22.0], [78.5, 19.0], [77.0, 17.0],
  [76.0, 13.0], [74.0, 9.5], [72.5, 12.5], [70.0, 15.5], [68.5, 20.5],
  [70.5, 23.0], [68.5, 25.8], [72.5, 29.0], [75.0, 32.2]
];
function buildIndia() {
  const g = layers.india;
  const backdrop = new THREE_NS.Mesh(new THREE_NS.PlaneGeometry(180, 120), new THREE_NS.MeshBasicMaterial({color:0x071c2c}));
  backdrop.position.z = -30; backdrop.rotation.x = 0; g.add(backdrop);

  // Stylized India silhouette from a geodetic-looking lat/lon trace.
  const pts = INDIA_OUTLINE.map(([lon,lat]) => {
    const x = (lon - 82) * 4.2;
    const z = (28 - lat) * 4.0;
    return new THREE_NS.Vector3(x, 0, z);
  });
  const shape = new THREE_NS.Shape();
  shape.moveTo(pts[0].x, pts[0].z);
  for (let i=1;i<pts.length;i++) shape.lineTo(pts[i].x, pts[i].z);
  shape.closePath();
  const geo = new THREE_NS.ExtrudeGeometry(shape, {depth:1.6, bevelEnabled:true, bevelSegments:2, bevelSize:.7, bevelThickness:.35});
  geo.rotateX(-Math.PI/2);
  const mesh = new THREE_NS.Mesh(geo, mat(0x1f7b69, .85, .15, 0x053f34, .2));
  mesh.position.y = -2;
  g.add(mesh);

  // Terrain bands: Himalayas, plains, peninsula.
  const terrain = [
    {x:5,z:-18,w:58,d:8,c:0xc2d5e6},
    {x:2,z:-3,w:62,d:18,c:0x3f9b74},
    {x:-4,z:20,w:48,d:28,c:0x6c9b55},
  ];
  for (const t of terrain) {
    const m = new THREE_NS.Mesh(new THREE_NS.BoxGeometry(t.w,1,t.d), mat(t.c,.96));
    m.position.set(t.x,-3.1,t.z); g.add(m);
  }

  // Major river cues.
  const riverPts = [
    new THREE_NS.Vector3(-34,-1,-5), new THREE_NS.Vector3(-20,-1,-7),
    new THREE_NS.Vector3(-4,-1,-8), new THREE_NS.Vector3(13,-1,-4),
    new THREE_NS.Vector3(32,-1,-1)
  ];
  const curve = new THREE_NS.CatmullRomCurve3(riverPts);
  const river = new THREE_NS.Mesh(
    new THREE_NS.TubeGeometry(curve, 80, .55, 8, false),
    new THREE_NS.MeshBasicMaterial({color:0x4aa7d8, transparent:true, opacity:.8})
  );
  g.add(river);

  addCityMarker(g, "INDORE", -1, 19, 0xff8fbe);
  addCityMarker(g, "PATNA", 14, -11, 0x84dcff);
  addCityMarker(g, "NEW DELHI", 1, -21, 0xffd37d);

  g.add(makeTextSprite("INDIA — stylized terrain / city layer", 0xe9f6ff, 28)).position.set(0,10,20);
}
function addCityMarker(parent, label, x, z, color) {
  const m = addGlowSphere(parent, .9, color, new THREE_NS.Vector3(x,0,z), 1);
  const s = makeTextSprite(label, color, 24);
  s.position.set(0,2.4,0); m.add(s);
}
buildIndia();

// Street world -------------------------------------------------------
const street = {
  group: layers.city,
  colliders: [],
  buildings: [],
  pickups: [],
  hazards: [],
  couple: null,
  cityRoots: {},
  cityData: {
    indore: {
      title: "Indore after blue hour",
      subtitle: "Malwa Plateau • Rajwada lights • café streets",
      color: 0xff7fb8
    },
    patna: {
      title: "Patna after blue hour",
      subtitle: "Ganga breeze • Golghar silhouette • riverfront lights",
      color: 0x7fd8ff
    }
  }
};

function boxCollider(x,z,w,d,label="") {
  return {minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,label};
}
function collidesCircle(x,z,r, list=street.colliders) {
  return list.some(c => {
    const cx = Math.max(c.minX, Math.min(x,c.maxX));
    const cz = Math.max(c.minZ, Math.min(z,c.maxZ));
    const dx = x-cx, dz = z-cz;
    return dx*dx+dz*dz < r*r;
  });
}
function createBuilding(parent, x,z,w,d,h,color,label) {
  const b = new THREE_NS.Group();
  const base = new THREE_NS.Mesh(new THREE_NS.BoxGeometry(w,h,d), mat(color,.92));
  base.position.y = h/2; base.castShadow = true; base.receiveShadow = true;
  b.add(base);

  const roof = new THREE_NS.Mesh(
    new THREE_NS.BoxGeometry(w*1.03,.35,d*1.03),
    mat(0x1a1f2f,.78,.15)
  );
  roof.position.y = h+.2; b.add(roof);

  const rows = Math.max(1,Math.floor(h/2.5));
  const cols = Math.max(2,Math.floor(w/2.5));
  for (let ry=0;ry<rows;ry++) {
    for (let cx=0;cx<cols;cx++) {
      const wm = new THREE_NS.Mesh(
        new THREE_NS.BoxGeometry(.48,.65,.07),
        new THREE_NS.MeshBasicMaterial({color:(Math.random()>.35?0xffd782:0x6ca2ff),transparent:true,opacity:.72})
      );
      wm.position.set(-w/2+1.15+cx*2.3,.9+ry*2.2,-d/2-.045);
      b.add(wm);
    }
  }
  b.position.set(x,0,z);
  parent.add(b);
  street.colliders.push(boxCollider(x,z,w+.8,d+.8,label));
  street.buildings.push({group:b, x,z,w,d,h,label});
  return b;
}
function createStreetLight(parent, x,z) {
  const g = new THREE_NS.Group();
  const pole = new THREE_NS.Mesh(new THREE_NS.CylinderGeometry(.07,.1,4.8,10), mat(0x252b35,.75,.7));
  pole.position.y=2.4;
  g.add(pole);
  const head = addGlowSphere(g,.16,0xffd58d,new THREE_NS.Vector3(0,4.75,0),1);
  const light = new THREE_NS.PointLight(0xffb85f, 2.4, 14, 2);
  light.position.set(0,4.4,0); g.add(light);
  g.position.set(x,0,z); parent.add(g);
}
function createTree(parent, x,z) {
  const g = new THREE_NS.Group();
  const trunk = new THREE_NS.Mesh(new THREE_NS.CylinderGeometry(.18,.24,2,8), mat(0x553a27,.9));
  trunk.position.y=1; g.add(trunk);
  const crown = new THREE_NS.Mesh(new THREE_NS.IcosahedronGeometry(1.55,1), mat(0x2e7754,.95));
  crown.position.y=2.55; crown.castShadow=true; g.add(crown);
  g.position.set(x,0,z); parent.add(g);
}
function createCar(parent, x,z, color) {
  const g=new THREE_NS.Group();
  const body=new THREE_NS.Mesh(new THREE_NS.BoxGeometry(2.5,.65,1.15),mat(color,.62,.18));
  body.position.y=.75; g.add(body);
  const cabin=new THREE_NS.Mesh(new THREE_NS.BoxGeometry(1.25,.55,.95),mat(0x24324a,.32,.1));
  cabin.position.set(.15,1.25,0); g.add(cabin);
  for(const sx of [-.88,.88]) for(const sz of [-.58,.58]) {
    const wheel=new THREE_NS.Mesh(new THREE_NS.CylinderGeometry(.25,.25,.18,16),mat(0x111318,.4));
    wheel.rotation.z=Math.PI/2; wheel.position.set(sx,.42,sz); g.add(wheel);
  }
  g.position.set(x,0,z); parent.add(g);
}
function createDog(parent,x,z) {
  const g=new THREE_NS.Group();
  const body=new THREE_NS.Mesh(new THREE_NS.BoxGeometry(1.1,.55,.45),mat(0x8a5b3b,.8));
  body.position.y=.65; g.add(body);
  const head=new THREE_NS.Mesh(new THREE_NS.SphereGeometry(.38,14,14),mat(0x9d6d47,.8));
  head.position.set(.65,.85,0); g.add(head);
  const ear=new THREE_NS.Mesh(new THREE_NS.ConeGeometry(.14,.38,8),mat(0x5f3d2a,.85));
  ear.position.set(.72,1.18,-.2); g.add(ear);
  g.position.set(x,0,z); parent.add(g);
  return g;
}
function createCat(parent,x,z) {
  const g=new THREE_NS.Group();
  const body=new THREE_NS.Mesh(new THREE_NS.SphereGeometry(.45,16,16),mat(0x81889a,.9));
  body.scale.set(1.15,.75,.8); body.position.y=.55; g.add(body);
  const head=new THREE_NS.Mesh(new THREE_NS.SphereGeometry(.35,16,16),mat(0x8f96a9,.9));
  head.position.set(.35,.8,0); g.add(head);
  for(const dz of [-.16,.16]){
    const ear=new THREE_NS.Mesh(new THREE_NS.ConeGeometry(.12,.25,6),mat(0x6a7081,.9));
    ear.position.set(.42,1.08,dz); g.add(ear);
  }
  g.position.set(x,0,z); parent.add(g);
  return g;
}
function createCafe(parent,x,z,theme) {
  const g=new THREE_NS.Group();
  const base=new THREE_NS.Mesh(new THREE_NS.BoxGeometry(9,5.5,7),mat(theme.wall,.88));
  base.position.y=2.75; base.castShadow=true; g.add(base);
  const awning=new THREE_NS.Mesh(new THREE_NS.BoxGeometry(9.6,.7,2.2),mat(theme.awning,.7,.1));
  awning.position.set(0,5.35,-4.2); g.add(awning);
  for(let i=-3;i<=3;i+=2){
    const lamp=addGlowSphere(g,.13,theme.light,new THREE_NS.Vector3(i,4.7,-4.7),1);
    const pl=new THREE_NS.PointLight(theme.light,1.3,8,2);
    pl.position.set(i,4.4,-4.2); g.add(pl);
  }
  const sign=makeTextSprite(theme.sign,theme.light,24);
  sign.scale.set(7.5,1,1); sign.position.set(0,6.15,-4.35); g.add(sign);
  const door=new THREE_NS.Mesh(new THREE_NS.BoxGeometry(1.3,2.7,.16),mat(0x172130,.45,.2));
  door.position.set(0,1.55,-3.57); g.add(door);
  // Tables + chairs, with a coffee cup on each.
  for(const tx of [-2.6,2.6]){
    const table=new THREE_NS.Mesh(new THREE_NS.CylinderGeometry(.75,.75,.12,18),mat(0x6e4a35,.8));
    table.position.set(tx,.82,-5.8); g.add(table);
    const leg=new THREE_NS.Mesh(new THREE_NS.CylinderGeometry(.08,.08,.75,10),mat(0x46352a,.9));
    leg.position.set(tx,.42,-5.8); g.add(leg);
    const cup=new THREE_NS.Mesh(new THREE_NS.CylinderGeometry(.22,.17,.38,18),mat(0xf0e7d7,.65));
    cup.position.set(tx,.98,-5.8); g.add(cup);
    const coffee=new THREE_NS.Mesh(new THREE_NS.CylinderGeometry(.13,.13,.008,18),mat(0x44271a,.9));
    coffee.position.set(tx,.18+.98,-5.8); g.add(coffee);
    const steam=new THREE_NS.Mesh(
      new THREE_NS.TorusGeometry(.14,.018,8,18,Math.PI*1.5),
      new THREE_NS.MeshBasicMaterial({color:0xe8f0ff,transparent:true,opacity:.22})
    );
    steam.rotation.x=Math.PI/2; steam.position.set(tx,1.55,-5.8); g.add(steam);
  }
  g.position.set(x,0,z); parent.add(g);
  street.colliders.push(boxCollider(x,z,10,8,"cafe"));
  return g;
}
function createLandmark(parent,type,x,z) {
  const g=new THREE_NS.Group();
  if(type==="rajwada"){
    const body= new THREE_NS.Mesh(new THREE_NS.BoxGeometry(11,4.8,8),mat(0x7b5940,.9));
    body.position.y=2.4; g.add(body);
    for(const dx of [-3.8,0,3.8]){
      const tower=new THREE_NS.Mesh(new THREE_NS.BoxGeometry(2.1,6.8,2.1),mat(0x8c6549,.85));
      tower.position.set(dx,3.4,-1.1); g.add(tower);
      const roof=new THREE_NS.Mesh(new THREE_NS.ConeGeometry(1.5,1.2,4),mat(0x2f3543,.7));
      roof.rotation.y=Math.PI/4; roof.position.set(dx,7.2,-1.1); g.add(roof);
    }
    const sign=makeTextSprite("RAJWADA",0xff9fbf,22); sign.scale.set(7,1,1); sign.position.set(0,7,-4.2); g.add(sign);
  }
  if(type==="golghar"){
    const dome=new THREE_NS.Mesh(new THREE_NS.SphereGeometry(5,32,18,0,Math.PI*2,0,Math.PI*.62),mat(0xd1a77c,.88));
    dome.scale.y=1.3; dome.position.y=4.6; g.add(dome);
    const base=new THREE_NS.Mesh(new THREE_NS.CylinderGeometry(5.1,5.1,1.4,40),mat(0xb08a65,.9));
    base.position.y=1.0; g.add(base);
    const ramp=new THREE_NS.Mesh(new THREE_NS.TorusGeometry(4.9,.25,8,72),new THREE_NS.MeshBasicMaterial({color:0x7e654e}));
    ramp.rotation.x=Math.PI/2; ramp.position.y=2.8; g.add(ramp);
    const sign=makeTextSprite("GOLGHAR",0x9fe7ff,22); sign.scale.set(7,1,1); sign.position.set(0,10.7,-1); g.add(sign);
  }
  g.position.set(x,0,z); parent.add(g);
}

function buildCity() {
  const g=layers.city;
  street.cityRoots.indore=new THREE_NS.Group();
  street.cityRoots.patna=new THREE_NS.Group();
  g.add(street.cityRoots.indore, street.cityRoots.patna);

  const ind=street.cityRoots.indore; const pat=street.cityRoots.patna;
  const roadMat=mat(0x20232a,.96);
  const pavementMat=mat(0x7a7d82,.95);
  for(const root of [ind,pat]){
    const ground=new THREE_NS.Mesh(new THREE_NS.PlaneGeometry(120,100),mat(0x19211c,.96));
    ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; root.add(ground);
    const road=new THREE_NS.Mesh(new THREE_NS.PlaneGeometry(22,100),roadMat);
    road.rotation.x=-Math.PI/2; road.position.y=.02; root.add(road);
    const sidewalkL=new THREE_NS.Mesh(new THREE_NS.PlaneGeometry(9,100),pavementMat);
    sidewalkL.rotation.x=-Math.PI/2; sidewalkL.position.set(-15,.05,0); root.add(sidewalkL);
    const sidewalkR=sidewalkL.clone(); sidewalkR.position.x=15; root.add(sidewalkR);
    for(const z of [-42,-28,-14,0,14,28,42]) {
      const dash=new THREE_NS.Mesh(new THREE_NS.BoxGeometry(.35, .03, 5.5), new THREE_NS.MeshBasicMaterial({color:0xf0e7cf}));
      dash.position.set(0,.04,z); root.add(dash);
    }
    for(const z of [-42,-28,-14,0,14,28,42]) {
      createStreetLight(root,-10,z); createStreetLight(root,10,z);
    }
    for(const x of [-26,-22,22,26]) for(const z of [-38,-18,2,22,42]) {
      createTree(root,x,z);
    }
  }

  // Indore street dressing.
  street.cityRoots.indore.position.x=-85;
  createBuilding(ind,-28, -31, 10,11,12,0x28394a,"indore-building");
  createBuilding(ind,29, -24, 11,9,9,0x4f3b45,"indore-building");
  createBuilding(ind,-29, -6, 12,10,15,0x3c4558,"indore-building");
  createBuilding(ind,29, 2, 9,13,11,0x5a4750,"indore-building");
  createBuilding(ind,-28, 28, 13,11,10,0x344456,"indore-building");
  createBuilding(ind,29, 31, 11,13,14,0x493e51,"indore-building");
  createCafe(ind,0,22,{wall:0x4b2e3b,awning:0xd96da2,light:0xffcf84,sign:"MOON & CHAI"});
  createLandmark(ind,"rajwada",-44,14);
  createDog(ind,7,-8); createCat(ind,-7,9);
  createCar(ind,-5,35,0x304f80); createCar(ind,4,-32,0x7f2e4b);

  // Patna street dressing.
  street.cityRoots.patna.position.x=85;
  createBuilding(pat,-28,-31,10,11,13,0x36475a,"patna-building");
  createBuilding(pat,29,-24,12,10,10,0x58464b,"patna-building");
  createBuilding(pat,-29,-5,13,11,9,0x465143,"patna-building");
  createBuilding(pat,29,3,10,13,15,0x4e3f51,"patna-building");
  createBuilding(pat,-28,28,12,11,11,0x475368,"patna-building");
  createBuilding(pat,29,31,12,13,14,0x4a4b55,"patna-building");
  createCafe(pat,0,22,{wall:0x283e56,awning:0x4d8fca,light:0xffd98b,sign:"GANGA BREW"});
  createLandmark(pat,"golghar",-44,14);
  createDog(pat,7,-8); createCat(pat,-7,9);
  createCar(pat,-4,35,0x284c57); createCar(pat,3,-32,0x8b5a2c);

  // Ganga river strip for Patna.
  const river=new THREE_NS.Mesh(new THREE_NS.PlaneGeometry(25,100),new THREE_NS.MeshStandardMaterial({color:0x1b6a91,roughness:.2,metalness:.15,transparent:true,opacity:.9}));
  river.rotation.x=-Math.PI/2; river.position.set(-31,.08,0); pat.add(river);
  for(let z=-40;z<=40;z+=10){
    const lamp=new THREE_NS.PointLight(0xffc76c,1.0,7,2); lamp.position.set(-31,2.8,z); pat.add(lamp);
    addGlowSphere(pat,.11,0xffc76c,new THREE_NS.Vector3(-31,3,z),1);
  }

  // Birthday billboard in both cities.
  for(const root of [ind,pat]){
    const board=new THREE_NS.Mesh(new THREE_NS.BoxGeometry(12,5,0.4),mat(0x141928,.45,.1));
    board.position.set(0,8,-2); root.add(board);
    const sign=makeTextSprite("HAPPY BIRTHDAY DARLING",0xffd9ef,27);
    sign.scale.set(11,1.35,1); sign.position.set(0,8,-2.3); root.add(sign);
  }

  // Resource pickups in the date corridor; collecting all unlocks the ending.
  for(let i=0;i<state.starsToCollect;i++){
    const x=(i%2===0?-6:6), z=8-i*6;
    const star=addGlowSphere(layers.city,.35,0xffe28c,new THREE_NS.Vector3(x,-0.7,z),1);
    star.userData.kind="pickup"; star.userData.baseY=-0.7; street.pickups.push(star);
  }

  // Meteors: harmless visual hazard objects that patrol near the street skyline.
  for(let i=0;i<8;i++){
    const h=new THREE_NS.Mesh(new THREE_NS.IcosahedronGeometry(.22+Math.random()*.22,1),mat(0xa7b3c8,.95,0.05,0x73502f,.7));
    h.position.set((Math.random()-.5)*26,4+Math.random()*10,-15-Math.random()*45);
    h.userData.v=new THREE_NS.Vector3((Math.random()-.5)*.5,-.1-Math.random()*.2,.35+Math.random()*.5);
    h.userData.kind="meteor"; layers.city.add(h); street.hazards.push(h);
  }
}
buildCity();

// Couple -------------------------------------------------------------
function makeCharacter({girl=false}) {
  const c=new THREE_NS.Group();
  const skin=girl?0xe7b295:0xc98b6a;
  const hair=girl?0x2a1c20:0x202026;
  const outfit=girl?0x744f9b:0x365a84;

  const body=new THREE_NS.Mesh(new THREE_NS.CapsuleGeometry(.45,1.0,6,12),mat(outfit,.76));
  body.position.y=1.15; body.castShadow=true; c.add(body);

  const head=new THREE_NS.Mesh(new THREE_NS.SphereGeometry(.43,18,18),mat(skin,.82));
  head.position.y=2.12; head.castShadow=true; c.add(head);

  const hairCap=new THREE_NS.Mesh(new THREE_NS.SphereGeometry(.46,18,12,0,Math.PI*2,0,Math.PI*.58),mat(hair,.66));
  hairCap.position.y=2.25; c.add(hairCap);

  for(const sx of [-.22,.22]){
    const leg=new THREE_NS.Mesh(new THREE_NS.CylinderGeometry(.12,.14,.72,10),mat(outfit,.85));
    leg.position.set(sx,.32,0); leg.castShadow=true; c.add(leg);
  }

  const armL=new THREE_NS.Group(), armR=new THREE_NS.Group();
  for(const a of [armL,armR]){
    const arm=new THREE_NS.Mesh(new THREE_NS.CylinderGeometry(.105,.12,.78,10),mat(skin,.82));
    arm.position.y=-.38; a.add(arm);
    c.add(a);
  }
  armL.position.set(-.5,1.57,0); armR.position.set(.5,1.57,0);
  armL.rotation.z=.75; armR.rotation.z=-.75;

  if(girl){
    const frame=new THREE_NS.Group();
    const l=new THREE_NS.Mesh(new THREE_NS.TorusGeometry(.15,.035,6,18),mat(0x201c22,.45,.75));
    const r=l.clone();
    l.position.set(-.2,2.13,.4); r.position.set(.2,2.13,.4);
    const bridge=new THREE_NS.Mesh(new THREE_NS.BoxGeometry(.18,.035,.035),mat(0x201c22,.45,.75));
    bridge.position.set(0,2.13,.4);
    frame.add(l,r,bridge); c.add(frame);
  }
  c.userData.walkPhase=Math.random()*10;
  return c;
}
function buildCouple() {
  const c=new THREE_NS.Group();
  const boy=makeCharacter({girl:false});
  const girl=makeCharacter({girl:true});
  boy.position.set(-.62,0,0);
  girl.position.set(.62,0,0);
  c.add(boy,girl);

  // Visible "hand hold" constraint.
  const hand=new THREE_NS.Mesh(
    new THREE_NS.CylinderGeometry(.045,.045,.9,8),
    new THREE_NS.MeshBasicMaterial({color:0xffd6ed,transparent:true,opacity:.9})
  );
  hand.rotation.z=Math.PI/2;
  hand.position.set(0,1.52,0);
  c.add(hand);

  // Heart guide above them.
  const heart=makeTextSprite("TOGETHER",0xff9ac7,20);
  heart.scale.set(3.2,.48,1); heart.position.set(0,3.8,0); c.add(heart);

  street.couple={
    group:c, boy, girl,
    pos:new THREE_NS.Vector3(0,0,31),
    speed:7.2,
    dir:new THREE_NS.Vector3(),
    radius:.8,
  };
  c.position.set(street.couple.pos.x,0,street.couple.pos.z);
  layers.city.add(c);
}
buildCouple();

// Resource / placement systems -------------------------------------
const ResourceManager = {
  resources: { stardust:0, memories:0, coffee:0 },
  add(type, amount=1){ this.resources[type]=(this.resources[type]||0)+amount; },
  reset(){ this.resources={stardust:0,memories:0,coffee:0}; }
};

const PlacementManager = {
  reserve(list, candidate, padding=.4){
    return !list.some(c =>
      candidate.minX-padding < c.maxX &&
      candidate.maxX+padding > c.minX &&
      candidate.minZ-padding < c.maxZ &&
      candidate.maxZ+padding > c.minZ
    );
  }
};

// Input --------------------------------------------------------------
const keys = new Set();
window.addEventListener("keydown", e=>{
  keys.add(e.key.toLowerCase());
  if([" ","arrowup","arrowdown","arrowleft","arrowright"].includes(e.key.toLowerCase())) e.preventDefault();
  if(e.key==="1") setZone(0);
  if(e.key==="2") setZone(1);
  if(e.key==="3") setZone(2);
  if(e.key==="4") setZone(3);
  if(e.key==="5") setZone(4);
  if(e.key.toLowerCase()==="i") switchCity("indore");
  if(e.key.toLowerCase()==="p") switchCity("patna");
  if(e.key===" ") state.running=!state.running;
});
window.addEventListener("keyup", e=>keys.delete(e.key.toLowerCase()));

// UI ----------------------------------------------------------------
document.querySelector("#darlingName").textContent=GIFT.name;
document.querySelector("#birthdayName").textContent=GIFT.name;
document.querySelector("#birthdayMessage").textContent=GIFT.message;

const journeyList=document.querySelector("#journeyList");
journeyList.innerHTML=ZONES.map((z,i)=>`
  <div class="journey-item ${i===0?"active":""}" data-zone="${i}">
    <div class="journey-number">${String(i+1).padStart(2,"0")}</div>
    <div>${z.label}</div>
  </div>`).join("");

document.querySelectorAll(".journey-item").forEach(el=>{
  el.addEventListener("click",()=>setZone(Number(el.dataset.zone)));
});

function updateUI(){
  const z=ZONES[state.zoneIndex];
  document.querySelector("#zoneEyebrow").textContent=z.label.toUpperCase();
  document.querySelector("#zoneTitle").textContent=state.zoneIndex===4
    ? `${street.cityData[state.city].title}`
    : z.title;
  document.querySelector("#zoneCopy").textContent=state.zoneIndex===4
    ? street.cityData[state.city].subtitle + " — WASD to walk with your date."
    : z.copy;

  document.querySelector("#progressLabel").textContent=z.label;
  document.querySelector("#progressNumber").textContent=`0${state.zoneIndex+1} / 05`;
  document.querySelector("#progressBar").style.width=`${(state.zoneIndex+1)/ZONES.length*100}%`;

  document.querySelectorAll(".journey-item").forEach((el,i)=>{
    el.classList.toggle("active",i===state.zoneIndex);
    el.classList.toggle("done",i<state.zoneIndex);
  });

  layers.galaxy.visible=state.zoneIndex===0;
  layers.solar.visible=state.zoneIndex===1;
  layers.earth.visible=state.zoneIndex===2;
  layers.india.visible=state.zoneIndex===3;
  layers.city.visible=state.zoneIndex===4;

  street.cityRoots.indore.visible=state.city==="indore";
  street.cityRoots.patna.visible=state.city==="patna";
  street.gameActive=state.zoneIndex===4;

  controls.enabled=state.zoneIndex!==4 || !state.gameActive;
}
function positionCityObjects(){
  const cityX=state.city==="indore"?-85:85;
  street.couple.group.position.set(cityX+street.couple.pos.x,0,street.couple.pos.z);
  street.pickups.forEach((p,i)=>{
    p.position.x=cityX+(i%2===0?-6:6);
    p.position.z=8-i*6;
  });
}

function setZone(index){
  state.zoneIndex=Math.max(0,Math.min(ZONES.length-1,index));
  state.gameActive=state.zoneIndex===4;
  if(state.zoneIndex===4){
    state.collected=0; state.score=0; ResourceManager.reset();
    street.couple.pos.set(0,0,31);
    street.couple.group.position.set(0,0,31);
    street.pickups.forEach((p,i)=>{p.visible=true;p.position.z=8-i*6;});
    positionCityObjects();
  }
  updateUI();
  animateCameraToZone();
}
function switchCity(city){
  state.city=city;
  if(state.zoneIndex!==4) setZone(4);
  positionCityObjects();
  updateUI();
  animateCameraToZone();
}

document.querySelector("#soundBtn").addEventListener("click",()=>{
  state.sound=!state.sound;
  document.querySelector("#soundBtn").textContent=`Sound: ${state.sound?"On":"Off"}`;
});
document.querySelector("#factsBtn").addEventListener("click",()=>{
  const body=document.querySelector("#factsBody");
  body.innerHTML="";
  for(const [key,item] of Object.entries(RESEARCH)){
    body.insertAdjacentHTML("beforeend",`
      <section class="fact-block">
        <h3>${item.title}</h3>
        <ul>${item.points.map(p=>`<li>${p}</li>`).join("")}</ul>
        <div class="fact-source">${item.source}</div>
      </section>`);
  }
  document.querySelector("#factsModal").classList.remove("hidden");
});
document.querySelector("#closeFactsBtn").addEventListener("click",()=>document.querySelector("#factsModal").classList.add("hidden"));
document.querySelector(".modal-backdrop").addEventListener("click",()=>document.querySelector("#factsModal").classList.add("hidden"));
document.querySelector("#restartBtn").addEventListener("click",()=>{
  document.querySelector("#birthdayPanel").classList.add("hidden");
  setZone(0);
});

// Camera choreography ------------------------------------------------
function zoneCamera(index){
  if(index===0) return {pos:new THREE_NS.Vector3(0,90,2100), target:new THREE_NS.Vector3(0,0,0)};
  if(index===1) return {pos:new THREE_NS.Vector3(80,70,155), target:new THREE_NS.Vector3(0,0,0)};
  if(index===2) return {pos:new THREE_NS.Vector3(40,24,62), target:new THREE_NS.Vector3(0,0,0)};
  if(index===3) return {pos:new THREE_NS.Vector3(0,42,95), target:new THREE_NS.Vector3(0,0,0)};
  const cityX=state.city==="indore"?-85:85;
  return {pos:new THREE_NS.Vector3(cityX,10,50), target:new THREE_NS.Vector3(cityX,1,15)};
}
let camTween=null;
function animateCameraToZone(){
  const s=zoneCamera(state.zoneIndex);
  camTween={
    startPos:camera.position.clone(),
    startTarget:controls.target.clone(),
    endPos:s.pos.clone(),
    endTarget:s.target.clone(),
    t:0,
    duration:1.55
  };
}
function updateCameraTween(dt){
  if(!camTween) return;
  camTween.t=Math.min(1,camTween.t+dt/camTween.duration);
  const e=1-Math.pow(1-camTween.t,3);
  camera.position.lerpVectors(camTween.startPos,camTween.endPos,e);
  controls.target.lerpVectors(camTween.startTarget,camTween.endTarget,e);
  if(camTween.t>=1) camTween=null;
}

// Game loop ----------------------------------------------------------
const moveDir=new THREE_NS.Vector3();
function updateStreetGame(dt){
  if(!state.gameActive || !state.running) return;
  const c=street.couple;
  moveDir.set(0,0,0);
  if(keys.has("w")||keys.has("arrowup")) moveDir.z-=1;
  if(keys.has("s")||keys.has("arrowdown")) moveDir.z+=1;
  if(keys.has("a")||keys.has("arrowleft")) moveDir.x-=1;
  if(keys.has("d")||keys.has("arrowright")) moveDir.x+=1;
  if(moveDir.lengthSq()>0){
    moveDir.normalize().multiplyScalar(c.speed*dt);
    const nx=c.pos.x+moveDir.x;
    const nz=c.pos.z+moveDir.z;
    if(!collidesCircle(nx,c.pos.z,c.radius)) c.pos.x=nx;
    if(!collidesCircle(c.pos.x,nz,c.radius)) c.pos.z=nz;
    c.group.rotation.y=Math.atan2(moveDir.x,moveDir.z);
  }

  // Girl keeps a stable hand-holding offset.
  const gap=c.boy.position.distanceTo(c.girl.position);
  const desired=.98;
  if(Math.abs(gap-desired)>.04){
    c.girl.position.x=THREE_NS.MathUtils.lerp(c.girl.position.x, desired, .45);
    c.boy.position.x=THREE_NS.MathUtils.lerp(c.boy.position.x, -desired, .45);
  }

  // Gentle walking animation.
  const moving=moveDir.lengthSq()>0;
  const walk=Math.sin(state.elapsed*10)*.22*(moving?1:0);
  c.boy.position.y=Math.abs(walk)*.4;
  c.girl.position.y=Math.abs(Math.sin(state.elapsed*10+1)*.22)*(moving?.4:0);
  c.boy.rotation.z=walk*.12;
  c.girl.rotation.z=-walk*.12;

  // Collect stardust / birthday stars.
  for(const star of street.pickups){
    if(!star.visible) continue;
    star.rotation.y+=dt*1.6;
    star.position.y=star.userData.baseY+Math.sin(state.elapsed*2+star.position.z)*.28;
    const wp=star.getWorldPosition(tmpV);
    const localDist=Math.hypot(wp.x-c.group.position.x, wp.z-c.group.position.z);
    if(localDist<1.55){
      star.visible=false;
      state.collected++;
      state.score+=100;
      ResourceManager.add("stardust",1);
    }
  }

  if(state.collected>=state.starsToCollect && !state.complete){
    state.complete=true;
    setTimeout(showBirthday,420);
  }

  // Meteorites drift through the scene as moving sky objects.
  street.hazards.forEach(h=>{
    h.position.addScaledVector(h.userData.v,dt);
    if(h.position.z>16) h.position.z=-62;
    if(h.position.y<3) h.position.y=14;
  });

  // Keep the final date inside the virtual district.
  c.pos.x=THREE_NS.MathUtils.clamp(c.pos.x,-8,8);
  c.pos.z=THREE_NS.MathUtils.clamp(c.pos.z,-43,39);

  // Keep the couple physically placed inside the active city root.
  const cityX=state.city==="indore"?-85:85;
  c.group.position.set(cityX+c.pos.x,0,c.pos.z);

  // Follow couple in third-person.
  const desiredCam=new THREE_NS.Vector3(cityX + c.pos.x, 7.5, c.pos.z+13);
  const desiredTarget=new THREE_NS.Vector3(cityX+c.pos.x, 1.8, c.pos.z-3);
  camera.position.lerp(desiredCam,.08);
  controls.target.lerp(desiredTarget,.08);
}
function showBirthday(){
  state.complete=false;
  document.querySelector("#birthdayPanel").classList.remove("hidden");
}

// Initial positions --------------------------------------------------
updateUI();
animateCameraToZone();

let loading=0;
const loadingBar=document.querySelector("#loadingBar");
const loadingTimer=setInterval(()=>{
  loading=Math.min(100,loading+18);
  loadingBar.style.width=loading+"%";
  if(loading>=100){
    clearInterval(loadingTimer);
    setTimeout(()=>document.querySelector("#loading").classList.add("hidden"),250);
  }
},120);

window.addEventListener("resize",()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});

// Render -------------------------------------------------------------
function animate(){
  const dt=Math.min(clock.getDelta(),.035);
  state.elapsed+=dt;

  if(state.running){
    updateCameraTween(dt);
    updateStreetGame(dt);

    if(layers.galaxy.visible) layers.galaxy.rotation.y+=dt*.0022;
    if(layers.solar.visible) layers.solar.rotation.y+=dt*.005;
    if(layers.earth.visible) layers.earth.rotation.y+=dt*.002;
    if(layers.india.visible) layers.india.rotation.y+=dt*.0004;

    controls.update();
  }

  renderer.render(scene,camera);
  requestAnimationFrame(animate);
}
animate();