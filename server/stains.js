import { Stain } from './stain.js';
import { Bonus } from './bonus.js';
import { maxWidth, maxHeight } from './constants.js';
import { players } from './index.js';

export class Stains {
	constructor(count) {
		this.stains = [];
		this.count = count;
		this.createStains();
	}

	createStains() {
		for (let i = 0; i < this.count; i++) {
			let stain;
			let isValidPosition = false;

			while (!isValidPosition) {
				const x = Math.floor(Math.random() * maxWidth - 10);
				const y = Math.floor(Math.random() * maxHeight - 10);
				stain = Math.random() < 0.1 ? new Bonus(20, x, y) : new Stain(20, x, y);

				// Vérifie si le stain est en dehors du rayon de tous les joueurs
				isValidPosition = !Object.values(players).some(player => {
					const dx = player.x - stain.x;
					const dy = player.y - stain.y;
					const distanceSquared = dx * dx + dy * dy;
					const radiusSum = player.radius + stain.radius;
					return distanceSquared < radiusSum * radiusSum;
				});
			}

			this.stains.push(stain);
		}
	}

	updateStains() {
		while (this.stains.length < this.count) {
			const x = Math.floor(Math.random() * maxWidth - 10);
			const y = Math.floor(Math.random() * maxHeight - 10);
			const entity =
				Math.random() < 0.1 ? new Bonus(20, x, y) : new Stain(20, x, y);
			this.stains.push(entity);
		}
	}

	size() {
		return this.stains.length;
	}

	get(i) {
		return this.stains[i];
	}

	splice(i, val) {
		this.stains.splice(i, val);
	}

	push(stain) {
		this.stains.push(stain);
	}

	getAll() {
		return this.stains;
	}
}
