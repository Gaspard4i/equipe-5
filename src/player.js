import { canvas } from './canvas.js';
import { Entity } from './entity.js';
import { stains } from './entities.js';

let color = 'rgba(255, 255, 255)';

export class Player extends Entity {
	constructor(radius, x, y, vx, vy) {
		super(radius, x, y, vx, vy);
		this.color = color;
	}

	draw(context) {
		context.fillStyle = this.color;
		context.strokeStyle = this.color;
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		context.fill();
		context.stroke();
	}
	slow() {
		this.vx *= 0.5;
		this.vy *= 0.5;
	}

	grow() {
		this.radius += 5;
		this.slow();
	}

	checkStainCollisionFromCenter() {
		for (let i = 0; i < stains.length; i++) {
			let stainCenterX = stains[i].x + 40 / 2;
			let stainCenterY = stains[i].y + 40 / 2;

			let dx = stainCenterX - this.x;
			let dy = stainCenterY - this.y;
			let distance = Math.sqrt(dx * dx + dy * dy);
			// console.log(
			// 	`Collision detected with stain at (${stains[i].x}, ${stains[i].y})`
			// );
			// console.log(
			// 	`Player position: (${this.x}, ${this.y}), Player radius: ${this.radius}`
			// );
			// console.log(
			// 	`Stain position: (${stains[i].x}, ${stains[i].y}), Stain center: (${stainCenterX}, ${stainCenterY})`
			// );
			// console.log(`Distance: ${distance}`);
			if (distance <= this.radius) {
				stains.splice(i, 1);
				i--;
				this.grow();
			}
		}
	}
}

let player = new Player(30, canvas.width / 2, canvas.height / 2, 0, 0);

export function movePlayer() {
	player.x += player.vx;
	player.y += player.vy;

	if (player.x - player.radius < 0) {
		player.x = player.radius;
	} else if (player.x + player.radius > canvas.width) {
		player.x = canvas.width - player.radius;
	}
	if (player.y - player.radius < 0) {
		player.y = player.radius;
	} else if (player.y + player.radius > canvas.height) {
		player.y = canvas.height - player.radius;
	}
	player.checkStainCollisionFromCenter();
}

export function handleKeyDown(event) {
	switch (event.key) {
		case 'ArrowRight':
			player.vx = 15;
			break;
		case 'ArrowLeft':
			player.vx = -15;
			break;
		case 'ArrowUp':
			player.vy = -15;
			break;
		case 'ArrowDown':
			player.vy = 15;
			break;
	}
}

export function handleKeyUp(event) {
	switch (event.key) {
		case 'ArrowRight':
		case 'ArrowLeft':
			player.vx = 0;
			break;
		case 'ArrowUp':
		case 'ArrowDown':
			player.vy = 0;
			break;
	}
}

export function drawPlayer(context) {
	player.draw(context);
}
