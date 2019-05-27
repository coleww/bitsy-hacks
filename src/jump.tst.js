import {
	start,
	press,
	end,
	snapshot,
} from './test/bitsy';



// need to use fake game data here

test('jump', async () => {
	await start({
		hacks: ['jump'],
	});
	await press('Enter'); // complete title dialog
	await press('Enter'); // end dialog
	// await press('ArrowUp'); // attempt to move up, fail
	// await snapshot(); // snapshot 1, still in original spot
	// await press('ArrowRight'); // attempt to move right, fail
	// await snapshot(); // snapshot 2, still in original spot
	// await press('ArrowLeft'); // attempt to move left, fail
	// await snapshot(); // snapshot 3, still in original spot
	// await press('ArrowDown'); // move down
	// await press('ArrowRight'); // move right, successfully
	// await snapshot(); // snapshot 4, moved diagonally to the right
	// await press('ArrowDown'); // move down
	// await press('ArrowLeft'); // move left, successfully
	// await snapshot(); // snapshot 5, moved diagonally to the left
	await end();
});
