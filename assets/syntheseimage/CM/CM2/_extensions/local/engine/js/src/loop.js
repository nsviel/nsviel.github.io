
// Main 
export function run_loop(composer, camera, scene, mesh, controls){
    //---------------

    let raf = 0;
    function animate(t){
        update(composer, camera, scene, mesh, controls, t);
        raf = requestAnimationFrame(animate);
    }    
    raf = requestAnimationFrame(animate);

    document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(animate);
    });

    //---------------
}

// Subfunction
function update(composer, camera, scene, mesh, controls, t){
    //---------------

    if(mesh){
       // mesh.rotation.z = t * 0.00035;
    }
    controls.update();
    composer.render();

    //---------------
}

