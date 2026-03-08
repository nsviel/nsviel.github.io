import * as THREE from "three";

export function add_object(scene){
    //---------------

    const mesh = new THREE.Mesh(
        new THREE.TorusKnotGeometry(1, 0.35, 180, 24),
        new THREE.MeshStandardMaterial({ metalness: 0.3, roughness: 0.4 })
    );

    scene.add(mesh);

    //---------------
    return mesh;
}
