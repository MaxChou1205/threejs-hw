import "./style.scss";
import * as THREE from "three";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import atmosphereVertex from "./shaders/atmosphereVertex.glsl";
import atmosphereFragment from "./shaders/atmosphereFragment.glsl";

const canvasContainer = document.querySelector("#canvas") as HTMLCanvasElement;
const popupEl = document.querySelector("#popupEl") as htmlDivElement;
const populationEl = document.querySelector("#popupEl > h2") as HTMLHeadElement;
const populationValueEl = document.querySelector(
  "#popupEl > p"
) as HTMLParagraphElement;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  canvasContainer.offsetWidth / canvasContainer.offsetHeight,
  0.1,
  1000
);
const raycaster = new THREE.Raycaster();

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.querySelector("#canvas") as HTMLCanvasElement
});
renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// create sphere
const geometry = new THREE.SphereGeometry(5, 50, 50);
// const material = new THREE.MeshBasicMaterial({
//   // color: 0xff0000
//   map: new THREE.TextureLoader().load(
//     new URL("./assets/earth.jpg", import.meta.url).href
//   )
// });
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    globeTexture: {
      value: new THREE.TextureLoader().load(
        new URL("./assets/earth.jpg", import.meta.url).href
      )
    }
  }
});
const sphere = new THREE.Mesh(geometry, material);

// scene.add(sphere);

// create atmosphere
const atmosphereGeometry = new THREE.SphereGeometry(5, 50, 50);
const atmosphereMaterial = new THREE.ShaderMaterial({
  vertexShader: atmosphereVertex,
  fragmentShader: atmosphereFragment,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide
});
const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
atmosphere.scale.set(1.1, 1.1, 1.1);
scene.add(atmosphere);

camera.position.z = 10;

const group = new THREE.Group();
group.add(sphere);
scene.add(group);

const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
const starVertices = [];
for (let i = 0; i < 1000; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = -Math.random() * 2000;
  starVertices.push(x, y, z);
}
starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVertices, 3)
);
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

const mouse = {
  x: 0,
  y: 0
};

function animate() {
  requestAnimationFrame(animate);

  // renderer.render(scene, camera);
  group.rotation.y += 0.01;
  // group.rotation.x = mouse.y * 2;
  // group.rotation.y = mouse.x * 0.5;

  // update the picking ray with the camera and pointer position
  raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);

  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(
    group.children.filter((child: THREE.Mesh) => {
      console.log(child);

      return child.geometry.type == "BoxGeometry";
    })
  );
  console.log(intersects);

  group.children.forEach((child: THREE.Mesh) => {
    (child.material as THREE.MeshBasicMaterial).opacity = 0.5;
  });

  for (let i = 0; i < intersects.length; i++) {
    intersects[i].object.material.opacity = 1;
  }

  popupEl.style.display = intersects.length > 0 ? "block" : "none";

  renderer.render(scene, camera);
}

function createPoint(
  latitude: number,
  longitude: number,
  country: string = "",
  population: number = 0
) {
  // https://stackoverflow.com/questions/16266809/convert-from-latitude-longitude-to-x-y
  const point = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.1, 0.8),
    new THREE.MeshBasicMaterial({
      color: "#3bf7ff"
      // opacity: 0.5,
      // transparent: true
    })
  );

  const lat = (latitude / 180) * Math.PI;
  const lon = (longitude / 180) * Math.PI;
  const radius = 5;
  const x = radius * Math.cos(lat) * Math.cos(lon);
  const y = radius * Math.sin(lat);
  const z = radius * Math.cos(lat) * Math.sin(lon);

  point.position.set(x, y, z);
  point.lookAt(new THREE.Vector3(0, 0, 0));
  point.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, -0.4));
  group.add(point);

  populationEl.innerText = country;
  populationValueEl.innerText = population?.toString();
}

animate();

createPoint(23.6345, 102.5528);
// sphere.rotation.y += -Math.PI / 2;

addEventListener("mousemove", event => {
  mouse.x =
    ((event.clientX - window.innerWidth / 2) / (window.innerWidth / 2)) * 2 - 1;
  mouse.y = (event.clientY / window.innerHeight) * 2 + 1;
  // console.log(mouse.x, mouse.y);

  popupEl.style.left = `${event.clientX}px`;
  popupEl.style.top = `${event.clientY}px`;
});
