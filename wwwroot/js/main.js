"use strict"
// ================ Global variables =================
let id = null;
let undoList = [];   // Push the id with action
let redoList = [];   // After undo, push the undoList to the redoList
let choosen_id = null;
let points = [];   // Used in Draw Line
let newPath; // Currently used to store the boolean whether the thing got or not
let app = {
    type: "pen",
    color: "black",
    size: "5",
};
const as = "";
let coordinates = [];
let resize_angle;

// Coordinate variables
let cursorPosition = {};
let differentPosition = {};
let position = { x: 0, y: 0 };
let tempPoint1 = {}, tempPoint2 = {};
let scale = { x: 1.00, y: 1.00 };
let current_scale = { x: 1.00, y: 1.00 };

// Flag
let drag = false;
let resize = false;

// let menu = document.querySelector('#type');
// console.log(menu);
// menu.addEventListener('onchange', function (e) {
//     console.log("asd");
//     console.log(e.target.id);
//     app.type = e.target.id;
// });

// $query('#size').on('input' function(e) => {
//     let size = $query('#size').value
// });

$query('#size').oninput = e => {
    app.size = $query('#size').value;
    //app.size = document.getElementById('size').value;
    console.log(app.size);
};

$query('#color').oninput = e => {
    app.color = $query('#color').value;
    console.log(app.color);
};


// let svgDraw = document.querySelector('svg#draw');
let svgDraw = $query('svg#draw');

function menu(value) {
    app.type = value;
    // selection
    let children = $query('#type').children;
    for (var i = 0; i < children.length; i++) {
        children[i].classList.remove('typeActive');
    }
    $query(`#${value}`).classList.add('typeActive');
    unselect();
}

svgDraw.onpointerdown = svgDraw.onpointerenter = e => {
    if (e.buttons == 1 && e.isPrimary) {
        e.preventDefault();
        let current_position = cursorPoint(e);

        if (choosen_id && e.target.tagName == "svg") unselect();

        switch (app.type) {
            case "pen":         // Draw
                unselect();
                break;
            case "cursor":      // Move
                let resize_target = ["resize_nw", "resize_n", "resize_ne", "resize_e", "resize_se", "resize_s", "resize_sw", "resize_w", "line_x1", "line_x2"];
                let drag_target = ["path", "rect", "ellipse", "text", "image", "line"];

                if (resize_target.includes(e.target.id) && choosen_id) {
                    resize_angle = e.target.id;
                    cursorPosition = current_position;
                    // console.log($query(`#${choosen_id}`).getAttribute('stroke'));
                    if ($query(`[id='${choosen_id}']`).tagName == 'line') {
                        tempPoint1 = {
                            x: $query(`[id='${choosen_id}']`).getAttribute('x1'),
                            y: $query(`[id='${choosen_id}']`).getAttribute('y1')
                        };
                        tempPoint2 = {
                            x: $query(`[id='${choosen_id}']`).getAttribute('x2'),
                            y: $query(`[id='${choosen_id}']`).getAttribute('y2')
                        };
                    }
                    drag = false;
                    resize = true;
                }
                else if (drag_target.includes(e.target.tagName) && !resize_target.includes(e.target.id) && e.target.id != "resize_border" && !e.target.classList.contains("notMoveable")) {
                    unselect();
                    choosen_id = e.target.id;
                    if (e.target.tagName == "line") {
                        tempPoint1 = {
                            x: $query(`[id='${choosen_id}']`).getAttribute('x1'),
                            y: $query(`[id='${choosen_id}']`).getAttribute('y1')
                        };
                        tempPoint2 = {
                            x: $query(`[id='${choosen_id}']`).getAttribute('x2'),
                            y: $query(`[id='${choosen_id}']`).getAttribute('y2')
                        };
                        selected_border({ x1: $query(`[id='${choosen_id}']`).getAttribute('x1'), x2: $query(`[id='${choosen_id}']`).getAttribute('x2'), y1: $query(`[id='${choosen_id}']`).getAttribute('y1'), y2: $query(`[id='${choosen_id}']`).getAttribute('y2') }, true);

                    }
                    else selected_border($query(`[id='${choosen_id}']`).getBBox());
                    cursorPosition = current_position;
                    resize = false;
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
};

svgDraw.onpointermove = e => {
    if (e.buttons == 1 && e.isPrimary) {
        e.preventDefault();
        let current_position = cursorPoint(e);

        switch (app.type) {
            case "pen":         // Draw
                if (!id) {
                    coordinates.push({ x: current_position.x - e.movementX, y: current_position.y - e.movementY });
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
                    $query(`[id='${choosen_id}']`).style.transform = `translate(${current_position.x - cursorPosition.x}px,${current_position.y - cursorPosition.y}px)`;
                    $query('#resize_wrap').style.transform = `translate(${current_position.x - cursorPosition.x}px,${current_position.y - cursorPosition.y}px)`;
                    $query('#line_edit').style.transform = `translate(${current_position.x - cursorPosition.x}px,${current_position.y - cursorPosition.y}px)`;
                }
                else if (resize && resize_angle) {
                    let selected_info = $query(`[id='${choosen_id}']`).getBBox();

                    if (resize_angle == "resize_e") {
                        differentPosition.x = current_position.x - (selected_info.x + selected_info.width);
                        current_scale.x = (differentPosition.x + selected_info.width) / selected_info.width;

                        $query(`[id='${choosen_id}']`).style.transform = `translate(${selected_info.x}px,0) scale(${current_scale.x},${current_scale.y}) translate(-${selected_info.x}px,0)`
                        $query('#resize_wrap').style.transform = `translate(${selected_info.x}px,0) scale(${current_scale.x},${current_scale.y}) translate(-${selected_info.x}px,0)`
                    }
                    else if (resize_angle == "resize_w") {
                        differentPosition.x = selected_info.x - current_position.x;
                        current_scale.x = (differentPosition.x + selected_info.width) / selected_info.width;

                        $query(`[id='${choosen_id}']`).style.transform = `translate(${selected_info.x + selected_info.width}px,0) scale(${current_scale.x},${current_scale.y}) translate(-${selected_info.x + selected_info.width}px,0)`;
                        $query(`#resize_wrap`).style.transform = `translate(${selected_info.x + selected_info.width}px,0) scale(${current_scale.x},${current_scale.y}) translate(-${selected_info.x + selected_info.width}px,0)`;
                    }
                    else if (resize_angle == "resize_s") {
                        differentPosition.y = current_position.y - (selected_info.y + selected_info.height);
                        current_scale.y = (differentPosition.y + selected_info.height) / selected_info.height;

                        $query(`[id='${choosen_id}']`).style.transform = `translate(0,${selected_info.y}px) scale(${current_scale.x},${current_scale.y}) translate(0,-${selected_info.y}px)`;
                        $query(`#resize_wrap`).style.transform = `translate(0,${selected_info.y}px) scale(${current_scale.x},${current_scale.y}) translate(0,-${selected_info.y}px)`;
                    }
                    else if (resize_angle == "resize_n") {
                        differentPosition.y = selected_info.y - current_position.y;
                        current_scale.y = (differentPosition.y + selected_info.height) / selected_info.height;

                        $query(`[id='${choosen_id}']`).style.transform = `translate(0,${selected_info.y + selected_info.height}px) scale(${current_scale.x},${current_scale.y}) translate(0,-${selected_info.y + selected_info.height}px)`;
                        $query(`#resize_wrap`).style.transform = `translate(0,${selected_info.y + selected_info.height}px) scale(${current_scale.x},${current_scale.y}) translate(0,-${selected_info.y + selected_info.height}px)`;
                    }
                    else if (resize_angle == "resize_se") {
                        differentPosition.y = current_position.y - (selected_info.y + selected_info.height);
                        differentPosition.x = current_position.x - (selected_info.x + selected_info.width);
                        current_scale.y = (differentPosition.y + selected_info.height) / selected_info.height;
                        current_scale.x = (differentPosition.x + selected_info.width) / selected_info.width;

                        if (e.shiftKey) current_scale.x > current_scale.y ? current_scale.y = current_scale.x : current_scale.x = current_scale.y;

                        $query(`[id='${choosen_id}']`).style.transform = `translate(${selected_info.x}px,${selected_info.y}px) scale(${current_scale.x},${current_scale.y}) translate(-${selected_info.x}px,-${selected_info.y}px)`;
                        $query(`#resize_wrap`).style.transform = `translate(${selected_info.x}px,${selected_info.y}px) scale(${current_scale.x},${current_scale.y}) translate(-${selected_info.x}px,-${selected_info.y}px)`;
                    }
                    else if (resize_angle == "resize_nw") {
                        differentPosition.x = selected_info.x - current_position.x;
                        differentPosition.y = selected_info.y - current_position.y;
                        current_scale.x = (differentPosition.x + selected_info.width) / selected_info.width;
                        current_scale.y = (differentPosition.y + selected_info.height) / selected_info.height;

                        if (e.shiftKey) current_scale.x > current_scale.y ? current_scale.y = current_scale.x : current_scale.x = current_scale.y;

                        $query(`[id='${choosen_id}']`).style.transform = `translate(${selected_info.x + selected_info.width}px,${selected_info.y + selected_info.height}px) scale(${current_scale.x},${current_scale.y}) translate(-${selected_info.x + selected_info.width}px,-${selected_info.y + selected_info.height}px)`;
                        $query(`#resize_wrap`).style.transform = `translate(${selected_info.x + selected_info.width}px,${selected_info.y + selected_info.height}px) scale(${current_scale.x},${current_scale.y}) translate(-${selected_info.x + selected_info.width}px,-${selected_info.y + selected_info.height}px)`;
                    }
                    else if (resize_angle == "resize_ne") {
                        differentPosition.y = selected_info.y - current_position.y;
                        differentPosition.x = current_position.x - (selected_info.x + selected_info.width);
                        current_scale.x = (differentPosition.x + selected_info.width) / selected_info.width;
                        current_scale.y = (differentPosition.y + selected_info.height) / selected_info.height;

                        if (e.shiftKey) current_scale.x > current_scale.y ? current_scale.y = current_scale.x : current_scale.x = current_scale.y;

                        $query(`[id='${choosen_id}']`).style.transform = `translate(${selected_info.x}px,${selected_info.y + selected_info.height}px) scale(${current_scale.x},${current_scale.y}) translate(-${selected_info.x}px,-${selected_info.y + selected_info.height}px)`;
                        $query(`#resize_wrap`).style.transform = `translate(${selected_info.x}px,${selected_info.y + selected_info.height}px) scale(${current_scale.x},${current_scale.y}) translate(-${selected_info.x}px,-${selected_info.y + selected_info.height}px)`;
                    }
                    else if (resize_angle == "resize_sw") {
                        differentPosition.y = current_position.y - (selected_info.y + selected_info.height);
                        differentPosition.x = selected_info.x - current_position.x;
                        current_scale.x = (differentPosition.x + selected_info.width) / selected_info.width;
                        current_scale.y = (differentPosition.y + selected_info.height) / selected_info.height;

                        if (e.shiftKey) current_scale.x > current_scale.y ? current_scale.y = current_scale.x : current_scale.x = current_scale.y;

                        $query(`[id='${choosen_id}']`).style.transform = `translate(${selected_info.x + selected_info.width}px,${selected_info.y}px) scale(${current_scale.x},${current_scale.y}) translate(-${selected_info.x + selected_info.width}px,-${selected_info.y}px)`;
                        $query(`#resize_wrap`).style.transform = `translate(${selected_info.x + selected_info.width}px,${selected_info.y}px) scale(${current_scale.x},${current_scale.y}) translate(-${selected_info.x + selected_info.width}px,-${selected_info.y}px)`;
                    }
                    else if (resize_angle == "line_x1") {
                        let newPoint = comparePoint(current_position);
                        cursorPosition = newPoint ? { x: newPoint.x, y: newPoint.y } : { x: current_position.x.toFixed(2), y: current_position.y.toFixed(2) };

                        $query(`[id='${choosen_id}']`).setAttribute("x1", cursorPosition.x)
                        $query(`[id='${choosen_id}']`).setAttribute("y1", cursorPosition.y);
                        con.invoke('MoveObject', 'line', {
                            id: choosen_id,
                            x1: $query(`[id='${choosen_id}']`).getAttribute('x1'), y1: $query(`[id='${choosen_id}']`).getAttribute('y1')
                        });
                        selected_border({ x1: $(`#${choosen_id}`).attr('x1'), x2: $(`#${choosen_id}`).attr('x2'), y1: $(`#${choosen_id}`).attr('y1'), y2: $(`#${choosen_id}`).attr('y2') }, true);
                    }
                    else if (resize_angle == "line_x2") {
                        let newPoint = comparePoint(current_position);
                        cursorPosition = newPoint ? { x: newPoint.x, y: newPoint.y } : { x: current_position.x.toFixed(2), y: current_position.y.toFixed(2) };
                        $query(`[id='${choosen_id}']`).setAttribute("x2", cursorPosition.x)
                        $query(`[id='${choosen_id}']`).setAttribute("y2", cursorPosition.y);
                        con.invoke('MoveObject', 'line', {
                            id: choosen_id,
                            x2: $query(`[id='${choosen_id}']`).getAttribute('x2'), y2: $query(`[id='${choosen_id}']`).getAttribute('y2')
                        });
                        selected_border({ x1: $(`#${choosen_id}`).attr('x1'), x2: $(`#${choosen_id}`).attr('x2'), y1: $(`#${choosen_id}`).attr('y1'), y2: $(`#${choosen_id}`).attr('y2') }, true);
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
                let tempCurrent = { x: Number(current_position.x), y: Number(current_position.y) };
                let pointLA = null;
                newPoint ? pointLA = newPoint : pointLA = tempCurrent;
                drawLine(id, tempCurrent, pointLA, app.color, app.size);
                con.invoke('DrawLine', id, tempCurrent, pointLA, app.color, app.size);
                break;
            default:
                break;
        }
    }
};

svgDraw.onpointerup = svgDraw.onpointerleave = e => {
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
                undoList.push({ mode: 'new', object: $query(`[id='${id}']`).cloneNode(true) });
            id = null;
            coordinates = [];
            break;
        case "cursor":      // Move
            let object1 = null;
            let object2 = null;
            if (choosen_id) {
                const change = window.getComputedStyle($query(`[id='${choosen_id}']`), null)?.transform;
                const selected_css_value = change != 'none' ? change.match(/matrix.*\((.+)\)/)[1].split(', ').map(parseFloat) : null;
                let $choosen_id = $query(`[id='${choosen_id}']`);

                // $(`#${choosen_id},#resize_wrap,#line_edit`).removeAttr('style');
                $choosen_id.removeAttribute('style');
                $query("#resize_wrap").removeAttribute('style');
                $query("#line_edit").removeAttribute('style');

                if ($choosen_id.tagName == 'line') {
                    $('#resize_wrap').hide();
                } else {
                    $('#line_edit').hide();
                }

                object1 = $choosen_id.cloneNode(true);
                if (drag && selected_css_value) {       // drag
                    position = { x: selected_css_value[4], y: selected_css_value[5] };

                    switch ($choosen_id.tagName) {
                        case 'path':
                            let new_coord;
                            const coord = $choosen_id.getAttribute('d').substring(1).split("Q");
                            let i
                            for (i of coord) {
                                let coord_xy = i.split(",").map(parseFloat);
                                !new_coord ?
                                    new_coord = `M${simplifyNumber(coord_xy[0] + position.x)},${simplifyNumber(coord_xy[1] + position.y)}` :
                                    new_coord += `Q${simplifyNumber(coord_xy[0] + position.x)},${simplifyNumber(coord_xy[1] + position.y)},${simplifyNumber(coord_xy[2] + position.x)},${simplifyNumber(coord_xy[3] + position.y)}`;
                            }
                            con.invoke('MoveObject', 'path', { id: choosen_id, d: new_coord });
                            $choosen_id.setAttribute('d', new_coord);
                            break;
                        case 'rect':
                            $choosen_id.setAttribute('x', Number($choosen_id.getAttribute('x')) + position.x);
                            $choosen_id.setAttribute('y', Number($choosen_id.getAttribute('y')) + position.y);
                            con.invoke('MoveObject', 'rect', { id: choosen_id, x: $choosen_id.getAttribute('x'), y: $choosen_id.getAttribute('y') });
                            break;
                        case 'ellipse':
                            $choosen_id.setAttribute('cx', Number($choosen_id.getAttribute('cx')) + position.x);
                            $choosen_id.setAttribute('cy', Number($choosen_id.getAttribute('cy')) + position.y);
                            con.invoke('MoveObject', 'ellipse', { id: choosen_id, cx: $choosen_id.getAttribute('cx'), cy: $choosen_id.getAttribute('cy') });
                            break;
                        case 'image':
                            break;
                        case 'line':
                            $choosen_id.setAttribute('x1', Number($choosen_id.getAttribute('x1')) + position.x);
                            $choosen_id.setAttribute('x2', Number($choosen_id.getAttribute('x2')) + position.x);
                            $choosen_id.setAttribute('y1', Number($choosen_id.getAttribute('y1')) + position.y);
                            $choosen_id.setAttribute('y2', Number($choosen_id.getAttribute('y2')) + position.y);
                            selected_border({ x1: $choosen_id.getAttribute('x1'), x2: $choosen_id.getAttribute('x2'), y1: $choosen_id.getAttribute('y1'), y2: $choosen_id.getAttribute('y2') }, true);
                            popPoint(tempPoint1); popPoint(tempPoint2);
                            pushPoint({ x: Number($choosen_id.getAttribute("x1")), y: Number($choosen_id.getAttribute("y1")) });
                            pushPoint({ x: Number($choosen_id.getAttribute("x2")), y: Number($choosen_id.getAttribute("y2")) });
                            $query("#line_edit").removeAttribute('style');
                            con.invoke('MoveObject', 'line', {
                                id: choosen_id, x1: $choosen_id.getAttribute('x1'), y1: $choosen_id.getAttribute('y1'),
                                x2: $choosen_id.getAttribute('x2'), y2: $choosen_id.getAttribute('y2')
                            });
                            break;
                    }
                }
                else if (resize && selected_css_value) {        // resize
                    let scale = { x: selected_css_value[0], y: selected_css_value[3] };

                    switch ($choosen_id.tagName) {
                        case 'path':
                            let new_coord, initial_position;
                            const coord = $choosen_id.getAttribute('d').substring(1).split("Q");

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
                                    case "resize_ne":
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
                            $choosen_id.setAttribute('d', new_coord);
                            con.invoke('MoveObject', 'path', { id: choosen_id, d: new_coord });
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

                            $choosen_id.setAttribute('x', rect_info.x + position.x);
                            $choosen_id.setAttribute('y', rect_info.y + position.y);
                            $choosen_id.setAttribute('width', rect_info.width * scale.x);
                            $choosen_id.setAttribute('height', rect_info.height * scale.y);
                            con.invoke('MoveObject', 'rect', {
                                id: choosen_id,
                                x: $choosen_id.getAttribute('x'), y: $choosen_id.getAttribute('y'),
                                width: $choosen_id.getAttribute('width'), height: $choosen_id.getAttribute('height')
                            });
                            break;
                        case 'ellipse':
                            const ellipse_info = $choosen_id.getBBox();
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

                            $choosen_id.setAttribute('cx', circle.cx);
                            $choosen_id.setAttribute('cy', circle.cy);
                            $choosen_id.setAttribute('rx', circle.rx);
                            $choosen_id.setAttribute('ry', circle.ry);

                            con.invoke('MoveObject', 'ellipse', {
                                id: choosen_id,
                                cx: $choosen_id.getAttribute('cx'), cy: $choosen_id.getAttribute('cy'),
                                rx: $choosen_id.getAttribute('rx'), ry: $choosen_id.getAttribute('ry')
                            });
                            break;
                    }
                }
                else if (resize && $(`#${choosen_id}`)[0].tagName == "line") {
                    popPoint({ x: tempPoint1.x, y: tempPoint1.y });
                    popPoint({ x: tempPoint2.x, y: tempPoint2.y });
                    pushPoint({ x: $choosen_id.getAttribute('x1') * 1, y: $choosen_id.getAttribute('y1') * 1 });
                    pushPoint({ x: $choosen_id.getAttribute('x2') * 1, y: $choosen_id.getAttribute('y2') * 1 });
                }
                object2 = $query(`[id='${choosen_id}']`).cloneNode(true);
                undoList.push({ mode: 'move', object1: object1, object2: object2 });

                if ($(`#${choosen_id}`)[0].tagName != "line") {
                    selected_border($choosen_id.getBBox());
                }
            }
            current_scale = { x: 1, y: 1 };
            differentPosition = cursorPosition = {}
            position = { x: 0, y: 0 };
            drag = resize = false;
            break;
        case "text":        // Textbox

            break;
        case "rect":        // Rectangle
            if (e.type == "pointerup") {
                if (id != null)
                    undoList.push({ mode: 'new', object: $query(`[id='${id}']`).cloneNode(true) });
                // newPath = differentPosition = cursorPosition = id = null;
            }
            break;
        case "circle":      // Circle
            if (e.type == "pointerup") {
                if (id != null)
                    undoList.push({ mode: 'new', object: $query(`[id='${id}']`).cloneNode(true) });
                // newPath = differentPosition = cursorPosition = id = null;
            }
            break;
        case "line":        // Line
            if (e.type == "pointerup") {
                if (!$.isEmptyObject(cursorPosition)) {
                    let newPoint = { x: current_position.x.toFixed(2) * 1, y: current_position.y.toFixed(2) * 1 };
                    // Update hub point
                    let tempCursorPosition = { x: cursorPosition.x.toFixed(2) * 1, y: cursorPosition.y.toFixed(2) * 1 };
                    pushPoint(tempCursorPosition); pushPoint(newPoint);
                    con.invoke("PushPoint", tempCursorPosition);
                    con.invoke("PushPoint", newPoint);
                }
                if (id != null) undoList.push({ mode: 'new', object: $query(`[id='${id}']`).cloneNode(true) });
                // newPath = cursorPosition =current_position = id = null;
            }
            break;
    }
};

window.onpointerup = e => {
    e.preventDefault();

    switch (app.type) {
        case 'line':
            cursorPosition = {};
            newPath = id = null;
            break;
        case 'rect':
            differentPosition = cursorPosition = {};
            newPath = id = null;
            break;
        case 'pen':
            id = null;
            coordinates = [];
            break;
        case 'circle':
            differentPosition = cursorPosition = {};
            newPath = id = null;
            break;
    }
};

// Zoom in & out
svgDraw.onmousewheel = svgDraw.onkeydown = e => {
    if (e.ctrlKey) {
        e.preventDefault();
        let scale = $query("#draw").getBoundingClientRect().width / $query("#draw").clientWidth;
        if (e.wheelDelta / 120 > 0) {
            if (scale < 5) {
                $query("#draw").style.transform = `scale(${(scale + 0.05).toFixed(2)})`;
                $query("#grid_wrap").style.transform = `scale(${(scale + 0.05).toFixed(2)})`;
            }
        } else {
            if (scale >= 0.2) {
                $query("#draw").style.transform = `scale(${(scale - 0.05).toFixed(2)})`;
                $query("#grid_wrap").style.transform = `scale(${(scale - 0.05).toFixed(2)})`;
            }
        }
    }
};

// Delete selected object
window.onkeydown = e => {
    if (e.keyCode == 8 || e.keyCode == 46 && choosen_id) {
        if (!choosen_id) return;
        undoList.push({ mode: 'remove', object: $query(`[id='${choosen_id}']`) });
        remove(choosen_id); unselect();
    }
    else if (e.ctrlKey && e.keyCode == '90' && !e.repeat) {
        unselect(); undo();
    } else if (e.ctrlKey && e.keyCode == '89' && !e.repeat) {
        unselect(); redo();
    }
};

/* ==================================== Update by frame ====================================== */
let rgb_H = 0;
let secondsPassed;
let oldTimeStamp;
let fps;

window.requestAnimationFrame(update); // update by frame

function update(timeStamp) {
    // Calculate the number of seconds passed since the last frame
    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;

    // Calculate fps
    fps = Math.round(1 / secondsPassed);

    // Display fps
    if (fps > 20) {
        $query(`#fps`).innerHTML = fps;
        $query(`#fps`).style.color = "green";
    }
    else {
        $query(`#fps`).innerHTML = fps;
        $query(`#fps`).style.color = "red";
    }

    // RGB Stroke
    // $("#draw path:not(#resize_wrap *)").attr('stroke', `hsl(${rgb_H}, 100%, 50%)`);
    // rgb_H < 360 ? rgb_H++ : rgb_H = 0;
    // $("label#pen span").css("color", `hsl(${rgb_H}, 100%, 50%)`);

    window.requestAnimationFrame(update);
}

/* ==================================== Function ====================================== */
function $query(selector) {
    return document.querySelectorAll(selector).length == 1 ?
        document.querySelector(selector) : document.querySelectorAll(selector);
}

async function upload() {
    let f = e.target.files[0];
    let svg = $query('svg#draw').getAttribute("viewBox").split(" ");
    if (f && f.type.startsWith('image/')) {
        // TODO: Use async-await syntax
        let url = await crop(f, svg[2], svg[3], 'dataURL', 'image/webp');
        let newPath = document.createElementNS("http://www.w3.org/2000/svg", "image");
        newPath.setAttribute('id', uuidv4());
        newPath.setAttribute('href', url);
        $query("#draw").appendChild(newPath);
    }
}

function select(box, con) {
    if ($query('#resize_wrap') !== null) {
        svgDraw.removeChild($query('#resize_wrap'));
    }
    if ($query('#line_edit') !== null) {
        svgDraw.removeChild($query('#line_edit'));
    }
    if (!box) return;

    let border = "";

    if (con) {
        border = `<g id="resize_wrap">
                    <rect id="resize_border" class='notMoveable' fill="none" stroke="lightblue" stroke-width="1px" x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" />
                    <rect id="resize_nw" class="notMoveable" width="10" height="10" x="${box.x - 10}" y="${box.y - 10}" style="cursor:nw-resize"/>
                    <rect id="resize_n" class='notMoveable' width="10" height="10" x="${box.x + (box.width / 2) - 5}" y="${box.y - 10}" style="cursor:n-resize" />
                    <rect id="resize_ne" class='notMoveable' width="10" height="10" x="${box.x + box.width}" y="${box.y - 10}" style="cursor:ne-resize" />
                    <rect id="resize_e" class='notMoveable' width="10" height="10" x="${box.x + box.width}" y="${box.y + (box.height / 2) - 5}" style="cursor:e-resize"/>
                    <rect id="resize_se" class='notMoveable' width="10" height="10" x="${box.x + box.width}" y="${box.y + box.height}" style="cursor:se-resize" />
                    <rect id="resize_s" class='notMoveable' width="10" height="10"  x="${box.x + (box.width / 2) - 5}" y="${box.y + box.height}" style="cursor:s-resize"/>
                    <rect id="resize_sw" class='notMoveable' width="10" height="10" x="${box.x - 10}" y="${box.y + box.height}" style="cursor:sw-resize"/>
                    <rect id="resize_w" class='notMoveable' width="10" height="10" x="${box.x - 10}" y="${box.y + (box.height / 2) - 5}" style="cursor:w-resize"/>
                  </g>`;

    } else {
        border = `<g id="line_edit">
                    <rect id="line_x1" class='notMoveable' width="10" height="10" x="${box.x1 - 5}" y="${box.y1 - 5}" style="cursor:move" />
                    <rect id="line_x2" class='notMoveable' width="10" height="10" x="${box.x2 - 5}" y="${box.y2 - 5}" style="cursor:move"/>
                  </g>`;
    }

    svgDraw.insertAdjacentHTML('beforeend', border);
    // svgDraw.appendChild(border);
}

function unselect() {
    if (choosen_id) {
        $query("#resize_wrap").setAttribute("hidden", true);
        $query("#resize_wrap").removeAttribute("style");
        $query("#line_edit").setAttribute("hidden", true);
        $query("#line_edit").removeAttribute("style");
        choosen_id = null;
    }
}

// Drawing function
function mid(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function startDraw(id, point, color, size) {
    let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute('id', id);
    path.setAttribute('d', `M${simplifyNumber(point.x)},${simplifyNumber(point.y)}`);
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", `${size}px`);
    $query("svg#draw").appendChild(path);
}
function draw(id, pointA, pointB) {
    let path = $query(`[id='${id}']`);
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
    $query("svg#draw").appendChild(rect);
}
function drawRect(id, point, box) {
    let rect = $query(`[id='${id}']`);
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
    $query("svg#draw").appendChild(circle);    // add into svg
}
function drawCircle(id, point, box) {
    let circle = $query(`[id='${id}']`);
    circle.setAttribute('rx', simplifyNumber(box.x));
    circle.setAttribute('ry', simplifyNumber(box.y));
    circle.setAttribute('cx', simplifyNumber(point.x));
    circle.setAttribute('cy', simplifyNumber(point.y));
}
function drawLine(id, point, point2, color, size) {
    let path = $query(`[id='${id}']`);
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
    $query("svg#draw").appendChild(path);
}

function pushPoint(point) {
    points.push(point);
}

function popPoint(point) {
    points = points.filter(o => o.x != point.x * 1 && o.y != point.y * 1);
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
    $query("svg#draw").appendChild(text);
}

// Remove object
function remove(id) {
    if ($query(`[id='${id}']`).tagName == 'line') {
        popPoint({ x: $query(`[id='${id}']`).getAttribute('x1') * 1, y: $query(`[id='${id}']`).getAttribute('y1') * 1 });
        popPoint({ x: $query(`[id='${id}']`).getAttribute('x2') * 1, y: $query(`[id='${id}']`).getAttribute('y2') * 1 });
    }
    $query(`[id='${id}']`).remove();
}
function removeAll() {
    $('svg#draw > :not("#resize_wrap")').remove();
}
function create(object) {
    console.log(object);
    $query('svg#draw').appendChild(object);
}
//id,d,x1,y1,x2,y2
function moveObject(tag, object) {
    switch (tag) {
        case 'path':
            $query(`[id='${object.id}']`).setAttribute('d', object.d);
            break;
        case 'ellipse':
            if (object.cx && object.cy) {
                $query(`[id='${object.id}']`).setAttribute('cx', object.cx);
                $query(`[id='${object.id}']`).setAttribute('cy', object.cy);
            }
            if (object.rx && object.ry) {
                $query(`[id='${object.id}']`).setAttribute('rx', object.rx);
                $query(`[id='${object.id}']`).setAttribute('ry', object.ry);
            }
            break;
        case 'rect':
            if (object.x && object.y) {
                $query(`[id='${object.id}']`).setAttribute('x', object.x);
                $query(`[id='${object.id}']`).setAttribute('y', object.y);
            }
            if (object.width && object.height) {
                $query(`[id='${object.id}']`).setAttribute('width', object.width);
                $query(`[id='${object.id}']`).setAttribute('height', object.height);
            }
            break;
        case 'line':
            if (object.x1 && object.y1) {
                $query(`[id='${object.id}']`).setAttribute('x1', object.x1);
                $query(`[id='${object.id}']`).setAttribute('y1', object.y1);
            }
            if (object.x2 && object.y2) {
                $query(`[id='${object.id}']`).setAttribute('x2', object.x2);
                $query(`[id='${object.id}']`).setAttribute('y2', object.y2);
            }
            break;
    }
}

// Undo event trigger
function undo() {  // Everytime will push {event:,object:}  
    if (undoList.length == 0) return;
    let temp = undoList.pop();
    let tempId = $query(temp.object).getAttribute('id');    // use for remove and new
    if (temp.mode == 'new') {
        remove(tempId);
        con.invoke('Remove', tempId);
    }
    else if (temp.mode == 'move') {
        let firstId = $(temp.object1).attr('id');
        let secondId = $(temp.object2).attr('id');
        if (firstId == secondId) {
            remove(firstId);
            con.invoke('Remove', firstId);
            create(temp.object1);
            con.invoke('Create', getString(temp.object1));
        }
    } else if (temp.mode == 'remove') {
        remove(tempId);
        create(temp.object);
        con.invoke('Create', getString(temp.object));
    } else {
        console.log("Unknown");
    }
    redoList.push(temp);
}

/*when  */
// Redo event trigger
function redo() {

    if (redoList.length == 0) return;

    let temp = redoList.pop();
    console.log(temp.mode);
    let tempId = $(temp.object).attr('id');
    if (temp.mode == 'new') {
        create(temp.object);
        let p = getString(temp.object);
        con.invoke('Create', getString(temp.object).replace(/\"/gi, "\'"));
    }
    else if (temp.mode == 'move') {
        let firstId = $(temp.object1).attr('id');
        let secondId = $(temp.object2).attr('id');
        if (firstId == secondId) {
            remove(firstId);
            con.invoke('Remove', firstId);
            create(temp.object2);
            con.invoke('Create', getString(temp.object2));
        }
    } else if (temp.mode == 'remove') {
        remove(tempId);
        con.invoke('Remove', tempId);
    } else {
        console.log("Unknown");
    }
    undoList.push(temp);
}
function createObject(stringObject) {
    let tempObject = new DOMParser().parseFromString(stringObject, "image/svg+xml").firstChild;
    let newObject = $(tempObject);
    let tag = newObject.prop('tagName');
    switch (tag) {
        case 'path':
            let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('id', newObject.attr('id'));
            path.setAttribute('d', newObject.attr('d'));
            path.setAttribute("stroke", newObject.attr('stroke'));
            path.setAttribute("stroke-width", newObject.attr('stroke-width'));
            $query("svg#draw").appendChild(path);
            break;
        case 'ellipse':
            let circle = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
            circle.setAttribute('id', newObject.attr('id'));
            circle.setAttribute('cx', newObject.attr('cx'));
            circle.setAttribute('cy', newObject.attr('cy'));
            circle.setAttribute('rx', newObject.attr('rx'));
            circle.setAttribute('ry', newObject.attr('ry'));
            circle.setAttribute('stroke', newObject.attr('stroke'));
            circle.setAttribute('stroke-width', newObject.attr('stroke-width'));
            $query("svg#draw").appendChild(circle);
            break;
        case 'rect':
            let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute('id', newObject.attr('id'));
            rect.setAttribute("stroke", newObject.attr('id'));
            rect.setAttribute("stroke-width", newObject.attr('id'));
            rect.setAttribute('x', newObject.attr('x'));
            rect.setAttribute('y', newObject.attr('y'));
            rect.setAttribute('width', newObject.attr('width'));
            rect.setAttribute('height', newObject.attr('height'));
            $query("svg#draw").appendChild(rect);
            break;
        case 'line':
            let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute('id', newObject.attr('id'));
            line.setAttribute('stroke', newObject.attr('stroke'));
            line.setAttribute('stroke-width', newObject.attr('stroke-width'));
            line.setAttribute('x1', newObject.attr('x1'));
            line.setAttribute('y1', newObject.attr('y1'));
            line.setAttribute('x2', newObject.attr('x2'));
            line.setAttribute('y2', newObject.attr('y2'));
            $query("svg#draw").appendChild(line);
            break;
    }
}
// Convert the DOM to string
var getString = (function () {
    var DIV = document.createElement("div");

    if ('outerHTML' in DIV)
        return function (node) {
            return node.outerHTML;
        };

    return function (node) {
        var div = DIV.cloneNode();
        div.appendChild(node.cloneNode(true));
        return div.innerHTML;
    };

})();


function simplifyNumber(n) {
    if (!$.isNumeric(n)) return;
    return n.toFixed(2) % 1 != 0 ? n.toFixed(2) : n.toFixed(0);
}

// Reset selected border coordinate
function selected_border(selected_info, line = false) {
    if (!line) {
        $('#resize_wrap').show();
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
    else {
        $("#line_edit").show();
        $("#line_x1").attr("x", selected_info.x1 - 5).attr("y", selected_info.y1 - 5).css("cursor", "move");
        $("#line_x2").attr("x", selected_info.x2 - 5).attr("y", selected_info.y2 - 5).css("cursor", "move");
    }
}

function uuidv4() { // ID generator
    return ([1e7] + 1e3 + 4e3 + 8e3 + 1e11).replace(/[018]/g, c =>
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
const name = sessionStorage.getItem('name');
const roomId = new URL(location).searchParams.get('roomId');
if (!roomId) {
    location = 'list.html';
    throw 'ERROR: Invalid game id';
}
const param = $.param({ page: 'draw', name, roomId });
const con = new signalR.HubConnectionBuilder()
    .withUrl('/hub?' + param)
    .build();

con.onclose(err => {
    alert("Disconnect");
    location = 'main.html';
});

con.on('Reject', () => location = 'list.html');
$('#leave').click(e => location = 'list.html');

con.on('Left', status => {
    var x = document.getElementById("status");
    console.log(x.innerHTML);
    x.hidden = false;
    x.innerHTML = status;
    console.log(x.innerHTML);

    setTimeout(function () {
        x.hidden = true;
    }, 3000);
});

con.on('StartDraw', startDraw);
con.on('Draw', draw);
con.on('StartRect', startRect);
con.on('DrawRect', drawRect);
con.on('StartCircle', startCircle);
con.on('DrawCircle', drawCircle);
con.on('DrawLine', drawLine);
con.on('PushPoint', pushPoint);
con.on('Remove', remove);
con.on('RemoveAll', removeAll);
con.on('MoveObject', moveObject);
con.on('Create', createObject);

con.start().then(e => main());

function main() {
    $query('#main').hidden = false;
    $("#resize_wrap,#line_edit").hide();
    menu('pen');
}
