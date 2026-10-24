import { object, engine, mouse, param } from '../utils/struct.js';
import { convert_255_to_1, fct_distance_cartesian } from '../utils/utility.js';
import { point_collision } from './point.js';


// Main
export function init(){
    const gl = engine.context;
    //-----------------------

    object.line.draw_type = gl.LINES;

    //-----------------------
}
export function runtime_line(){
    //-----------------------

    //create all line
    let XY = [];
    let RGB = [];
    runtime_line_all(XY, RGB);
    runtime_mouse(XY, RGB);

    object.line.xy = XY;
    object.line.rgb = RGB;
    object.line.nb_line = XY.length;

    //-----------------------
}

// Subfunction
function runtime_line_all(XY, RGB){
    //-----------------------

    for(let i=0; i<object.point.xy.length; i++){
        let dist_vec = runtime_compute_distance(i);
        create_line_all(XY, RGB, dist_vec, i);
    }

    //-----------------------
}
function runtime_compute_distance(i){
    let dist_col = param.collision_area;
    let dist_max = object.line.dist_max;
    let dist_vec = new Array();
    //-----------------------

    for(let j=i+1; j<object.point.xy.length; j++){
        let dist = fct_distance_cartesian(object.point.xy[i], object.point.xy[j]);

        //Take for line
        if(dist < dist_max){
            let dist_n = dist / dist_max;
            dist_vec.push([dist_n, j]);
        }

        //Take for collision
        if(dist < dist_col){
            point_collision(i);
            point_collision(j);
        }
    }

    //-----------------------
    return dist_vec;
}
function runtime_mouse(XY, RGB){
  let rgb_mou = convert_255_to_1(mouse.color);
  let rgb_bkg = convert_255_to_1(param.background_color);
  let mouse_area = mouse.rayon;
  //-----------------------

  //Mouse centered lines
  if(mouse.over){
    for(let i=0; i<object.point.xy.length; i++){
      dist = fct_distance_cartesian(object.point.xy[i], mouse.xy)

      //If inside mouse circle
      if(dist <= mouse_area + mouse_area / 10){
        let dist_n = dist / (mouse_area + mouse_area / 5);
        let r = dist_n * rgb_bkg[0] + (1 - dist_n) * rgb_mou[0]
        let g = dist_n * rgb_bkg[1] + (1 - dist_n) * rgb_mou[1]
        let b = dist_n * rgb_bkg[2] + (1 - dist_n) * rgb_mou[2]
        let color = [r, g, b, 1];

        XY.push(mouse.xy)
        XY.push(object.point.xy[i])

        RGB.push(color)
        RGB.push(color)
      }
    }
  }

  //-----------------------
}
function create_line_all(XY, RGB, dist_vec, i){
  let rgb_obj = convert_255_to_1(object.line.color);
  let rgb_bkg = convert_255_to_1(param.background_color);
  //-----------------------

  for(let j=0; j<dist_vec.length; j++){
    let dist_n = dist_vec[j][0];
    let a = Math.pow(1 - dist_n, 2.0);     
    let color = [rgb_obj[0], rgb_obj[1], rgb_obj[2], a];

    XY.push(object.point.xy[i]);
    XY.push(object.point.xy[dist_vec[j][1]]);

    RGB.push(color);
    RGB.push(color);
  }

  //-----------------------
}
