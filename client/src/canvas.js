export const canvas = document.querySelector('.gameCanvas');
export const context = canvas.getContext('2d');

export function resampleCanvas(draw, render) {
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	draw();
	requestAnimationFrame(render);
}

export function observeCanvas(draw, render) {
	const canvasResizeObserver = new ResizeObserver(() =>
		resampleCanvas(draw, render)
	);
	canvasResizeObserver.observe(canvas);
}

// Méthode pour dessiner un joueur
export function drawPlayer(context, player) {
	context.fillStyle = 'rgba(255, 255, 255)';
	context.beginPath();
	context.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
	context.fill();
}

// Méthode pour dessiner une tache
export function drawStain(context, stain) {
	const image = new Image();
	image.src = '../images/stain.png';
	context.drawImage(
		image,
		stain.x - stain.radius,
		stain.y - stain.radius,
		stain.radius * 2,
		stain.radius * 2
	);
}

// Méthode pour dessiner un bonus
export function drawBonus(context, bonus) {
	const image = new Image();
	image.src =
		bonus.type === 'VITESSE'
			? 'src/assets/stain_green.png'
			: 'src/assets/stain_blue.png';
	context.drawImage(
		image,
		bonus.x - bonus.radius,
		bonus.y - bonus.radius,
		bonus.radius * 2,
		bonus.radius * 2
	);
}

// Méthode principale pour dessiner le jeu
export function drawGame(context, gameState) {
	context.clearRect(0, 0, canvas.width, canvas.height);

	gameState.players.forEach(player => drawPlayer(context, player));

	gameState.stains.forEach(stain => {
		if (stain.type === 'VITESSE' || stain.type === 'TAILLE') {
			drawBonus(context, stain);
		} else {
			drawStain(context, stain);
		}
	});
}

export function drawBonus(context, bonus) {
	const image = new Image();
	image.src =
		bonus.type === 'VITESSE'
			? 'src/assets/stain_green.png'
			: 'src/assets/stain_blue.png';
	context.drawImage(
		image,
		bonus.x - bonus.radius,
		bonus.y - bonus.radius,
		bonus.radius * 2,
		bonus.radius * 2
	);
}

export const BonusType = {
	VITESSE: 'VITESSE',
	TAILLE: 'TAILLE',
};

export function drawPlayer(context, player) {
	context.fillStyle = 'rgba(255, 255, 255)';
	context.beginPath();
	context.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
	context.fill();

	if (!player.useKeyboard) {
		context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
		context.lineWidth = 2;
		const maxDistance = Math.min(canvas.width, canvas.height) / 4;
		context.beginPath();
		context.arc(player.x, player.y, maxDistance, 0, 2 * Math.PI);
		context.stroke();
	}
}
