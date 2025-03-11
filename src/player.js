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
	slow() {
		vx *= 0.5;
		vy *= 0.5;
	}

	grow() {
		radius += 5;
		slow();
	}

	checkStainCollisionFromCenter() {
		for (let i = 0; i < position.length; i++) {
			let stainCenterX = position[i][0] + IMAGE_SIZE / 2;
			let stainCenterY = position[i][1] + IMAGE_SIZE / 2;

			let dx = stainCenterX - x;
			let dy = stainCenterY - y;
			let distance = Math.sqrt(dx * dx + dy * dy);
			if (distance <= radius) {
				position.splice(i, 1);
				i--;
				grow();
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
	checkStainCollisionFromCenter();
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
