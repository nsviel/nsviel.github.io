import { engine, param } from '../utils/struct.js';
import { convert_255_to_1 } from '../utils/utility.js';
import * as scene from "../scene/draw.js";


//Main functions
export function run(){
  const gl = engine.context;
  //-----------------------

  //main loop
  function render(){
    const rgb = convert_255_to_1(param.background_color);
    gl.clearColor(rgb[0], rgb[1], rgb[2], 1);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //tic();
    scene.draw();
    //info.time.scene = toc_return();

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  //-----------------------
}
