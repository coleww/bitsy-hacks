/**
👣
@file step-counter
@summary count the number of tiles the player has moved
@license MIT
@version 1.0.0
@requires 5.3
@author Cole Sea

@description
For the speedrunners ;)

Count how many tiles the player has moved since the game started,
or reset the counter to start over. Will set and update a variable `steps`
that you can use as needed.

Usage:
	{say steps}: prints the current number of steps taken
	(resetSteps): resets the step counter

NOTE that this script assumes the player can only move 1 space at a time.

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
*/
import bitsy from "bitsy";
import {
	after, before, addDialogTag
} from "./helpers/kitsy-script-toolkit";
import {
	printDialog
} from "./helpers/utils";

var oldX, oldY, steps = 0;

before("movePlayer", function () {
	var player = bitsy.player();
	// store current position before any movement happens
	oldX = player.x;
	oldY = player.y;
});

after("movePlayer", function () {
	var player = bitsy.player();
	var newX = player.x;
	var newY = player.y;
  if (oldX !== newX || oldY !== newY) {
    // if either value changed, then the player moved!
    steps++;
		bitsy.scriptInterpreter.SetVariable('steps', steps);
  }
});

addDialogTag('resetSteps', function () {
	steps = 0
	bitsy.scriptInterpreter.SetVariable('steps', steps);
});
