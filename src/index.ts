// Inspired by https://github.com/MattVador/node-red-contrib-play-sound/blob/master/node-red-contrib-play-sound.js

// TODO: Type correctly the lib
import { Gpio } from "pigpio";
import debounce from "lodash/debounce";
import Omx from "omxplayer-pi";

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

const player = Omx("get-down-on-it.mp3", "local", true);

let playing = true;

const pause = debounce(
  () => {
    playing && player.pause();
    playing = false;
  },
  500,
  { leading: true, trailing: false }
);
const resume = debounce(
  () => {
    !playing && player.play();
    playing = true;
  },
  500,
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
};

const onDoorsOpened = () => {
  resume();
};

console.log("Started");

process.on("SIGINT", function() {
  console.log("Quitting player");
  player.quit();
  leftDoor.off("alert", onDoorsChange);
  rightDoor.off("alert", onDoorsChange);
  process.exit();
});
