import * as THREE from "three";


// Main
export function processing_entity(camera, controls, entity) {
    //---------------
    
    normalize_height(entity, 5);
    put_on_ground(entity);
    frame_entity(camera, controls, entity);

    //---------------
}

// Subfunction
function normalize_height(entity, targetHeight){
    const box = new THREE.Box3().setFromObject(entity);
    if (box.isEmpty()) return;

    const height = box.max.z - box.min.z;
    if (!Number.isFinite(height) || height <= Number.EPSILON) return;

    entity.scale.multiplyScalar(targetHeight / height);
    entity.updateMatrixWorld(true);
}

function put_on_ground(entity){
    //---------------

    const box = new THREE.Box3().setFromObject(entity);
    if (box.isEmpty()) return;

    const center = box.getCenter(new THREE.Vector3());

    entity.position.x -= center.x;
    entity.position.y -= center.y;
    entity.position.z -= box.min.z;

    //---------------
}
function frame_entity(camera, controls, entity) {
    const box = new THREE.Box3().setFromObject(entity);
    if (box.isEmpty()) return;

    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const halfFov = THREE.MathUtils.degToRad(camera.fov * 0.5);
    const fitHeightDistance = sphere.radius / Math.sin(halfFov);
    const fitWidthDistance = fitHeightDistance / Math.max(camera.aspect, 0.1);
    const distance = Math.max(fitHeightDistance, fitWidthDistance) * 1.1;

    // Equal positive X/Y components give a 45° horizontal view.
    const direction = new THREE.Vector3(1, 1, 0.375).normalize();
    controls.target.copy(sphere.center);
    camera.position.copy(sphere.center).addScaledVector(direction, distance);
    camera.lookAt(sphere.center);
    controls.update();
}
