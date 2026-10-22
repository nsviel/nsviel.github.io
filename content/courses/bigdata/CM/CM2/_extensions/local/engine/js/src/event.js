import * as THREE from "three";


// Main function
export function add_event(renderer, camera, renderPipeline){
    //---------------

    event_resize(renderer, camera, renderPipeline);
    event_keyboard();

    //---------------
}

// Subfunction
function event_resize(renderer, camera, renderPipeline){
    //---------------

    function resize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderPipeline.setSize();
    }

    window.addEventListener("resize", resize);
    resize();

    //---------------
}
function event_keyboard(){
    //---------------



    //---------------
}



