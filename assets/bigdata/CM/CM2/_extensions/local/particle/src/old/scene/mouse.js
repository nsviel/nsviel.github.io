function point_mouse_repulsif(i, dist){
  let mouse_xy = mouse.xy;
  let mouse_area = mouse.rayon;
  let mouse_rgb = convert_255_to_1(color.mouse);
  let point = object.point.xy[i];
  let normal = object.point.nxy[i];
  let speed = object.point.speed[i];
  //-----------------------

  //Color
  object.point.rgb[i] = mouse_rgb;

  //Normal
  let vec_n = [];
  let vec_p = [];
  for(let i=0; i<2; i++){
    vec_n[i] = normal[i] - point[i];
    vec_p[i] = point[i] - mouse_xy[i];
  }
  let theta_d = Math.atan2(vec_p[1], vec_p[0]) - Math.atan2(normal[1], normal[0]);
  let angle = theta_d;
  let Nx = normal[0] * Math.cos(angle) - normal[1] * Math.sin(angle);
  let Ny = normal[0] * Math.sin(angle) + normal[1] * Math.cos(angle);
  let norm = Math.sqrt(Math.pow(Nx, 2) + Math.pow(Ny, 2));
  normal[0] = Nx / norm;
  normal[1] = Ny / norm;

  //Repulsif displacment
  let dist_n = dist / mouse_area;
  let force_repusif = (1 - dist_n) * mouse.force;
  for(let i=0; i<2; i++){
    let force_normal = normal[i] * speed * param.speed ;
    let vec_mouse_point = point[i] - mouse_xy[i];
    point[i] += force_repusif * vec_mouse_point + force_normal;
    point[i] += force_repusif * vec_mouse_point + force_normal;
  }

  //-----------------------
}
function point_mouse_blackhole(i, dist){
  let mouse_xy = mouse.xy;
  let mouse_area = mouse.rayon;
  let mouse_rgb = convert_255_to_1(color.mouse);
  let point = object.point.xy[i];
  let normal = object.point.nxy[i];
  let color = object.point.rgb[i];
  let speed = object.point.speed[i];
  //-----------------------

  //Color
  object.point.rgb[i] = mouse_rgb;

  //Repulsif displacment
  for(let i=0; i<2; i++){
    let force_attractive = (dist) * mouse.force;
    let force_normal = normal[i] * speed * param.speed ;
    let vec_mouse_point = mouse_xy[i] - point[i];
    point[i] += force_attractive * vec_mouse_point + force_normal;
    point[i] += force_attractive * vec_mouse_point + force_normal;
  }

  //-----------------------
}

function point_mouse_selection(i, dist){
  let mouse_xy = mouse.xy;
  let mouse_rgb = convert_255_to_1(color.mouse);
  let point = object.point.xy[i];
  //-----------------------

  //Color
  object.point.rgb[i] = mouse_rgb;

  //-----------------------
}
