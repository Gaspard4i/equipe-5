import { Stain } from './stain.js';

export class Bonus extends Stain {
	constructor(radius, x, y) {
		const bonus = Math.random() < 0.5 ? BonusType.VITESSE : BonusType.TAILLE;
		super(radius + 50, x, y);
		this.bonus = bonus;
	}
}

export const BonusType = {
	VITESSE: 'VITESSE',
	TAILLE: 'TAILLE',
};
