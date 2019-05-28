import {
	start,
	press,
	walkToCat,
	end,
	snapshot,
} from './test/bitsy';

test('falling-movement', async () => {
	await start({
		hacks: ['falling-movement'],
		catDialog: 'meow (toggleFalling)'
	});
	await press('Enter'); // complete title dialog
	await press('Enter'); // end dialog
	// walk
	await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog
  await snapshot(); // snapshot 1 should say meow
	await press('Enter'); // end dialog
	await press('ArrowUp'); // attempt to move up, nothing happens
	await snapshot(); // snapshot 2
	await press('ArrowLeft'); // attempt to move left, move down instead
	await snapshot(); // snapshot 3
	await press('ArrowRight'); // attempt to move right, succeed
	await snapshot(); // snapshot 4
	await press('ArrowDown'); // move down
	await press('ArrowRight'); // move right, successfully
	await snapshot(); // snapshot 5, moved diagonally to the right
	await end();
});
