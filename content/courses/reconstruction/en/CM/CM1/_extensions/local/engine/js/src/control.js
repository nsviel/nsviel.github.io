import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


// Main
export function add_control(scene, renderer, camera){
    //---------------

    const controls = create_control(renderer, camera);
    add_target(scene, controls);
    add_event(controls, camera);
    
    //---------------
    return controls;
}

// Subfunction
function create_control(renderer, camera){
    //---------------

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0, 0);
    //controls.maxPolarAngle = Math.PI / 2 - 0.01;

    //---------------
    return controls;
}
function add_event(controls, camera){
    //---------------

    controls.addEventListener("change", () => {
        // Clamp absolu du target
        if (controls.target.z < 0) {
            controls.target.z = 0;
        }

        // Clamp absolu de la caméra
        if (camera.position.z < 0) {
            camera.position.z = 0;
        }
    });

    //---------------
}
function add_target(scene, controls) {
    //---------------

    const size = 0.1;   // longueur demi-branche
    const color = 0xffffff;

    const material = new THREE.LineBasicMaterial({ color });

    const geometryX = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-size, 0, 0),
        new THREE.Vector3( size, 0, 0)
    ]);

    const geometryY = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -size, 0),
        new THREE.Vector3(0,  size, 0)
    ]);

    const lineX = new THREE.Line(geometryX, material);
    const lineY = new THREE.Line(geometryY, material);

    const cross = new THREE.Group();
    cross.add(lineX);
    cross.add(lineY);

    scene.add(cross);

    // ---- Synchronisation avec orbit target ----
    function updateCross() {
        cross.position.copy(controls.target);
    }

    // Update à chaque mouvement caméra
    controls.addEventListener("change", updateCross);

    // Position initiale
    updateCross();

    //---------------
}
