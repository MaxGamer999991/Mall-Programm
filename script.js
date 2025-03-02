function get(id) {
    return document.getElementById(id);
}

const canvas = get("canvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
addEventListener("resize", () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
})

var menu = false;
function menu_ausklap() {
    menu = !menu;
    if (menu) {
        get("menu-ausklap").style.display = "flex";
    } else {
        get("menu-ausklap").style.display = "none";
    }
}

var wirklich_new = false;
function warnung_new() {
    wirklich_new = true;
    get("warnung-new").style.display = "flex";
}
function warnung_new_ja() {
    if (wirklich_new) {
        wirklich_new = false;
        get("warnung-new").style.display = "none";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        menu_ausklap();
    }
}
function warnung_new_nein() {
    wirklich_new = false;
    get("warnung-new").style.display = "none";
}


// Data [Seiten [Lines{Colors, Widths, Points{X, Y}}]]
// Touches [Touches{Identifier, Points{X, Y}}]
var Data = [[]]; // Initialize Data as a 2D array
const Settings = {
    seiten: 0,
    color: "black",
    width: 2,
    filepath: ""
};
const Touches = [];
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        ctx.beginPath();
        ctx.fillStyle = Settings.color;
        ctx.arc(e.changedTouches[i].clientX, e.changedTouches[i].clientY, Settings.width/2, 0, Math.PI*2);
        ctx.fill();
        Touches.push([e.changedTouches[i].identifier, [{x: e.changedTouches[i].clientX, y: e.changedTouches[i].clientY}]]);
    }
});
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        let id = find(e.changedTouches[i].identifier);
        ctx.beginPath();
        ctx.strokeStyle = Settings.color;
        ctx.lineWidth = Settings.width;
        ctx.moveTo(Touches[id][1][Touches[id][1].length-1].x, Touches[id][1][Touches[id][1].length-1].y);
        ctx.lineTo(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = Settings.color;
        ctx.arc(e.changedTouches[i].clientX, e.changedTouches[i].clientY, Settings.width/2, 0, Math.PI*2);
        ctx.fill();
        Touches[find(e.changedTouches[i].identifier)][1].push({x: e.changedTouches[i].clientX, y: e.changedTouches[i].clientY});
    }
});
canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        let id = find(e.changedTouches[i].identifier);
        const points = Touches[id][1];
        const startPoint = points[0];
        const endPoint = points[points.length - 1];
        const distance = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));

        if (distance < 5 && points.length < 10) {
            ctx.beginPath();
            ctx.fillStyle = Settings.color;
            ctx.arc(endPoint.x, endPoint.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        Data[Settings.seiten].push({color: Settings.color, width: Settings.width, points: points});
        Touches.splice(id, 1);
    }
});
addEventListener("touchcancel", (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        Touches.splice(find(e.changedTouches[i].identifier), 1);
    }
});
function find(id) {
    for (let i = 0; i < Touches.length; i++) {
        if (Touches[i][0] == id) {
            return i;
        }
    }
    return 0;
}
function load(data) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < data.length; i++) {
        const points = data[i].points;
        ctx.beginPath();
        ctx.strokeStyle = data[i].color;
        ctx.lineWidth = data[i].width;
        ctx.moveTo(points[0].x, points[0].y);
        for (let j = 1; j < points.length; j++) {
            ctx.lineTo(points[j].x, points[j].y);
        }
        ctx.stroke();

        const startPoint = points[0];
        const endPoint = points[points.length - 1];
        const distance = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));

        if (distance < 10) {
            ctx.beginPath();
            ctx.arc(endPoint.x, endPoint.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
function open() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".teach, .pronote, .maxnote";
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            Data = JSON.parse(e.target.result);
            seite(0);
        }
        reader.readAsText(file);
        Settings.filepath = file.name;
    }
    input.click();
}
function save() {
    if (Settings.filepath != "") {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([JSON.stringify(Data)], {type: ".maxnote"}));
        a.download = Settings.filepath;
        a.click();
    } else {
        saveas();
    }
}
function saveas() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(Data)], {type: "application/json"}));
    a.download = "data.maxnote";
    a.click();
}

setInterval(() => {
    ctx.beginPath();
    ctx.fillStyle = "rgb(" + (Math.random() * 100 + 155) + "," + (Math.random() * 100 + 155) + "," + (Math.random() * 100 + 155) + ")";
    ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, 10, 0, Math.PI*2);
    ctx.fill();
}
, 1000/10);

function seite(id) {
    Settings.seiten = id;
    get("page-current").innerText = id + 1;
    load(Data[id]);
}


get("menu").addEventListener("touchstart", menu_ausklap);
get("menu-item-open").addEventListener("touchstart", open);
get("menu-item-save").addEventListener("touchstart", save);
get("menu-item-saveas").addEventListener("touchstart", saveas);
get("menu-item-new").addEventListener("touchstart", warnung_new);
get("page-left").addEventListener("touchstart", () => {
    if (Settings.seiten >= 0) {
        seite(Settings.seiten - 1);
    } else {
        seite(Data.length - 1);
    }
});
get("page-right").addEventListener("touchstart", () => {
    if (Settings.seiten >= Data.length - 1) {
        Data.push([]);
    }
    seite(Settings.seiten + 1);
});
get("warnung-new-ja").addEventListener("touchstart", warnung_new_ja);
get("warnung-new-nein").addEventListener("touchstart", warnung_new_nein);
get("warnung-new-abbrechen").addEventListener("touchstart", warnung_new_nein);