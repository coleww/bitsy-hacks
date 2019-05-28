/**
🍂
@file falling movement
@summary simulate an infinite falling game by restricting movement
@license MIT
@version 1.0.0
@requires 5.3
@author Cole Sea

@description
Prevents the player from moving up.
Player can only move left or right if their last move was down.

NOTE that this script assumes the player can only move 1 space at a time.

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
*/
import bitsy from "bitsy";
import {
	after, before, addDialogTag
} from "./helpers/kitsy-script-toolkit";

var oldX, oldY, lastMovement, active = false;

before("movePlayer", function () {
	if (!active) return;
	var player = bitsy.player();
	// store current position before any movement happens
	oldX = player.x;
	oldY = player.y;
});

// note: this function is intentionally verbose so that it may be
// forked to implement other movement customizations
after("movePlayer", function () {
	if (!active) return;
	var player = bitsy.player();
	var newX = player.x;
	var newY = player.y;
	var currentMovement;

		// moved up
	if (newY === oldY - 1) {

		currentMovement = 'up';

		// if the player ever tries to move up, move them back :p
		player.y = oldY;

		// moved down
	} else if (newY === oldY + 1) {

		currentMovement = 'down';

		// do nothing, downward is heavenward!

		// moved left
	} else if ((newX === oldX - 1) || (newX === oldX + 1)) {
		currentMovement = 'horizontal';

		if (lastMovement !== 'down') {
			// move the player back
			player.x = oldX;

			// move them down instead (if possible)
			currentMovement = 'down'
			var objectBelow = bitsy.isWallDown() || bitsy.getSpriteDown();
			if (!objectBelow) {
				player.y += 1
			}
		}
	// something weird happened
	} else {

		// for debugging if needed
		// console.log('falling-movement', {oldX, oldY, newX, newY, hackOptions});
	}

	// store this movement
	lastMovement = currentMovement;
});


addDialogTag('toggleFalling', function (env, params, onReturn) {
	active = !active;
	onReturn(null);
});
