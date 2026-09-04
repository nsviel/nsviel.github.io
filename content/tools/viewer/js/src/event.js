import * as THREE from "three";
import { MIN_CAMERA_HEIGHT } from "./control.js";


// Main function
export function add_event(renderer, camera, controls){
    //---------------

    event_resize(renderer, camera);
    return event_keyboard(camera, controls);

    //---------------
}

// Subfunction
function event_resize(renderer, camera){
    //---------------

    function resize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }

    window.addEventListener("resize", resize);
    resize();

    //---------------
}
function event_keyboard(camera, controls){
    //---------------

    const movementKeys = new Set([
        "arrowleft", "arrowright", "arrowup", "arrowdown",
        "q", "d", "z", "s", "a", "e"
    ]);
    const pressedKeys = new Set();
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const movement = new THREE.Vector3();

    function isFormControl(target) {
        return target instanceof HTMLInputElement
            || target instanceof HTMLTextAreaElement
            || target instanceof HTMLSelectElement
            || target?.isContentEditable;
    }

    window.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase();
        if (!movementKeys.has(key) || isFormControl(event.target)) return;
        event.preventDefault();
        pressedKeys.add(key);
    });

    window.addEventListener("keyup", (event) => {
        const key = event.key.toLowerCase();
        if (!movementKeys.has(key)) return;
        pressedKeys.delete(key);
    });

    window.addEventListener("blur", () => pressedKeys.clear());
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) pressedKeys.clear();
    });

    return function update_keyboard(deltaTime) {
        const forwardAxis = Number(pressedKeys.has("z") || pressedKeys.has("arrowup"))
            - Number(pressedKeys.has("s") || pressedKeys.has("arrowdown"));
        const rightAxis = Number(pressedKeys.has("d") || pressedKeys.has("arrowright"))
            - Number(pressedKeys.has("q") || pressedKeys.has("arrowleft"));
        const verticalAxis = Number(pressedKeys.has("e")) - Number(pressedKeys.has("a"));

        if (forwardAxis === 0 && rightAxis === 0 && verticalAxis === 0) return;

        forward.subVectors(controls.target, camera.position);
        forward.z = 0;
        if (forward.lengthSq() < Number.EPSILON) forward.set(0, 1, 0);
        forward.normalize();
        right.crossVectors(forward, camera.up).normalize();

        movement.set(0, 0, verticalAxis)
            .addScaledVector(forward, forwardAxis)
            .addScaledVector(right, rightAxis)
            .normalize();

        const distance = camera.position.distanceTo(controls.target);
        movement.multiplyScalar(Math.max(distance * 0.35, 0.5) * deltaTime);
        movement.z = Math.max(
            movement.z,
            -controls.target.z,
            MIN_CAMERA_HEIGHT - camera.position.z
        );

        controls.target.add(movement);
        camera.position.add(movement);
    };

    //---------------
}



