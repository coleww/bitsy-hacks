/**
🤺
@file souls
@summary the dark souls of bitsy
@license MIT
@version 0.0.1
@requires 5.3
@author Cole Sea

@description
For making exceedingly difficult tiny narrative games ;)



enemy advances when u do. you just got a sword poking in yr front direction
trying to poke them in the back







gives the player "health" and allows them to be damaged via dialog.
if at any point the player's health becomes 0 or less,
the endDialog will be triggered

Usage:
  (changeHealth "1"): add one to the player's health, display "damage" text and current health.
	(changeHealth "-1"): subtract one from the player's health, display "healed" text and current health.
	(changeHealth "0"): display players health.

(changeMaxHealth "1"): increase players max vitality...or take it away :p






(retrieveSouls)












NOTE: adjust 'maxHealth' and 'endDialog' as needed

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
	endDialog: "YOU DIED!",
	healedText: "Healed for",
	damagedText: "Damaged for",
	retrievedText: "RETRIEVED",
	soulsWord: "Souls"
};

var health = hackOptions.maxHealth;

addDialogTag("changeHealth", function (environment, parameters, onReturn) {
	var amount = ~~parameters[0];

	health += amount;
  if (health <= 0) {
		recordDeath(environment, parameters);
    bitsy.dialogBuffer.EndDialog();
    bitsy.startNarrating(hackOptions.endDialog || null, true);
  } else if (health > hackOptions.maxHealth) {
		health = hackOptions.maxHealth
	}

	if (amount < 0) {
		printDialog(environment, `${hackOptions.damagedText} ${amount}! [${health}/${hackOptions.maxHealth}]`, onReturn);
	} else if (amount > 0) {
		printDialog(environment, `${hackOptions.healedText} ${amount}! [${health}/${hackOptions.maxHealth}]`, onReturn);
	} else {
		printDialog(environment, `[${health}/${hackOptions.maxHealth}]`, onReturn);
	}
});


addDialogTag("retrieveSouls", function (environment, parameters, onReturn) {

	printDialog(environment, `${hackOptions.retrievedText} ${hackOptions.soulsWord}!`, onReturn);
});

function retrieveSouls() {
	// restore stuff to yr inventory
	// update variables
	// delete localStorage record
	// ....
}


function recordDeath(environment, parameters) {
	// save current state to localstorage
}


function onGameStart() {
	// check localStorage for souls
	// mark player as "soul-less"
	// create item in room and spot with (retrieveSouls) dialog
	// remove items from game that were collected? (could this just use the save thing?)
	// save the game, do the localstorage dance, then show YOU DIED, reload then all u gotta do is move the character back to the hub

}


// THIS WONT WORK for choppie game :~(
// on death
// write current player position, threads, room,  and stuff to localstorage (work it into save functionality?)
// on game load,
// WOULD NEED unique items i guess :X (can automate that?)
// WOULD ALSO MAKE the end script totally absurd (unless it can just loop through ALLL the variables?)
// oh...just...no items...or not many...lol 
