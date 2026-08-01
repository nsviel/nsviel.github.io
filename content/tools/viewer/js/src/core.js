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
    add_glyph(scene);
    const { ambient } = add_light(scene);
    add_event(renderer, camera);

    const composer = create_composer_with_edl(renderer, scene, camera);
    run_loop(composer, camera, scene, null, controls);

    const input = document.getElementById("file-input");
    const openButtons = [document.getElementById("open-button"), document.getElementById("welcome-button")];
    const welcome = document.getElementById("welcome");
    const dropZone = document.getElementById("drop-zone");
    const status = document.getElementById("status");
    const filename = document.getElementById("filename");
    const loading = document.getElementById("loading");
    const loadingText = document.getElementById("loading-text");
    const ambientControl = document.getElementById("ambient-light");
    ambientControl.addEventListener("input", () => {
        ambient.intensity = Number(ambientControl.value);
    });
    let entity = null;

    function showLoading(message = "Chargement du modèle…") {
        loadingText.textContent = message;
        loading.classList.remove("hidden", "error");
    }

    function hideLoading() {
        // Attendre une frame garantit que le modèle a été rendu avant le fondu.
        requestAnimationFrame(() => loading.classList.add("hidden"));
    }

    function showLoadingError() {
        loadingText.textContent = "Impossible de charger ce modèle.";
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
        setStatus("Chargement du modèle…");
        try {
            const next = await load_glb(url);
            dispose(entity);
            entity = next;
            scene.add(entity);
            place_and_frame(camera, controls, entity);
            filename.textContent = name;
            welcome.classList.add("hidden");
            setStatus("");
            hideLoading();
        } catch (error) {
            console.error(error);
            setStatus("Impossible d’ouvrir ce fichier GLB.", true);
            showLoadingError();
        }
    }

    openButtons.forEach((button) => button.addEventListener("click", () => input.click()));
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
        if (!file) return setStatus("Veuillez déposer un fichier .glb.", true);
        const url = URL.createObjectURL(file);
        await display(url, file.name);
        URL.revokeObjectURL(url);
    });

    const initialPath = path_from_query();
    if (initialPath) {
        display(initialPath, decodeURIComponent(initialPath.split("/").pop().split("?")[0]));
    } else {
        hideLoading();
    }
}
