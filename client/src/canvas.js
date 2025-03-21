export const canvas = document.querySelector('.gameCanvas');
export const context = canvas.getContext('2d');

let debugCameraEnabled = false; // Mode de débogage désactivé par défaut
let debugPlayerEnabled = false;

export const BonusType = {
	VITESSE: 'VITESSE',
	TAILLE: 'TAILLE',
};

// ==================== UTILITAIRES ====================

export function setDebugCameraMode(enabled) {
	debugCameraEnabled = enabled;
}
export function setDebugPlayerMode(enabled) {
	debugPlayerEnabled = enabled;
}

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

function isEntityVisible(entity, camera, canvasWidth, canvasHeight) {
	const halfWidth = canvasWidth / 2 / camera.zoom;
	const halfHeight = canvasHeight / 2 / camera.zoom;

	const cameraLeft = camera.x - halfWidth;
	const cameraRight = camera.x + halfWidth;
	const cameraTop = camera.y - halfHeight;
	const cameraBottom = camera.y + halfHeight;

	return (
		entity.x + entity.radius > cameraLeft &&
		entity.x - entity.radius < cameraRight &&
		entity.y + entity.radius > cameraTop &&
		entity.y - entity.radius < cameraBottom
	);
}

function isEntityVisibleInDebug(entity, camera, canvasWidth, canvasHeight) {
	const halfWidth = canvasWidth / 4 / camera.zoom; // Taille réduite pour la caméra de débogage
	const halfHeight = canvasHeight / 4 / camera.zoom;

	const cameraLeft = camera.x - halfWidth;
	const cameraRight = camera.x + halfWidth;
	const cameraTop = camera.y - halfHeight;
	const cameraBottom = camera.y + halfHeight;

	return (
		entity.x + entity.radius > cameraLeft &&
		entity.x - entity.radius < cameraRight &&
		entity.y + entity.radius > cameraTop &&
		entity.y - entity.radius < cameraBottom
	);
}

export function interpolatePlayerPosition(player, deltaTime) {
	player.x += player.vx * deltaTime;
	player.y += player.vy * deltaTime;
}

// ==================== DESSIN ====================

function drawDebugPlayer(context, player) {
	const maxDistance = Math.min(canvas.width, canvas.height) / 4;
	context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
	context.lineWidth = 2;
	context.beginPath();
	context.arc(player.x, player.y, maxDistance, 0, 2 * Math.PI);
	context.stroke();
}

export function drawPlayer(context, player) {
	context.save();
	context.fillStyle = 'white';
	context.beginPath();
	context.arc(player.x, player.y, player.radius, 0, 2 * Math.PI); // Utilisation correcte du rayon
	context.fill();
	context.restore();

	if (debugPlayerEnabled) {
		drawDebugPlayer(context, player); // méthode de débogage
	}

	// score du joueur
	context.save();
	context.fillStyle = 'black';
	context.font = '16px Arial';
	context.textAlign = 'center';
	context.fillText(
		`Score: ${player.score}`,
		player.x,
		player.y - player.radius - 10
	); // au dessus
	context.restore();
}

function drawStain(context, stain) {
	const svgPathBase = new Path2D(
		'M189.935 201.29c20.635 27.084-22.03 71.467-55.054 29.935-39.398-49.548-82.237-47.484-87.398-5.161-5.129 42.061 61.392 41.155 77.18 72.774 14.346 28.731-45.974 50.698-32.449 109.935 17.204 75.355 112.172 66.065 134.882 21.677 50.813-99.316 103.226-33.032 122.495-12.387 40.711 43.619 141.016-10.085 66.065-79.484-37.161-34.409-30.71-69.268-1.959-89.29 46.69-32.516 4.368-86.194-28.664-69.677-8.793 4.396-16 18.581-33.032 23.226-14.855 4.051-31.878-4.745-34.065-18.409-5.505-34.409 45.945-60.071 41.29-89.979-6.882-44.215-71.57-51.785-76.387-6.366-5.257 49.568-26.045 70.366-59.078 53.849-24.774-12.387-45.004-6.18-52.406 14.968-7.226 20.647 10.322 33.551 18.58 44.389'
	);
	const svgPathShadow = new Path2D(
		'M413.697 249.29c46.691-32.516 4.368-86.194-28.664-69.677-8.793 4.396-16 18.581-33.032 23.226-2.934.8-5.941.97-8.913.829-5.863 10.823-12.988 21.972-28.592 32.375-22.71 15.14-58.494 3.441-58.494-37.849s-42.667-45.419-52.989-18.581c-3.368 8.757-4.483 16.293-13.447 21.214.12.154.255.311.371.464 20.635 27.084-22.03 71.467-55.054 29.935-7.533-9.474-15.188-17.029-22.685-22.808-29.103 7.452-41.363 34.509-33.656 58.101 17.89 8.918 38.274 16.6 46.123 32.32 14.346 28.731-45.974 50.698-32.449 109.935 3.969 17.384 12.105 30.212 22.51 39.195 48.366 25.895 86.276-36.287 108.243-84.614 20.645-45.419 81.169-37.214 103.914-2.753 22.71 34.409 69.029 27.898 71.57-8.946.518-7.51 3.111-15.582 7.028-23.901-25.281-30.732-17.519-60.543 8.216-78.465'
	);

	// Couleurs pour les taches de base
	const baseColor = '#E5C985 ';
	const shadowColor = '#B99850 ';

	context.save();
	context.translate(stain.x, stain.y);
	context.scale(stain.radius / 256, stain.radius / 256); // Adapter la taille du SVG

	// Dessiner la couleur de base
	context.fillStyle = baseColor;
	context.fill(svgPathBase);

	// Dessiner l'ombre
	context.fillStyle = shadowColor;
	context.fill(svgPathShadow);

	context.restore();
}

export function drawBonus(context, bonus) {
	const svgPathBase = new Path2D(
		'M189.935 201.29c20.635 27.084-22.03 71.467-55.054 29.935-39.398-49.548-82.237-47.484-87.398-5.161-5.129 42.061 61.392 41.155 77.18 72.774 14.346 28.731-45.974 50.698-32.449 109.935 17.204 75.355 112.172 66.065 134.882 21.677 50.813-99.316 103.226-33.032 122.495-12.387 40.711 43.619 141.016-10.085 66.065-79.484-37.161-34.409-30.71-69.268-1.959-89.29 46.69-32.516 4.368-86.194-28.664-69.677-8.793 4.396-16 18.581-33.032 23.226-14.855 4.051-31.878-4.745-34.065-18.409-5.505-34.409 45.945-60.071 41.29-89.979-6.882-44.215-71.57-51.785-76.387-6.366-5.257 49.568-26.045 70.366-59.078 53.849-24.774-12.387-45.004-6.18-52.406 14.968-7.226 20.647 10.322 33.551 18.58 44.389'
	);
	const svgPathShadow = new Path2D(
		'M413.697 249.29c46.691-32.516 4.368-86.194-28.664-69.677-8.793 4.396-16 18.581-33.032 23.226-2.934.8-5.941.97-8.913.829-5.863 10.823-12.988 21.972-28.592 32.375-22.71 15.14-58.494 3.441-58.494-37.849s-42.667-45.419-52.989-18.581c-3.368 8.757-4.483 16.293-13.447 21.214.12.154.255.311.371.464 20.635 27.084-22.03 71.467-55.054 29.935-7.533-9.474-15.188-17.029-22.685-22.808-29.103 7.452-41.363 34.509-33.656 58.101 17.89 8.918 38.274 16.6 46.123 32.32 14.346 28.731-45.974 50.698-32.449 109.935 3.969 17.384 12.105 30.212 22.51 39.195 48.366 25.895 86.276-36.287 108.243-84.614 20.645-45.419 81.169-37.214 103.914-2.753 22.71 34.409 69.029 27.898 71.57-8.946.518-7.51 3.111-15.582 7.028-23.901-25.281-30.732-17.519-60.543 8.216-78.465'
	);

	// Couleurs pour les bonus
	const baseColor = bonus.type === 'VITESSE' ? '#ff5733' : '#33c1ff';
	const shadowColor = bonus.type === 'VITESSE' ? '#cc4629' : '#2a99cc';

	context.save();
	context.translate(bonus.x, bonus.y);
	context.scale(bonus.radius / 256, bonus.radius / 256); // Adapter la taille du SVG

	// Dessiner l'ombre
	context.fillStyle = shadowColor;
	context.fill(svgPathShadow);

	// Dessiner la couleur de base
	context.fillStyle = baseColor;
	context.fill(svgPathBase);

	context.restore();
}

function drawCamera(context, camera, canvasWidth, canvasHeight) {
	if (!debugCameraEnabled) return;

	const halfWidth = canvasWidth / 4 / camera.zoom; // Réduit la largeur à la moitié
	const halfHeight = canvasHeight / 4 / camera.zoom; // Réduit la hauteur à la moitié

	context.save();
	context.strokeStyle = 'yellow';
	context.lineWidth = 2;
	context.strokeRect(
		camera.x - halfWidth,
		camera.y - halfHeight,
		halfWidth * 2,
		halfHeight * 2
	);
	context.restore();
}

// ==================== RENDU PRINCIPAL ====================

export function drawGame(context, player, otherPlayers, stains, bots, camera) {
	context.save();
	const centerX = canvas.width / 2;
	const centerY = canvas.height / 2;
	context.translate(centerX, centerY);
	context.scale(camera.zoom, camera.zoom);
	context.translate(-camera.x, -camera.y);

	// Dessine le débogage de la caméra
	drawCamera(context, camera, canvas.width, canvas.height);

	// Dessine le joueur local
	drawPlayer(context, player);

	// Interpolation des autres joueurs
	const deltaTime = 1 / 60; // Temps entre deux frames (60Hz)
	for (const id in otherPlayers) {
		interpolatePlayerPosition(otherPlayers[id], deltaTime);
		drawPlayer(context, otherPlayers[id]);
	}

	// Dessine uniquement les entités visibles
	stains.forEach(entity => {
		const isVisible = debugCameraEnabled
			? isEntityVisibleInDebug(entity, camera, canvas.width, canvas.height)
			: isEntityVisible(entity, camera, canvas.width, canvas.height);

		if (isVisible) {
			if (entity.type === 'VITESSE' || entity.type === 'TAILLE') {
				drawBonus(context, entity);
			} else {
				drawStain(context, entity);
			}
		}
	});

	// Dessine uniquement les entités visibles
	bots.forEach(entity => {
		const isVisible = debugCameraEnabled
			? isEntityVisibleInDebug(entity, camera, canvas.width, canvas.height)
			: isEntityVisible(entity, camera, canvas.width, canvas.height);

		if (isVisible) {
			drawPlayer(context, entity);
		}
	});

	context.restore();
}
