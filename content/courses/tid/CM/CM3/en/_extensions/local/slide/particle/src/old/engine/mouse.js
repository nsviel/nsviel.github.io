export function set_mouse_over(is_over){
    //-----------------------

    mouse.over = is_over;

    //-----------------------
}
function getRelativeMousePosition(event, target) {
  target = target || event.target;
  var rect = target.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}
function getNoPaddingNoBorderCanvasRelativeMousePosition(event, target) {
  target = target || event.target;
  var pos = getRelativeMousePosition(event, target);

  pos.x = pos.x * target.width  / target.clientWidth;
  pos.y = pos.y * target.height / target.clientHeight;

  return pos;
}
function get_mouse_pos(e, target){
  const pos = getNoPaddingNoBorderCanvasRelativeMousePosition(e, target);

  // pos is in pixel coordinates for the canvas.
  // so convert to WebGL clip space coordinates
  let value_1 = pos.x / engine.canvas.width  *  2 - 1;
  let value_2 = pos.y / engine.canvas.height * -2 + 1;
  mouse.xy = ([value_1, value_2]);
}
