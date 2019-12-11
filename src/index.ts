// Inspired by https://github.com/MattVador/node-red-contrib-play-sound/blob/master/node-red-contrib-play-sound.js

// TODO: Type correctly the lib
import { Gpio } from "onoff";

const LEFT_DOOR = 17;
const leftDoor = new Gpio(LEFT_DOOR, "in", "both", { debounceTimeout: 100 });

const RIGHT_DOOR = 27;
const rightDoor = new Gpio(RIGHT_DOOR, "in", "both", { debounceTimeout: 100 });

leftDoor.watch((err, value) => {
  console.log("Left door changed, it is now: ", value);
});

rightDoor.watch((err, value) => {
  console.log("Right door changed, it is now: ", value);
});
