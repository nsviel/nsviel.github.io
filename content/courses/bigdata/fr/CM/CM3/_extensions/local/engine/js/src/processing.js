import * as THREE from "three";


// Main
export function processing_entity(controls, entity) {
    //---------------
    
    put_on_ground(entity);
    center_control_target(controls, entity);

    //---------------
}

// Subfunction
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
function center_control_target(controls, entity) {
    //---------------

    const box = new THREE.Box3().setFromObject(entity);
    const center = box.getCenter(new THREE.Vector3());

    controls.target.copy(center);
    controls.update();
    
    //---------------
}
