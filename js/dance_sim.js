'use strict';
const HTML_CANVAS = "dancesimcanvas";
const HTML_TICK_DURATION = "tickduration";
const HTML_START_BUTTON = "simstart";
const HTML_NUM_GROUPS = "numgroups";
const HTML_NUM_PLAYERS = "numplayers";
const HTML_NUM_PLAYERS2 = "numplayers2";
const HTML_NUM_PLAYERS3 = "numplayers3";
const HTML_NUM_PLAYERS4 = "numplayers4";
const HTML_NUM_PLAYERS5 = "numplayers5";
const HTML_NUM_PLAYERS6 = "numplayers6";
const HTML_NUM_PLAYERS7 = "numplayers7";
const HTML_NUM_PLAYERS8 = "numplayers8";
const HTML_NUM_PLAYERS9 = "numplayers9";
const HTML_LEAD_COLOR = "lead";
const HTML_MIDDLE_COLOR = "middle";
const HTML_BACK_COLOR = "back";
const HTML_ALTERNATE_COLOR = "alternate";
const HTML_MARKER_COLOR = "marker";
const HTML_TOGGLE_TICK_PER_CLICK = "tickperclick";

window.onload = simInit;

//{ Simulation - sim

var simSmoothMovement;
var simPlayersVisible;
var simMarkingTiles;

var simMarkedTiles;

function simInit() {
    let canvas = document.getElementById(HTML_CANVAS);
    simTickDurationInput = document.getElementById(HTML_TICK_DURATION);
    simNumGroupsInput = document.getElementById(HTML_NUM_GROUPS);
    simNumPlayersInput = document.getElementById(HTML_NUM_PLAYERS);
    simNumPlayers2Input = document.getElementById(HTML_NUM_PLAYERS2);
    simNumPlayers3Input = document.getElementById(HTML_NUM_PLAYERS3);
    simNumPlayers4Input = document.getElementById(HTML_NUM_PLAYERS4);
    simNumPlayers5Input = document.getElementById(HTML_NUM_PLAYERS5);
    simNumPlayers6Input = document.getElementById(HTML_NUM_PLAYERS6);
    simNumPlayers7Input = document.getElementById(HTML_NUM_PLAYERS7);
    simNumPlayers8Input = document.getElementById(HTML_NUM_PLAYERS8);
    simNumPlayers9Input = document.getElementById(HTML_NUM_PLAYERS9);
    simLeadColorInput = document.getElementById(HTML_LEAD_COLOR);
    simMiddleColorInput = document.getElementById(HTML_MIDDLE_COLOR);
    simBackColorInput = document.getElementById(HTML_BACK_COLOR);
    simAlternateColorInput = document.getElementById(HTML_ALTERNATE_COLOR);
    simMarkerColorInput = document.getElementById(HTML_MARKER_COLOR);
    simToggleTickPerClick = document.getElementById(HTML_TOGGLE_TICK_PER_CLICK);
    simToggleTickPerClick.onchange = simToggleTickPerClickOnChange;
    simStartStopButton = document.getElementById(HTML_START_BUTTON);
    simStartStopButton.onclick = simStartStopButtonOnClick;

    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        rInit(canvas, 64*12, 48*12);
    } else {
        rInit(canvas, 128 * 12, 100 * 12);
    }
    rrInit(12);

    var mOPEN_MAP = [];

    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        for (let i = 0; i < 3072; i++) {
            mOPEN_MAP.push(0);
        }
    } else {

        for (let i = 0; i < 12800; i++) {
            mOPEN_MAP.push(0);
        }

    }

    simPlayersVisible = true;
    simSmoothMovement = false;
    simMarkingTiles = false;
    simMarkedTiles = [];

    simCurrentGroup = 0;
    numGroups = simNumGroupsInput.value;

    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        mInit(mOPEN_MAP, 64, 48);
    } else {

        mInit(mOPEN_MAP, 128, 100);

    }

    simReset();

    window.onkeydown = simWindowOnKeyDown;
    canvas.onmousedown = simCanvasOnMouseDown;
    canvas.oncontextmenu = function (e) { // prevent context menu from opening when right-clicking
        e.preventDefault();
    };
}

function toggleVisibilityOfFollowers() {
    simPlayersVisible = !simPlayersVisible;
}

function toggleSmoothMovement() {
    simSmoothMovement = !simSmoothMovement;
}

function toggleMarkingTiles() {
    simMarkingTiles = !simMarkingTiles;
}

function simReset() {
    if (simIsRunning) {
        clearInterval(simTickTimerId);
    }
    simIsRunning = false;
    simStartStopButton.innerHTML = "Start Sim";
    simTickPerClick = (simToggleTickPerClick.value === "yes") ? true : false;
    daInit();
    plInit();
    simDraw();
}

function simStartStopButtonOnClick() {
    if (simIsRunning) {
        simReset();
    } else {
        simStaticTickDuration =Number(simTickDurationInput.value);

        simIsRunning = true;
        simStartStopButton.innerHTML = "Stop Sim";
        numGroups = simNumGroupsInput.value;
        daInit();
        plInit();
        if (!simTickPerClick) {
            simTick();
            simTickTimerId = setInterval(simTick, Number(simTickDurationInput.value)); // tick time in milliseconds (set to 600 for real)
        }
    }
}

var simStaticTickDuration;

function simWindowOnKeyDown(e) {
    if (simIsRunning) {
        if ((e.key === "1") || (e.key === "2") || (e.key === "3") || (e.key === "4") || (e.key === "5") || (e.key === "6") || (e.key === "7") || (e.key === "8") || (e.key === "9") )
        if (Number(e.key) <= numGroups) {
            simCurrentGroup = Number(e.key) - 1;
        }
    }
    if (e.key === " ") {
        simStartStopButtonOnClick();
        e.preventDefault();
    }
}

function simCanvasOnMouseDown(e) {
    var canvasRect = rCanvas.getBoundingClientRect();
    let xTile = Math.trunc((e.clientX - canvasRect.left) / rrTileSize);
    let yTile = Math.trunc((canvasRect.bottom - 1 - e.clientY) / rrTileSize);
    if (e.button === 0) {
        if (simMarkingTiles) {
            var tileAlreadyMarked = false;
            for (let i = 0; i < simMarkedTiles.length; i++) {
                if ((simMarkedTiles[i][0] === xTile) && (simMarkedTiles[i][1] === yTile)) {
                    tileAlreadyMarked = true;
                    simMarkedTiles.splice(i, 1);
                }
            }
            if (!tileAlreadyMarked) {
                simMarkedTiles.push([xTile, yTile]);
            }

            if (!simIsRunning) {
                simDraw();
            }
        } else {
            plPathfind(xTile, yTile, simCurrentGroup);
            plIsDancing[simCurrentGroup] = false;

            if (simTickPerClick) {
                clearInterval(simTickTimerId);
                simTick();
            }
        }
    } else if (e.button === 2) {
        startDancing();
        //plIsDancing[simCurrentGroup] = true;
        //clearInterval(simTickTimerId);
        //simTickTimerId = setInterval(simTick, Number(simTickDurationInput.value)); // tick time in milliseconds (set to 600 for real)
    }

}

function startDancing() {
    if (simIsRunning) {
        plIsDancing[simCurrentGroup] = true;
        clearInterval(simTickTimerId);
        simTickTimerId = setInterval(simTick, simStaticTickDuration); // tick time in milliseconds (set to 600 for real)
    }
}

function simDraw() {
    mDrawMap();
    daDrawPlayers();
    mDrawGrid();
    rPresent();
}

function simDrawIntermediate() {
    mDrawMap();
    daDrawPlayersIntermediate(subTick, numSubTicks);
    mDrawGrid();
    rPresent();

    subTick++;

    if (subTick > numSubTicks) {
        clearInterval(subTickInterval);
    }
}

var subTickInterval;

function simTick() {
    for (let j = 0; j < numGroups; j++) {
        var daPlayers = daGroups[j];

        for (let i = 0; i < daPlayers.length; i++) {
            plDestFindById(i, j);
            plPathFindById(i, j);
        }
        for (let i = 0; i < daPlayers.length; ++i) {
            daPlayers[i].tick();
        }
    }

    if (simSmoothMovement && plIsDancing[simCurrentGroup]) {
        subTick = 1.0;

        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            numSubTicks = simStaticTickDuration / 120.0;
        } else {

            numSubTicks = simStaticTickDuration / 30.0;

        }

        simDrawIntermediate();

        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            subTickInterval = setInterval(simDrawIntermediate, 120);
        } else {

            subTickInterval = setInterval(simDrawIntermediate, 30);

        }
    } else {
        simDraw();
    }

}

var subTick;
var numSubTicks;

var simIsRunning;
var simTickDurationInput;
var simNumGroupsInput;
var simNumPlayersInput;
var simNumPlayers2Input;
var simNumPlayers3Input;
var simNumPlayers4Input;
var simNumPlayers5Input;
var simNumPlayers6Input;
var simNumPlayers7Input;
var simNumPlayers8Input;
var simNumPlayers9Input;
var simLeadColorInput;
var simMiddleColorInput;
var simBackColorInput;
var simAlternateColorInput;
var simMarkerColorInput;
var simToggleTickPerClick;
var simTickTimerId;
var simStartStopButton;

var simTickPerClick;

var simCurrentGroup;

function simToggleTickPerClickOnChange(e) {
    simTickPerClick = (simToggleTickPerClick.value === "yes") ? true : false;
}

//}

//{ DanceArena - da

function daDrawPlayers() {
    if (simPlayersVisible) {
        rSetDrawColor((daMiddleColor >> 16) & 255, (daMiddleColor >> 8) & 255, daMiddleColor & 255, 255);
        for (let j = 0; j < numGroups; j++) {
            var daPlayers = daGroups[j];
            for (let i = 1; i < daPlayers.length - 1; ++i) {
                if (i % 2 === 0) {
                    rrFill(daPlayers[i].x, daPlayers[i].y);
                }
            }
        }

        rSetDrawColor((daAlternateColor >> 16) & 255, (daAlternateColor >> 8) & 255, daAlternateColor & 255, 255);
        for (let j = 0; j < numGroups; j++) {
            var daPlayers = daGroups[j];
            for (let i = 1; i < daPlayers.length - 1; ++i) {
                if (i % 2 === 1) {
                    rrFill(daPlayers[i].x, daPlayers[i].y);
                }
            }
        }

        rSetDrawColor((daBackColor >> 16) & 255, (daBackColor >> 8) & 255, daBackColor & 255, 255);
        for (let j = 0; j < numGroups; j++) {
            var daPlayers = daGroups[j];
            rrFill(daPlayers[daPlayers.length - 1].x, daPlayers[daPlayers.length - 1].y);
        }
    }

    rSetDrawColor((daLeadColor >> 16) & 255, (daLeadColor >> 8) & 255, daLeadColor & 255, 255);
    for (let j = 0; j < numGroups; j++) {
        var daPlayers = daGroups[j];
        rrFill(daPlayers[0].x, daPlayers[0].y);
    }
}

function daDrawPlayersIntermediate(step, numSteps) { // number of total steps - 1 if frame per tick 1
    var stepRatio = step / numSteps;

    //console.log(stepRatio);
    if (simPlayersVisible) {

        rSetDrawColor((daMiddleColor >> 16) & 255, (daMiddleColor >> 8) & 255, daMiddleColor & 255, 255);
        for (let j = 0; j < numGroups; j++) {
            var daPlayers = daGroups[j];
            for (let i = 1; i < daPlayers.length - 1; ++i) {
                if (i % 2 === 0) {
                    rrFill(daPlayers[i].x * stepRatio + daPlayers[i].prevX * (1 - stepRatio), daPlayers[i].y * stepRatio + daPlayers[i].prevY * (1 - stepRatio));
                }
            }
        }

        rSetDrawColor((daAlternateColor >> 16) & 255, (daAlternateColor >> 8) & 255, daAlternateColor & 255, 255);
        for (let j = 0; j < numGroups; j++) {
            var daPlayers = daGroups[j];
            for (let i = 1; i < daPlayers.length - 1; ++i) {
                if (i % 2 === 1) {
                    rrFill(daPlayers[i].x * stepRatio + daPlayers[i].prevX * (1 - stepRatio), daPlayers[i].y * stepRatio + daPlayers[i].prevY * (1 - stepRatio));
                }
            }
        }

        rSetDrawColor((daBackColor >> 16) & 255, (daBackColor >> 8) & 255, daBackColor & 255, 255);
        for (let j = 0; j < numGroups; j++) {
            var daPlayers = daGroups[j];
            rrFill(daPlayers[daPlayers.length - 1].x * stepRatio + daPlayers[daPlayers.length - 1].prevX * (1 - stepRatio), daPlayers[daPlayers.length - 1].y * stepRatio + daPlayers[daPlayers.length - 1].prevY * (1 - stepRatio));
        }

    }

    rSetDrawColor((daLeadColor >> 16) & 255, (daLeadColor >> 8) & 255, daLeadColor & 255, 255);
    for (let j = 0; j < numGroups; j++) {
        var daPlayers = daGroups[j];
        rrFill(daPlayers[0].x * stepRatio + daPlayers[0].prevX * (1 - stepRatio) , daPlayers[0].y * stepRatio + daPlayers[0].prevY * (1 - stepRatio));
    }
}

function daInit() {
    numGroups = simNumGroupsInput.value;
    daGroups = [];

    plIsDancing = [false, false, false, false, false, false, false, false, false];
    plIsRunning = [false, false, false, false, false, false, false, false, false];

    simNumPlayersList = [];
    simNumPlayersList.push(simNumPlayersInput.value);
    simNumPlayersList.push(simNumPlayers2Input.value);
    simNumPlayersList.push(simNumPlayers3Input.value);
    simNumPlayersList.push(simNumPlayers4Input.value);
    simNumPlayersList.push(simNumPlayers5Input.value);
    simNumPlayersList.push(simNumPlayers6Input.value);
    simNumPlayersList.push(simNumPlayers7Input.value);
    simNumPlayersList.push(simNumPlayers8Input.value);
    simNumPlayersList.push(simNumPlayers9Input.value);

    for (let i = 0; i < numGroups; i++) {
        var daPlayers = [];

        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            daPlayers.push(new plPlayer(20, 28 + i * 2, daPlayers.length, "w", i));
            for (let j = 1; j < simNumPlayersList[i]; j++) {
                if (j % 2 === 1) {
                    daPlayers.push(new plPlayer(21, 28 + i * 2, daPlayers.length, "w", i));
                } else {
                    daPlayers.push(new plPlayer(22, 28 + i * 2, daPlayers.length, "e", i));
                }
            }
        } else {
            daPlayers.push(new plPlayer(20, 80 + i * 2, daPlayers.length, "w", i));
            for (let j = 1; j < simNumPlayersList[i]; j++) {
                if (j % 2 === 1) {
                    daPlayers.push(new plPlayer(21, 80 + i * 2, daPlayers.length, "w", i));
                } else {
                    daPlayers.push(new plPlayer(22, 80 + i * 2, daPlayers.length, "e", i));
                }
            }
        }
        daGroups.push(daPlayers);
    }

    daLeadColor = Number("0x" + simLeadColorInput.value.substring(1));
    daMiddleColor = Number("0x" + simMiddleColorInput.value.substring(1));
    daBackColor = Number("0x" + simBackColorInput.value.substring(1));
    daAlternateColor = Number("0x" + simAlternateColorInput.value.substring(1));
    daMarkerColor = Number("0x" + simMarkerColorInput.value.substring(1));
}

//var daPlayers;
// hi

var daGroups;

var simNumPlayersList;

var daLeadColor;
var daMiddleColor;
var daBackColor;
var daAlternateColor;
var daMarkerColor;

//}

//{ Player - pl

function plPlayer(x, y, id, orientation, group) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.group = group;
    this.orientation = orientation; // n, s, e, w, nw, ne, nw, ne

    this.pathQueuePos = 0;
    this.shortestDistances = [];
    this.wayPoints = [];
    this.pathQueueX = [];
    this.pathQueueY = [];

    this.destX = x;
    this.destY = y;

    this.prevX = x;
    this.prevY = y;

    this.tick = function() {
        var oldX = this.x;
        var oldY = this.y;

        this.prevX = this.x;
        this.prevY = this.y;

        if (!plIsDancing[this.group] && (this.id === 0)) { // if dance leader, then move to destination tile
            if (plPathQueuePos[this.group] > 0) {
                this.x = plPathQueueX[this.group][--plPathQueuePos[this.group]];
                this.y = plPathQueueY[this.group][plPathQueuePos[this.group]];
                if (plIsRunning[this.group] && plPathQueuePos[this.group] > 0) { // TODO: update orientation correctly when running
                    this.x = plPathQueueX[this.group][--plPathQueuePos[this.group]];
                    this.y = plPathQueueY[this.group][plPathQueuePos[this.group]];
                }
            }

            /*
            var oldOrientation = this.orientation;

            this.orientation = "";

            if (oldY < this.y) {
                this.orientation += "n";
            } else if (oldY > this.y) {
                this.orientation += "s";
            }

            if (oldX < this.x) {
                this.orientation += "e";
            } else if (oldX > this.x) {
                this.orientation += "w";
            }

            if (this.orientation === "") {
                this.orientation = oldOrientation;
            }*/
        } else {
            if (this.pathQueuePos > 0) {
                this.x = this.pathQueueX[--this.pathQueuePos];
                this.y = this.pathQueueY[this.pathQueuePos];
                if (plIsRunning && this.pathQueuePos > 0) { // TODO: update orientation correctly when running
                    this.x = this.pathQueueX[--this.pathQueuePos];
                    this.y = this.pathQueueY[this.pathQueuePos];
                }
            }
        }

        var oldOrientation = this.orientation;

        this.orientation = "";

        if (oldY < this.y) {
            this.orientation += "n";
        } else if (oldY > this.y) {
            this.orientation += "s";
        }

        if (oldX < this.x) {
            this.orientation += "e";
        } else if (oldX > this.x) {
            this.orientation += "w";
        }

        if (this.orientation === "") {
            this.orientation = oldOrientation;
        }
    }
}

function plInit() {
    plPathQueuePos = [0,0,0,0,0,0,0,0,0];
    plPathQueueX = [[],[],[],[],[],[],[],[],[]];
    plPathQueueY = [[],[],[],[],[],[],[],[],[]];
    plShortestDistances = [[],[],[],[],[],[],[],[],[]];
    plWayPoints = [[],[],[],[],[],[],[],[],[]];
}

function plDestFindById(id, group) {
    var daPlayers = daGroups[group];

    var leaderOrientation = daPlayers[(daPlayers.length + id - 1) % daPlayers.length].orientation;
    var leaderX = daPlayers[(daPlayers.length + id - 1) % daPlayers.length].x;
    var leaderY = daPlayers[(daPlayers.length + id - 1) % daPlayers.length].y;
    var destX = leaderX;
    var destY = leaderY;

    if (leaderOrientation === "n") {
        destY = leaderY - 1;
    } else if (leaderOrientation === "s") {
        destY = leaderY + 1;
    } else if (leaderOrientation === "e") {
        destX = leaderX - 1;
    } else if (leaderOrientation === "w") {
        destX = leaderX + 1;
    } else if (leaderOrientation === "ne") {
        destX = leaderX - 1;
        destY = leaderY - 1;
    } else if (leaderOrientation === "nw") {
        destX = leaderX + 1;
        destY = leaderY - 1;
    } else if (leaderOrientation === "se") {
        destX = leaderX - 1;
        destY = leaderY + 1;
    } else if (leaderOrientation === "sw") {
        destX = leaderX + 1;
        destY = leaderY + 1;
    }

    daPlayers[id].destX = destX;
    daPlayers[id].destY = destY;
}

function plPathFindById(id, group) {
    var daPlayers = daGroups[group];

    var thisPlayer = daPlayers[id];

    var destX = thisPlayer.destX;
    var destY = thisPlayer.destY;

    for (let i = 0; i < mWidthTiles*mHeightTiles; ++i) {
        thisPlayer.shortestDistances[i] = 99999999;
        thisPlayer.wayPoints[i] = 0;
    }
    thisPlayer.wayPoints[thisPlayer.x + thisPlayer.y*mWidthTiles] = 99;
    thisPlayer.shortestDistances[thisPlayer.x + thisPlayer.y*mWidthTiles] = 0;
    thisPlayer.pathQueuePos = 0;
    let pathQueueEnd = 0;
    thisPlayer.pathQueueX[pathQueueEnd] = thisPlayer.x;
    thisPlayer.pathQueueY[pathQueueEnd++] = thisPlayer.y;
    let currentX;
    let currentY;
    let foundDestination = false;
    while (thisPlayer.pathQueuePos !== pathQueueEnd) {
        currentX = thisPlayer.pathQueueX[thisPlayer.pathQueuePos];
        currentY = thisPlayer.pathQueueY[thisPlayer.pathQueuePos++];
        if (currentX === destX && currentY === destY) {
            foundDestination = true;
            break;
        }
        let newDistance = thisPlayer.shortestDistances[currentX + currentY*mWidthTiles] + 1;
        let index = currentX - 1 + currentY*mWidthTiles;
        if (currentX > 0 && thisPlayer.wayPoints[index] === 0 && (mCurrentMap[index] & 19136776) === 0) {
            thisPlayer.pathQueueX[pathQueueEnd] = currentX - 1;
            thisPlayer.pathQueueY[pathQueueEnd++] = currentY;
            thisPlayer.wayPoints[index] = 2;
            thisPlayer.shortestDistances[index] = newDistance;
        }
        index = currentX + 1 + currentY*mWidthTiles;
        if (currentX < mWidthTiles - 1 && thisPlayer.wayPoints[index] === 0 && (mCurrentMap[index] & 19136896) === 0) {
            thisPlayer.pathQueueX[pathQueueEnd] = currentX + 1;
            thisPlayer.pathQueueY[pathQueueEnd++] = currentY;
            thisPlayer.wayPoints[index] = 8;
            thisPlayer.shortestDistances[index] = newDistance;
        }
        index = currentX + (currentY - 1)*mWidthTiles;
        if (currentY > 0 && thisPlayer.wayPoints[index] === 0 && (mCurrentMap[index] & 19136770) === 0) {
            thisPlayer.pathQueueX[pathQueueEnd] = currentX;
            thisPlayer.pathQueueY[pathQueueEnd++] = currentY - 1;
            thisPlayer.wayPoints[index] = 1;
            thisPlayer.shortestDistances[index] = newDistance;
        }
        index = currentX + (currentY + 1)*mWidthTiles;
        if (currentY < mHeightTiles - 1 && thisPlayer.wayPoints[index] === 0 && (mCurrentMap[index] & 19136800) === 0) {
            thisPlayer.pathQueueX[pathQueueEnd] = currentX;
            thisPlayer.pathQueueY[pathQueueEnd++] = currentY + 1;
            thisPlayer.wayPoints[index] = 4;
            thisPlayer.shortestDistances[index] = newDistance;
        }
        index = currentX - 1 + (currentY - 1)*mWidthTiles;
        if (currentX > 0 && currentY > 0 && thisPlayer.wayPoints[index] === 0 &&
            (mCurrentMap[index] & 19136782) == 0 &&
            (mCurrentMap[currentX - 1 + currentY*mWidthTiles] & 19136776) === 0 &&
            (mCurrentMap[currentX + (currentY - 1)*mWidthTiles] & 19136770) === 0) {
            thisPlayer.pathQueueX[pathQueueEnd] = currentX - 1;
            thisPlayer.pathQueueY[pathQueueEnd++] = currentY - 1;
            thisPlayer.wayPoints[index] = 3;
            thisPlayer.shortestDistances[index] = newDistance;
        }
        index = currentX + 1 + (currentY - 1)*mWidthTiles;
        if (currentX < mWidthTiles - 1 && currentY > 0 && thisPlayer.wayPoints[index] === 0 &&
            (mCurrentMap[index] & 19136899) == 0 &&
            (mCurrentMap[currentX + 1 + currentY*mWidthTiles] & 19136896) === 0 &&
            (mCurrentMap[currentX + (currentY - 1)*mWidthTiles] & 19136770) === 0) {
            thisPlayer.pathQueueX[pathQueueEnd] = currentX + 1;
            thisPlayer.pathQueueY[pathQueueEnd++] = currentY - 1;
            thisPlayer.wayPoints[index] = 9;
            thisPlayer.shortestDistances[index] = newDistance;
        }
        index = currentX - 1 + (currentY + 1)*mWidthTiles;
        if (currentX > 0 && currentY < mHeightTiles - 1 && thisPlayer.wayPoints[index] === 0 &&
            (mCurrentMap[index] & 19136824) == 0 &&
            (mCurrentMap[currentX - 1 + currentY*mWidthTiles] & 19136776) === 0 &&
            (mCurrentMap[currentX + (currentY + 1)*mWidthTiles] & 19136800) === 0) {
            thisPlayer.pathQueueX[pathQueueEnd] = currentX - 1;
            thisPlayer.pathQueueY[pathQueueEnd++] = currentY + 1;
            thisPlayer.wayPoints[index] = 6;
            thisPlayer.shortestDistances[index] = newDistance;
        }
        index = currentX + 1 + (currentY + 1)*mWidthTiles;
        if (currentX < mWidthTiles - 1 && currentY < mHeightTiles - 1 && thisPlayer.wayPoints[index] === 0 &&
            (mCurrentMap[index] & 19136992) == 0 &&
            (mCurrentMap[currentX + 1 + currentY*mWidthTiles] & 19136896) === 0 &&
            (mCurrentMap[currentX + (currentY + 1)*mWidthTiles] & 19136800) === 0) {
            thisPlayer.pathQueueX[pathQueueEnd] = currentX + 1;
            thisPlayer.pathQueueY[pathQueueEnd++] = currentY + 1;
            thisPlayer.wayPoints[index] = 12;
            thisPlayer.shortestDistances[index] = newDistance;
        }
    }
    if (!foundDestination) {
        let bestDistanceStart = 0x7FFFFFFF;
        let bestDistanceEnd = 0x7FFFFFFF;
        let deviation = 10;
        for (let x = destX - deviation; x <= destX + deviation; ++x) {
            for (let y = destY - deviation; y <= destY + deviation; ++y) {
                if (x >= 0 && y >= 0 && x < mWidthTiles && y < mHeightTiles) {
                    let distanceStart = thisPlayer.shortestDistances[x + y*mWidthTiles];
                    if (distanceStart < 100) {
                        let dx = Math.max(destX - x);
                        let dy = Math.max(destY - y);
                        let distanceEnd = dx*dx + dy*dy;
                        if (distanceEnd < bestDistanceEnd || (distanceEnd === bestDistanceEnd && distanceStart < bestDistanceStart)) {
                            bestDistanceStart = distanceStart;
                            bestDistanceEnd = distanceEnd;
                            currentX = x;
                            currentY = y;
                            foundDestination = true;
                        }
                    }
                }
            }
        }
        if (!foundDestination) {
            thisPlayer.pathQueuePos = 0;
            return;
        }
    }
    thisPlayer.pathQueuePos = 0;
    while (currentX !== thisPlayer.x || currentY !== thisPlayer.y) {
        let waypoint = thisPlayer.wayPoints[currentX + currentY*mWidthTiles];
        thisPlayer.pathQueueX[thisPlayer.pathQueuePos] = currentX;
        thisPlayer.pathQueueY[thisPlayer.pathQueuePos++] = currentY;
        if ((waypoint & 2) !== 0) {
            ++currentX;
        } else if ((waypoint & 8) !== 0) {
            --currentX;
        }
        if ((waypoint & 1) !== 0) {
            ++currentY;
        } else if ((waypoint & 4) !== 0) {
            --currentY;
        }
    }
}

function plPathfind(destX, destY, group) {
    var daPlayers = daGroups[group];
    //console.log("found path");

    for (let i = 0; i < mWidthTiles*mHeightTiles; ++i) {
        plShortestDistances[group][i] = 99999999;
        plWayPoints[group][i] = 0;
    }

    //console.log("found path");

    plWayPoints[group][daPlayers[0].x + daPlayers[0].y*mWidthTiles] = 99;
    plShortestDistances[group][daPlayers[0].x + daPlayers[0].y*mWidthTiles] = 0;
    plPathQueuePos[group] = 0;
    let pathQueueEnd = 0;
    plPathQueueX[group][pathQueueEnd] = daPlayers[0].x;
    plPathQueueY[group][pathQueueEnd++] = daPlayers[0].y;
    let currentX;
    let currentY;
    let foundDestination = false;

    //console.log("found path");

    while (plPathQueuePos[group] !== pathQueueEnd) {
        //console.log("found path");
        currentX = plPathQueueX[group][plPathQueuePos[group]];
        currentY = plPathQueueY[group][plPathQueuePos[group]++];
        if (currentX === destX && currentY === destY) {
            foundDestination = true;
            break;
        }
        let newDistance = plShortestDistances[group][currentX + currentY*mWidthTiles] + 1;
        let index = currentX - 1 + currentY*mWidthTiles;
        if (currentX > 0 && plWayPoints[group][index] === 0 && (mCurrentMap[index] & 19136776) === 0) {
            plPathQueueX[group][pathQueueEnd] = currentX - 1;
            plPathQueueY[group][pathQueueEnd++] = currentY;
            plWayPoints[group][index] = 2;
            plShortestDistances[group][index] = newDistance;
        }
        index = currentX + 1 + currentY*mWidthTiles;
        if (currentX < mWidthTiles - 1 && plWayPoints[group][index] === 0 && (mCurrentMap[index] & 19136896) === 0) {
            plPathQueueX[group][pathQueueEnd] = currentX + 1;
            plPathQueueY[group][pathQueueEnd++] = currentY;
            plWayPoints[group][index] = 8;
            plShortestDistances[group][index] = newDistance;
        }
        index = currentX + (currentY - 1)*mWidthTiles;
        if (currentY > 0 && plWayPoints[group][index] === 0 && (mCurrentMap[index] & 19136770) === 0) {
            plPathQueueX[group][pathQueueEnd] = currentX;
            plPathQueueY[group][pathQueueEnd++] = currentY - 1;
            plWayPoints[group][index] = 1;
            plShortestDistances[group][index] = newDistance;
        }
        index = currentX + (currentY + 1)*mWidthTiles;
        if (currentY < mHeightTiles - 1 && plWayPoints[group][index] === 0 && (mCurrentMap[index] & 19136800) === 0) {
            plPathQueueX[group][pathQueueEnd] = currentX;
            plPathQueueY[group][pathQueueEnd++] = currentY + 1;
            plWayPoints[group][index] = 4;
            plShortestDistances[group][index] = newDistance;
        }
        index = currentX - 1 + (currentY - 1)*mWidthTiles;
        if (currentX > 0 && currentY > 0 && plWayPoints[group][index] === 0 &&
            (mCurrentMap[index] & 19136782) == 0 &&
            (mCurrentMap[currentX - 1 + currentY*mWidthTiles] & 19136776) === 0 &&
            (mCurrentMap[currentX + (currentY - 1)*mWidthTiles] & 19136770) === 0) {
            plPathQueueX[group][pathQueueEnd] = currentX - 1;
            plPathQueueY[group][pathQueueEnd++] = currentY - 1;
            plWayPoints[group][index] = 3;
            plShortestDistances[group][index] = newDistance;
        }
        index = currentX + 1 + (currentY - 1)*mWidthTiles;
        if (currentX < mWidthTiles - 1 && currentY > 0 && plWayPoints[group][index] === 0 &&
            (mCurrentMap[index] & 19136899) == 0 &&
            (mCurrentMap[currentX + 1 + currentY*mWidthTiles] & 19136896) === 0 &&
            (mCurrentMap[currentX + (currentY - 1)*mWidthTiles] & 19136770) === 0) {
            plPathQueueX[group][pathQueueEnd] = currentX + 1;
            plPathQueueY[group][pathQueueEnd++] = currentY - 1;
            plWayPoints[group][index] = 9;
            plShortestDistances[group][index] = newDistance;
        }
        index = currentX - 1 + (currentY + 1)*mWidthTiles;
        if (currentX > 0 && currentY < mHeightTiles - 1 && plWayPoints[group][index] === 0 &&
            (mCurrentMap[index] & 19136824) == 0 &&
            (mCurrentMap[currentX - 1 + currentY*mWidthTiles] & 19136776) === 0 &&
            (mCurrentMap[currentX + (currentY + 1)*mWidthTiles] & 19136800) === 0) {
            plPathQueueX[group][pathQueueEnd] = currentX - 1;
            plPathQueueY[group][pathQueueEnd++] = currentY + 1;
            plWayPoints[group][index] = 6;
            plShortestDistances[group][index] = newDistance;
        }
        index = currentX + 1 + (currentY + 1)*mWidthTiles;
        if (currentX < mWidthTiles - 1 && currentY < mHeightTiles - 1 && plWayPoints[group][index] === 0 &&
            (mCurrentMap[index] & 19136992) == 0 &&
            (mCurrentMap[currentX + 1 + currentY*mWidthTiles] & 19136896) === 0 &&
            (mCurrentMap[currentX + (currentY + 1)*mWidthTiles] & 19136800) === 0) {
            plPathQueueX[group][pathQueueEnd] = currentX + 1;
            plPathQueueY[group][pathQueueEnd++] = currentY + 1;
            plWayPoints[group][index] = 12;
            plShortestDistances[group][index] = newDistance;
        }
    }

    if (!foundDestination) {
        let bestDistanceStart = 0x7FFFFFFF;
        let bestDistanceEnd = 0x7FFFFFFF;
        let deviation = 10;
        for (let x = destX - deviation; x <= destX + deviation; ++x) {
            for (let y = destY - deviation; y <= destY + deviation; ++y) {
                if (x >= 0 && y >= 0 && x < mWidthTiles && y < mHeightTiles) {
                    let distanceStart = plShortestDistances[group][x + y*mWidthTiles];
                    if (distanceStart < 100) {
                        let dx = Math.max(destX - x);
                        let dy = Math.max(destY - y);
                        let distanceEnd = dx*dx + dy*dy;
                        if (distanceEnd < bestDistanceEnd || (distanceEnd === bestDistanceEnd && distanceStart < bestDistanceStart)) {
                            bestDistanceStart = distanceStart;
                            bestDistanceEnd = distanceEnd;
                            currentX = x;
                            currentY = y;
                            foundDestination = true;
                        }
                    }
                }
            }
        }
        if (!foundDestination) {
            plPathQueuePos[group] = 0;
            return;
        }
    }
    plPathQueuePos[group] = 0;
    while (currentX !== daPlayers[0].x || currentY !== daPlayers[0].y) {
        let waypoint = plWayPoints[group][currentX + currentY*mWidthTiles];
        plPathQueueX[group][plPathQueuePos[group]] = currentX;
        plPathQueueY[group][plPathQueuePos[group]++] = currentY;
        if ((waypoint & 2) !== 0) {
            ++currentX;
        } else if ((waypoint & 8) !== 0) {
            --currentX;
        }
        if ((waypoint & 1) !== 0) {
            ++currentY;
        } else if ((waypoint & 4) !== 0) {
            --currentY;
        }
    }

    //console.log("found path");
}
var plPathQueuePos;
var plShortestDistances;
var plWayPoints;
var plPathQueueX;
var plPathQueueY;

var plIsDancing;
var plIsRunning;

//{ Map - m

const mWAVE10 = [2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2228480,2228480,2228480,2097156,2097154,2097154,2097154,2097154,2228480,2228480,2228480,2228480,2097154,2097154,2097154,2097154,2228481,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2097156,2097408,96,2097440,2097440,32,0,0,0,0,131360,131360,131360,131376,2097408,2228481,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,131328,131328,131328,2228480,2097156,2097154,2097154,2097408,64,0,2097408,2097408,0,0,0,0,0,0,0,0,0,16,2097408,2097154,2097154,2097154,2097154,2097154,2097154,2097154,2097154,2097154,2097153,2228480,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,131328,2097156,2097154,2097154,2097154,2097408,352,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,32,32,32,32,32,32,131362,131386,2097280,131328,0,0,131328,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2097156,2097408,96,131360,32,0,0,0,131328,0,0,0,0,0,0,0,0,0,0,0,0,131328,0,131328,131328,0,131328,0,0,0,0,32,32,0,0,0,0,0,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,131328,2097156,2097408,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,131328,131328,0,0,0,0,0,0,0,0,0,0,0,0,131328,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2228480,2097160,192,131328,0,0,0,131328,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2097156,2097408,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,131328,0,0,0,0,0,2,2,0,131328,131328,0,0,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2097156,2097408,64,0,0,131328,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,131328,0,131360,131368,2097538,0,131328,0,0,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2097160,192,131328,131328,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,131328,131368,2097280,0,131328,131328,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2228480,2097160,128,131328,131328,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,131336,2097280,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2228480,2097156,2097408,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,131328,0,0,0,0,2097408,2097153,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2097156,2097408,131392,0,0,131328,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,131328,0,0,131328,131328,0,16,2097408,2097153,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2097156,2097408,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,131328,131328,0,0,24,2097280,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2097160,192,131328,131328,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,131328,8,2097280,2228480,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2097160,128,131328,131328,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,131328,0,0,0,0,2097408,2097153,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2097160,128,0,0,131328,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,2097408,2097153,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2097156,2097408,131328,0,0,0,0,0,0,0,0,4104,65664,0,4104,65664,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,131328,131328,24,2097280,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2097160,192,0,0,0,0,0,0,0,0,0,5130,65664,0,4104,66690,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,131328,131328,8,2097280,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2097160,128,131328,131328,0,0,0,0,0,0,4104,2179488,0,0,0,2117928,65664,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,131328,0,0,131340,2097280,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2097160,129,131328,131328,0,0,0,0,0,0,4104,65664,0,0,0,4104,65664,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2097408,2097216,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2097168,2097408,0,0,0,131328,0,0,0,0,4104,65664,0,262144,131328,4104,65664,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,131328,8,2097280,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2097160,128,0,131328,0,0,0,0,0,4104,2164098,1026,1026,1026,2102538,65664,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,2097280,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2097160,129,0,0,0,0,0,0,0,0,16416,16416,16416,16416,16416,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,131328,131328,0,2097408,2097216,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2097168,2097408,1,0,0,131328,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,131328,131328,12,2097280,2228480,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2097168,2097408,131328,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,131328,0,0,0,4,2097408,2097216,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2228480,2097160,129,0,131328,131328,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,131328,0,2097408,2097216,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2097168,2097408,1,131328,131328,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,131328,131328,0,12,2097280,2228480,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2097168,2097408,0,0,0,0,131328,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,131328,131328,4,2097408,2097216,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2228480,2097160,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2097408,2097216,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2097160,129,0,131328,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,131328,12,2097280,2228480,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2097168,2097408,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,2097408,2097216,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2097168,2097408,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,2097408,2097216,2228480,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2228480,2097168,2097408,1,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,4,2097408,2097216,2228480,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2228480,2097168,2228480,2228480,2228480,2097184,2097184,2097408,1,0,0,2,2,0,0,0,0,0,2,2,0,0,4,2097408,2097184,2097184,2228480,2228480,2228480,2097216,2228480,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2097168,2228480,2228480,2228480,2097184,2097184,2097408,3,2,6,2097408,2097184,2097184,2228480,2228480,2228480,2097216,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2097168,2097184,2097184,2097184,2097216,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2228480,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152,2097152];

const mLOS_FULL_MASK = 0x20000;
const mLOS_EAST_MASK = 0x1000;
const mLOS_WEST_MASK = 0x10000;
const mLOS_NORTH_MASK = 0x400;
const mLOS_SOUTH_MASK = 0x4000;
const mMOVE_FULL_MASK = 0x100 | 0x200000 | 0x40000 | 0x1000000; // 0x100 for objects, 0x200000 for unwalkable tiles such as water etc, 0x40000 is very rare but BA cannon has it. 0x1000000 is not confirmed to block move but outside ba arena 1-9.
const mMOVE_EAST_MASK = 0x8;
const mMOVE_WEST_MASK = 0x80;
const mMOVE_NORTH_MASK = 0x2;
const mMOVE_SOUTH_MASK = 0x20;

function mInit(map, widthTiles, heightTiles) {
    mCurrentMap = map;
    mWidthTiles = widthTiles;
    mHeightTiles = heightTiles;
}

function mGetTileFlag(x, y) {
    return mCurrentMap[x + y*mWidthTiles];
}

function mDrawGrid() {
    for (var xTile = 0; xTile < mWidthTiles; ++xTile) {
        if (xTile % 8 == 7) {
            rSetDrawColor(0, 0, 0, 72);
        } else {
            rSetDrawColor(0, 0, 0, 48);
        }
        rrEastLineBig(xTile, 0, mHeightTiles);
    }
    for (var yTile = 0; yTile < mHeightTiles; ++yTile) {
        if (yTile % 8 == 7) {
            rSetDrawColor(0, 0, 0, 72);
        } else {
            rSetDrawColor(0, 0, 0, 48);
        }
        rrNorthLineBig(0, yTile, mWidthTiles);
    }
}

function mDrawMap() {
    rSetDrawColor(206, 183, 117, 255);
    rClear();
    for (let y = 0; y < mHeightTiles; ++y) {
        for (let x = 0; x < mWidthTiles; ++x) {
            let tileFlag = mGetTileFlag(x, y);
            if ((tileFlag & mLOS_FULL_MASK) !== 0) {
                rSetDrawColor(0, 0, 0, 255);
                rrFillOpaque(x, y);
            } else  {
                if ((tileFlag & mMOVE_FULL_MASK) !== 0) {
                    rSetDrawColor(127, 127, 127, 255);
                    rrFillOpaque(x, y);
                }
                if ((tileFlag & mLOS_EAST_MASK) !== 0) {
                    rSetDrawColor(0, 0, 0, 255);
                    rrEastLine(x, y);
                } else if ((tileFlag & mMOVE_EAST_MASK) !== 0) {
                    rSetDrawColor(127, 127, 127, 255);
                    rrEastLine(x, y);
                }
                if ((tileFlag & mLOS_WEST_MASK) !== 0) {
                    rSetDrawColor(0, 0, 0, 255);
                    rrWestLine(x, y);
                } else if ((tileFlag & mMOVE_WEST_MASK) !== 0) {
                    rSetDrawColor(127, 127, 127, 255);
                    rrWestLine(x, y);
                }
                if ((tileFlag & mLOS_NORTH_MASK) !== 0) {
                    rSetDrawColor(0, 0, 0, 255);
                    rrNorthLine(x, y);
                } else if ((tileFlag & mMOVE_NORTH_MASK) !== 0) {
                    rSetDrawColor(127, 127, 127, 255);
                    rrNorthLine(x, y);
                }
                if ((tileFlag & mLOS_SOUTH_MASK) !== 0) {
                    rSetDrawColor(0, 0, 0, 255);
                    rrSouthLine(x, y);
                } else if ((tileFlag & mMOVE_SOUTH_MASK) !== 0) {
                    rSetDrawColor(127, 127, 127, 255);
                    rrSouthLine(x, y);
                }
            }
        }
    }

    rSetDrawColor((daMarkerColor >> 16) & 255, (daMarkerColor >> 8) & 255, daMarkerColor & 255, 255);
    for (let i = 0; i < simMarkedTiles.length; i++) {
        rrFill(simMarkedTiles[i][0], simMarkedTiles[i][1]);
    }
}

var mCurrentMap;
var mWidthTiles;
var mHeightTiles;

//}

//{ RsRenderer - rr

function rrInit(tileSize) {
    rrTileSize = tileSize;
}

function rrSetTileSize(size) {
    rrTileSize = size;
}

function rrSetSize(widthTiles, heightTiles) {
    rResizeCanvas(rrTileSize*widthTiles, rrTileSize*heightTiles);
}

function rrFillOpaque(x, y) {
    rSetFilledRect(x*rrTileSize, y*rrTileSize, rrTileSize, rrTileSize);
}

function rrFill(x, y) {
    rDrawFilledRect(Math.floor(x*rrTileSize), Math.floor(y*rrTileSize), rrTileSize, rrTileSize);
}

function rrFillBig(x, y, width, height) {
    rDrawFilledRect(x*rrTileSize, y*rrTileSize, width*rrTileSize, height*rrTileSize);
}

function rrOutline(x, y) {
    rDrawOutlinedRect(x*rrTileSize, y*rrTileSize, rrTileSize, rrTileSize);
}

function rrOutlineBig(x, y, width, height) {
    rDrawOutlinedRect(x*rrTileSize, y*rrTileSize, rrTileSize*width, rrTileSize*height);
}

function rrWestLine(x, y) {
    rDrawVerticalLine(x*rrTileSize, y*rrTileSize, rrTileSize);
}

function rrWestLineBig(x, y, length) {
    rDrawHorizontalLine(x*rrTileSize, y*rrTileSize, rrTileSize*length)
}

function rrEastLine(x, y) {
    rDrawVerticalLine((x + 1)*rrTileSize - 1, y*rrTileSize, rrTileSize);
}

function rrEastLineBig(x, y, length) {
    rDrawVerticalLine((x + 1)*rrTileSize - 1, y*rrTileSize, rrTileSize*length);
}

function rrSouthLine(x, y) {
    rDrawHorizontalLine(x*rrTileSize, y*rrTileSize, rrTileSize);
}

function rrSouthLineBig(x, y, length) {
    rDrawHorizontalLine(x*rrTileSize, y*rrTileSize, rrTileSize*length);
}

function rrNorthLine(x, y) {
    rDrawHorizontalLine(x*rrTileSize, (y + 1)*rrTileSize - 1, rrTileSize);
}

function rrNorthLineBig(x, y, length) {
    rDrawHorizontalLine(x*rrTileSize, (y + 1)*rrTileSize - 1, rrTileSize*length);
}

function rrCone(x, y) {
    rDrawCone(x*rrTileSize, y*rrTileSize, rrTileSize);
}

function rrFillItem(x, y) {
    let padding = rrTileSize >>> 2;
    let size = rrTileSize - 2*padding;
    rDrawFilledRect(x*rrTileSize + padding, y*rrTileSize + padding, size, size);
}

var rrTileSize;

//}

//{ Renderer - r

const rPIXEL_ALPHA = 255 << 24;

function rInit(canvas, width, height) {
    rCanvas = canvas;
    rContext = canvas.getContext("2d");
    rResizeCanvas(width, height);
    rSetDrawColor(255, 255, 255, 255);
}

function rResizeCanvas(width, height) {
    rCanvas.width = width;
    rCanvas.height = height;
    rCanvasWidth = width;
    rCanvasHeight = height;
    rCanvasYFixOffset = (rCanvasHeight - 1)*rCanvasWidth;
    rImageData = rContext.createImageData(width, height);
    rPixels = new ArrayBuffer(rImageData.data.length);
    rPixels8 = new Uint8ClampedArray(rPixels);
    rPixels32 = new Uint32Array(rPixels);
}

function rSetDrawColor(r, g, b, a) {
    rDrawColorRB = r | (b << 16);
    rDrawColorG = rPIXEL_ALPHA | (g << 8);
    rDrawColor = rDrawColorRB | rDrawColorG;
    rDrawColorA = a + 1;
}

function rClear() {
    let endI = rPixels32.length;
    for (let i = 0; i < endI; ++i) {
        rPixels32[i] = rDrawColor;
    }
}

function rPresent() {
    rImageData.data.set(rPixels8);
    rContext.putImageData(rImageData, 0, 0);
}

function rDrawPixel(i) {
    let color = rPixels32[i];
    let oldRB = color & 0xFF00FF;
    let oldAG = color & 0xFF00FF00;
    let rb = oldRB + (rDrawColorA*(rDrawColorRB - oldRB) >> 8) & 0xFF00FF;
    let g = oldAG + (rDrawColorA*(rDrawColorG - oldAG) >> 8) & 0xFF00FF00;
    rPixels32[i] = rb | g;
}

function rDrawHorizontalLine(x, y, length) {
    let i = rXYToI(x, y)
    let endI = i + length;
    for (; i < endI; ++i) {
        rDrawPixel(i);
    }
}

function rDrawVerticalLine(x, y, length) {
    let i = rXYToI(x, y);
    let endI = i - length*rCanvasWidth;
    for (; i > endI; i -= rCanvasWidth) {
        rDrawPixel(i);
    }
}

function rSetFilledRect(x, y, width, height) {
    let i = rXYToI(x, y);
    let rowDelta = width + rCanvasWidth;
    let endYI = i - height*rCanvasWidth;
    while (i > endYI) {
        let endXI = i + width;
        for (; i < endXI; ++i) {
            rPixels32[i] = rDrawColor;
        }
        i -= rowDelta;
    }
}

function rDrawFilledRect(x, y, width, height) {
    let i = rXYToI(x, y);
    let rowDelta = width + rCanvasWidth;
    let endYI = i - height*rCanvasWidth;
    while (i > endYI) {
        let endXI = i + width;
        for (; i < endXI; ++i) {
            rDrawPixel(i);
        }
        i -= rowDelta;
    }
}

function rDrawOutlinedRect(x, y, width, height) {
    rDrawHorizontalLine(x, y, width);
    rDrawHorizontalLine(x, y + height - 1, width);
    rDrawVerticalLine(x, y + 1, height - 2);
    rDrawVerticalLine(x + width - 1, y + 1, height - 2);
}

function rDrawCone(x, y, width) { // Not optimised to use i yet
    let lastX = x + width - 1;
    let endI = (width >>> 1) + (width & 1);
    for (let i = 0; i < endI; ++i) {
        rDrawPixel(rXYToI(x + i, y));
        rDrawPixel(rXYToI(lastX - i, y));
        ++y;
    }
}

function rXYToI(x, y) {
    return rCanvasYFixOffset + x - y*rCanvasWidth;
}

var rCanvas;
var rCanvasWidth;
var rCanvasHeight;
var rCanvasYFixOffset;
var rContext;
var rImageData;
var rPixels;
var rPixels8;
var rPixels32;
var rDrawColor;
var rDrawColorRB;
var rDrawColorG;
var rDrawColorA;

//}

function increaseSize() {
    setTileSize(rrTileSize + 1);
}

function decreaseSize() {
    if (rrTileSize > 1) {
        setTileSize(rrTileSize - 1);
    }
}

function setTileSize(size) {
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        rResizeCanvas(size * 64, size * 48);
    } else {
        rResizeCanvas(size * 128, size * 100);
    }
    rrSetTileSize(size);
    simDraw();
}

function setCanvasWidth(width) {
    canvasWidth = width;
}

function setCanvasHeight(height) {
    canvasHeight = height;
}

var canvasWidth;
var canvasHeight;

var numGroups;