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
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //---------------
    return renderer;
}
export function create_scene(){
    //---------------

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    scene.fog = new THREE.Fog( 0x111111, 10, 1000 );


    //---------------
    return scene;
}
