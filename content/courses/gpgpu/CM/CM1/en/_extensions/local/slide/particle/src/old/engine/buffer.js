import { engine, object } from '../utils/struct.js';


// Main
export function create_buffer(data){
    const gl = engine.context;
    //-----------------------

    // Create buffer
    data.vbo_xy = gl.createBuffer();
    data.vbo_rgb = gl.createBuffer();

    // Bind buffer
    let XY = [];
    let RGB = [];
    for(let i=0; i<data.xy.length; i++){
        XY.push(data.xy[i][0]);
        XY.push(data.xy[i][1]);

        RGB.push(data.rgb[i][0]);
        RGB.push(data.rgb[i][1]);
        RGB.push(data.rgb[i][2]);
        RGB.push(data.rgb[i][3]);
    }

    //Add to GPU
    gl.bindBuffer(gl.ARRAY_BUFFER, data.vbo_xy);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(XY), gl.STREAM_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, data.vbo_rgb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(RGB), gl.STREAM_DRAW);

    //-----------------------
}
export function update_buffer(data){
    const gl = engine.context;
    //-----------------------

    //Serialization
    let XY = [];
    let RGB = [];
    for(let i=0; i<data.xy.length; i++){
        XY.push(data.xy[i][0]);
        XY.push(data.xy[i][1]);

        RGB.push(data.rgb[i][0]);
        RGB.push(data.rgb[i][1]);
        RGB.push(data.rgb[i][2]);
        RGB.push(data.rgb[i][3]);
    }

    //GPU update
    gl.bindBuffer(gl.ARRAY_BUFFER, data.vbo_xy);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(XY), gl.STREAM_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, data.vbo_rgb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(RGB), gl.STREAM_DRAW);

    //-----------------------
}
export function draw_buffer(data){
    const gl = engine.context;
    //-----------------------

    gl.uniform1f(engine.shader.uniform.point_size, object.point.size);

    //Location
    gl.bindBuffer(gl.ARRAY_BUFFER, data.vbo_xy);
    gl.vertexAttribPointer(engine.shader.attribut.location, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(engine.shader.attribut.location);

    //Color
    gl.bindBuffer(gl.ARRAY_BUFFER, data.vbo_rgb);
    gl.vertexAttribPointer(engine.shader.attribut.color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(engine.shader.attribut.color);

    //Draw
    gl.drawArrays(data.draw_type, 0, data.xy.length);

    //-----------------------
}
