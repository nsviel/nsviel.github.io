import * as webgl from "./engine/webgl.js";
import * as shader from "./shader/program.js";
import * as gui from "./gui/gui.js";
import * as scene from "./scene/init.js";
import * as loop from "./engine/loop.js";


export function main() {
    //-----------------------

    webgl.init();
    shader.init();
    scene.init();
    gui.init();

    loop.run();

    //-----------------------
} 
