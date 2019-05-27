/**
🤕
@file health
@summary give the player a health bar and end the game if it depletes
@license MIT
@version 0.0.1
@requires 5.3
@author Cole Sea

@description
gives the player a "health bar" and damage them with dialog.
if the player's health becomes 0 or less, the endDialog will be triggered.

Usage:
  (changeHealth "1"): add one to the player's health, display "damage" text and current health.
	(changeHealth "-1"): subtract one from the player's health, display "healed" text and current health.
	(changeHealth "0"): display players health.

NOTE: adjust hackOptions below as needed.

HOW TO USE:
1. Copy-paste into a script tag after the bitsy source
*/
import bitsy from "bitsy";
import {
	addDialogTag
} from "./helpers/kitsy-script-toolkit";

import {
	printDialog
} from "./helpers/utils";

export var hackOptions = {
	maxHealth: 3,
  startingHealth: 3,
	endDialog: "YOU DIED! ",
	healedText: "Healed for",
	damagedText: "Damaged for",
  healFailText: "But it had no effect... "
};

var health = hackOptions.startingHealth;

addDialogTag("changeHealth", function (environment, parameters, onReturn) {
	var amount = ~~parameters[0];

  // check if player is at full health or not
  var wasDamaged = health !== hackOptions.maxHealth;

  // apply the change
	health += amount;

  if (health <= 0) {
    // you died
    bitsy.dialogBuffer.EndDialog();
    bitsy.startNarrating(hackOptions.endDialog || null, true);
    return; // return early, game is over!
  } else if (health > hackOptions.maxHealth) {
    // don't let player exceed the max health
		health = hackOptions.maxHealth
	}


	bitsy.scriptInterpreter.SetVariable('health', health);
  bitsy.scriptInterpreter.SetVariable('maxHealth', hackOptions.maxHealth);

	if (amount < 0) {
		printDialog(environment, `${hackOptions.damagedText} ${Math.abs(amount)}!`, onReturn);
	} else if (amount > 0) {
		printDialog(environment, `${hackOptions.healedText} ${amount}! ${wasDamaged ? "" : hackOptions.healFailText}`, onReturn);
	}
});
