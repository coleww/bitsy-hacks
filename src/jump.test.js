import {
	start,
	press,
	end,
	snapshot,
} from './test/bitsy';

test('jump', async () => {
	await start({
    gamedata: `JUMP TEST

# BITSY VERSION 6.2

! ROOM_FORMAT 1

PAL 0
10,16,96
246,244,247
239,240,250

ROOM 0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,a,a,a,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,a,a,a,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,a,a,a,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,a,a,a,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,a,a,a,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a
PAL 0

TIL a
11111111
11111111
11111111
11111111
11111111
11111111
11111111
11111111
WAL true

SPR A
00111100
01111110
01111110
01111110
00111100
00100100
00100100
00100100
POS 0 0,14

SPR a
00000000
00000000
01010001
01110001
01110010
01111100
00111100
00100100
DLG SPR_0
POS 0 8,3

ITM 0
00000000
00000000
00000000
00111100
01100100
00100100
00011000
00000000
NAME tea
DLG ITM_0

DLG SPR_0
I'm a cat

DLG ITM_0
You found a nice warm cup of tea

VAR a
42`,
		hacks: ['jump'],
	});
	await press('Enter'); // complete title dialog
	await press('Enter'); // end dialog
  await snapshot(); // snapshot 1, starting positions
	await press('ArrowUp'); // start jump
	await press('ArrowRight');
	await press('ArrowRight');
	await press('ArrowRight');
	await snapshot(); // snapshot 2, should be on 1st platform

	await press('ArrowLeft');
  await press('ArrowLeft');
  await press('ArrowLeft');
  await press('ArrowDown');
  // attempt to move left, succeed
	await snapshot(); // snapshot 3, back at starting position
	await end();
});
