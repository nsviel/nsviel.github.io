import * as THREE from "three";

export function place_and_frame(camera, controls, entity) {
    const box = new THREE.Box3().setFromObject(entity);
    if (box.isEmpty()) return;

    const center = box.getCenter(new THREE.Vector3());
    entity.position.x -= center.x;
    entity.position.y -= center.y;
    entity.position.z -= box.min.z;

    box.setFromObject(entity);
    box.getCenter(center);
    const size = box.getSize(new THREE.Vector3());
    const radius = Math.max(size.x, size.y, size.z, 0.1);
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const distance = radius / (2 * Math.tan(fov / 2)) * 1.7;

    controls.target.copy(center);
    camera.position.set(center.x + distance, center.y - distance, center.z + distance * 0.75);
    camera.near = Math.max(radius / 1000, 0.001);
    camera.far = Math.max(radius * 100, 100);
    camera.updateProjectionMatrix();
    controls.minDistance = radius * 0.02;
    controls.maxDistance = radius * 30;
    controls.update();
}
