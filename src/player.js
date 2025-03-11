import { canvas } from './canvas.js';
import { Entity } from './entity.js';
import { stains } from './entities.js';

const COLOR = 'rgba(255, 255, 255)';
const PLAYER_SPEED = 15;
const STAIN_SIZE = 40;

export class Player extends Entity {
	constructor(radius, x, y, vx, vy) {
		super(radius, x, y);
		this.color = COLOR;
		this.vx = vx;
		this.vy = vy;
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
			const stainCenterX = stains[i].x + STAIN_SIZE / 2;
			const stainCenterY = stains[i].y + STAIN_SIZE / 2;
			const dx = stainCenterX - this.x;
			const dy = stainCenterY - this.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance <= this.radius) {
				stains.splice(i, 1);
				i--;
				this.grow();
			}
		}
	}
}

const player = new Player(30, canvas.width / 2, canvas.height / 2, 0, 0);

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
			player.vx = PLAYER_SPEED;
			break;
		case 'ArrowLeft':
			player.vx = -PLAYER_SPEED;
			break;
		case 'ArrowUp':
			player.vy = -PLAYER_SPEED;
			break;
		case 'ArrowDown':
			player.vy = PLAYER_SPEED;
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
