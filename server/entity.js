export class Entity {
	constructor(radius, x, y) {
		if (this.constructor === Entity) {
			throw new Error("Impossible d'instancier la classe abstraite Entity");
		}
		this.radius = radius;
		this.x = x;
		this.y = y;
	}
}
