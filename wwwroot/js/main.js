"use strict"
// right upper corner
// ================ Global variables =================
let id = null;
let undoList = [];   // Push the id with action
let redoList = [];   // After undo, push the undoList to the redoList
let choosen_id = null;
let points = [];   // Used in Draw Line
let newPath; // Currently used to store the boolean whether the thing got or not
const as = "";

let app = new Vue({
    el: '#main',
    data: {
        type: "pen",
        code: "",
        color: "black",
        size: "5",
    },
    components: {

    },
    methods: {
        upload: async (e) => {  // upload image
            let f = e.target.files[0];
            let svg = $('svg#draw').attr("viewBox").split(" ");
            if (f && f.type.startsWith('image/')) {
                // TODO: Use async-await syntax
                let url = await crop(f, svg[2], svg[3], 'dataURL', 'image/webp');
                let newPath = document.createElementNS("http://www.w3.org/2000/svg", "image");
                newPath.setAttribute('id', uuidv4());
                newPath.setAttribute('href', url);
                $("#draw").append(newPath);
            }
        },
        save: function (e) {

        }
    },
    computed: {

    },
    created() {
        $("#resize_wrap").hide();
    },
    mounted() {
        let coordinates = [];
        let resize_angle;

        // Coordinate variables
        let cursorPosition = {};
        let differentPosition = {};
        let position = { x: 0, y: 0 };
        let scale = { x: 1.00, y: 1.00 };
        let current_scale = { x: 1.00, y: 1.00 };

        // Flag
        let drag = false;
        let resize = false;

        let svgDraw = document.querySelector('svg#draw');

        window.requestAnimationFrame(update); // update by frame

        $("svg#draw").on('pointerdown pointerenter', function (e) {
            if (e.buttons == 1 && e.originalEvent.isPrimary) {
                e.preventDefault();
                let current_position = cursorPoint(e);

                if (choosen_id && e.target.tagName == "svg") unselect();

                switch (app.type) {
                    case "pen":         // Draw
                        unselect();
                        break;
                    case "cursor":      // Move
                        let resize_target = ["resize_nw", "resize_n", "resize_ne", "resize_e", "resize_se", "resize_s", "resize_sw", "resize_w"];
                        let drag_target = ["path", "rect", "ellipse", "text", "image"];

                        if (resize_target.includes(e.target.id) && choosen_id) {
                            resize_angle = e.target.id;
                            cursorPosition = current_position;
                            resize = true;
                        }
                        else if (drag_target.includes(e.target.tagName) && !resize_target.includes(e.target.id) && e.target.id != "resize_border" && !e.target.classList.contains("notMoveable")) {
                            choosen_id = e.target.id;
                            $('#resize_wrap').show();
                            selected_border($(`#${choosen_id}`)[0].getBBox());
                            cursorPosition = current_position;
                            drag = true;
                        }
                        break;
                    case "text":        // Textbox

                        break;
                    case "rect":        // Rectangle
                        unselect();
                        if (!newPath) {
                            newPath = true;
                            cursorPosition = { x: current_position.x, y: current_position.y };
                        }
                        break;
                    case "circle":      // Circle
                        unselect();
                        if (!newPath) {
                            newPath = true;
                            cursorPosition = { x: current_position.x, y: current_position.y };
                        }
                        break;
                    case "line":        // Line
                        unselect();
                        break;
                }
            }
        });

        $("svg#draw").on('pointermove', function (e) {
            if (e.buttons == 1 && e.originalEvent.isPrimary) {
                e.preventDefault();
                let current_position = cursorPoint(e);

                switch (app.type) {
                    case "pen":         // Draw
                        if (!id) {
                            coordinates.push({ x: current_position.x - e.originalEvent.movementX, y: current_position.y - e.originalEvent.movementY });
                            coordinates.push({ x: current_position.x, y: current_position.y });

                            id = uuidv4();
                            startDraw(id, coordinates[0], app.color, app.size);
                            con.invoke("StartDraw", id, coordinates[0], app.color, app.size);

                        } else if (current_position.x != coordinates[1].x || current_position.y != coordinates[1].y) {
                            coordinates.push({ x: current_position.x, y: current_position.y });
                            coordinates = coordinates.slice(-3);
                            let midPoint = mid(coordinates[1], coordinates[2]);
                            draw(id, coordinates[1], midPoint);
                            con.invoke("Draw", id, coordinates[1], midPoint);
                        }
                        break;
                    case "cursor":      // Move
                        if (!choosen_id) break;

                        if (drag) {
                            $(`#${choosen_id},#resize_wrap`).css('transform',
                                `translate(${current_position.x - cursorPosition.x}px,${current_position.y - cursorPosition.y}px)`
                            );
                        }
                        else if (resize) {
                            let selected_info = $(`#${choosen_id}`)[0].getBBox();

                            if (resize_angle) {
                                if (resize_angle == "resize_e") {
                                    differentPosition.x = current_position.x - (selected_info.x + selected_info.width);
                                    current_scale.x = (differentPosition.x + selected_info.width) / selected_info.width;
                                    $(`#${choosen_id},#resize_wrap`).css(
                                        'transform',
                                        `translate(${selected_info.x}px,0) scale(${current_scale.x},${current_scale.y}) translate(-${selected_info.x}px,0)`
                                    );
                                }
                                else if (resize_angle == "resize_w") {
                                    differentPosition.x = selected_info.x - current_position.x;
                                    current_scale.x = (differentPosition.x + selected_info.width) / selected_info.width;
                                    $(`#${choosen_id},#resize_wrap`).css(
                                        'transform',
                                        `translate(${selected_info.x + selected_info.width}px,0) scale(${current_scale.x},${current_scale.y}) translate(-${selected_info.x + selected_info.width}px,0)`
                                    );
                                }
                                else if (resize_angle == "resize_s") {
                                    differentPosition.y = current_position.y - (selected_info.y + selected_info.height);
                                    current_scale.y = (differentPosition.y + selected_info.height) / selected_info.height;
                                    $(`#${choosen_id},#resize_wrap`).css(
                                        'transform',
                                        `translate(0,${selected_info.y}px) scale(${current_scale.x},${current_scale.y}) translate(0,-${selected_info.y}px)`
                                    );
                                }
                                else if (resize_angle == "resize_n") {
                                    differentPosition.y = selected_info.y - current_position.y;
                                    current_scale.y = (differentPosition.y + selected_info.height) / selected_info.height;
                                    $(`#${choosen_id},#resize_wrap`).css(
                                        'transform',
                                        `translate(0,${selected_info.y + selected_info.height}px) scale(${current_scale.x},${current_scale.y}) translate(0,-${selected_info.y + selected_info.height}px)`
                                    );
                                }
                                else if (resize_angle == "resize_se") {
                                    differentPosition.y = current_position.y - (selected_info.y + selected_info.height);
                                    differentPosition.x = current_position.x - (selected_info.x + selected_info.width);
                                    current_scale.y = (differentPosition.y + selected_info.height) / selected_info.height;
                                    current_scale.x = (differentPosition.x + selected_info.width) / selected_info.width;
                                    if (e.shiftKey) {
                                        if (current_scale.x > current_scale.y) current_scale.y = current_scale.x;
                                        else current_scale.x = current_scale.y;
                                    }
                                    $(`#${choosen_id},#resize_wrap`).css(
                                        'transform',
                                        `translate(${selected_info.x}px,${selected_info.y}px) scale(${current_scale.x},${current_scale.y}) translate(-${selected_info.x}px,-${selected_info.y}px)`
                                    );
                                }
                                else if (resize_angle == "resize_nw") {
                                    differentPosition.x = selected_info.x - current_position.x;
                                    differentPosition.y = selected_info.y - current_position.y;
                                    current_scale.x = (differentPosition.x + selected_info.width) / selected_info.width;
                                    current_scale.y = (differentPosition.y + selected_info.height) / selected_info.height;
                                    if (e.shiftKey) {
                                        if (current_scale.x > current_scale.y) current_scale.y = current_scale.x;
                                        else current_scale.x = current_scale.y;
                                    }
                                    $(`#${choosen_id},#resize_wrap`).css(
                                        'transform',
                                        `translate(${selected_info.x + selected_info.width}px,${selected_info.y + selected_info.height}px) scale(${current_scale.x},${current_scale.y}) translate(-${selected_info.x + selected_info.width}px,-${selected_info.y + selected_info.height}px)`
                                    );
                                }
                                else if (resize_angle == "resize_ne") {
                                    differentPosition.y = selected_info.y - current_position.y;
                                    differentPosition.x = current_position.x - (selected_info.x + selected_info.width);
                                    current_scale.x = (differentPosition.x + selected_info.width) / selected_info.width;
                                    current_scale.y = (differentPosition.y + selected_info.height) / selected_info.height;
                                    if (e.shiftKey) {
                                        if (current_scale.x > current_scale.y) current_scale.y = current_scale.x;
                                        else current_scale.x = current_scale.y;
                                    }
                                    $(`#${choosen_id},#resize_wrap`).css(
                                        'transform',
                                        `translate(${selected_info.x}px,${selected_info.y + selected_info.height}px) scale(${current_scale.x},${current_scale.y}) translate(-${selected_info.x}px,-${selected_info.y + selected_info.height}px)`
                                    );
                                }
                                else if (resize_angle == "resize_sw") {
                                    differentPosition.y = current_position.y - (selected_info.y + selected_info.height);
                                    differentPosition.x = selected_info.x - current_position.x;
                                    current_scale.x = (differentPosition.x + selected_info.width) / selected_info.width;
                                    current_scale.y = (differentPosition.y + selected_info.height) / selected_info.height;
                                    if (e.shiftKey) {
                                        if (current_scale.x > current_scale.y) current_scale.y = current_scale.x;
                                        else current_scale.x = current_scale.y;
                                    }
                                    $(`#${choosen_id},#resize_wrap`).css(
                                        'transform',
                                        `translate(${selected_info.x + selected_info.width}px,${selected_info.y}px) scale(${current_scale.x},${current_scale.y}) translate(-${selected_info.x + selected_info.width}px,-${selected_info.y}px)`
                                    );
                                }
                            }

                        }
                        break;
                    case "text":        // Textbox

                        break;
                    case "rect":        // Rectangle
                        if (!id) {
                            id = uuidv4();
                            let point = { x: current_position.x, y: current_position.y };
                            startRect(id, point, app.color, app.size);
                            con.invoke("StartRect", id, point, app.color, app.size);
                        }
                        differentPosition = { x: Math.abs(current_position.x - cursorPosition.x), y: Math.abs(current_position.y - cursorPosition.y) };

                        // Square ===================================================
                        if (e.shiftKey) differentPosition.x > differentPosition.y ? differentPosition.y = differentPosition.x : differentPosition.x = differentPosition.y

                        let pointR = null;

                        // Set rect size ==================================================
                        let boxR = { x: differentPosition.x, y: differentPosition.y };

                        // Fix position =====================================================
                        if (current_position.x < cursorPosition.x && current_position.y < cursorPosition.y) //Left top
                            pointR = { x: cursorPosition.x - differentPosition.x, y: cursorPosition.y - differentPosition.y };
                        else if (current_position.x < cursorPosition.x) //Left
                            pointR = { x: cursorPosition.x - differentPosition.x, y: cursorPosition.y };
                        else if (current_position.y < cursorPosition.y)  //Top
                            pointR = { x: cursorPosition.x, y: cursorPosition.y - differentPosition.y };
                        else //Bottom Right
                            pointR = { x: cursorPosition.x, y: cursorPosition.y };

                        drawRect(id, pointR, boxR);
                        con.invoke("DrawRect", id, pointR, boxR);
                        break;
                    case "circle":      // Circle
                        if (!id) { // check new element
                            id = uuidv4();
                            let point = { x: current_position.x, y: current_position.y };
                            startCircle(id, point, app.color, app.size);
                            con.invoke("StartCircle", id, point, app.color, app.size);
                        }

                        differentPosition = { x: Math.abs(current_position.x - cursorPosition.x), y: Math.abs(current_position.y - cursorPosition.y) };

                        // Prefect circle ===================================================
                        if (e.shiftKey) differentPosition.x > differentPosition.y ? differentPosition.y = differentPosition.x : differentPosition.x = differentPosition.y

                        let pointC = null;
                        // Set circle size ==================================================
                        let boxC = { x: differentPosition.x / 2, y: differentPosition.y / 2 };

                        // Fix position =====================================================
                        if (current_position.x - cursorPosition.x < 0 && current_position.y - cursorPosition.y < 0)   // left top
                            pointC = { x: cursorPosition.x - differentPosition.x / 2, y: cursorPosition.y - differentPosition.y / 2 };
                        else if (current_position.x - cursorPosition.x < 0)   // left
                            pointC = { x: cursorPosition.x - differentPosition.x / 2, y: cursorPosition.y + differentPosition.y / 2 };
                        else if (current_position.y - cursorPosition.y < 0)   /// top
                            pointC = { x: cursorPosition.x + differentPosition.x / 2, y: cursorPosition.y - differentPosition.y / 2 };
                        else   // bottom right
                            pointC = { x: cursorPosition.x + differentPosition.x / 2, y: cursorPosition.y + differentPosition.y / 2 };

                        drawCircle(id, pointC, boxC);
                        con.invoke("DrawCircle", id, pointC, boxC);

                        break;
                    case "line":        // Line
                        let newPoint = comparePoint(current_position);

                        if (!id) {
                            cursorPosition = newPoint ? { x: newPoint.x, y: newPoint.y } : { x: current_position.x, y: current_position.y };
                            id = uuidv4();
                        }
                        let tempCurrent = { x: current_position.x, y: current_position.y };
                        let pointLA = null;
                        newPoint ? pointLA = newPoint : pointLA = tempCurrent;
                        drawLine(id, cursorPosition, pointLA, app.color, app.size);
                        con.invoke('DrawLine', id, cursorPosition, pointLA, app.color, app.size);
                        break;
                    default:
                        break;
                }
            }
        });

        $("svg#draw").on('pointerup pointerleave', function (e) {
            e.preventDefault();
            let current_position = cursorPoint(e);

            switch (app.type) {
                case "pen":         // Draw
                    if (id) {
                        coordinates.push({ x: current_position.x, y: current_position.y });
                        coordinates = coordinates.slice(-3);

                        let midPoint = mid(coordinates[1], coordinates[2]);
                        draw(id, midPoint, coordinates[2]);
                        con.invoke("Draw", id, midPoint, coordinates[2]);
                    }
                    if (id != null)
                        undoList.push({ mode: 'create', object: $(`#${id}`)[0] });
                    id = null;
                    coordinates = [];
                    break;
                case "cursor":      // Move
                    const change = $(`#${choosen_id}`).css('transform')

                    if (choosen_id && change != "none") {
                        const selected_css_value = change.match(/matrix.*\((.+)\)/)[1].split(', ').map(parseFloat);

                        if (drag && selected_css_value) {       // drag
                            position = { x: selected_css_value[4], y: selected_css_value[5] };

                            switch (e.target.tagName) {
                                case 'path':
                                    let new_coord;

                                    if (e.target.classList.contains("straightLine")) {
                                        const coord = $(`#${choosen_id}`).attr('d').substring(1).split("L");
                                        for (let i of coord) {
                                            let coord_xy = i.split(",");
                                            if ($.isNumeric(coord_xy[0]) && $.isNumeric(coord_xy[1])) {
                                                !new_coord ?
                                                    new_coord = `M${(parseFloat(coord_xy[0]) + position.x).toFixed(2)},${(parseFloat(coord_xy[1]) + position.y).toFixed(2)},` :
                                                    new_coord += `L${(parseFloat(coord_xy[0]) + position.x).toFixed(2)},${(parseFloat(coord_xy[1]) + position.y).toFixed(2)}`;
                                            }
                                        }
                                    }
                                    else {
                                        const coord = $(`#${choosen_id}`).attr('d').substring(1).split("Q");
                                        let i
                                        for (i of coord) {
                                            let coord_xy = i.split(",");
                                            if ($.isNumeric(coord_xy[0]) && $.isNumeric(coord_xy[1])) {
                                                !new_coord ?
                                                    new_coord = `M${(parseFloat(coord_xy[0]) + position.x).toFixed(2)},${(parseFloat(coord_xy[1]) + position.y).toFixed(2)}` :
                                                    new_coord += `Q${(parseFloat(coord_xy[0]) + position.x).toFixed(2)},${(parseFloat(coord_xy[1]) + position.y).toFixed(2)},${(parseFloat(coord_xy[2]) + position.x).toFixed(2)},${(parseFloat(coord_xy[3]) + position.y).toFixed(2)}`;
                                            }
                                        }
                                    }
                                    $(`#${choosen_id}`).attr('d', new_coord);
                                    break;
                                case 'rect':
                                    $(`#${choosen_id}`).attr('x', Number($(`#${choosen_id}`).attr('x')) + position.x);
                                    $(`#${choosen_id}`).attr('y', Number($(`#${choosen_id}`).attr('y')) + position.y);
                                    break;
                                case 'ellipse':
                                    $(`#${choosen_id}`).attr('cx', Number($(`#${choosen_id}`).attr('cx')) + position.x);
                                    $(`#${choosen_id}`).attr('cy', Number($(`#${choosen_id}`).attr('cy')) + position.y);
                                    break;
                                case 'image':
                                    break;

                                default:
                                    break;
                            }
                        }
                        else if (resize && selected_css_value) {        // resize
                            let scale = { x: selected_css_value[0], y: selected_css_value[3] }

                            switch ($(`#${choosen_id}`)[0].tagName) {
                                case 'path':
                                    let new_coord, initial_position;

                                    if (e.target.classList.contains("straightLine")) {
                                        const coord = $(`#${choosen_id}`).attr('d').substring(1).split("L");
                                        for (let i of coord) {
                                            let coord_xy = i.split(",").map(parseFloat);
                                            !new_coord ?
                                                new_coord = `M${(coord_xy[0] * scale.x).toFixed(2)},${(coord_xy[1] * scale.y).toFixed(2)}` :
                                                new_coord += `L${(coord_xy[0] * scale.x).toFixed(2)},${(coord_xy[1] * scale.y).toFixed(2)}`;
                                        }
                                    }
                                    else {
                                        const coord = $(`#${choosen_id}`).attr('d').substring(1).split("Q");

                                        for (let i of coord) {
                                            let coord_xy = i.split(",").map(parseFloat);
                                            if (!initial_position) initial_position = { x: coord_xy[0], y: coord_xy[1] };
                                            else switch (resize_angle) {
                                                case "resize_e": case "resize_s": case "resize_se":
                                                    initial_position = { x: Math.min(initial_position.x, coord_xy[0], coord_xy[2]), y: Math.min(initial_position.y, coord_xy[1], coord_xy[3]) };
                                                    break;
                                                case "resize_w": case "resize_n": case "resize_nw":
                                                    initial_position = { x: Math.max(initial_position.x, coord_xy[0], coord_xy[2]), y: Math.max(initial_position.y, coord_xy[1], coord_xy[3]) };
                                                    break;
                                                case "reesize_ne":
                                                    initial_position = { x: Math.min(initial_position.x, coord_xy[0], coord_xy[2]), y: Math.max(initial_position.y, coord_xy[1], coord_xy[3]) };
                                                    break;
                                                case "resize_sw":
                                                    initial_position = { x: Math.max(initial_position.x, coord_xy[0], coord_xy[2]), y: Math.min(initial_position.y, coord_xy[1], coord_xy[3]) };
                                                    break;
                                            }
                                        }

                                        initial_position = { x: initial_position.x * scale.x - initial_position.x, y: initial_position.y * scale.y - initial_position.y };

                                        for (let i of coord) {
                                            let coord_xy = i.split(",").map(parseFloat);
                                            !new_coord ?
                                                new_coord = `M${(coord_xy[0] * scale.x - initial_position.x).toFixed(2)},${(coord_xy[1] * scale.y - initial_position.y).toFixed(2)}` :
                                                new_coord += `Q${(coord_xy[0] * scale.x - initial_position.x).toFixed(2)},${(coord_xy[1] * scale.y - initial_position.y).toFixed(2)},${(coord_xy[2] * scale.x - initial_position.x).toFixed(2)},${(coord_xy[3] * scale.y - initial_position.y).toFixed(2)}`;
                                        }
                                    }
                                    $(`#${choosen_id}`).attr('d', new_coord);
                                    break;
                                case 'rect':
                                    const rect_info = $(`#${choosen_id}`)[0].getBBox();

                                    if (resize_angle == "resize_w" || resize_angle == "resize_sw")
                                        rect_info.x = rect_info.x - (rect_info.width * scale.x - rect_info.width);
                                    else if (resize_angle == "resize_n" || resize_angle == "resize_ne")
                                        rect_info.y = rect_info.y - (rect_info.height * scale.y - rect_info.height);
                                    else if (resize_angle == "resize_nw") {
                                        rect_info.x = rect_info.x - (rect_info.width * scale.x - rect_info.width);
                                        rect_info.y = rect_info.y - (rect_info.height * scale.y - rect_info.height);
                                    }

                                    $(`#${choosen_id}`).attr('x', rect_info.x + position.x)
                                        .attr('y', rect_info.y + position.y)
                                        .attr('width', rect_info.width * scale.x)
                                        .attr('height', rect_info.height * scale.y);
                                    break;
                                case 'ellipse':
                                    const ellipse_info = $(`#${choosen_id}`)[0].getBBox();
                                    let circle = { cx: ellipse_info.x + (ellipse_info.width / 2), cy: ellipse_info.y + (ellipse_info.height / 2), rx: ellipse_info.width / 2, ry: ellipse_info.height / 2 };

                                    switch (resize_angle) {
                                        case "resize_e":
                                            circle.rx = ellipse_info.width * scale.x / 2;
                                            circle.cx = ellipse_info.x + circle.rx;
                                            break;
                                        case "resize_s":
                                            circle.ry = ellipse_info.height * scale.y / 2;
                                            circle.cy = ellipse_info.y + circle.ry;
                                            break;
                                        case "resize_se":
                                            circle.rx = ellipse_info.width * scale.x / 2;
                                            circle.ry = ellipse_info.height * scale.y / 2;
                                            circle.cx = ellipse_info.x + circle.rx;
                                            circle.cy = ellipse_info.y + circle.ry;
                                            break;
                                        case "resize_w":
                                            circle.rx = ellipse_info.width * scale.x / 2;
                                            circle.cx = ellipse_info.x + ellipse_info.width - circle.rx;
                                            break;
                                        case "resize_n":
                                            circle.ry = ellipse_info.height * scale.y / 2;
                                            circle.cy = ellipse_info.y + ellipse_info.height - circle.ry;
                                            break;
                                        case "resize_nw":
                                            circle.rx = ellipse_info.width * scale.x / 2;
                                            circle.ry = ellipse_info.height * scale.y / 2;
                                            circle.cx = ellipse_info.x + ellipse_info.width - circle.rx;
                                            circle.cy = ellipse_info.y + ellipse_info.height - circle.ry;
                                            break;
                                        case "resize_ne":
                                            circle.rx = ellipse_info.width * scale.x / 2;
                                            circle.ry = ellipse_info.height * scale.y / 2;
                                            circle.cx = ellipse_info.x + circle.rx;
                                            circle.cy = ellipse_info.y + ellipse_info.height - circle.ry;
                                            break;
                                        case "resize_sw":
                                            circle.rx = ellipse_info.width * scale.x / 2;
                                            circle.ry = ellipse_info.height * scale.y / 2;
                                            circle.cx = ellipse_info.x + ellipse_info.width - circle.rx;
                                            circle.cy = ellipse_info.y + circle.ry;
                                            break;
                                    }

                                    $(`#${choosen_id}`).attr('cx', circle.cx).attr('cy', circle.cy)
                                        .attr('rx', circle.rx).attr('ry', circle.ry);
                                    break;
                                case 'image':
                                    break;
                                default:
                                    break;
                            }
                        }
                        $(`#${choosen_id},#resize_wrap`).removeAttr('style');
                        selected_border($(`#${choosen_id}`)[0].getBBox());
                    }
                    current_scale = { x: 1, y: 1 };
                    differentPosition = cursorPosition = {}
                    position = { x: 0, y: 0 };
                    drag = resize = false;
                    break;
                case "text":        // Textbox

                    break;
                case "rect":        // Rectangle
                    if (e.type == "pointerup")
                        newPath = differentPosition = cursorPosition = id = null;

                    break;
                case "circle":      // Circle
                    if (e.type == "pointerup")
                        newPath = differentPosition = cursorPosition = id = null;
                    break;
                case "line":        // Line
                    if (e.type == "pointerup") {
                        if (cursorPosition) {
                            let newPoint = { x: current_position.x, y: current_position.y };
                            // Update hub point
                            pushPoint(cursorPosition);
                            con.invoke("PushPoint", cursorPosition);
                            pushPoint(newPoint);
                            con.invoke("PushPoint", newPoint);
                        }
                        newPath = cursorPosition = current_position = id = null;
                    }
                    break;
                default:
                    break;
            }
        });

        // Zoom in & out
        $("svg#draw").on('mousewheel keydown', function (e) {
            if (e.ctrlKey) {
                e.preventDefault();
                let scale = $("#draw,#grid_wrap")[0].getBoundingClientRect().width / $("#draw").width();
                if (e.originalEvent.wheelDelta / 120 > 0) {
                    if (scale < 5) $("#draw,#grid_wrap").css("transform", `scale(${(scale + 0.05).toFixed(2)})`);
                } else {
                    if (scale >= 0.1) $("#draw,#grid_wrap").css("transform", `scale(${(scale - 0.05).toFixed(2)})`);
                }
            }
        });

        // Delete selected object
        $(document).on('keydown', function (e) {
            if (choosen_id && e.keyCode == 8 || e.keyCode == 46) {
                $(`#${choosen_id}`).remove();
                unselect();
            } else if (e.ctrlKey && e.keyCode == '90' && !e.originalEvent.repeat) {
                console.log('undo');
                undo();
            } else if (e.ctrlKey && e.keyCode == '89' && !e.originalEvent.repeat) {
                console.log('redo');
                redo();
            }
        });
    }
});

/* ==================================== Update by frame ====================================== */
let rgb_H = 0;
let secondsPassed;
let oldTimeStamp;
let fps;

function unselect() {
    if (choosen_id) {
        $("#resize_wrap").removeAttr('style').hide();
        choosen_id = null;
    }
}

function update(timeStamp) {
    // Calculate the number of seconds passed since the last frame
    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;

    // Calculate fps
    fps = Math.round(1 / secondsPassed);

    // Display fps
    fps > 20 ? $('#fps').html(`${fps}`).css("color", "green") :
        $('#fps').html(`${fps}`).css("color", "red");

    // RGB Stroke
    // $("#draw path:not(#resize_wrap *)").attr('stroke', `hsl(${rgb_H}, 100%, 50%)`);
    // rgb_H < 360 ? rgb_H++ : rgb_H = 0;
    // $("label#pen span").css("color", `hsl(${rgb_H}, 100%, 50%)`);

    window.requestAnimationFrame(update);
}

/* ==================================== Function ====================================== */
// Drawing function
function mid(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function startDraw(id, point, color, size) {
    let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute('id', id);
    path.setAttribute('d', `M${simplifyNumber(point.x)},${simplifyNumber(point.y)}`);
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", size + "px");
    $("svg#draw").append(path);
}
function draw(id, pointA, pointB) {
    let path = $(`#${id}`)[0];
    path.setAttribute('d',
        `${path.getAttribute('d')}Q${simplifyNumber(pointA.x)},${simplifyNumber(pointA.y)},${simplifyNumber(pointB.x)},${simplifyNumber((pointB.y))}`
    );
}
function startRect(id, point, color, size) {
    let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute('id', id);
    rect.setAttribute("stroke", color);
    rect.setAttribute("stroke-width", size + "px");
    rect.setAttribute('x', simplifyNumber(point.x));
    rect.setAttribute('y', simplifyNumber(point.y));

    $("svg#draw").append(rect);
}
function drawRect(id, point, box) {
    let rect = $(`#${id}`)[0];
    rect.setAttribute('width', simplifyNumber(box.x));
    rect.setAttribute('height', simplifyNumber(box.y));
    rect.setAttribute('x', simplifyNumber(point.x));
    rect.setAttribute('y', simplifyNumber(point.y));
}
function startCircle(id, point, color, size) {  // ID,point,color,size,fillColor
    let circle = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    circle.setAttribute('id', id);
    circle.setAttribute('cx', simplifyNumber(point.x));
    circle.setAttribute('cy', simplifyNumber(point.y));
    circle.setAttribute('stroke', color);
    circle.setAttribute('stroke-width', size + "px");
    $("svg#draw").append(circle);    // add into svg
}
function drawCircle(id, point, box) {
    let circle = $(`#${id}`)[0];
    circle.setAttribute('rx', simplifyNumber(box.x));
    circle.setAttribute('ry', simplifyNumber(box.y));
    circle.setAttribute('cx', simplifyNumber(point.x));
    circle.setAttribute('cy', simplifyNumber(point.y));
}
function drawLine(id, point, point2, color, size) {
    let path = $(`#${id}`)[0];
    if (!path) {
        path = document.createElementNS("http://www.w3.org/2000/svg", "line");
        path.setAttribute('id', id);
        // path.setAttribute('class', "straightLine");
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', size);
        path.setAttribute('x1', simplifyNumber(point.x));
        path.setAttribute('y1', simplifyNumber(point.y));
    }
    path.setAttribute('x2', simplifyNumber(point2.x));
    path.setAttribute('y2', simplifyNumber(point2.y));

    // path.setAttribute('d', `M${simplifyNumber(point.x)},${simplifyNumber(point.y)},L${simplifyNumber(point2.x)},${simplifyNumber(point2.y)}`);

    $("svg#draw").append(path);
}

function pushPoint(point) {
    points.push(point);
}

//Text function
function startText(id, x, y, color, size) {
    let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute('id', id);
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    text.setAttribute('fill', color);
    text.setAttribute('font-size', size + "em");
    text.textContent = "Type Something";
    $('svg#draw').append(text);
}

// Remove object
function remove(id) {
    $(`#${id}`).remove();
    // Call server to remove the id
    // undoList.push({id,method:"remove"});
}
function removeAll() {
    $('svg#draw > :not("#resize_wrap")').remove();
}
function create(object) {
    $('svg#draw').append(object);
}
// Undo event trigger
function undo() {  // Everytime will push {event:,object:}  

    if (undoList.length == 0) return;
    let object = undoList.pop();
    undoReplace(object)

    redoList.push(object);


}
// Redo event trigger
function redo() {

    if (redoList.length == 0) return;
    let temp = redoList.pop();
    undoList.push(temp);

}
function undoReplace(temp) {
    let tempId = $(temp.object).attr('id');
    if (temp.mode == 'new') {
        remove(tempId);
    }
    else if (temp.mode == 'move') {

    } else if (temp.mode == 'remove') {
        create(temp.object);
    } else {
        console.log("Unknown");
    }
}
function redoReplace(temp) {
    let tempId = $(temp.object).attr('id');
    if (temp.mode == 'new') {
        create(temp.object);
    }
    else if (temp.mode == 'move') {

    } else if (temp.mode == 'remove') {

    } else {
        console.log("Unknown");
    }
}


function simplifyNumber(n) {
    if (!$.isNumeric(n)) return;
    return n.toFixed(2) % 1 != 0 ? n.toFixed(2) : n.toFixed(0);
}

// Reset selected border coordinate
function selected_border(selected_info) {
    $("#resize_border").attr("x", selected_info.x - 5).attr("y", selected_info.y - 5).attr("width", selected_info.width + 10).attr("height", selected_info.height + 10);
    $("#resize_nw").attr("x", selected_info.x - 10).attr("y", selected_info.y - 10).css("cursor", "nw-resize");
    $("#resize_n").attr("x", selected_info.x + (selected_info.width / 2) - 5).attr("y", selected_info.y - 10).css("cursor", "n-resize");
    $("#resize_ne").attr("x", selected_info.x + selected_info.width).attr("y", selected_info.y - 10).css("cursor", "ne-resize");
    $("#resize_e").attr("x", selected_info.x + selected_info.width).attr("y", selected_info.y + (selected_info.height / 2) - 5).css("cursor", "e-resize");
    $("#resize_se").attr("x", selected_info.x + selected_info.width).attr("y", selected_info.y + selected_info.height).css("cursor", "se-resize");
    $("#resize_s").attr("x", selected_info.x + (selected_info.width / 2) - 5).attr("y", selected_info.y + selected_info.height).css("cursor", "s-resize");
    $("#resize_sw").attr("x", selected_info.x - 10).attr("y", selected_info.y + selected_info.height).css("cursor", "sw-resize");
    $("#resize_w").attr("x", selected_info.x - 10).attr("y", selected_info.y + (selected_info.height / 2) - 5).css("cursor", "w-resize");
}

function uuidv4() { // ID generator
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function comparePoint(cursor) { // Get the nearest point
    if (!points) return
    for (let point of points)
        if (cursor.x >= point.x - 10 && cursor.x <= point.x + 10 &&
            cursor.y >= point.y - 10 && cursor.y <= point.y + 10) return point;
}

/* ==================================== SVG Coordinate ====================================== */
let svg = document.querySelector('svg');    // Find your root SVG element
let pt = svg.createSVGPoint();  // Create an SVGPoint for future math

function cursorPoint(evt) {     // Get point in global SVG space
    pt.x = evt.clientX; pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
}


/* ==================================== Hub Configuration ====================================== */
const con = new signalR.HubConnectionBuilder()
    .withUrl('/hub')
    .build();

con.onclose(err => {
    alert("Disconnect");
    location = '/';
});

con.on('StartDraw', startDraw);
con.on('Draw', draw);
con.on('StartRect', startRect);
con.on('DrawRect', drawRect);
con.on('StartCircle', startCircle);
con.on('DrawCircle', drawCircle);
con.on('DrawLine', drawLine);
con.on('PushPoint', pushPoint);

con.start().then(e => $('#main').show());
