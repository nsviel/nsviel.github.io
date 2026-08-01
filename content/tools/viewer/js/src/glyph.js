import * as THREE from "three";


// Main
export function add_glyph(scene) {
    //---------------

    const grid = add_grid(scene);
    const axes = add_axes(scene);

    //---------------
}

// Subfunction
function add_grid(scene) {
    //---------------

    // Une maille par unité suffit à l'échelle normalisée des modèles.
    // Une grille trop dense au loin produit du moiré pendant les mouvements.
    const size = 100;
    const divisions = 100;

    // 1️⃣ Plan plein
    const planeGeo = new THREE.PlaneGeometry(size, size);
    const planeMat = new THREE.MeshStandardMaterial({
        color: 0x4f4f4f,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: 2,
        polygonOffsetUnits: 2
    });

    const plane = new THREE.Mesh(planeGeo, planeMat);
    // Le support et les lignes ne sont plus coplanaires : aucun z-fighting.
    plane.position.z = -0.025;
    plane.receiveShadow = true;
    scene.add(plane);

    // 2️⃣ Grille
    const grid = new THREE.GridHelper(size, divisions, 0x8f969e, 0x686e75);
    grid.rotation.x = Math.PI / 2;
    grid.material.transparent = false;
    grid.material.depthWrite = true;
    grid.material.fog = true;
    scene.add(grid);

    //---------------
    return { plane, grid };
}
function add_axes(scene) {
    //---------------

    let length = 1;
    let showLabels = false;
    let radius = 0.01;

    const axes = new THREE.Group();

    function createAxis(color, direction) {
        const geometry = new THREE.CylinderGeometry(radius, radius, length, 16);
        const material = new THREE.MeshStandardMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);

        // Orienter cylindre (par défaut axe Y)
        if (direction === "x") mesh.rotation.z = -Math.PI / 2;
        if (direction === "z") mesh.rotation.x = Math.PI / 2;

        // Positionner à moitié
        if (direction === "x") mesh.position.x = length / 2;
        if (direction === "y") mesh.position.y = length / 2;
        if (direction === "z") mesh.position.z = length / 2;

        return mesh;
    }

    axes.add(createAxis(0xff0000, "x"));
    axes.add(createAxis(0x00ff00, "y"));
    axes.add(createAxis(0x0000ff, "z"));

    scene.add(axes);

    //---------------
    return axes;
}

