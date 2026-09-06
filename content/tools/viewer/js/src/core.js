import * as three from "./threejs.js";
import { load_glb, path_from_query } from "./loader.js";
import { add_glyph } from "./glyph.js";
import { place_and_frame } from "./processing.js";
import { add_light } from "./light.js";
import { add_camera } from "./camera.js";
import { add_control } from "./control.js";
import { add_event } from "./event.js";
import { run_loop } from "./loop.js";
import { create_composer_with_edl } from "./edl.js";

export async function engine() {
    const renderer = three.create_renderer(three.create_canvas("webgl"));
    const scene = three.create_scene();
    const camera = add_camera(renderer);
    const controls = add_control(scene, renderer, camera);
    three.bind_fog_to_zoom(scene, camera, controls);
    add_glyph(scene);
    const { directional, ambient } = add_light(scene);
    const update_keyboard = add_event(renderer, camera, controls);

    const composer = create_composer_with_edl(renderer, scene, camera);
    run_loop(composer, camera, scene, null, controls, update_keyboard);

    const input = document.getElementById("file-input");
    const openButtons = [document.getElementById("open-button"), document.getElementById("welcome-button")];
    const sampleButtons = document.querySelectorAll("[data-model-url]");
    const welcome = document.getElementById("welcome");
    const dropZone = document.getElementById("drop-zone");
    const status = document.getElementById("status");
    const filename = document.getElementById("filename");
    const loading = document.getElementById("loading");
    const loadingText = document.getElementById("loading-text");
    const initialPath = path_from_query();
    document.body.classList.toggle("tool-viewer", !initialPath);
    const lightBalanceControl = document.getElementById("light-balance");
    const lightAzimuthControl = document.getElementById("light-azimuth");
    const lightBrightnessControl = document.getElementById("light-brightness");
    const lightHorizontalDistance = Math.hypot(5, 5);
    const lightHeight = directional.position.z;

    const updateLightBalance = () => {
        const balance = Number(lightBalanceControl.value);
        const totalIntensity = Number(lightBrightnessControl.value);
        const minimumDirectionalShare = 0.2;
        const variableShare = 0.8;
        ambient.intensity = (1 - balance) * variableShare * totalIntensity;
        directional.intensity = (minimumDirectionalShare + balance * variableShare) * totalIntensity;
    };

    const updateDirectionalPosition = () => {
        const angle = Number(lightAzimuthControl.value) * Math.PI / 180;
        const target = controls.target;
        directional.target.position.copy(target);
        directional.position.set(
            target.x + Math.cos(angle) * lightHorizontalDistance,
            target.y + Math.sin(angle) * lightHorizontalDistance,
            lightHeight
        );
    };

    let azimuthDrag = null;
    const wrapAngle = (angle) => ((angle % 360) + 360) % 360;

    lightAzimuthControl.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        const bounds = lightAzimuthControl.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
        lightAzimuthControl.value = String(ratio * 360);
        updateDirectionalPosition();
        azimuthDrag = {
            pointerId: event.pointerId,
            lastX: event.clientX,
            width: bounds.width
        };
        lightAzimuthControl.setPointerCapture(event.pointerId);
    });

    lightAzimuthControl.addEventListener("pointermove", (event) => {
        if (!azimuthDrag || event.pointerId !== azimuthDrag.pointerId) return;
        event.preventDefault();
        const deltaAngle = (event.clientX - azimuthDrag.lastX) / azimuthDrag.width * 360;
        lightAzimuthControl.value = String(wrapAngle(Number(lightAzimuthControl.value) + deltaAngle));
        azimuthDrag.lastX = event.clientX;
        updateDirectionalPosition();
    });

    const stopAzimuthDrag = (event) => {
        if (!azimuthDrag || event.pointerId !== azimuthDrag.pointerId) return;
        if (lightAzimuthControl.hasPointerCapture(event.pointerId)) {
            lightAzimuthControl.releasePointerCapture(event.pointerId);
        }
        azimuthDrag = null;
    };

    lightAzimuthControl.addEventListener("pointerup", stopAzimuthDrag);
    lightAzimuthControl.addEventListener("pointercancel", stopAzimuthDrag);
    lightBalanceControl.addEventListener("input", updateLightBalance);
    lightBrightnessControl.addEventListener("input", updateLightBalance);
    lightAzimuthControl.addEventListener("input", updateDirectionalPosition);
    controls.addEventListener("change", updateDirectionalPosition);
    updateLightBalance();
    updateDirectionalPosition();
    let entity = null;

    function showLoading(message = "Loading model…") {
        loadingText.textContent = message;
        loading.classList.remove("hidden", "error");
    }

    function hideLoading() {
        // Attendre une frame garantit que le modèle a été rendu avant le fondu.
        requestAnimationFrame(() => loading.classList.add("hidden"));
    }

    function showLoadingError() {
        loadingText.textContent = "Unable to load this model.";
        loading.classList.add("error");
    }

    function setStatus(message, error = false) {
        status.hidden = !message;
        status.textContent = message;
        status.classList.toggle("error", error);
    }

    function dispose(object) {
        if (!object) return;
        object.traverse((child) => {
            child.geometry?.dispose();
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.filter(Boolean).forEach((material) => {
                Object.values(material).forEach((value) => value?.isTexture && value.dispose());
                material.dispose();
            });
        });
        scene.remove(object);
    }

    async function display(url, name) {
        showLoading();
        setStatus("Loading model…");
        try {
            const next = await load_glb(url);
            dispose(entity);
            entity = next;
            scene.add(entity);
            place_and_frame(camera, controls, entity);
            updateDirectionalPosition();
            filename.textContent = name;
            welcome.classList.add("hidden");
            document.body.classList.add("model-loaded");
            setStatus("");
            hideLoading();
        } catch (error) {
            console.error(error);
            setStatus("Unable to open this GLB file.", true);
            showLoadingError();
        }
    }

    openButtons.forEach((button) => button.addEventListener("click", () => input.click()));
    sampleButtons.forEach((button) => button.addEventListener("click", () => {
        const url = new URL(button.dataset.modelUrl, window.location.href).toString();
        display(url, button.dataset.modelName);
    }));
    input.addEventListener("change", async () => {
        const file = input.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        await display(url, file.name);
        URL.revokeObjectURL(url);
        input.value = "";
    });

    let dragDepth = 0;
    window.addEventListener("dragenter", (event) => { event.preventDefault(); dragDepth++; dropZone.classList.add("visible"); });
    window.addEventListener("dragover", (event) => event.preventDefault());
    window.addEventListener("dragleave", (event) => { event.preventDefault(); if (--dragDepth <= 0) { dragDepth = 0; dropZone.classList.remove("visible"); } });
    window.addEventListener("drop", async (event) => {
        event.preventDefault();
        dragDepth = 0;
        dropZone.classList.remove("visible");
        const file = [...event.dataTransfer.files].find((item) => item.name.toLowerCase().endsWith(".glb"));
        if (!file) return setStatus("Please drop a .glb file.", true);
        const url = URL.createObjectURL(file);
        await display(url, file.name);
        URL.revokeObjectURL(url);
    });

    if (initialPath) {
        display(initialPath, decodeURIComponent(initialPath.split("/").pop().split("?")[0]));
    } else {
        hideLoading();
    }
}
