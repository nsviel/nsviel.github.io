import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


export function add_camera(renderer){
    //---------------

    const camera = new THREE.PerspectiveCamera(60, 2, 0.1, 200);
    camera.position.set(3, 2, 4);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    //---------------
    return camera;
}
