import { engine, param, object } from '../utils/struct.js';
export * from "../utils/gl-matrix-min.js";


// Main
export function compute_viewport(){
    const gl = engine.context;
    //-----------------------

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    compute_mvp();

    //-----------------------
}
export function runtime_camera(){
    //-----------------------

    compute_canvas_size();
    compute_viewport();
    compute_mvp();

    //-----------------------
}

// Subfunction
function compute_canvas_size(){
    const canvas = engine.canvas;
    //-----------------------

    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    let needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;
    if(needResize){
        // Make the canvas the same size
        canvas.width  = displayWidth;
        canvas.height = displayHeight;
    }

    //-----------------------
    return needResize;
}

function compute_mvp(){
    const gl = engine.context;
    //-----------------------

    // Create a perspective matrix, a special matrix that is
    const fieldOfView = 90 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const proj_mat = glMatrix.mat4.create();
    glMatrix.mat4.perspective(proj_mat, fieldOfView, aspect, zNear, zFar);
    //glMatrix.mat4.ortho(proj_mat, -1.0, 1.0, -1.0, 1.0, zNear, zFar);

    // Model view matrix
    const modelview_mat = glMatrix.mat4.create();

    //Stock info into a dedicated structure
    engine.mvp.projection = proj_mat;
    engine.mvp.modelview = modelview_mat;
    engine.mvp.mvp = modelview_mat;

    //-----------------------
}
