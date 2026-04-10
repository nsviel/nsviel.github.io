import { engine, param } from '../utils/struct.js';


// Main
export function init(){
    const gl = engine.context
    const program = engine.shader.program;
    //-----------------------

    engine.shader.attribut.location = gl.getAttribLocation(program, 'in_position');
    engine.shader.attribut.color = gl.getAttribLocation(program, 'in_color');
    engine.shader.uniform.in_mvp = gl.getUniformLocation(program, 'in_mvp');
    engine.shader.uniform.is_point = gl.getUniformLocation(program, 'is_point');
    engine.shader.uniform.point_size = gl.getUniformLocation(program, 'point_size');

    gl.uniformMatrix4fv(engine.shader.uniform.in_mvp, false, engine.mvp.mvp);
    gl.uniform1f(engine.shader.uniform.point_size, param.point_size);

    //-----------------------
}
export function runtime(){
    const gl = engine.context;
    //-----------------------

    gl.uniform1f(engine.shader.uniform.point_size, param.point_size);

    //-----------------------
}
