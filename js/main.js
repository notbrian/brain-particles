var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// var geometry = new THREE.BoxGeometry(1, 1, 1);
// var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// var cube = new THREE.Mesh(geometry, material);
// scene.add(cube);
const sprite = new THREE.TextureLoader().load("assets/spark1.png");

var loader = new THREE.GLTFLoader();

let brainPoints;
loader.load(
  "assets/brain.glb",
  function(gltf) {
    gltf.scene.scale.set(0.6, 0.6, 0.6);
    // gltf.scene.position.x = 0;
    // gltf.scene.position.y = -1250;
    // gltf.scene.position.z = 0;

    var brainGeometry = gltf.scene.children[3].geometry;
    brainGeometry.merge(gltf.scene.children[0].geometry);
    brainGeometry.merge(gltf.scene.children[1].geometry);
    brainGeometry.merge(gltf.scene.children[2].geometry);

    var pointMaterial = new THREE.PointsMaterial({
      size: 0.25,
      color: 0xffffff
      // map: sprite
    });

    brainPoints = new THREE.Points(brainGeometry, pointMaterial);
    const object = brainPoints;
    object.scale.set(0.7, 0.7, 0.7);
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    object.position.x += object.position.x - center.x;
    object.position.y += object.position.y - center.y;
    object.position.z += object.position.z - center.z;

    scene.add(brainPoints);

    brainPoints.geometry.attributes.initialPositions = brainPoints.geometry.attributes.position.clone();

    // scene.add(object);

    // var boxHelper = new THREE.BoxHelper(object, 0xffff00);
    // scene.add(boxHelper);
  },
  function(xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function(error) {
    console.error(error);
  }
);

var light = new THREE.AmbientLight(0xffffff); // soft white light
scene.add(light);

// var axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0, 20, 100);
controls.autoRotate = true;
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.zoomSpeed = 0.8;
controls.maxDistance = 120;

controls.update();

let exploding = false;
setInterval(() => {
  exploding = !exploding;
  console.log(exploding);
}, 3000);

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
  renderer.render(scene, camera);

  if (brainPoints) {
    let particlePositions = brainPoints.geometry.attributes.position;
    let originalParticlePositions =
      brainPoints.geometry.attributes.initialPositions;

    if (exploding) {
      for (let i = 0; i < particlePositions.count; i++) {
        const px = particlePositions.getX(i);
        const py = particlePositions.getY(i);
        const pz = particlePositions.getZ(i);

        particlePositions.setXYZ(
          i,
          px + (Math.random() * 2 - 1) * 0.2,
          py + (Math.random() * 2 - 1) * 0.2,
          pz + (Math.random() * 2 - 1) * 0.2
        );
      }

      particlePositions.needsUpdate = true;
    } else {
      for (let i = 0; i < particlePositions.count; i++) {
        const ix = originalParticlePositions.getX(i);
        const iy = originalParticlePositions.getY(i);
        const iz = originalParticlePositions.getZ(i);
        const px = particlePositions.getX(i);
        const py = particlePositions.getY(i);
        const pz = particlePositions.getZ(i);

        particlePositions.setXYZ(
          i,
          px - (px - ix) / 10,
          py - (py - iy) / 10,
          pz - (pz - iz) / 10
        );
      }

      particlePositions.needsUpdate = true;
    }

    // const object = brainPoints;
    // const box = new THREE.Box3().setFromObject(brainPoints);
    // const center = box.getCenter(new THREE.Vector3());
    // object.position.x += object.position.x - center.x;
    // object.position.y += object.position.y - center.y;
    // object.position.z += object.position.z - center.z;
  }
}
animate();
