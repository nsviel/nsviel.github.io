import * as THREE from "three";
import { add_torus } from "./primitive.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { PLYLoader } from "three/addons/loaders/PLYLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";


// Main
export async function load_entity(scene) {
    const url = resolve_url();
    const format = get_format(url);

    let entity = null;
    switch (format) {
        case "obj":
            entity = await load_obj(url);
            break;
        case "ply":
            entity = await load_ply(url);
            break;
        case "glb":
        case "gltf":
            entity = await load_glb(url);
            break;
        default:
            console.warn("Format non supporté:", format);
            entity = add_torus(scene);
            break;
    }

    scene.add(entity);
    return entity;
}

// Subfunction
function resolve_url() {
    const params = new URLSearchParams(window.location.search);
    const objPath = params.get("path");

    if (!objPath) {
        return "";
    }

    const base = (window.parent && window.parent.location)
        ? window.parent.location.href
        : window.location.href;

    return new URL(objPath, base).toString();
}

function get_format(url) {
    const clean = url.split("?")[0];
    return clean.split(".").pop().toLowerCase();
}

async function load_obj(url) {
    const loader = new OBJLoader();
    const obj = await loader.loadAsync(url);

    obj.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    return obj;
}

async function load_ply(url) {
    const loader = new PLYLoader();
    const geometry = await loader.loadAsync(url);

    geometry.computeVertexNormals();

    if (geometry.hasAttribute("intensity") && !geometry.hasAttribute("color")) {
        const intensityAttr = geometry.getAttribute("intensity");
        const count = intensityAttr.count;

        let min = Infinity;
        let max = -Infinity;

        for (let i = 0; i < count; i++) {
            const v = intensityAttr.getX(i);
            min = Math.min(min, v);
            max = Math.max(max, v);
        }

        const range = max - min || 1.0;
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const v = intensityAttr.getX(i);
            const n = (v - min) / range;

            colors[i * 3 + 0] = n;
            colors[i * 3 + 1] = n;
            colors[i * 3 + 2] = n;
        }

        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    }

    let object;

    if (geometry.index !== null) {
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.0,
            roughness: 0.8,
            vertexColors: geometry.hasAttribute("color")
        });

        object = new THREE.Mesh(geometry, material);
        object.castShadow = true;
        object.receiveShadow = true;
    } else {
        const material = new THREE.PointsMaterial({
            size: 0.01,
            vertexColors: geometry.hasAttribute("color"),
            color: 0xffffff
        });

        object = new THREE.Points(geometry, material);
    }

    return object;
}

async function load_glb(url) {
    const dracoLoader = new DRACOLoader();

    // chemin vers les fichiers Draco :
    // draco_decoder.js
    // draco_decoder.wasm
    // draco_wasm_wrapper.js
    dracoLoader.setDecoderPath("draco/");
    dracoLoader.preload();

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    const gltf = await loader.loadAsync(url);
    const object = gltf.scene;

    object.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.geometry && !child.geometry.attributes.normal) {
                child.geometry.computeVertexNormals();
            }
        }
    });

    dracoLoader.dispose();

    return object;
}
