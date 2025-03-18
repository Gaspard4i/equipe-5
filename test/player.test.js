import assert from 'node:assert/strict';
import { describe, it, before } from 'node:test';
import { Player } from '../src/player.js';

describe('Player Module', () => {
	it('Score should up when player grow', () => {
		const player = new Player(0, 0, 0, 0, 0, false);
		assert.equal(player.score, 0);
		player.grow();
		assert.equal(player.score, 15);
	});
});
