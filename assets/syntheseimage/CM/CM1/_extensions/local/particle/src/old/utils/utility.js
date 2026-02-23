import { engine } from './struct.js';


// Main
export function get_random(min, max) {
    //-----------------------

    return Math.random() * (max - min) + min;

    //-----------------------
}
export function convert_255_to_1(arr_in){
    //-----------------

    if (!Array.isArray(arr_in) || arr_in.length < 3) {
        console.error("convert_255_to_1: invalid input", arr_in);
        return [0, 0, 0, 1];
    }

    let arr_out = [0, 0, 0, 1];
    arr_out[0] = arr_in[0] / 255;
    arr_out[1] = arr_in[1] / 255;
    arr_out[2] = arr_in[2] / 255;

    //-----------------
    return arr_out;
}
export function fct_distance_cartesian(pt_1, pt_2){
  let canvas = engine.canvas;
  //-----------------------

  let pt_1_xy = [pt_1[0] * canvas.width, pt_1[1] * canvas.height];
  let pt_2_xy = [pt_2[0] * canvas.width, pt_2[1] * canvas.height];

  let dist = Math.sqrt(Math.pow(pt_1_xy[0] - pt_2_xy[0], 2) + Math.pow(pt_1_xy[1] - pt_2_xy[1], 2));

  //-----------------------
  return dist;
}



var start

// this example takes 2 seconds to run
function tic(){
  start = Date.now();
}
function toc(){
  const millis = Date.now() - start;
  say(millis)
}
function toc_return(){
  const millis = Date.now() - start;
  return millis;
}
function fct_distance(pt_1, pt_2){
  //-----------------------

  let dist = Math.sqrt(Math.pow(pt_1[0] - pt_2[0], 2) + Math.pow(pt_1[1] - pt_2[1], 2));

  //-----------------------
  return dist;
}

function homogeneous_to_cartesian(xy){
  let canvas = engine.canvas;
  //-----------------------

  let x = xy[0] * canvas.width;
  let y = xy[1] * canvas.height;

  return [x, y];
}

function create_matrix(m, n){
  //-----------------------

  let arr = new Array(m); // create an empty array of length n
  for (var i = 0; i < m; i++) {
    arr[i] = new Array(n); // make each element an array
  }

  //-----------------------
  return arr;
}
function randomDigit(min, max){
  return Math.floor(Math.random() * Math.floor(2)) * (max - min) + min;;
}
function sayVecAlert(arr){
  alert(arr.join('\n'))
}
function sayAlert(arr){
  alert(arr)
}
function say(truc){
  console.log(truc);
}



// assumes target or event.target is canvas
function get_value(value){
  return Object.assign({}, value);
}

function sort_by_indice(arr){
  var indices = new Array(arr.length);
  for (var k = 0; k < arr.length; ++k) indices[k] = k;
  indices.sort(function (a, b) { return arr[a] < arr[b] ? -1 : arr[a] > arr[b] ? 1 : 0; });
  return indices
}
