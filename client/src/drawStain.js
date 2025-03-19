export class DrawStain {
	constructor(radius, x, y) {
		this.radius = radius;
		this.x = x;
		this.y = y;
		this.image = new Image();
		this.image.src = '../../src/assets/stain.png';
	}

	draw(context) {
		context.drawImage(
			this.image,
			this.x - this.radius,
			this.y - this.radius,
			this.radius * 2,
			this.radius * 2
		);
	}
}
