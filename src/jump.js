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


this script assumes that any exits which the player can interact with while jumping are laid out in cartesian space.
you can have exits to arbitrary locations as long as there is a wall directly underneath the exit
also assumes that any tile along the outside of the grid that isn't a "wall" is an "exit"

TODO: OH NO THIS NEEDS TO WORK ACROSS ROOMS OH NOOOOOOOO


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

var oldX,
		oldY,
		isJumping,
		changedRooms = false,
		lastRoom,
		jumpCounter = 0,
		fallCounter = 0,
		fallingHorizMovesCounter = 0,
		wasStandingOnSomething;


function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function isWall(dir, x, y) {
	var capDir = capitalize(dir);
	var wallCheck = `isWall${capDir}`;
	var spriteCheck = `isWall${capDir}`;
	var isSpriteThere =  bitsy[spriteCheck]()
	var edgeMap = {
		up: {
			coord: y,
			value: 0
		},
		down: {
			coord: y,
			value: 15
		},
		left: {
			coord: x,
			value: 0
		},
		right: {
			coord: x,
			value: 15
		}
	}
	var edgeToCheck = edgeMap[dir]

	var isWallThere = bitsy[wallCheck]() && (edgeToCheck.coord !== edgeToCheck.value)
	return isWallThere || isSpriteThere;
}

before("movePlayer", function () {
	var player = bitsy.player();
	// store current position before any movement happens
	oldX = player.x;
	oldY = player.y;
	wasStandingOnSomething = isWall('down', oldX, oldY);
	console.log("before move", {oldX, oldY, wasStandingOnSomething})
	// TODO get current Room id for moving u back
	lastRoom = bitsy.curRoom;
});

after("movePlayer", function () {
	var player = bitsy.player();
	var newX = player.x;
	var newY = player.y;
	var currentMovement;

	var lastMoveWasARoomChange = changedRooms;

  // get the direction the player ~TRIED~ to move in
	changedRooms = false;
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
	} else if (newX === oldX && newY === oldY){
		console.log('nothing happened', {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY})
	} else {
		changedRooms = true;
		var sameRoom = bitsy.curRoom === lastRoom;
		console.log('should be equal', changedRooms, sameRoom);
		console.log('changed rooms', {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY})
    // TODO: does the above if/else miss any moves that this script causes?
		// console.log("?????");
	}

	player.x = oldX;
  player.y = oldY;

	var reallyMovedUp = currentMovement === 'up' || (changedRooms && newY === 15)

  if (reallyMovedUp && !isJumping && fallCounter === 0 && wasStandingOnSomething) {

		isJumping = true;
    jumpCounter = 0;
		console.log('starting jump', {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY})
  }

	// or: MAKE EXITS not work if yr last tile was also an exit


	// TODO: need to IGNORE THIS sometimes? jump through exit then move right. should move you diagonally right but does not. because u changed rooms due to hitting a space you didn't actually land on!
	if (changedRooms && !lastMoveWasARoomChange) {
		// for now, don't worry about room changes updating the correct counters and such. just let it do its thing
		console.log('changed rooms resetting player to new coords', {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY})
		player.x = newX;
	  player.y = newY;
		return;
	} else if (changedRooms && lastMoveWasARoomChange) {
		// reset player to oldX/oldY in previous room!

	}

  if (isJumping && !bitsy.isWallUp() && !bitsy.getSpriteUp() && jumpCounter <= hackOptions.jumpPower && currentMovement !== 'down') {
		console.log('in the jump', {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY})
    jumpCounter += 1

		player.y -= 1;



		if (allowHorizontalMovement(currentMovement)) {
			console.log('allowing horizontal movement in a jump', {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY})
			player.x = newX
		}
  } else {
		isJumping = false;
		console.log('gravity is being applied',  {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY})
    // if you aren't jumping then yr falling


		// give player a chance to move at the apex, otherwise movement feels bad :~(
		if (fallCounter === 0) {
			// let em chill in the air for the first frame like wile e coyote
			// TODO: is this really better than shoving them down? im not sure.
			player.y = oldY;
			console.log('starting a fall',  {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY})
			if (allowHorizontalMovement(currentMovement)) {
				console.log('moving horiz at start of fall',  {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY})
				player.x = newX
			}
		}

		fallCounter += 1;

    if (fallCounter > 1 && !bitsy.isWallDown() && !bitsy.getSpriteDown()) {
			console.log('falling', {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY})
      // if there's nothing below you, gravity is applied
      player.y += 1
      // fallCounter += 1;


			// TODO: TRIGGER ITEMS AND EXITS if u move to a spot that was not where u were supposed to go OH GOD WHAT IF THER are 2 in one spot
			// after applying gravity, then try to move horizontally

			// TODO: FURTHER RESTRICT HORIZONTAL MOVEMENT WHILE FALLING
			if (allowHorizontalMovement(currentMovement) && fallingHorizMovesCounter < fallCounter / hackOptions.jumpPower) {

				console.log('moving horiz while falling',  {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY})
				fallingHorizMovesCounter += 1;
				player.x = newX;
			}

			// player landed, reset counter before next movement loop
			if (bitsy.isWallDown() || bitsy.getSpriteDown()) {

				console.log('landed on something at end of fall',  {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY})
				fallCounter = 0
			}
    } else if (bitsy.isWallDown() || bitsy.getSpriteDown()){
			// TODO: APPLY FALLY DAMAGE HERE!
			console.log('on solid ground', {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY})
      // standing above wall or a sprite. no gravity
      fallCounter = 0
			fallingHorizMovesCounter = 0
			player.x = newX;
    }
  }
	console.log('end of move loop', {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY})
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
