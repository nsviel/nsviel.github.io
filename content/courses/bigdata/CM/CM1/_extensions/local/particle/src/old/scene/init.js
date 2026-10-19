import { param, object } from '../utils/struct.js';
import { create_buffer } from '../engine/buffer.js';
import * as point from './point.js';
import * as line from './line.js';


// Main
export function init(){
  //-----------------------

  init_point();
  init_line();
    
  //-----------------------
}

// Subfunction
function init_point(){
    //-----------------------

    point.init();
    create_buffer(object.point);

    //-----------------------
}
function init_line(){
    //-----------------------

    line.init();
    create_buffer(object.line);

    //-----------------------
}

