import { engine, param, object } from '../utils/struct.js';
import { compute_viewport } from './camera.js';


// Main 
export function init(){
    //-----------------------

    init_context();
    //init_listener();
    compute_viewport();

    //-----------------------
}

// Subfunction
function init_context(){
    //-----------------------

    // Init context
    const canvas = document.querySelector('#webgl');
    const gl = canvas.getContext('webgl2', {alpha: true, premultipliedAlpha: false});
    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }
    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Store it
    engine.context = gl;
    engine.canvas = canvas;

    //-----------------------
}
function init_listener(){
    let canvas = engine.canvas;
    //-----------------------

    canvas.addEventListener("mouseover", event => set_mouse_over(true));
    canvas.addEventListener("mouseout", event => set_mouse_over(false));
    canvas.addEventListener("mousemove", event => get_mouse_pos(event, canvas));
    canvas.addEventListener("click", event => add_point_mouse());

    //-----------------------
}
function get_webgl_info(){
    //-----------------------

    say(gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
    say(gl.getParameter(gl.VERSION));

    //-----------------------
}

