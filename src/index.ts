// Inspired by https://github.com/MattVador/node-red-contrib-play-sound/blob/master/node-red-contrib-play-sound.js

import { Gpio } from "pigpio";
import debounce from "lodash/debounce";
import { MPC } from "mpc-js";

const ACTIONS_DEBOUNCE_DELAY = 200;

const LEFT_DOOR = 17;
const leftDoor = new Gpio(LEFT_DOOR, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_UP,
  alert: true
});

leftDoor.glitchFilter(50_000);

const RIGHT_DOOR = 27;
const rightDoor = new Gpio(RIGHT_DOOR, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_UP,
  alert: true
});

rightDoor.glitchFilter(50_000);

const LIGHT = 22;
const light = new Gpio(LIGHT, {
  mode: Gpio.OUTPUT
});

const player = new MPC();
player.connectTCP("localhost", 6600);

let playing = true;

const pause = debounce(
  () => {
    playing && player.playback.pause();
    playing = false;
  },
  ACTIONS_DEBOUNCE_DELAY,
  { leading: true, trailing: false }
);
const resume = debounce(
  () => {
    !playing && player.playback.play();
    playing = true;
  },
  ACTIONS_DEBOUNCE_DELAY,
  { leading: true, trailing: false }
);

const turnLightOn = debounce(
  () => {
    light.digitalWrite(1);
  },
  ACTIONS_DEBOUNCE_DELAY,
  { leading: true, trailing: false }
);

const turnLightOff = debounce(
  () => {
    light.digitalWrite(0);
  },
  ACTIONS_DEBOUNCE_DELAY,
  { leading: true, trailing: false }
);

const onDoorsChange = () => {
  const leftDoorValue = leftDoor.digitalRead();
  const rightDoorValue = rightDoor.digitalRead();

  const doorsAreBothClosed = leftDoorValue === 1 && rightDoorValue === 1;

  if (doorsAreBothClosed) {
    onDoorsClosed();
  } else {
    onDoorsOpened();
  }
};

leftDoor.on("alert", onDoorsChange);

rightDoor.on("alert", onDoorsChange);

const onDoorsClosed = () => {
  pause();
  turnLightOff();
};

const onDoorsOpened = () => {
  resume();
  turnLightOn();
};

console.log("Started");

process.on("SIGINT", function() {
  console.log("Quitting player");
  leftDoor.off("alert", onDoorsChange);
  rightDoor.off("alert", onDoorsChange);
  process.exit();
});
