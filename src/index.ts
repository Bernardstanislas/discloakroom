// Inspired by https://github.com/MattVador/node-red-contrib-play-sound/blob/master/node-red-contrib-play-sound.js

// TODO: Type correctly the lib
const player = require("play-sound")({});
const audio = player.play("sample.mp3");
