import * as THREE from "three";

const GIFT = {
  name: "Darling",

  message:
    "If I could show you every beautiful thing in existence, I would still save my favourite view for the end: you.",

  ending:
    "Out of every star, every road, every city and every possible universe, this is still the one where I would choose you."
};


const state = {

  layer: 0,

  city: "indore",

  started: false,

  paused: false,

  collected: 0,

  totalCollectibles: 8,

  ending: false,

  keys: {},

  elapsed: 0

};


const layers = [
  "GALAXY",
  "SOLAR SYSTEM",
  "EARTH",
  "INDIA",
  "CITY"
];


const zoneData = [

  {
    eyebrow: "GALAXY",
    title: "Somewhere in the Milky Way",
    copy: "A journey that starts among the stars."
  },

  {
    eyebrow: "SOLAR SYSTEM",
    title: "Then, home",
    copy: "Eight planets. One Sun. One tiny blue world."
  },

  {
    eyebrow: "EARTH",
    title: "One world",
    copy: "Continents, oceans, countries and millions of stories."
  },

  {
    eyebrow: "INDIA",
    title: "And then… us",
    copy: "Somewhere in India, two cities wait for our date."
  },

  {
    eyebrow: "CITY",
    title: "Hold my hand",
    copy: "Now the universe gets small. Roads. Lights. Cafés. You and me."
  }

];


const facts = [

  {
    title: "Milky Way",
    text:
      "The Milky Way is a barred spiral galaxy. Our Solar System lies in one of its spiral features, roughly 26,000 light-years from the Galactic Center."
  },

  {
    title: "Solar System",
    text:
      "The Solar System formed about 4.6 billion years ago and contains eight recognized planets orbiting the Sun."
  },

  {
    title: "Earth",
    text:
      "Earth is the third planet from the Sun and the only world currently known to support life."
  },

  {
    title: "India",
    text:
      "India occupies a large part of the South Asian peninsula and contains extremely varied terrain, from mountains and plateaus to plains and coasts."
  },

  {
    title: "Indore",
    text:
      "Indore is located on the Malwa Plateau in Madhya Pradesh. Rajwada is one of its most recognizable historic landmarks."
  },

  {
    title: "Patna",
    text:
      "Patna lies along the Ganga and has deep historical connections with ancient Pataliputra. Golghar is one of its iconic landmarks."
  }

];


const canvas =
  document.getElementById("scene");


const renderer =
  new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance"
  });


renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);


renderer.setSize(
  window.innerWidth,
  window.innerHeight
);


renderer.outputColorSpace =
  THREE.SRGBColorSpace;


renderer.toneMapping =
  THREE.ACESFilmicToneMapping;


renderer.toneMappingExposure = 1.2;


const scene =
  new THREE.Scene();


scene.background =
  new THREE.Color(0x02030b);


const camera =
  new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    .1,
    100000
  );


camera.position.set(
  0,
  6,
  22
);


const clock =
  new THREE.Clock();


const root =
  new THREE.Group();


scene.add(root);


const galaxy =
  new THREE.Group();


const solar =
  new THREE.Group();


const earth =
  new THREE.Group();


const india =
  new THREE.Group();


const city =
  new THREE.Group();


root.add(
  galaxy,
  solar,
  earth,
  india,
  city
);


solar.visible = false;
earth.visible = false;
india.visible = false;
city.visible = false;


/* ------------------------------------------------ */
/* HELPERS */
/* ------------------------------------------------ */

function rand(min, max){

  return min +
    Math.random() *
    (max - min);

}


function lerp(a,b,t){

  return a +
    (b-a)*t;

}


function makeGlowMaterial(
  color,
  opacity = 1
){

  return new THREE.MeshBasicMaterial({
    color,
    transparent:true,
    opacity,
    depthWrite:false
  });

}


function makeSphere(
  radius,
  color
){

  return new THREE.Mesh(
    new THREE.SphereGeometry(
      radius,
      16,
      16
    ),
    new THREE.MeshStandardMaterial({
      color,
      roughness:.7,
      metalness:.05
    })
  );

}


function makeBox(
  x,
  y,
  z,
  color
){

  return new THREE.Mesh(
    new THREE.BoxGeometry(
      x,
      y,
      z
    ),
    new THREE.MeshStandardMaterial({
      color,
      roughness:.8
    })
  );

}


/* ------------------------------------------------ */
/* LIGHTING */
/* ------------------------------------------------ */

const ambient =
  new THREE.AmbientLight(
    0x8790bb,
    1.4
  );


scene.add(ambient);


const moonLight =
  new THREE.DirectionalLight(
    0x9cb7ff,
    2
  );


moonLight.position.set(
  10,
  15,
  10
);


scene.add(moonLight);


/* ------------------------------------------------ */
/* GALAXY */
/* ------------------------------------------------ */

function buildGalaxy(){

  const stars =
    new THREE.BufferGeometry();


  const positions = [];


  const colors = [];


  const count = 18000;


  for(
    let i=0;
    i<count;
    i++
  ){

    const arm =
      Math.floor(
        Math.random()*5
      );


    const radius =
      Math.pow(
        Math.random(),
        .62
      ) * 620;


    const angle =
      radius*.006 +
      arm*
      Math.PI*2/5 +
      rand(-.45,.45);


    const thickness =
      rand(-30,30) *
      (1-radius/700);


    const x =
      Math.cos(angle) *
      radius +
      thickness;


    const z =
      Math.sin(angle) *
      radius +
      rand(-25,25);


    const y =
      rand(-9,9) *
      (1-radius/750);


    positions.push(
      x,y,z
    );


    const c =
      new THREE.Color();


    const hue =
      Math.random();


    if(hue < .5){

      c.setHSL(
        .58 + Math.random()*.08,
        .8,
        .65 + Math.random()*.3
      );

    }
    else{

      c.setHSL(
        .08 + Math.random()*.06,
        .8,
        .65 + Math.random()*.3
      );

    }


    colors.push(
      c.r,
      c.g,
      c.b
    );

  }


  stars.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      positions,
      3
    )
  );


  stars.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(
      colors,
      3
    )
  );


  const material =
    new THREE.PointsMaterial({

      size:.9,

      vertexColors:true,

      transparent:true,

      opacity:.9,

      depthWrite:false,

      blending:
        THREE.AdditiveBlending

    });


  galaxy.add(
    new THREE.Points(
      stars,
      material
    )
  );


  const center =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        32,
        32,
        32
      ),
      new THREE.MeshBasicMaterial({
        color:0x010106
      })
    );


  galaxy.add(center);


  const ring =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        44,
        2.8,
        12,
        128
      ),
      new THREE.MeshBasicMaterial({
        color:0xffb36b,
        transparent:true,
        opacity:.55,
        blending:
          THREE.AdditiveBlending
      })
    );


  ring.rotation.x =
    Math.PI/2;


  galaxy.add(ring);


  for(
    let i=0;
    i<7;
    i++
  ){

    const nebula =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          rand(25,65),
          16,
          16
        ),
        new THREE.MeshBasicMaterial({
          color:
            i%2
              ? 0x693cff
              : 0xff3ca6,

          transparent:true,

          opacity:.025,

          depthWrite:false,

          blending:
            THREE.AdditiveBlending
        })
      );


    nebula.position.set(
      rand(-350,350),
      rand(-20,20),
      rand(-350,350)
    );


    galaxy.add(nebula);

  }

}


buildGalaxy();


/* ------------------------------------------------ */
/* SOLAR SYSTEM */
/* ------------------------------------------------ */

function buildSolarSystem(){

  const sun =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        9,
        32,
        32
      ),
      new THREE.MeshBasicMaterial({
        color:0xffb13b
      })
    );


  solar.add(sun);


  const sunLight =
    new THREE.PointLight(
      0xffc56e,
      700,
      1200
    );


  solar.add(sunLight);


  const planets = [

    ["Mercury",14,.6,0xaaa39b],

    ["Venus",20,.95,0xd9b16e],

    ["Earth",28,1.05,0x438be8],

    ["Mars",37,.8,0xb6533b],

    ["Jupiter",51,3.1,0xd9a66c],

    ["Saturn",68,2.7,0xd9c58d],

    ["Uranus",86,1.7,0x78cfe0],

    ["Neptune",103,1.65,0x4667d6]

  ];


  planets.forEach(
    ([name,distance,size,color],i)=>{

      const orbit =
        new THREE.Mesh(
          new THREE.RingGeometry(
            distance-.025,
            distance+.025,
            128
          ),
          new THREE.MeshBasicMaterial({
            color:0x7180a7,
            transparent:true,
            opacity:.16,
            side:
              THREE.DoubleSide
          })
        );


      orbit.rotation.x =
        Math.PI/2;


      solar.add(orbit);


      const planet =
        makeSphere(
          size,
          color
        );


      planet.position.x =
        distance;


      planet.userData.orbit =
        .0015 +
        i*.0004;


      solar.add(planet);


      if(name === "Saturn"){

        const ring =
          new THREE.Mesh(
            new THREE.RingGeometry(
              3.5,
              5,
              64
            ),
            new THREE.MeshBasicMaterial({
              color:0xe4d4aa,
              side:
                THREE.DoubleSide,
              transparent:true,
              opacity:.65
            })
          );


        ring.rotation.x =
          Math.PI/2.5;


        planet.add(ring);

      }

    }
  );

}


buildSolarSystem();


/* ------------------------------------------------ */
/* EARTH */
/* ------------------------------------------------ */

function buildEarth(){

  const earthMesh =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        14,
        64,
        64
      ),
      new THREE.MeshStandardMaterial({
        color:0x2576c7,
        roughness:.9,
        metalness:0
      })
    );


  earth.add(
    earthMesh
  );


  const atmosphere =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        14.6,
        48,
        48
      ),
      new THREE.MeshBasicMaterial({
        color:0x5ebeff,
        transparent:true,
        opacity:.1,
        side:
          THREE.BackSide
      })
    );


  earth.add(
    atmosphere
  );


  const indiaMarker =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        .35,
        12,
        12
      ),
      new THREE.MeshBasicMaterial({
        color:0xff6ba9
      })
    );


  indiaMarker.position.set(
    5,
    3,
    12
  );


  earth.add(
    indiaMarker
  );


  const markerLight =
    new THREE.PointLight(
      0xff6ba9,
      5,
      20
    );


  markerLight.position.copy(
    indiaMarker.position
  );


  earth.add(markerLight);

}


buildEarth();


/* ------------------------------------------------ */
/* INDIA */
/* ------------------------------------------------ */

function buildIndia(){

  const shape =
    new THREE.Shape();


  shape.moveTo(
    -10,
    12
  );


  shape.lineTo(
    -3,
    15
  );


  shape.lineTo(
    3,
    12
  );


  shape.lineTo(
    8,
    7
  );


  shape.lineTo(
    10,
    1
  );


  shape.lineTo(
    7,
    -5
  );


  shape.lineTo(
    3,
    -13
  );


  shape.lineTo(
    0,
    -18
  );


  shape.lineTo(
    -3,
    -10
  );


  shape.lineTo(
    -7,
    -5
  );


  shape.lineTo(
    -9,
    2
  );


  shape.lineTo(
    -13,
    8
  );


  shape.closePath();


  const geometry =
    new THREE.ExtrudeGeometry(
      shape,
      {
        depth:1.4,
        bevelEnabled:true,
        bevelSegments:2,
        bevelSize:.2,
        bevelThickness:.2
      }
    );


  const mesh =
    new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color:0xc58d50,
        roughness:1
      })
    );


  mesh.rotation.x =
    -Math.PI/2;


  india.add(mesh);


  const river =
    new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(
            -8,
            .4,
            5
          ),

          new THREE.Vector3(
            -2,
            .4,
            3
          ),

          new THREE.Vector3(
            3,
            .4,
            1
          ),

          new THREE.Vector3(
            8,
            .4,
            -1
          )
        ]),
        40,
        .12,
        8,
        false
      ),
      new THREE.MeshBasicMaterial({
        color:0x54b9ff
      })
    );


  india.add(river);


  createCityMarker(
    "INDORE",
    -4,
    1,
    2,
    0x79ddff
  );


  createCityMarker(
    "PATNA",
    5,
    1,
    4,
    0xff79bd
  );

}


function createCityMarker(
  name,
  x,
  y,
  z,
  color
){

  const marker =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        .4,
        .7,
        .5,
        16
      ),
      new THREE.MeshBasicMaterial({
        color
      })
    );


  marker.position.set(
    x,y,z
  );


  india.add(marker);


  const light =
    new THREE.PointLight(
      color,
      3,
      15
    );


  light.position.copy(
    marker.position
  );


  india.add(light);

}


buildIndia();


/* ------------------------------------------------ */
/* CITY */
/* ------------------------------------------------ */

const cityRoots = {

  indore:
    new THREE.Group(),

  patna:
    new THREE.Group()

};


city.add(
  cityRoots.indore,
  cityRoots.patna
);


cityRoots.patna.position.x =
  110;


const cityColliders = {

  indore:[],
  patna:[]

};


const cityCollectibles = {

  indore:[],
  patna:[]

};


function buildCity(
  root,
  cityName,
  offset
){

  const ground =
    makeBox(
      220,
      .3,
      150,
      0x101321
    );


  ground.position.y =
    -.2;


  root.add(ground);


  const road =
    makeBox(
      210,
      .15,
      14,
      0x202431
    );


  road.position.y =
    0;


  root.add(road);


  for(
    let x=-95;
    x<100;
    x+=10
  ){

    const line =
      makeBox(
        5,
        .08,
        .16,
        0xe4dfc2
      );


    line.position.set(
      x,
      .1,
      0
    );


    root.add(line);

  }


  /* BUILDINGS */

  for(
    let side=-1;
    side<=1;
    side+=2
  ){

    for(
      let i=0;
      i<12;
      i++
    ){

      const width =
        rand(5,9);


      const depth =
        rand(7,12);


      const height =
        rand(5,18);


      const building =
        makeBox(
          width,
          height,
          depth,
          new THREE.Color().setHSL(
            rand(.55,.68),
            .18,
            rand(.12,.24)
          )
        );


      const x =
        -95 +
        i*17 +
        rand(-3,3);


      const z =
        side *
        rand(17,27);


      building.position.set(
        x,
        height/2,
        z
      );


      root.add(building);


      cityColliders[
        cityName
      ].push({

        x,
        z,

        w:
          width/2+.8,

        d:
          depth/2+.8

      });


      /* WINDOWS */

      for(
        let wx=-width/2+.9;
        wx<width/2-.3;
        wx+=1.6
      ){

        for(
          let wy=1;
          wy<height-.5;
          wy+=2.2
        ){

          const windowMesh =
            makeBox(
              .55,
              .7,
              .06,
              Math.random()>.3
                ? 0xffd87a
                : 0x1d355f
            );


          windowMesh.position.set(
            x+wx,
            wy,
            z-side*(depth/2+.04)
          );


          root.add(
            windowMesh
          );

        }

      }

    }

  }


  /* STREET LIGHTS */

  for(
    let x=-90;
    x<=90;
    x+=18
  ){

    for(
      let side=-1;
      side<=1;
      side+=2
    ){

      const pole =
        makeBox(
          .12,
          5,
          .12,
          0x252b38
        );


      pole.position.set(
        x,
        2.5,
        side*8
      );


      root.add(pole);


      const bulb =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            .2,
            12,
            12
          ),
          makeGlowMaterial(
            0xffd98a
          )
        );


      bulb.position.set(
        x,
        5.2,
        side*8
      );


      root.add(bulb);


      const light =
        new THREE.PointLight(
          0xffd98a,
          1.8,
          15
        );


      light.position.copy(
        bulb.position
      );


      root.add(light);

    }

  }


  /* TREES */

  for(
    let i=0;
    i<24;
    i++
  ){

    const x =
      rand(-100,100);


    const side =
      Math.random()>.5
        ? 1
        : -1;


    const z =
      side *
      rand(10,35);


    const trunk =
      makeBox(
        .45,
        2,
        .45,
        0x593a27
      );


    trunk.position.set(
      x,
      1,
      z
    );


    root.add(trunk);


    const crown =
      makeSphere(
        2.1,
        0x235c42
      );


    crown.position.set(
      x,
      3,
      z
    );


    root.add(crown);

  }


  /* CARS */

  for(
    let i=0;
    i<8;
    i++
  ){

    const car =
      makeBox(
        4,
        1.2,
        2,
        i%2
          ? 0x7d88a7
          : 0x9d435f
      );


    car.position.set(
      rand(-90,90),
      .8,
      rand(-4,4)
    );


    root.add(car);

  }


  /* CAFÉ */

  const cafeX =
    65;


  const cafeZ =
    0;


  const cafe =
    new THREE.Group();


  cafe.position.set(
    cafeX,
    0,
    cafeZ
  );


  root.add(cafe);


  const cafeBody =
    makeBox(
      13,
      7,
      10,
      0x2b2030
    );


  cafeBody.position.y =
    3.5;


  cafe.add(cafeBody);


  const awning =
    makeBox(
      14,
      .4,
      2,
      0xff668f
    );


  awning.position.set(
    0,
    7,
    -5.5
  );


  cafe.add(awning);


  const sign =
    makeBox(
      8,
      1.3,
      .2,
      0x10121e
    );


  sign.position.set(
    0,
    8.5,
    -5.15
  );


  cafe.add(sign);


  const signLight =
    new THREE.PointLight(
      0xff79bd,
      4,
      18
    );


  signLight.position.set(
    0,
    8,
    -5
  );


  cafe.add(signLight);


  /* CAFÉ WINDOWS */

  for(
    let i=-1;
    i<=1;
    i++
  ){

    const windowMesh =
      makeBox(
        3,
        2.8,
        .1,
        0x9edaff
      );


    windowMesh.position.set(
      i*4,
      3.8,
      -5.1
    );


    cafe.add(windowMesh);

  }


  /* TABLES */

  for(
    let i=-1;
    i<=1;
    i+=2
  ){

    const table =
      makeBox(
        2,
        .15,
        2,
        0x8a5636
      );


    table.position.set(
      i*4,
      1,
      -8
    );


    cafe.add(table);


    const cup =
      makeSphere(
        .22,
        0xf3e6d0
      );


    cup.position.set(
      i*4,
      1.25,
      -8
    );


    cafe.add(cup);

  }


  cityColliders[
    cityName
  ].push({

    x:cafeX,

    z:cafeZ,

    w:8,

    d:7

  });


  /* LANDMARK */

  if(cityName === "indore"){

    buildRajwada(
      root,
      -62,
      0
    );

  }
  else{

    buildGolghar(
      root,
      -62,
      0
    );

  }


  /* BIRTHDAY BILLBOARD */

  const billboard =
    new THREE.Group();


  billboard.position.set(
    30,
    0,
    -12
  );


  root.add(
    billboard
  );


  const board =
    makeBox(
      14,
      7,
      .5,
      0x15172a
    );


  board.position.y =
    6;


  billboard.add(board);


  const border =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        14.5,
        7.5,
        .3
      ),
      new THREE.MeshBasicMaterial({
        color:0xff79bd,
        wireframe:true
      })
    );


  border.position.y =
    6;


  billboard.add(border);


  const textCanvas =
    document.createElement(
      "canvas"
    );


  textCanvas.width = 1024;
  textCanvas.height = 512;


  const ctx =
    textCanvas.getContext("2d");


  ctx.fillStyle =
    "#12152a";


  ctx.fillRect(
    0,
    0,
    1024,
    512
  );


  ctx.fillStyle =
    "#ff8fca";


  ctx.font =
    "bold 90px Georgia";


  ctx.textAlign =
    "center";


  ctx.fillText(
    "HAPPY",
    512,
    210
  );


  ctx.fillText(
    "BIRTHDAY",
    512,
    320
  );


  const texture =
    new THREE.CanvasTexture(
      textCanvas
    );


  const textPlane =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        13,
        6.5
      ),
      new THREE.MeshBasicMaterial({
        map:texture
      })
    );


  textPlane.position.set(
    0,
    6,
    -.3
  );


  billboard.add(textPlane);


  /* RIVER FOR PATNA */

  if(cityName === "patna"){

    const river =
      makeBox(
        210,
        .05,
        25,
        0x164d72
      );


    river.position.set(
      0,
      .05,
      45
    );


    root.add(river);

  }


  /* COLLECTIBLES */

  for(
    let i=0;
    i<state.totalCollectibles;
    i++
  ){

    const star =
      new THREE.Mesh(
        new THREE.OctahedronGeometry(
          .55,
          0
        ),
        new THREE.MeshBasicMaterial({
          color:0xffd86b
        })
      );


    star.position.set(
      -80 +
      i*19,

      1.4,

      -5 +
      Math.sin(i)*6
    );


    star.userData.index =
      i;


    root.add(star);


    cityCollectibles[
      cityName
    ].push(star);

  }

}


function buildRajwada(
  root,
  x,
  z
){

  const landmark =
    new THREE.Group();


  landmark.position.set(
    x,
    0,
    z
  );


  root.add(
    landmark
  );


  for(
    let i=0;
    i<3;
    i++
  ){

    const floor =
      makeBox(
        14-i*1.5,
        3,
        10-i,
        0x9c6747
      );


    floor.position.y =
      1.5 +
      i*3;


    landmark.add(floor);

  }


  const roof =
    makeBox(
      7,
      3,
      7,
      0x3b2732
    );


  roof.position.y =
    12;


  landmark.add(roof);

}


function buildGolghar(
  root,
  x,
  z
){

  const landmark =
    new THREE.Group();


  landmark.position.set(
    x,
    0,
    z
  );


  root.add(
    landmark
  );


  const dome =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        8,
        32,
        16,
        0,
        Math.PI*2,
        0,
        Math.PI/2
      ),
      new THREE.MeshStandardMaterial({
        color:0xb98b57
      })
    );


  dome.scale.y =
    1.4;


  dome.position.y =
    1;


  landmark.add(dome);


  const base =
    makeBox(
      15,
      1.2,
      15,
      0x8b663f
    );


  base.position.y =
    .5;


  landmark.add(base);

}


buildCity(
  cityRoots.indore,
  "indore",
  0
);


buildCity(
  cityRoots.patna,
  "patna",
  110
);


/* ------------------------------------------------ */
/* COUPLE */
/* ------------------------------------------------ */

const couple =
  new THREE.Group();


city.add(couple);


const boy =
  new THREE.Group();


const girl =
  new THREE.Group();


couple.add(
  boy,
  girl
);


function buildCharacter(
  group,
  bodyColor,
  headColor
){

  const body =
    makeSphere(
      1,
      bodyColor
    );


  body.scale.set(
    .65,
    1.25,
    .5
  );


  body.position.y =
    1.25;


  group.add(body);


  const head =
    makeSphere(
      .55,
      headColor
    );


  head.position.y =
    2.65;


  group.add(head);


  const leg1 =
    makeBox(
      .25,
      .9,
      .25,
      0x171a28
    );


  const leg2 =
    leg1.clone();


  leg1.position.set(
    -.22,
    .45,
    0
  );


  leg2.position.set(
    .22,
    .45,
    0
  );


  group.add(
    leg1,
    leg2
  );

}


buildCharacter(
  boy,
  0x4c72a7,
  0xc99776
);


buildCharacter(
  girl,
  0xd05f91,
  0xd9a17d
);


/* GIRL HAIR */

const hair =
  new THREE.Mesh(
    new THREE.SphereGeometry(
      .61,
      16,
      16
    ),
    new THREE.MeshStandardMaterial({
      color:0x271c29
    })
  );


hair.scale.y =
  1.15;


hair.position.y =
  2.82;


girl.add(hair);


/* SPECTACLES */

const glasses =
  new THREE.Group();


const lensMat =
  new THREE.MeshBasicMaterial({
    color:0x101522,
    transparent:true,
    opacity:.75
  });


const leftLens =
  new THREE.Mesh(
    new THREE.TorusGeometry(
      .18,
      .035,
      8,
      20
    ),
    lensMat
  );


const rightLens =
  leftLens.clone();


leftLens.position.x =
  -.2;


rightLens.position.x =
  .2;


glasses.add(
  leftLens,
  rightLens
);


const bridge =
  makeBox(
    .12,
    .04,
    .04,
    0x11131c
  );


bridge.position.x =
  0;


glasses.add(
  bridge
);


glasses.position.set(
  0,
  2.68,
  -.48
);


girl.add(glasses);


/* HAND HOLDING */

const hand =
  new THREE.Mesh(
    new THREE.CylinderGeometry(
      .09,
      .09,
      1.1,
      8
    ),
    new THREE.MeshBasicMaterial({
      color:0xffd6c7
    })
  );


hand.rotation.z =
  Math.PI/2;


hand.position.set(
  0,
  1.65,
  0
);


couple.add(hand);


/* LABEL */

const labelCanvas =
  document.createElement(
    "canvas"
  );


labelCanvas.width =
  512;

labelCanvas.height =
  128;


const labelCtx =
  labelCanvas.getContext("2d");


labelCtx.fillStyle =
  "rgba(0,0,0,.65)";


labelCtx.roundRect(
  0,
  20,
  512,
  88,
  30
);


labelCtx.fill();


labelCtx.fillStyle =
  "#ffffff";


labelCtx.font =
  "bold 38px Arial";


labelCtx.textAlign =
  "center";


labelCtx.fillText(
  "TOGETHER",
  256,
  77
);


const labelTexture =
  new THREE.CanvasTexture(
    labelCanvas
  );


const label =
  new THREE.Sprite(
    new THREE.SpriteMaterial({
      map:labelTexture,
      transparent:true
    })
  );


label.scale.set(
  5,
  1.25,
  1
);


label.position.set(
  0,
  4.1,
  0
);


couple.add(label);


/* ------------------------------------------------ */
/* CITY MOVEMENT */
/* ------------------------------------------------ */

const couplePosition =
  new THREE.Vector3(
    -90,
    0,
    0
  );


function getCityRoot(){

  return cityRoots[
    state.city
  ];

}


function placeCouple(){

  const root =
    getCityRoot();


  couple.position.set(
    root.position.x +
      couplePosition.x,

    couplePosition.y,

    couplePosition.z
  );

}


placeCouple();


function blocked(
  x,
  z
){

  const list =
    cityColliders[
      state.city
    ];


  for(
    const b of list
  ){

    if(
      Math.abs(x-b.x)
        <
      b.w

      &&

      Math.abs(z-b.z)
        <
      b.d
    ){

      return true;

    }

  }


  return false;

}


function updateMovement(dt){

  if(
    state.layer !== 4 ||
    state.ending
  ){

    return;

  }


  let dx = 0;
  let dz = 0;


  if(
    state.keys["w"] ||
    state.keys["arrowup"]
  ){

    dx += 1;

  }


  if(
    state.keys["s"] ||
    state.keys["arrowdown"]
  ){

    dx -= 1;

  }


  if(
    state.keys["a"] ||
    state.keys["arrowleft"]
  ){

    dz -= 1;

  }


  if(
    state.keys["d"] ||
    state.keys["arrowright"]
  ){

    dz += 1;

  }


  const length =
    Math.hypot(dx,dz);


  if(length === 0){

    return;

  }


  dx/=length;
  dz/=length;


  const speed =
    12*dt;


  const nx =
    couplePosition.x +
    dx*speed;


  const nz =
    couplePosition.z +
    dz*speed;


  if(
    !blocked(nx,nz)
  ){

    couplePosition.x =
      nx;

    couplePosition.z =
      nz;

  }


  placeCouple();


  const targetRotation =
    Math.atan2(
      dz,
      dx
    );


  couple.rotation.y =
    THREE.MathUtils.lerp(
      couple.rotation.y,
      targetRotation,
      .12
    );


  checkCollectibles();


  if(
    couplePosition.x > 58
    &&
    Math.abs(couplePosition.z) < 9
  ){

    showInteraction(
      "The café is right there. Walk in together."
    );

  }


  if(
    couplePosition.x > 69
    &&
    Math.abs(couplePosition.z) < 9
  ){

    finishDate();

  }

}


/* ------------------------------------------------ */
/* COLLECTIBLES */
/* ------------------------------------------------ */

function checkCollectibles(){

  const list =
    cityCollectibles[
      state.city
    ];


  list.forEach(
    star => {

      if(
        star.userData.collected
      ){

        return;

      }


      const dx =
        couplePosition.x -
        star.position.x;


      const dz =
        couplePosition.z -
        star.position.z;


      if(
        Math.hypot(dx,dz)
          <
        2.5
      ){

        star.userData.collected =
          true;


        star.visible =
          false;


        state.collected++;


        showInteraction(
          `Star ${state.collected}/${state.totalCollectibles} collected.`
        );

      }

    }
  );

}


/* ------------------------------------------------ */
/* INTERACTION UI */
/* ------------------------------------------------ */

const interaction =
  document.getElementById(
    "interaction"
  );


let interactionTimer =
  null;


function showInteraction(
  text
){

  interaction.textContent =
    text;


  interaction.classList.remove(
    "hidden"
  );


  clearTimeout(
    interactionTimer
  );


  interactionTimer =
    setTimeout(
      () => {

        interaction.classList.add(
          "hidden"
        );

      },
      2400
    );

}


/* ------------------------------------------------ */
/* JOURNEY UI */
/* ------------------------------------------------ */

const journeyList =
  document.getElementById(
    "journeyList"
  );


const journeyNames = [

  "The Milky Way",

  "Solar System",

  "Earth",

  "India",

  "The Date"

];


journeyNames.forEach(
  (name,i)=>{

    const item =
      document.createElement(
        "div"
      );


    item.className =
      "journey-item";


    item.innerHTML = `

      <span class="journey-dot"></span>

      <span>${name}</span>

    `;


    item.onclick =
      () => goToLayer(i);


    journeyList.appendChild(
      item
    );

  }
);


function updateJourneyUI(){

  [...journeyList.children]
    .forEach(
      (item,i)=>{

        item.classList.toggle(
          "active",
          i===state.layer
        );


        item.classList.toggle(
          "done",
          i<state.layer
        );

      }
    );

}


/* ------------------------------------------------ */
/* ZONE UI */
/* ------------------------------------------------ */

const zoneEyebrow =
  document.getElementById(
    "zoneEyebrow"
  );


const zoneTitle =
  document.getElementById(
    "zoneTitle"
  );


const zoneCopy =
  document.getElementById(
    "zoneCopy"
  );


const progressLabel =
  document.getElementById(
    "progressLabel"
  );


const progressNumber =
  document.getElementById(
    "progressNumber"
  );


const progressBar =
  document.getElementById(
    "progressBar"
  );


function updateZoneUI(){

  const data =
    zoneData[
      state.layer
    ];


  zoneEyebrow.textContent =
    data.eyebrow;


  zoneTitle.textContent =
    data.title;


  zoneCopy.textContent =
    data.copy;


  progressLabel.textContent =
    data.eyebrow;


  progressNumber.textContent =
    String(
      state.layer+1
    ).padStart(2,"0")
    +
    " / 05";


  progressBar.style.width =
    `${
      ((state.layer+1)/5)*100
    }%`;


  updateJourneyUI();

}


updateZoneUI();


/* ------------------------------------------------ */
/* CAMERA */
/* ------------------------------------------------ */

const cameraTarget =
  new THREE.Vector3();


function updateCamera(){

  if(state.layer === 0){

    const t =
      state.elapsed*.035;


    camera.position.set(
      Math.cos(t)*650,
      110,
      Math.sin(t)*650
    );


    cameraTarget.set(
      0,
      0,
      0
    );

  }


  else if(
    state.layer === 1
  ){

    camera.position.set(
      0,
      55,
      170
    );


    cameraTarget.set(
      0,
      0,
      0
    );

  }


  else if(
    state.layer === 2
  ){

    camera.position.set(
      0,
      8,
      38
    );


    cameraTarget.set(
      0,
      0,
      0
    );

  }


  else if(
    state.layer === 3
  ){

    camera.position.set(
      0,
      35,
      50
    );


    cameraTarget.set(
      0,
      0,
      0
    );

  }


  else{

    const root =
      getCityRoot();


    const desired =
      new THREE.Vector3(
        root.position.x +
        couplePosition.x -
        18,

        8,

        couplePosition.z +
        20
      );


    camera.position.lerp(
      desired,
      .045
    );


    cameraTarget.set(
      root.position.x +
      couplePosition.x +
      12,

      2,

      couplePosition.z
    );

  }


  camera.lookAt(
    cameraTarget
  );

}


/* ------------------------------------------------ */
/* LAYER SWITCHING */
/* ------------------------------------------------ */

function goToLayer(
  index
){

  index =
    THREE.MathUtils.clamp(
      index,
      0,
      4
    );


  state.layer =
    index;


  galaxy.visible =
    index === 0;


  solar.visible =
    index === 1;


  earth.visible =
    index === 2;


  india.visible =
    index === 3;


  city.visible =
    index === 4;


  couple.visible =
    index === 4;


  if(index === 4){

    cityRoots.indore.visible =
      state.city === "indore";


    cityRoots.patna.visible =
      state.city === "patna";


    resetCityPosition();

  }


  updateZoneUI();


  window.dispatchEvent(
    new CustomEvent(
      "birthday-zone-change",
      {
        detail:{
          index
        }
      }
    )
  );

}


function resetCityPosition(){

  couplePosition.set(
    -90,
    0,
    0
  );


  placeCouple();


  cityCollectibles[
    state.city
  ].forEach(
    star => {

      star.visible =
        !star.userData.collected;

    }
  );

}


goToLayer(0);


/* ------------------------------------------------ */
/* CITY SWITCH */
/* ------------------------------------------------ */

function switchCity(
  cityName
){

  if(
    cityName !== "indore" &&
    cityName !== "patna"
  ){

    return;

  }


  state.city =
    cityName;


  cityRoots.indore.visible =
    cityName === "indore";


  cityRoots.patna.visible =
    cityName === "patna";


  state.collected =
    0;


  cityCollectibles.indore
    .forEach(
      star => {

        star.userData.collected =
          false;

        star.visible =
          true;

      }
    );


  cityCollectibles.patna
    .forEach(
      star => {

        star.userData.collected =
          false;

        star.visible =
          true;

      }
    );


  resetCityPosition();


  showInteraction(
    cityName === "indore"
      ? "Indore — your date begins here."
      : "Patna — your date begins here."
  );

}


window.switchBirthdayCity =
  switchCity;


/* ------------------------------------------------ */
/* DATE FINISH */
/* ------------------------------------------------ */

function finishDate(){

  if(state.ending){

    return;

  }


  state.ending =
    true;


  showInteraction(
    "You made it. Together."
  );


  setTimeout(
    () => {

      const panel =
        document.getElementById(
          "birthdayPanel"
        );


      panel.classList.remove(
        "hidden"
      );


      document.getElementById(
        "birthdayName"
      ).textContent =
        GIFT.name;


      document.getElementById(
        "birthdayMessage"
      ).textContent =
        GIFT.ending;

    },
    1300
  );

}


/* ------------------------------------------------ */
/* KEYBOARD */
/* ------------------------------------------------ */

window.addEventListener(
  "keydown",
  event => {

    const key =
      event.key.toLowerCase();


    state.keys[key] =
      true;


    if(
      key === "1"
    ){

      goToLayer(0);

    }


    if(
      key === "2"
    ){

      goToLayer(1);

    }


    if(
      key === "3"
    ){

      goToLayer(2);

    }


    if(
      key === "4"
    ){

      goToLayer(3);

    }


    if(
      key === "5"
    ){

      goToLayer(4);

    }


    if(
      key === "i"
    ){

      switchCity(
        "indore"
      );

      goToLayer(4);

    }


    if(
      key === "p"
    ){

      switchCity(
        "patna"
      );

      goToLayer(4);

    }


    if(
      key === " "
    ){

      state.paused =
        !state.paused;

    }

  }
);


window.addEventListener(
  "keyup",
  event => {

    state.keys[
      event.key.toLowerCase()
    ] = false;

  }
);


/* ------------------------------------------------ */
/* FACTS */
/* ------------------------------------------------ */

const factsModal =
  document.getElementById(
    "factsModal"
  );


const factsBody =
  document.getElementById(
    "factsBody"
  );


facts.forEach(
  fact => {

    const div =
      document.createElement(
        "div"
      );


    div.className =
      "fact";


    div.innerHTML = `
      <strong>${fact.title}</strong>
      <div>${fact.text}</div>
    `;


    factsBody.appendChild(
      div
    );

  }
);


document.getElementById(
  "factsBtn"
).onclick =
  () => {

    factsModal.classList.remove(
      "hidden"
    );

  };


document.getElementById(
  "closeFactsBtn"
).onclick =
  () => {

    factsModal.classList.add(
      "hidden"
    );

  };


document.querySelector(
  ".modal-backdrop"
).onclick =
  () => {

    factsModal.classList.add(
      "hidden"
    );

  };


/* ------------------------------------------------ */
/* RESTART */
/* ------------------------------------------------ */

function restart(){

  state.layer =
    0;

  state.ending =
    false;

  state.collected =
    0;

  document.getElementById(
    "birthdayPanel"
  ).classList.add(
    "hidden"
  );


  switchCity(
    state.city
  );


  goToLayer(0);

}


document.getElementById(
  "restartBtn"
).onclick =
  restart;


document.getElementById(
  "again"
).onclick =
  restart;


/* ------------------------------------------------ */
/* SOUND BUTTON */
/* ------------------------------------------------ */

let soundOn =
  true;


document.getElementById(
  "soundBtn"
).onclick =
  () => {

    soundOn =
      !soundOn;


    document.getElementById(
      "soundBtn"
    ).textContent =
      soundOn
        ? "Sound: On"
        : "Sound: Off";

  };


/* ------------------------------------------------ */
/* LOADING */
/* ------------------------------------------------ */

const loading =
  document.getElementById(
    "loading"
  );


const loadingBar =
  document.getElementById(
    "loadingBar"
  );


let loadingProgress =
  0;


const loadingTimer =
  setInterval(
    () => {

      loadingProgress +=
        rand(4,12);


      loadingProgress =
        Math.min(
          loadingProgress,
          100
        );


      loadingBar.style.width =
        loadingProgress +
        "%";


      if(
        loadingProgress >= 100
      ){

        clearInterval(
          loadingTimer
        );


        setTimeout(
          () => {

            loading.classList.add(
              "hidden"
            );

          },
          500
        );

      }

    },
    90
  );


/* ------------------------------------------------ */
/* RESIZE */
/* ------------------------------------------------ */

window.addEventListener(
  "resize",
  () => {

    camera.aspect =
      window.innerWidth /
      window.innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

  }
);


/* ------------------------------------------------ */
/* ANIMATION */
/* ------------------------------------------------ */

function animate(){

  requestAnimationFrame(
    animate
  );


  const dt =
    Math.min(
      clock.getDelta(),
      .05
    );


  if(
    !state.paused
  ){

    state.elapsed +=
      dt;


    updateMovement(dt);

  }


  /* GALAXY ROTATION */

  galaxy.rotation.y +=
    dt*.008;


  /* SOLAR ORBITS */

  solar.children.forEach(
    object => {

      if(
        object.userData &&
        object.userData.orbit
      ){

        object.rotation.y +=
          object.userData.orbit;

      }

    }
  );


  /* EARTH ROTATION */

  earth.rotation.y +=
    dt*.025;


  /* INDIA ROTATION */

  india.rotation.y +=
    dt*.01;


  /* COLLECTIBLE ANIMATION */

  [
    ...cityCollectibles.indore,
    ...cityCollectibles.patna
  ]
  .forEach(
    star => {

      if(
        star.visible
      ){

        star.rotation.x +=
          dt*1.8;

        star.rotation.y +=
          dt*2.2;

        star.position.y =
          1.4 +
          Math.sin(
            state.elapsed*3 +
            star.userData.index
          )*.25;

      }

    }
  );


  /* CHARACTER FLOAT */

  if(
    couple.visible
  ){

    boy.position.y =
      Math.sin(
        state.elapsed*4
      )*.04;


    girl.position.y =
      Math.sin(
        state.elapsed*4+
        .7
      )*.04;

  }


  updateCamera();


  renderer.render(
    scene,
    camera
  );

}


animate();