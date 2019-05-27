/**
✈️
@file jump
@summary simulate jumping by restricting movement
@license MIT
@version 1.0.0
@requires 5.3
@author Cole Sea

@description



while standing on a wall, press up to jump.
player will keep moving up for x moves, pause for y moves, then move down for z moves





HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
2. Edit `` and `` below as needed
*/
import bitsy from "bitsy";
import {
	after, before, addDialogTag
} from "./helpers/kitsy-script-toolkit";

export var hackOptions = {
  // after pressing up, how many tiles should player go up before peak is reached
  rise: 3,
  // upon reaching peak of jump, how many moves should player stay still before moving down
  peak: 1
};



var noop = function () {};

var oldX, oldY, isJumping, jumpCounter = 0, fallCounter = 0;

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
	var currentMovement;

  // get the direction the player ~TRIED~ to move in

	// moved up
	if (newY === oldY - 1) {
		currentMovement = 'up';
	// moved down
	} else if (newY === oldY + 1) {
		currentMovement = 'down';
	// moved left
	} else if (newX === oldX - 1) {
		currentMovement = 'left';
	// moved right
	} else if (newX === oldX + 1) {
		currentMovement = 'right';
	// changed room or something
	} else {
    // TODO: does the above if/else miss any moves that this script causes?
		// console.log("?????");
	}

  player.y = oldY;

  if (currentMovement === 'up' && !isJumping && fallCounter === 0 && (bitsy.isWallDown() || bitsy.getSpriteDown())) {
    isJumping = true;
    jumpCounter = 0;
  }

  if (isJumping && !bitsy.isWallUp() && !bitsy.getSpriteUp()) {
    jumpCounter += 1
    if (currentMovement === 'down') jumpCounter += 1; // let player press down to "cancel" part of the jump

    if (jumpCounter <= hackOptions.rise) {

      // moving upwards if that won't cause a collission
      // if (!bitsy.isWallUp() && !bitsy.getSpriteUp()) {
        player.y -= 1;
      // } else {
      //   // collided with something///so this is now the "peak"
      //   isJumping = false;
      //   jumpCounter = 0;
      //   fallCounter = 0;
      // }

    } else if (jumpCounter < hackOptions.rise + hackOptions.peak) {

      // dont allow horizontal movement during the peak
      player.x = oldX;

    } else {

      // peak is reached, let gravity take over
      isJumping = false;
      jumpCounter = 0;
      fallCounter = 0;
    }
  } else {
    // if you aren't jumping then yr falling
    if (!bitsy.isWallDown() && !bitsy.getSpriteDown()) {
      // if there's nothing below you, gravity is applied
      player.y += 1
      fallCounter += 1;

      if (fallCounter > 3) {
        // can only move horizontally at the start of a fall
        player.x = oldX;
      }
    } else {
      // standing above wall or a sprite. no gravity
      fallCounter = 0
    }
  }
});

addDialogTag("increaseJump", function (environment, parameters, onReturn) {
	var amount = ~~parameters[0];
  hackOptions.rise += amount;
})
