import * as THREE from "three";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import atmosphereVertex from "./shaders/atmosphereVertex.glsl";
import atmosphereFragment from "./shaders/atmosphereFragment.glsl";

const canvasContainer = document.querySelector("#canvas") as HTMLCanvasElement;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

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
for (let i = 0; i < 10000; i++) {
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
  x: undefined,
  y: undefined
}

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
  sphere.rotation.y += 0.01;
  group.rotation.x = mouse.y * 2;
  group.rotation.y = mouse.x * 0.5;
}

animate();

addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2
  mouse.y = (event.clientY / window.innerHeight) * 2 + 1
  console.log(mouse.x, mouse.y);

})

