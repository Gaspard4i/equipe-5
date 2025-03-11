import { Stain } from './stain.js';

export const stains = [new Stain(20, 200, 200, 0, 0)];

for (let i = 0; i < 30; i++) {
	stains.push(
		new Stain(
			20 + i, // Modifier la taille
			200 - i * 5, // Modifier la position x
			200 - i * 5, // Modifier la position y
			i * 10, // Modifier la rotation
			i * 10 // Modifier l'opacité
		)
	);
}
