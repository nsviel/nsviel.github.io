//All webgl program info
export const param = {
    nb_point: 200,
    nb_point_max: 500,

    limit_x: 1.5,
    limit_y: 1.5,
    collision_area: 5,
    background_color: [0, 0, 0, 0],
};

export const engine = {
    canvas: 0,
    context: 0,
    with_gui: false,
    gui: 0,
    mvp : {
        projection: 0,
        modelview: 0,
        mvp: 0,
    },
    shader:{
        program: 0,
        attribut: {
            location: 0,
            color: [0, 0, 0, 1],
        },
        uniform: {
          in_mvp: 0,
          point_size: 5,
          is_point: false,
        },
    },
};
 
export const mouse = {
    rayon: 0,
    over: false,
    xy: 0,
    color: [0, 0, 0, 1],
    add_point_number: 0,
    add_point: false,
    repusif: 0,
};

export const info = {
    time:{
        scene: 0,
    },
};

//All scene objects info
export const object = {
    point : {
        xy: 0,
        rgb: 0,
        nxy: 0,
        speed: 0,

        number: 0,
        number_init: 200,
        number_max: 500,
        draw_type: 0,
        color: [255, 255, 255, 1],
        size: 5,

        vbo_xy: 0,
        vbo_rgb: 0,
    },
    line : {
        xy: 0,
        rgb: 0,

        color: [255, 255, 255, 1],
        nb_line: 0,
        draw_type: 0,
        dist_max: 500,

        vbo_xy: 0,
        vbo_rgb: 0,
    },
}
