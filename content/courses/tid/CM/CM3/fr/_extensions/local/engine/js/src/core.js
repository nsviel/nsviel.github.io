import * as three from "./threejs.js";
import * as loader from "./loader.js";
import * as glyph from "./glyph.js";
import * as process from "./processing.js";
import * as edl from "./edl.js";
import { add_light } from "./light.js";
import { add_camera } from "./camera.js";
import { add_control } from "./control.js";
import { add_event } from "./event.js";
import { add_object } from "./scene.js";
import { run_loop } from "./loop.js";
import { add_overlay } from "./ui.js";





// Main
export async function engine() {
    //---------------

    // Init
    const canvas = three.create_canvas("webgl");
    const renderer = three.create_renderer(canvas);
    const scene = three.create_scene(); 
    
    // Elements
    const camera = add_camera(renderer);
    const controls = add_control(scene, renderer, camera);
    const visualHelpers = glyph.add_glyph(scene);

    // Scene
    add_light(scene);
    const entity = await loader.load_entity(scene);
    process.processing_entity(camera, controls, entity)

    // Rendering
    const renderPipeline = edl.create_composer_with_edl(renderer, scene, camera);
    add_event(renderer, camera, renderPipeline);
    const requestRender = run_loop(renderPipeline, controls);
    add_overlay(
        [visualHelpers],
        entity,
        renderer,
        requestRender
    );

    //---------------
}
