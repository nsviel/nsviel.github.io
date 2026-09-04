import * as THREE from "three";


// Main
export function create_canvas(id){
    //---------------

    const canvas = document.getElementById(id);

    //---------------
    return canvas;
}
export function create_renderer(canvas){
    //---------------

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    //---------------
    return renderer;
}
export function create_scene(){
    //---------------

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    scene.fog = new THREE.Fog(0x111111);


    //---------------
    return scene;
}
export function bind_fog_to_zoom(scene, camera, controls) {
    // Des ratios constants conservent la même densité apparente quand la
    // caméra s'éloigne, tout en effaçant la grille avant son moiré lointain.
    const nearRatio = 0.9;
    const farRatio = 4;

    function update_fog() {
        const distance = Math.max(
            camera.position.distanceTo(controls.target),
            camera.near
        );
        scene.fog.near = distance * nearRatio;
        scene.fog.far = distance * farRatio;
    }

    controls.addEventListener("change", update_fog);
    update_fog();
}
