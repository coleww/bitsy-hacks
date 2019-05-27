import {
	start,
	press,
	end,
	walkToCat,
	snapshot,
} from './test/bitsy';

test('health: damage', async () => {
	await start({
		hacks: ['health'],
		catDialog: 'meow: (changeHealth "-1") [ {say health} / {say maxHealth} ]',
	});
	await press('Enter'); // complete title dialog
	await press('Enter'); // end dialog
  await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog
  await snapshot(); // should say took 1 damage 2/3
	await end();
});

test('health: heal', async () => {
	await start({
		hacks: ['health'],
		catDialog: '(changeHealth "-1") meow: (changeHealth "1") [ {say health} / {say maxHealth} ]',
	});
	await press('Enter'); // complete title dialog
	await press('Enter'); // end dialog
  await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog
  await snapshot(); // should say heal for 1 3/3
	await end();
});

test('health: heal fail', async () => {
	await start({
		hacks: ['health'],
		catDialog: 'meow: (changeHealth "1") [ {say health} / {say maxHealth} ]',
	});
	await press('Enter'); // complete title dialog
	await press('Enter'); // end dialog
  await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog
  await snapshot(); // should say heal for 1! But it did nothing... 3/3
	await end();
});


test('health: death', async () => {
	await start({
		hacks: ['health'],
		catDialog: 'meow: (changeHealth "-4") [ {say health} / {say maxHealth} ]',
	});
	await press('Enter'); // complete title dialog
	await press('Enter'); // end dialog
  await walkToCat();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog
  await snapshot(); //
	await end();
});
