"use strict";
// Inspired by https://github.com/MattVador/node-red-contrib-play-sound/blob/master/node-red-contrib-play-sound.js
exports.__esModule = true;
var pigpio_1 = require("pigpio");
var debounce_1 = require("lodash/debounce");
var mpc_js_1 = require("mpc-js");
var ACTIONS_DEBOUNCE_DELAY = 200;
var LEFT_DOOR = 17;
var leftDoor = new pigpio_1.Gpio(LEFT_DOOR, {
    mode: pigpio_1.Gpio.INPUT,
    pullUpDown: pigpio_1.Gpio.PUD_UP,
    alert: true
});
leftDoor.glitchFilter(50000);
var RIGHT_DOOR = 27;
var rightDoor = new pigpio_1.Gpio(RIGHT_DOOR, {
    mode: pigpio_1.Gpio.INPUT,
    pullUpDown: pigpio_1.Gpio.PUD_UP,
    alert: true
});
rightDoor.glitchFilter(50000);
var LIGHT = 22;
var light = new pigpio_1.Gpio(LIGHT, {
    mode: pigpio_1.Gpio.OUTPUT
});
var player = new mpc_js_1.MPC();
player.connectTCP("localhost", 6600);
var playing = true;
var pause = debounce_1["default"](function () {
    playing && player.playback.pause();
    playing = false;
}, ACTIONS_DEBOUNCE_DELAY, { leading: true, trailing: false });
var resume = debounce_1["default"](function () {
    !playing && player.playback.play();
    playing = true;
}, ACTIONS_DEBOUNCE_DELAY, { leading: true, trailing: false });
var turnLightOn = debounce_1["default"](function () {
    light.digitalWrite(1);
}, ACTIONS_DEBOUNCE_DELAY, { leading: true, trailing: false });
var turnLightOff = debounce_1["default"](function () {
    light.digitalWrite(0);
}, ACTIONS_DEBOUNCE_DELAY, { leading: true, trailing: false });
var onDoorsChange = function () {
    var leftDoorValue = leftDoor.digitalRead();
    var rightDoorValue = rightDoor.digitalRead();
    var doorsAreBothClosed = leftDoorValue === 1 && rightDoorValue === 1;
    if (doorsAreBothClosed) {
        onDoorsClosed();
    }
    else {
        onDoorsOpened();
    }
};
leftDoor.on("alert", onDoorsChange);
rightDoor.on("alert", onDoorsChange);
var onDoorsClosed = function () {
    pause();
    turnLightOff();
};
var onDoorsOpened = function () {
    resume();
    turnLightOn();
};
console.log("Started");
process.on("SIGINT", function () {
    console.log("Quitting player");
    leftDoor.off("alert", onDoorsChange);
    rightDoor.off("alert", onDoorsChange);
    process.exit();
});
