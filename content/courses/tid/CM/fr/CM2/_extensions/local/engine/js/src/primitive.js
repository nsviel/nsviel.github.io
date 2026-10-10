import * as THREE from "three";


// Main 
export function add_torus(scene){
    //---------------

    const mesh = new THREE.Mesh(
        new THREE.TorusKnotGeometry(1, 0.35, 180, 24),
        new THREE.MeshStandardMaterial({ metalness: 0.3, roughness: 0.4 })
    );
    mesh.castShadow = true;

    scene.add(mesh);

    //---------------
    return mesh;
}
