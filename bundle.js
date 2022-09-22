(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Grid = void 0;
const lib_1 = require("./lib");
class Grid {
    constructor(size, mines, essentials) {
        this.icons = {
            mine: '💣',
            flag: '🚩',
            ques: '❔',
            death: '💀',
            win: '😎',
        };
        /* dfs function */
        this.dx = [-1, -1, -1, 0, 0, 1, 1, 1];
        this.dy = [-1, 0, 1, -1, 1, -1, 0, 1];
        this.size = size;
        this.unlabelled_mines = mines;
        this.total_mines = mines;
        this.essentials = essentials;
        this.map = new Array(size.height).fill(0).map(() => new Array(size.width).fill(0));
        /* generate mines randomly */
        essentials.mine_label.innerHTML = (0, lib_1.format)(mines);
        for (let i = 0; i < mines; i++) {
            let coord = new lib_1.Position((0, lib_1.randint)(0, size.width), (0, lib_1.randint)(0, size.height));
            while (this.map[coord.y][coord.x] == -1)
                coord = new lib_1.Position((0, lib_1.randint)(0, size.width), (0, lib_1.randint)(0, size.height));
            this.map[coord.y][coord.x] = -1;
        }
        /* init the numbers on the grid */
        let dx = [-1, -1, -1, 0, 0, 1, 1, 1];
        let dy = [-1, 0, 1, -1, 1, -1, 0, 1];
        for (let i = 0; i < size.height; i++)
            for (let j = 0; j < size.width; j++)
                if (this.map[i][j] != -1) {
                    for (let k = 0; k < dx.length; k++) {
                        let search_coord = new lib_1.Position(j + dx[k], i + dy[k]);
                        if (search_coord.x < 0 || search_coord.x >= size.width || search_coord.y < 0 || search_coord.y >= size.height)
                            continue;
                        if (this.map[search_coord.y][search_coord.x] == -1)
                            this.map[i][j]++;
                    }
                }
        console.log(this.map);
    }
    render() {
        /* render bottom grid */
        for (let i = 0; i < this.size.height; i++) {
            let nrow = document.createElement('div');
            nrow.setAttribute('class', 'row');
            for (let j = 0; j < this.size.width; j++) {
                let nblock = document.createElement('div');
                nblock.setAttribute('class', 'block');
                if (this.map[i][j] != 0) {
                    let ninner = document.createElement('div');
                    let matched_style = {
                        '-1': 'font-size: 25px',
                        '1': 'color: blue',
                        '2': 'color: green',
                        '3': 'color: red',
                        '4': 'color: darkblue',
                        '5': 'color: darkred',
                        '6': 'color: orange',
                        '7': 'color: #f035de',
                        '8': 'color: purple',
                    };
                    ninner.setAttribute('style', matched_style[`${this.map[i][j]}`]);
                    ninner.innerHTML = this.map[i][j] == -1 ? this.icons.mine : `${this.map[i][j]}`;
                    nblock.appendChild(ninner);
                }
                nrow.appendChild(nblock);
            }
            this.essentials.grid.appendChild(nrow);
        }
        /* render upper cover */
        for (let i = 0; i < this.size.height; i++) {
            let nrow = document.createElement('div');
            nrow.setAttribute('class', 'row');
            for (let j = 0; j < this.size.width; j++) {
                let nblock = document.createElement('div');
                nblock.setAttribute('class', 'cover');
                nblock.setAttribute('onclick', `clickCover(${j}, ${i})`);
                nblock.setAttribute('oncontextmenu', `rightclickCover(event, ${j}, ${i})`);
                let ninner = document.createElement('div');
                nblock.appendChild(ninner);
                nrow.appendChild(nblock);
            }
            this.essentials.cover_grid.appendChild(nrow);
        }
    }
    reveal(pos) {
        this.essentials.cover_grid.children[pos.y].children[pos.x].classList.add('reveal');
    }
    revealAll() {
        for (let x = 0; x < this.size.width; x++)
            for (let y = 0; y < this.size.height; y++)
                this.reveal(new lib_1.Position(x, y));
    }
    unreveal(pos) {
        this.essentials.cover_grid.children[pos.y].children[pos.x].classList.remove('reveal');
    }
    unrevealAll() {
        for (let x = 0; x < this.size.width; x++)
            for (let y = 0; y < this.size.height; y++)
                this.unreveal(new lib_1.Position(x, y));
    }
    ongameover(func) {
        this.gameover_callback = func;
    }
    gameover() {
        var _a;
        for (let x = 0; x < this.size.width; x++)
            for (let y = 0; y < this.size.height; y++)
                this.essentials.cover_grid.children[y].children[x].setAttribute('style', 'opacity: 0');
        this.essentials.face.innerHTML = this.icons.death;
        (_a = this.gameover_callback) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    onwin(func) {
        this.win_callback = func;
    }
    win() {
        var _a;
        this.essentials.face.innerHTML = this.icons.win;
        (_a = this.win_callback) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    _dfs_open(pos) {
        for (let k = 0; k < this.dx.length; k++) {
            let npos = new lib_1.Position(pos.x + this.dx[k], pos.y + this.dy[k]);
            if (npos.x < 0 || npos.x >= this.size.width || npos.y < 0 || npos.y >= this.size.height)
                continue;
            let cover = this.essentials.cover_grid.children[npos.y].children[npos.x];
            if (cover.getAttribute('style') != null)
                continue;
            if (cover.firstChild.innerHTML != "")
                continue;
            cover.setAttribute('style', 'opacity: 0');
            if (this.map[npos.y][npos.x] == 0)
                this._dfs_open(npos);
        }
    }
    tap(pos) {
        let cover = this.essentials.cover_grid.children[pos.y].children[pos.x];
        if (cover.firstChild.innerHTML != "") {
            cover.firstChild.innerHTML = "";
            this.essentials.mine_label.innerHTML = (0, lib_1.format)(++this.unlabelled_mines);
            return;
        }
        if (this.map[pos.y][pos.x] == -1)
            this.gameover();
        cover.setAttribute('style', 'opacity: 0'); // non retractable
        if (this.map[pos.y][pos.x] == 0)
            this._dfs_open(pos);
        let uncovered = 0;
        for (let x = 0; x < this.size.width; x++)
            for (let y = 0; y < this.size.height; y++)
                if (this.essentials.cover_grid.children[y].children[x].getAttribute('style') == null)
                    uncovered++;
        if (uncovered == this.total_mines)
            this.win();
    }
    flag(pos) {
        let cover = this.essentials.cover_grid.children[pos.y].children[pos.x];
        if (cover.getAttribute('style') != null)
            return;
        let target = cover.firstChild;
        if (target.innerHTML == "") {
            target.innerHTML = this.icons.flag;
            this.unlabelled_mines--;
        }
        else {
            target.innerHTML = "";
            this.unlabelled_mines++;
        }
        this.essentials.mine_label.innerHTML = (0, lib_1.format)(this.unlabelled_mines);
        if (this.unlabelled_mines < 0)
            this.essentials.mine_label.setAttribute('style', 'color: green');
        else
            this.essentials.mine_label.setAttribute('style', '');
    }
}
exports.Grid = Grid;

},{"./lib":3}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("./lib");
const grid_1 = require("./grid");
const trailofwonder = ['😀', '🙂', '😐', '🙁', '☹️', '😪'];
let grid;
let timer;
let secs = 0;
window.exec = (cmd) => {
    console.log(cmd);
    let cmd_parts = cmd.split(' ');
    try {
        let cmd_matches = {
            'spawn': () => {
                if (cmd_parts.length != 4)
                    throw SyntaxError("Wrong number of args!");
                let w = parseInt(cmd_parts[1]);
                let h = parseInt(cmd_parts[2]);
                let m = parseInt(cmd_parts[3]);
                (0, lib_1.assert)(() => !isNaN(w) && !isNaN(h) && !isNaN(m));
                window.init(w, h, m);
            },
            'reveal': () => {
                if (cmd_parts.length == 1)
                    grid.revealAll();
                else if (cmd_parts.length == 3) {
                    let pos = new lib_1.Position(parseInt(cmd_parts[1]), parseInt(cmd_parts[2]));
                    (0, lib_1.assert)(() => !isNaN(pos.x) && !isNaN(pos.y));
                    grid.reveal(pos);
                }
                else
                    throw SyntaxError("Wrong number of args!");
            },
            'unreveal': () => {
                if (cmd_parts.length == 1)
                    grid.unrevealAll();
                else if (cmd_parts.length == 3) {
                    let pos = new lib_1.Position(parseInt(cmd_parts[1]), parseInt(cmd_parts[2]));
                    (0, lib_1.assert)(() => !isNaN(pos.x) && !isNaN(pos.y));
                    grid.unreveal(pos);
                }
                else
                    throw SyntaxError("Wrong number of args!");
            },
            'tap': () => {
                if (cmd_parts.length != 3)
                    throw SyntaxError("Wrong number of args!");
                let pos = new lib_1.Position(parseInt(cmd_parts[1]), parseInt(cmd_parts[2]));
                (0, lib_1.assert)(() => !isNaN(pos.x) && !isNaN(pos.y));
                grid.tap(pos);
            },
            'flag': () => {
                if (cmd_parts.length != 3)
                    throw SyntaxError("Wrong number of args!");
                let pos = new lib_1.Position(parseInt(cmd_parts[1]), parseInt(cmd_parts[2]));
                (0, lib_1.assert)(() => !isNaN(pos.x) && !isNaN(pos.y));
                grid.flag(pos);
            },
            'starttimer': () => {
                if (cmd_parts.length != 1)
                    throw SyntaxError("Wrong number of args!");
                document.getElementById('face-status').innerHTML = trailofwonder[0];
                document.getElementById('timer').innerHTML = (0, lib_1.format)(secs);
                timer = window.setInterval(() => {
                    secs++;
                    document.getElementById('timer').innerHTML = (0, lib_1.format)(secs);
                    document.getElementById('face-status').innerHTML = trailofwonder[Math.floor(secs / 60000)];
                }, 1000);
            },
            'stoptimer': () => {
                if (cmd_parts.length != 1)
                    throw SyntaxError("Wrong number of args!");
                window.clearInterval(timer);
            }
        };
        if (Object.keys(cmd_matches).indexOf(cmd_parts[0]) == -1)
            throw SyntaxError("Command nonexistent! Consider adding yourself :)");
        cmd_matches[cmd_parts[0]]();
    }
    catch (e) {
        console.error(e);
    }
};
window.cmdKeyDown = (event, val) => {
    // console.log(event)
    if (event.code == "Enter") {
        window.exec(val);
        event.target.value = "";
    }
};
function popup() {
    document.getElementById('popup-back').setAttribute('style', 'display: block');
    document.getElementById('popup').setAttribute('style', 'display: block');
}
window.closePopup = () => {
    document.getElementById('popup-back').setAttribute('style', 'display: none');
    document.getElementById('popup').setAttribute('style', 'display: none');
};
function initClickHooks() {
    window.clickCover = (x, y) => {
        // console.log(x, y)
        window.exec(`tap ${x} ${y}`);
    };
    window.rightclickCover = (event, x, y) => {
        // console.log(event)
        event.preventDefault();
        window.exec(`flag ${x} ${y}`);
    };
}
function clearClickHooks() {
    window.clickCover = () => { };
    window.rightclickCover = () => { };
}
window.init = (width, height, mine) => {
    /* clear */
    document.getElementById('grid').innerHTML = "";
    document.getElementById('cover_grid').innerHTML = "";
    /* restore / store values if apply */
    let last_width = parseInt(localStorage.getItem('last_width'));
    let last_height = parseInt(localStorage.getItem('last_height'));
    let last_mine = parseInt(localStorage.getItem('last_mine'));
    try {
        (0, lib_1.assert)(() => !isNaN(last_width) && !isNaN(last_height) && !isNaN(last_mine));
    }
    catch (e) {
        console.error("Stored values invalid, using default");
        last_width = 10;
        last_height = 10;
        last_mine = 10;
    }
    last_width = width !== null && width !== void 0 ? width : last_width;
    last_height = height !== null && height !== void 0 ? height : last_height;
    last_mine = mine !== null && mine !== void 0 ? mine : last_mine;
    localStorage.setItem('last_width', `${last_width}`);
    localStorage.setItem('last_height', `${last_height}`);
    localStorage.setItem('last_mine', `${last_mine}`);
    let game_essentials = {
        grid: document.getElementById('grid'),
        cover_grid: document.getElementById('cover_grid'),
        mine_label: document.getElementById('mines-left'),
        face: document.getElementById('face-status'),
    };
    /* game init */
    grid = new grid_1.Grid(new lib_1.Dimension(last_width, last_height), last_mine, game_essentials);
    grid.render();
    grid.ongameover(() => {
        window.exec('stoptimer');
        clearClickHooks();
        let popup_title = document.querySelector('#popup h1');
        popup_title.innerHTML = "You LOSE!";
        popup_title.setAttribute('style', 'color: red');
        popup();
    });
    grid.onwin(() => {
        window.exec('stoptimer');
        clearClickHooks();
        let popup_title = document.querySelector('#popup h1');
        popup_title.innerHTML = "You WIN!";
        popup_title.setAttribute('style', 'color: green');
        popup();
    });
    initClickHooks();
    window.exec('starttimer');
};
window.onload = () => window.init();

},{"./grid":1,"./lib":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.format = exports.assert = exports.randint = exports.Position = exports.Dimension = exports.sleep = void 0;
function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}
exports.sleep = sleep;
class Dimension {
    constructor(width = 0, height = 0) {
        this.width = width;
        this.height = height;
    }
}
exports.Dimension = Dimension;
class Position {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}
exports.Position = Position;
function randint(lb, ub) {
    return Math.floor(Math.random() * (ub - lb) + lb);
}
exports.randint = randint;
function assert(func) {
    if (!func())
        throw EvalError;
}
exports.assert = assert;
function format(x) {
    let res = `${x}`;
    while (res.length < 4)
        res = '0' + res;
    return res;
}
exports.format = format;

},{}]},{},[2]);
