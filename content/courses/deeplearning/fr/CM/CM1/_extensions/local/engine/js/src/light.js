import * as THREE from "three";

export function add_light(scene){
    //---------------
    
  const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(5, 5, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.mapSize.set(2048, 2048);
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 50;
    light.shadow.camera.top = 2;
	light.shadow.camera.bottom = - 2;
	light.shadow.camera.left = - 2;
	light.shadow.camera.right = 2;
    light.shadow.bias = -0.0001;
    scene.add(light);

    scene.add(new THREE.AmbientLight(0xffffff, 1));

    //---------------
}

