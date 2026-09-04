import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const MIN_CAMERA_HEIGHT = 0.05;

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

    function update_ground_limit() {
        const correction = Math.max(
            -controls.target.z,
            MIN_CAMERA_HEIGHT - camera.position.z,
            0
        );

        // Déplacer caméra et pivot ensemble préserve la géométrie de l'orbite.
        if (correction > 0) {
            controls.target.z += correction;
            camera.position.z += correction;
        }

        const distance = Math.max(
            camera.position.distanceTo(controls.target),
            Number.EPSILON
        );
        const minimumVerticalOffset = (MIN_CAMERA_HEIGHT - controls.target.z) / distance;
        controls.maxPolarAngle = Math.acos(
            THREE.MathUtils.clamp(minimumVerticalOffset, -1, 1)
        );
    }

    controls.addEventListener("change", update_ground_limit);
    update_ground_limit();

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
