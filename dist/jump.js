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
this.hacks = this.hacks || {};
this.hacks.jump = (function (exports,bitsy) {
'use strict';
var hackOptions = {
  // after pressing up, how many tiles should player go up before peak is reached
  jumpPower: 2
};

bitsy = bitsy && bitsy.hasOwnProperty('default') ? bitsy['default'] : bitsy;

/**
@file utils
@summary miscellaneous bitsy utilities
@author Sean S. LeBlanc
*/

/*
Helper used to replace code in a script tag based on a search regex
To inject code without erasing original string, using capturing groups; e.g.
	inject(/(some string)/,'injected before $1 injected after')
*/
function inject(searchRegex, replaceString) {
	// find the relevant script tag
	var scriptTags = document.getElementsByTagName('script');
	var scriptTag;
	var code;
	for (var i = 0; i < scriptTags.length; ++i) {
		scriptTag = scriptTags[i];
		var matchesSearch = scriptTag.textContent.search(searchRegex) !== -1;
		var isCurrentScript = scriptTag === document.currentScript;
		if (matchesSearch && !isCurrentScript) {
			code = scriptTag.textContent;
			break;
		}
	}

	// error-handling
	if (!code) {
		throw 'Couldn\'t find "' + searchRegex + '" in script tags';
	}

	// modify the content
	code = code.replace(searchRegex, replaceString);

	// replace the old script tag with a new one using our modified code
	var newScriptTag = document.createElement('script');
	newScriptTag.textContent = code;
	scriptTag.insertAdjacentElement('afterend', newScriptTag);
	scriptTag.remove();
}

/**
 * Helper for getting an array with unique elements 
 * @param  {Array} array Original array
 * @return {Array}       Copy of array, excluding duplicates
 */
function unique(array) {
	return array.filter(function (item, idx) {
		return array.indexOf(item) === idx;
	});
}

/**

@file kitsy-script-toolkit
@summary makes it easier and cleaner to run code before and after Bitsy functions or to inject new code into Bitsy script tags
@license WTFPL (do WTF you want)
@version 4.0.0
@requires Bitsy Version: 4.5, 4.6
@author @mildmojo

@description
HOW TO USE:
  import {before, after, inject, addDialogTag, addDeferredDialogTag} from "./helpers/kitsy-script-toolkit";

  before(targetFuncName, beforeFn);
  after(targetFuncName, afterFn);
  inject(searchRegex, replaceString);
  addDialogTag(tagName, dialogFn);
  addDeferredDialogTag(tagName, dialogFn);

  For more info, see the documentation at:
  https://github.com/seleb/bitsy-hacks/wiki/Coding-with-kitsy
*/


// Ex: inject(/(names.sprite.set\( name, id \);)/, '$1console.dir(names)');
function inject$1(searchRegex, replaceString) {
	var kitsy = kitsyInit();
	kitsy.queuedInjectScripts.push({
		searchRegex: searchRegex,
		replaceString: replaceString
	});
}

// Ex: before('load_game', function run() { alert('Loading!'); });
//     before('show_text', function run(text) { return text.toUpperCase(); });
//     before('show_text', function run(text, done) { done(text.toUpperCase()); });
function before(targetFuncName, beforeFn) {
	var kitsy = kitsyInit();
	kitsy.queuedBeforeScripts[targetFuncName] = kitsy.queuedBeforeScripts[targetFuncName] || [];
	kitsy.queuedBeforeScripts[targetFuncName].push(beforeFn);
}

// Ex: after('load_game', function run() { alert('Loaded!'); });
function after(targetFuncName, afterFn) {
	var kitsy = kitsyInit();
	kitsy.queuedAfterScripts[targetFuncName] = kitsy.queuedAfterScripts[targetFuncName] || [];
	kitsy.queuedAfterScripts[targetFuncName].push(afterFn);
}

function kitsyInit() {
	// return already-initialized kitsy
	if (bitsy.kitsy) {
		return bitsy.kitsy;
	}

	// Initialize kitsy
	bitsy.kitsy = {
		queuedInjectScripts: [],
		queuedBeforeScripts: {},
		queuedAfterScripts: {}
	};

	var oldStartFunc = bitsy.startExportedGame;
	bitsy.startExportedGame = function doAllInjections() {
		// Only do this once.
		bitsy.startExportedGame = oldStartFunc;

		// Rewrite scripts and hook everything up.
		doInjects();
		applyAllHooks();

		// Start the game
		bitsy.startExportedGame.apply(this, arguments);
	};

	return bitsy.kitsy;
}


function doInjects() {
	bitsy.kitsy.queuedInjectScripts.forEach(function (injectScript) {
		inject(injectScript.searchRegex, injectScript.replaceString);
	});
	_reinitEngine();
}

function applyAllHooks() {
	var allHooks = unique(Object.keys(bitsy.kitsy.queuedBeforeScripts).concat(Object.keys(bitsy.kitsy.queuedAfterScripts)));
	allHooks.forEach(applyHook);
}

function applyHook(functionName) {
	var functionNameSegments = functionName.split('.');
	var obj = bitsy;
	while (functionNameSegments.length > 1) {
		obj = obj[functionNameSegments.shift()];
	}
	var lastSegment = functionNameSegments[0];
	var superFn = obj[lastSegment];
	var superFnLength = superFn ? superFn.length : 0;
	var functions = [];
	// start with befores
	functions = functions.concat(bitsy.kitsy.queuedBeforeScripts[functionName] || []);
	// then original
	if (superFn) {
		functions.push(superFn);
	}
	// then afters
	functions = functions.concat(bitsy.kitsy.queuedAfterScripts[functionName] || []);

	// overwrite original with one which will call each in order
	obj[lastSegment] = function () {
		var returnVal;
		var args;
		var i = 0;

		function runBefore() {
			// All outta functions? Finish
			if (i === functions.length) {
				return returnVal;
			}

			// Update args if provided.
			if (arguments.length > 0) {
				args = [].slice.call(arguments);
			}

			if (functions[i].length > superFnLength) {
				// Assume funcs that accept more args than the original are
				// async and accept a callback as an additional argument.
				return functions[i++].apply(this, args.concat(runBefore.bind(this)));
			} else {
				// run synchronously
				returnVal = functions[i++].apply(this, args);
				if (returnVal && returnVal.length) {
					args = returnVal;
				}
				return runBefore.apply(this, args);
			}
		}

		return runBefore.apply(this, arguments);
	};
}

function _reinitEngine() {
	// recreate the script and dialog objects so that they'll be
	// referencing the code with injections instead of the original
	bitsy.scriptModule = new bitsy.Script();
	bitsy.scriptInterpreter = bitsy.scriptModule.CreateInterpreter();

	bitsy.dialogModule = new bitsy.Dialog();
	bitsy.dialogRenderer = bitsy.dialogModule.CreateRenderer();
	bitsy.dialogBuffer = bitsy.dialogModule.CreateBuffer();
}

// Rewrite custom functions' parentheses to curly braces for Bitsy's
// interpreter. Unescape escaped parentheticals, too.
function convertDialogTags(input, tag) {
	return input
		.replace(new RegExp('\\\\?\\((' + tag + '(\\s+(".+?"|.+?))?)\\\\?\\)', 'g'), function(match, group){
			if(match.substr(0,1) === '\\') {
				return '('+ group + ')'; // Rewrite \(tag "..."|...\) to (tag "..."|...)
			}
			return '{'+ group + '}'; // Rewrite (tag "..."|...) to {tag "..."|...}
		});
}


function addDialogFunction(tag, fn) {
	var kitsy = kitsyInit();
	kitsy.dialogFunctions = kitsy.dialogFunctions || {};
	if (kitsy.dialogFunctions[tag]) {
		throw new Error('The dialog function "' + tag + '" already exists.');
	}

	// Hook into game load and rewrite custom functions in game data to Bitsy format.
	before('parseWorld', function (game_data) {
		return [convertDialogTags(game_data, tag)];
	});

	kitsy.dialogFunctions[tag] = fn;
}

/**
 * Adds a custom dialog tag which executes the provided function.
 * For ease-of-use with the bitsy editor, tags can be written as
 * (tagname "parameters") in addition to the standard {tagname "parameters"}
 * 
 * Function is executed immediately when the tag is reached.
 *
 * @param {string}   tag Name of tag
 * @param {Function} fn  Function to execute, with signature `function(environment, parameters, onReturn){}`
 *                       environment: provides access to SetVariable/GetVariable (among other things, see Environment in the bitsy source for more info)
 *                       parameters: array containing parameters as string in first element (i.e. `parameters[0]`)
 *                       onReturn: function to call with return value (just call `onReturn(null);` at the end of your function if your tag doesn't interact with the logic system)
 */
function addDialogTag(tag, fn) {
	addDialogFunction(tag, fn);
	inject$1(
		/(var functionMap = new Map\(\);)/,
		'$1functionMap.set("' + tag + '", kitsy.dialogFunctions.' + tag + ');'
	);
}





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
	var isSpriteThere =  bitsy[spriteCheck]();
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
	};
	var edgeToCheck = edgeMap[dir];

	var isWallThere = bitsy[wallCheck]() && (edgeToCheck.coord !== edgeToCheck.value);
	return isWallThere || isSpriteThere;
}

before("movePlayer", function () {
	var player = bitsy.player();
	// store current position before any movement happens
	oldX = player.x;
	oldY = player.y;
	wasStandingOnSomething = isWall('down', oldX, oldY);
	console.log("before move", {oldX, oldY, wasStandingOnSomething});
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
		console.log('nothing happened', {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY});
	} else {
		changedRooms = true;
		var sameRoom = bitsy.curRoom === lastRoom;
		console.log('should be equal', changedRooms, sameRoom);
		console.log('changed rooms', {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY});
    // TODO: does the above if/else miss any moves that this script causes?
		// console.log("?????");
	}

	player.x = oldX;
  player.y = oldY;

	var reallyMovedUp = currentMovement === 'up' || (changedRooms && newY === 15);

  if (reallyMovedUp && !isJumping && fallCounter === 0 && wasStandingOnSomething) {

		isJumping = true;
    jumpCounter = 0;
		console.log('starting jump', {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY});
  }

	// or: MAKE EXITS not work if yr last tile was also an exit


	// TODO: need to IGNORE THIS sometimes? jump through exit then move right. should move you diagonally right but does not. because u changed rooms due to hitting a space you didn't actually land on!
	if (changedRooms && !lastMoveWasARoomChange) {
		// for now, don't worry about room changes updating the correct counters and such. just let it do its thing
		console.log('changed rooms resetting player to new coords', {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY});
		player.x = newX;
	  player.y = newY;
		return;
	} else if (changedRooms && lastMoveWasARoomChange) {
		// reset player to oldX/oldY in previous room!

	}

  if (isJumping && !bitsy.isWallUp() && !bitsy.getSpriteUp() && jumpCounter <= hackOptions.jumpPower && currentMovement !== 'down') {
		console.log('in the jump', {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY});
    jumpCounter += 1;

		player.y -= 1;



		if (allowHorizontalMovement(currentMovement)) {
			console.log('allowing horizontal movement in a jump', {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY});
			player.x = newX;
		}
  } else {
		isJumping = false;
		console.log('gravity is being applied',  {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY});
    // if you aren't jumping then yr falling


		// give player a chance to move at the apex, otherwise movement feels bad :~(
		if (fallCounter === 0) {
			// let em chill in the air for the first frame like wile e coyote
			// TODO: is this really better than shoving them down? im not sure.
			player.y = oldY;
			console.log('starting a fall',  {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY});
			if (allowHorizontalMovement(currentMovement)) {
				console.log('moving horiz at start of fall',  {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY});
				player.x = newX;
			}
		}

		fallCounter += 1;

    if (fallCounter > 1 && !bitsy.isWallDown() && !bitsy.getSpriteDown()) {
			console.log('falling', {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY});
      // if there's nothing below you, gravity is applied
      player.y += 1;
      // fallCounter += 1;


			// TODO: TRIGGER ITEMS AND EXITS if u move to a spot that was not where u were supposed to go OH GOD WHAT IF THER are 2 in one spot
			// after applying gravity, then try to move horizontally

			// TODO: FURTHER RESTRICT HORIZONTAL MOVEMENT WHILE FALLING
			if (allowHorizontalMovement(currentMovement) && fallingHorizMovesCounter < fallCounter / hackOptions.jumpPower) {

				console.log('moving horiz while falling',  {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY});
				fallingHorizMovesCounter += 1;
				player.x = newX;
			}

			// player landed, reset counter before next movement loop
			if (bitsy.isWallDown() || bitsy.getSpriteDown()) {

				console.log('landed on something at end of fall',  {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY});
				fallCounter = 0;
			}
    } else if (bitsy.isWallDown() || bitsy.getSpriteDown()){
			// TODO: APPLY FALLY DAMAGE HERE!
			console.log('on solid ground', {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY});
      // standing above wall or a sprite. no gravity
      fallCounter = 0;
			fallingHorizMovesCounter = 0;
			player.x = newX;
    }
  }
	console.log('end of move loop', {isJumping, jumpCounter, changedRooms, lastRoom, currentMovement, fallCounter, oldX, newX, oldY, newY});
});

function allowHorizontalMovement(currMove) {
	var moveLeft = currMove === 'left' && !bitsy.isWallLeft() && !bitsy.getSpriteLeft();
	var moveRight = currMove === 'right' && !bitsy.isWallRight() && !bitsy.getSpriteRight();
	return moveLeft || moveRight;
}

addDialogTag("increaseJumpPower", function (environment, parameters, onReturn) {
	var amount = ~~parameters[0];
  hackOptions.jumpPower += amount;
});

exports.hackOptions = hackOptions;

return exports;

}({},window));
