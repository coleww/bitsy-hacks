/**
✈️
@file jump
@summary simulate gravity by restricting movement
@license MIT
@version 1.0.0
@requires 5.3
@author Cole Sea

@description
while standing on a wall or sprite, press up to jump.
if you aren't standing on a wall or sprite or mid-jump, yr forced downwards





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
  jumpPower: 2
};



var noop = function () {};

var oldX, oldY, isJumping, jumpCounter = 0, fallCounter = 0, fallingHorizMovesCounter = 0;

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

	player.x = oldX;
  player.y = oldY;

  if (currentMovement === 'up' && !isJumping && fallCounter === 0 && (bitsy.isWallDown() || bitsy.getSpriteDown())) {

		isJumping = true;
    jumpCounter = 0;
		console.log('starting jump', {isJumping, jumpCounter, currentMovement, fallCounter, oldX, newX, oldY, newY})
  }

  if (isJumping && !bitsy.isWallUp() && !bitsy.getSpriteUp() && jumpCounter <= hackOptions.jumpPower) {
		console.log('in the jump', {isJumping, jumpCounter, currentMovement, fallCounter, oldX, newX, oldY, newY})
    jumpCounter += 1
    if (currentMovement === 'down') jumpCounter += 1; // let player press down to "cancel" part of the jump

		player.y -= 1;

		if (allowHorizontalMovement(currentMovement)) {
			console.log('allowing horizontal movement in a jump', {isJumping, jumpCounter, currentMovement, fallCounter, oldX, newX, oldY, newY})
			player.x = newX
		}
  } else {
		isJumping = false;
		console.log('gravity is being applied',  {isJumping, jumpCounter, currentMovement, fallCounter, oldX, newX, oldY, newY})
    // if you aren't jumping then yr falling


		// give player a chance to move at the apex, otherwise movement feels bad :~(
		if (fallCounter === 0) {
			// let em chill in the air for the first frame like wile e coyote
			// TODO: is this really better than shoving them down? im not sure.
			player.y = oldY;
			console.log('starting a fall',  {isJumping, jumpCounter, currentMovement, fallCounter, oldX, newX, oldY, newY})
			if (allowHorizontalMovement(currentMovement)) {
				console.log('moving horiz at start of fall',  {isJumping, jumpCounter, currentMovement, fallCounter, oldX, newX, oldY, newY})
				player.x = newX
			}
		}

		fallCounter += 1;

    if (fallCounter > 1 && !bitsy.isWallDown() && !bitsy.getSpriteDown()) {
			console.log('falling', {isJumping, jumpCounter, currentMovement, fallCounter, oldX, newX, oldY, newY})
      // if there's nothing below you, gravity is applied
      player.y += 1
      // fallCounter += 1;

			// TODO: TRIGGER ITEMS if u move to their spot
			// after applying gravity, then try to move horizontally

			if (allowHorizontalMovement(currentMovement) && fallingHorizMovesCounter < fallCounter / hackOptions.jumpPower) {

				console.log('moving horiz while falling',  {isJumping, jumpCounter, currentMovement, fallCounter, oldX, newX, oldY, newY})
				fallingHorizMovesCounter += 1;
				player.x = newX;
			}

			// player landed, reset counter before next movement loop
			if (bitsy.isWallDown() || bitsy.getSpriteDown()) {

				console.log('landed on something at end of fall',  {isJumping, jumpCounter, currentMovement, fallCounter, oldX, newX, oldY, newY})
				fallCounter = 0
			}
    } else if (bitsy.isWallDown() || bitsy.getSpriteDown()){
			console.log('on solid ground', {isJumping, jumpCounter, currentMovement, fallCounter, oldX, newX, oldY, newY})
      // standing above wall or a sprite. no gravity
      fallCounter = 0
			fallingHorizMovesCounter = 0
			player.x = newX;
    }
  }
	console.log('end of move loop', {isJumping, jumpCounter, currentMovement, fallCounter, oldX, newX, oldY, newY})
});

function allowHorizontalMovement(currMove) {
	var moveLeft = currMove === 'left' && !bitsy.isWallLeft() && !bitsy.getSpriteLeft();
	var moveRight = currMove === 'right' && !bitsy.isWallRight() && !bitsy.getSpriteRight();
	return moveLeft || moveRight;
}

addDialogTag("increaseJumpPower", function (environment, parameters, onReturn) {
	var amount = ~~parameters[0];
  hackOptions.jumpPower += amount;
})
