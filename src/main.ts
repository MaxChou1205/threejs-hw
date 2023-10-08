import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// create sphere
const geometry = new THREE.SphereGeometry(5, 50, 50);
const material = new THREE.MeshBasicMaterial({
  // color: 0xff0000
  map: new THREE.TextureLoader().load(
    new URL("./assets/earth.jpg", import.meta.url).href
  )
});
const sphere = new THREE.Mesh(geometry, material);

scene.add(sphere);
camera.position.z = 10;

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

animate();
