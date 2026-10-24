import { mouse, info, engine } from '../utils/struct.js';


//Main functions
export function init(){
  if(engine.with_gui == false) return;
  const canvas = engine.canvas;
  //-----------------------

  mouse.xy = 0;
  info.time.scene = 0;

  // Creating a GUI with options.
  engine.gui = new dat.GUI({autoPlace: true, closed: true});
  engine.gui.domElement.id = 'gui';
  engine.gui.width = canvas.width;

  //Parameters
  let gui_param = engine.gui.addFolder('Parameter');
  gui_param.add(param, 'line_dist_max', 0, 500, 1);
  gui_param.add(param, 'limit_x', 0, 1.5, 0.1);
  gui_param.add(param, 'limit_y', 0, 1.5, 0.1);

  //Points
  let gui_point = engine.gui.addFolder('Point');
  gui_point.add(param, 'nb_point', 0, param.nb_point_max, 1).listen();
  gui_point.add(param, 'point_size', 0, 20, 1);
  gui_point.add(param, 'speed', 0, 0.1, 0.0001);

  //Colors
  let gui_color = engine.gui.addFolder('Color');
  gui_color.addColor(color, 'collision');
  gui_color.addColor(color, 'bkg');
  gui_color.addColor(color, 'point');
  gui_color.addColor(color, 'mouse');
  gui_color.addColor(color, 'line');

  //Mouse
  let gui_mouse = engine.gui.addFolder('Mouse');
  gui_mouse.add(mouse, 'mode', ['Repulsif', 'Black_hole', 'selection']).setValue(mouse.mode);
  gui_mouse.add(mouse, 'rayon', 0, 0.5, 0.01);
  gui_mouse.add(mouse, 'add_point', false);
  gui_mouse.add(mouse, 'add_point_number', 1, 20, 1);
  gui_mouse.add(mouse, 'force', 0, 1, 0.01);

  //Time
  let gui_time = engine.gui.addFolder('Time');
  gui_time.add(info.time, 'scene').listen();

  //-----------------------
}

