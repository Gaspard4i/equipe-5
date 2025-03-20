import { canvas, context, observeCanvas } from './canvas.js';
import { io } from 'socket.io-client';
import { drawPlayer } from './playerDraw.js';
import { handleKeyDown, handleKeyUp } from './input.js';
import { Camera } from './camera.js'; // Import de la caméra
//camera
//player
//stains, createNewStains

const socket = io(window.location.hostname + ':8080');

// Initialisation du joueur local
const player = {
	id: null,
	x: 100,
	y: 100,
	vx: 0,
	vy: 0,
	radius: 30,
	keys: {},
	useKeyboard: true,
	camera: new Camera(), // Utilisation de la caméra locale
};

// Liste des autres joueurs
const otherPlayers = {};

// Gestion des événements socket
socket.on('connect', () => {
	player.id = socket.id;
	console.log(`Connecté au serveur avec l'ID :`, player.id);
});

socket.on('updatePlayers', players => {
	// Met à jour les autres joueurs et le joueur local
	for (const id in players) {
		if (id === player.id) {
			Object.assign(player, players[id]); // Met à jour les données du joueur local
		} else {
			otherPlayers[id] = players[id];
		}
	}
});

socket.on('playerDisconnected', id => {
	delete otherPlayers[id];
});

// Envoi des données du joueur local au serveur
function sendPlayerData() {
	socket.emit('updatePlayer', {
		id: player.id,
		x: player.x,
		y: player.y,
		vx: player.vx,
		vy: player.vy,
		radius: player.radius,
	});
}

function draw() {
	context.save();
	const centerX = canvas.width / 2;
	const centerY = canvas.height / 2;
	context.translate(centerX, centerY);
	context.scale(player.camera.zoom, player.camera.zoom); // Utilise la caméra locale
	context.translate(-player.camera.x, -player.camera.y); // Mise à jour avec la caméra locale

	// Dessine le joueur local
	drawPlayer(context, player);

	// Dessine les autres joueurs
	for (const id in otherPlayers) {
		drawPlayer(context, otherPlayers[id]);
	}

	// Dessine les entités (taches et bonus)
	stains.forEach(entity => entity.draw(context));

	context.restore();
}

function render() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	player.camera.adjustCameraPosition(player, canvas.width, canvas.height); 
	draw();
	requestAnimationFrame(render);
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

setInterval(() => {
	sendPlayerData(); // Envoie les données du joueur au serveur
}, 1000 / 60);

observeCanvas(draw, render);

// Empêcher le zoom avec la molette et les raccourcis clavier
document.addEventListener(
	'wheel',
	function (e) {
		if (e.ctrlKey) {
			e.preventDefault();
		}
	},
	{ passive: false }
);

// Empêcher le zoom par pincement sur les appareils tactiles
document.addEventListener(
	'touchstart',
	function (e) {
		if (e.touches.length > 1) {
			e.preventDefault();
		}
	},
	{ passive: false }
);

document.addEventListener(
	'touchmove',
	function (e) {
		if (e.touches.length > 1) {
			e.preventDefault();
		}
	},
	{ passive: false }
);

// Empêcher les gestes tactiles spécifiques (iOS Safari)
document.addEventListener('gesturestart', function (e) {
	e.preventDefault();
});
document.addEventListener('gesturechange', function (e) {
	e.preventDefault();
});
document.addEventListener('gestureend', function (e) {
	e.preventDefault();
});
