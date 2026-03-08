// WebGL stuff
engine.with_gui = true;

//Parameters
param.nb_point = 100;
param.nb_point_max = 1000;
param.speed = 0.001;
param.point_size = 5;
param.line_dist_max = 200;
param.collision_area = 5;
param.limit_x = 1;
param.limit_y = 1;

//Colors
color.bkg = [0.180392*255, 0.203922*255, 0.25098*255, 1];
color.collision = [255, 0, 0, 1];
color.mouse = [0, 125, 125, 1];
color.point = [255, 255, 255, 255];
color.line = [255, 255, 255, 255];

//Mouse
mouse.mode = "selection";
mouse.rayon = 100;
mouse.add_point = true;
mouse.add_point_number = 1;
mouse.over = false;
mouse.force = 0.02;
