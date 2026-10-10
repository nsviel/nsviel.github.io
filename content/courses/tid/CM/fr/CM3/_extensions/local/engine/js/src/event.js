import * as THREE from "three";


// Main function
export function add_event(renderer, camera){
    //---------------

    event_resize(renderer, camera);
    event_keyboard();

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
function event_keyboard(){
    //---------------



    //---------------
}



