import {
	start,
	press,
	end,
	walkToCat,
	snapshot,
} from './test/bitsy';

test('move-back', async () => {
	await start({
		hacks: ['move-back'],
		catDialog: '\\(moveBack "1"\\)(moveBack "1")',
	});
	await press('Enter'); // complete title dialog
	await press('Enter'); // end dialog
  await snapshot();
  await walkToCat();
  await snapshot();
	await press('ArrowRight'); // talk to cat
	await press('Enter'); // complete dialog
	await press('Enter'); // end dialog
  await snapshot();
	await end();
});
