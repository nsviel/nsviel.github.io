import { engine, param, object } from '../utils/struct.js';
import * as parameter from './parameter.js';
import { shader_fragment } from './fragment.js';
import { shader_vertex } from './vertex.js';


// Main
export function init(){
    //-----------------------

    //Init shader stuff
    const [vs, fs] = serialize_shader();
    init_program(vs, fs);
    parameter.init();

    //-----------------------
}

// Subfunction
function serialize_shader(){
    //-----------------------

    const vs = shader_vertex();
    const fs = shader_fragment();

    //-----------------------
    return [vs, fs];
}
function init_program(vs, fs) {
    const gl = engine.context
    //-----------------------

    const vertex = load_shader(gl, gl.VERTEX_SHADER, vs);
    const fragme = load_shader(gl, gl.FRAGMENT_SHADER, fs);

    // Create the shader program
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragme);
    gl.linkProgram(program);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
        return null;
    }

    gl.useProgram(program);

    //-----------------------
    engine.shader.program = program;
}
function load_shader(gl, type, source) {
    //-----------------------

    const shader = gl.createShader(type);

    // Send the source to the shader object
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    //-----------------------
    return shader;
}
