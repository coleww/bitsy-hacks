import {
	start,
	press,
	end,
	snapshot,
} from './test/bitsy';

test('falling movement', async () => {
	await start({
		hacks: ['falling-movement'],
	});
	await press('Enter'); // complete title dialog
	await press('Enter'); // end dialog
	await press('ArrowUp'); // attempt to move up, nothing happens
	await snapshot(); // snapshot 1
	await press('ArrowRight'); // attempt to move right, move down instead
	await snapshot(); // snapshot 2
	await press('ArrowLeft'); // attempt to move left, succeed
	await snapshot(); // snapshot 3
	await press('ArrowDown'); // move down
	await press('ArrowRight'); // move right, successfully
	await snapshot(); // snapshot 4, moved diagonally to the right
	await end();
});
