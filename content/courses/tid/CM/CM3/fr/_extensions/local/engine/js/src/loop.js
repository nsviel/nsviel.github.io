
// Render only while the camera is moving or when the scene is invalidated.
export function run_loop(renderPipeline, controls){
    let raf = 0;

    function request_render(){
        if (document.hidden || raf !== 0) return;
        raf = requestAnimationFrame(render);
    }

    function render(){
        raf = 0;
        controls.update();
        renderPipeline.render();
    }

    controls.addEventListener("change", request_render);
    window.addEventListener("resize", request_render);
    document.addEventListener("visibilitychange", () => {
        if (document.hidden && raf !== 0) {
            cancelAnimationFrame(raf);
            raf = 0;
        } else if (!document.hidden) {
            request_render();
        }
    });

    request_render();
    return request_render;
}

