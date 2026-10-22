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
    // A 1:1 pixel ratio substantially reduces GPU fill-rate while orbiting.
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;

    //---------------
    return renderer;
}
export function create_scene(){
    //---------------

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    scene.fog = new THREE.FogExp2(0x111111, 0.025);


    //---------------
    return scene;
}
