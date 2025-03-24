export let debugCameraEnabled = false;
export let debugPlayerEnabled = false;
export let debugEntityEnable = false;
export let debugGridEnabled = false;

export function setDebugCameraMode(enabled) {
	debugCameraEnabled = enabled;
}
export function setDebugPlayerMode(enabled) {
	debugPlayerEnabled = enabled;
}
export function setDebugEntityMode(enabled) {
	debugEntityEnable = enabled;
}
export function setDebugGridMode(enabled) {
	debugGridEnabled = enabled;
}
export function isEntityVisibleInDebug(
	entity,
	camera,
	canvasWidth,
	canvasHeight
) {
	const halfWidth = canvasWidth / 4 / camera.zoom;
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

export function drawDebugPlayer(context, player) {
	context.save();
	context.strokeStyle = 'white';
	context.fillStyle = 'rgba(255, 255, 255, 0.2)';
	context.lineWidth = 3;
	context.beginPath();
	context.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
	context.fill();
	context.stroke();
	context.restore();
}

export function drawDebugEntity(context, entity) {
	context.save();
	context.strokeStyle =
		entity.type === 'VITESSE' || entity.type === 'TAILLE' ? 'yellow' : 'red';
	context.fillStyle =
		entity.type === 'VITESSE' || entity.type === 'TAILLE'
			? 'rgba(255, 255, 0, 0.2)'
			: 'rgba(255, 0, 0, 0.2)';
	context.lineWidth = 1;
	context.beginPath();
	context.arc(entity.x, entity.y, entity.radius, 0, 2 * Math.PI);
	context.fill();
	context.stroke();
	context.restore();
}

export function drawCamera(context, camera, canvasWidth, canvasHeight) {
	if (!debugCameraEnabled) return;

	const halfWidth = canvasWidth / 4 / camera.zoom;
	const halfHeight = canvasHeight / 4 / camera.zoom;

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
