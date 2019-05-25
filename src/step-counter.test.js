import {
	start,
	press,
	end,
	walkToCat,
	snapshot,
} from './test/bitsy';

test('step-counter', async () => {
	await start({
		hacks: ['step-counter'],
		catDialog: '\\(saySteps\\)(saySteps)\\(resetSteps\\)(resetSteps)',
	});
	await press('Enter'); // complete title dialog
	await press('Enter'); // end dialog
  await walkToCat(); // 11 steps
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog
  await snapshot(); // should say 11 steps
	await press('Enter'); // end dialog
	await press('ArrowUp');
	await press('ArrowRight');
	await press('ArrowDown'); // talk to the cat again
	await press('Enter'); // complete dialog
	await snapshot(); // should be 2 steps
	await end();
});
