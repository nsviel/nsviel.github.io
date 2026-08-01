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
        return gltf.scene;
    } finally {
        draco.dispose();
    }
}

export function path_from_query() {
    const path = new URLSearchParams(window.location.search).get("path");
    return path ? new URL(path, window.location.href).toString() : null;
}
