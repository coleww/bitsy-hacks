/**
🙌
@file move-back
@summary push the player back with dialogue
@license MIT
@version 1.0.0
@requires 5.3
@author Cole Sea

@description
A dialog tag that detects which direction the player is facing and pushes them
back 1 tile in the opposite direction. For NPCs that "scare" the player, or
"guard" a door from being entered, or "teleport" the character. 

Usage:
	(moveBack "num"): moves character back num tiles immediately
	(moveBackNow "num"): moves character back num tiles when dialog is reached

NOTE: this script is only aware of what direction the player is facing, it does
not check for objects/walls/etc. when it is moving the character.

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
*/
import bitsy from "bitsy";

import {
	addDualDialogTag
} from "./helpers/kitsy-script-toolkit";

function moveBack(environment, parameters) {
  var amount = ~~parameters[0];
	var player = bitsy.player();

  switch (bitsy.curPlayerDirection) {
  case bitsy.Direction.Up:
    player.y += amount;
    break;
  case bitsy.Direction.Down:
    player.y -= amount;
    break;
  case bitsy.Direction.Left:
    player.x += amount;
    break;
  case bitsy.Direction.Right:
    player.x -= amount;
    break;
  default:
    break;
  }
}

addDualDialogTag('moveBack', moveBack);
