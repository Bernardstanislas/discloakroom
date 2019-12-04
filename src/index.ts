// Inspired by https://github.com/MattVador/node-red-contrib-play-sound/blob/master/node-red-contrib-play-sound.js

// TODO: Type correctly the lib
const player = require("play-sound")({});
import rpio from "rpio";

let audio = player.play("sample.mp3");

const pause = () => audio.kill("SIGSTOP");

const resume = () => audio.kill("SIGCONT");

const LEFT_DOOR = 11;

rpio.open(LEFT_DOOR, rpio.INPUT, rpio.PULL_UP);

const onLeftDoorChange = (pin: number) => {
  rpio.msleep(20);

  const state = rpio.read(pin);

  if (state) {
    resume();
  } else {
    pause();
  }
};

rpio.poll(LEFT_DOOR, onLeftDoorChange, rpio.POLL_BOTH);
