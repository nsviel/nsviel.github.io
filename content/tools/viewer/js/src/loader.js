import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

export async function load_glb(url) {
    const draco = new DRACOLoader();
    draco.setDecoderPath("./draco/");
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    try {
        const gltf = await loader.loadAsync(url);
        gltf.scene.traverse((child) => {
            if (!child.isMesh) return;
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.geometry && !child.geometry.attributes.normal) child.geometry.computeVertexNormals();
        });
        // glTF est toujours Y-up. Le viewer et Blender travaillent ici en Z-up :
        // (x, y, z) glTF devient (x, -z, y) dans la scène du viewer.
        const zUpScene = new THREE.Group();
        zUpScene.rotation.x = Math.PI / 2;
        zUpScene.add(gltf.scene);
        zUpScene.updateMatrixWorld(true);

        return zUpScene;
    } finally {
        draco.dispose();
    }
}

export function path_from_query() {
    const path = new URLSearchParams(window.location.search).get("path");
    return path ? new URL(path, window.location.href).toString() : null;
}
