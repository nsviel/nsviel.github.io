import { engine, object } from '../utils/struct.js';
import { runtime_camera } from '../engine/camera.js';
import { runtime_shader } from '../engine/shader.js';
import { update_buffer, draw_buffer } from '../engine/buffer.js';
import { runtime_point } from './point.js';
import { runtime_line } from './line.js';


// Main
export function draw(){
    //-----------------------

    //WebGL
    runtime_camera();
    runtime_shader();

    //Runtime functions
    runtime_point();
    runtime_line();

    //Draw objects
    draw_point();
    draw_line();

    //-----------------------
}

// Subfunction
function draw_point(){
    const gl = engine.context;
    //-----------------------

    gl.uniform1i(engine.shader.uniform.is_point, 1);
    update_buffer(object.point);
    draw_buffer(object.point);

    //-----------------------
}
function draw_line(){
    const gl = engine.context;
    //-----------------------

    //Draw object.line
    gl.uniform1i(engine.shader.uniform.is_point, 0);
    update_buffer(object.line);
    draw_buffer(object.line);

    //-----------------------
}
