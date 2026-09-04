export function add_overlay(helpers, entity, renderer, requestRender) {
    const helpersCheckbox = document.getElementById("toggle-helpers");
    const wireframeCheckbox = document.getElementById("toggle-wireframe");
    const originalWireframe = new WeakMap();

    helpersCheckbox.addEventListener("change", () => {
        for (const helper of helpers) {
            if (helper) helper.visible = helpersCheckbox.checked;
        }
        renderer.shadowMap.needsUpdate = true;
        requestRender();
    });

    wireframeCheckbox.addEventListener("change", () => {
        entity.traverse((child) => {
            if (!child.isMesh || !child.material) return;

            const materials = Array.isArray(child.material)
                ? child.material
                : [child.material];

            for (const material of materials) {
                if (!("wireframe" in material)) continue;
                if (!originalWireframe.has(material)) {
                    originalWireframe.set(material, material.wireframe);
                }
                material.wireframe = wireframeCheckbox.checked
                    ? true
                    : originalWireframe.get(material);
                material.needsUpdate = true;
            }
        });

        requestRender();
    });
}
