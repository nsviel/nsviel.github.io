
// Main 
export function run_loop(composer, camera, scene, mesh, controls, update_keyboard){
    //---------------

    let raf = 0;
    let previousTime = 0;
    function animate(t){
        const deltaTime = previousTime ? Math.min((t - previousTime) / 1000, 0.1) : 0;
        previousTime = t;
        update(composer, camera, scene, mesh, controls, deltaTime, update_keyboard);
        raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            cancelAnimationFrame(raf);
            previousTime = 0;
        } else {
            raf = requestAnimationFrame(animate);
        }
    });

    //---------------
}

// Subfunction
function update(composer, camera, scene, mesh, controls, deltaTime, update_keyboard){
    //---------------

    if(mesh){
       // mesh.rotation.z = t * 0.00035;
    }
    update_keyboard(deltaTime);
    controls.update();
    composer.render();

    //---------------
}

