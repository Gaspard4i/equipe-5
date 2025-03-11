import { canvas } from './canvas.js';
import { Entity } from './entity.js';

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
