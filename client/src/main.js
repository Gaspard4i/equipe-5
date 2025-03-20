import { canvas, context, observeCanvas, drawGame } from './canvas.js';
import { io } from 'socket.io-client';
import { Camera } from './camera.js'; // Import de la caméra
//camera
//player
//stains, createNewStains

const socket = io(window.location.hostname + ':8080');

const stains = []; // Liste des entités (taches et bonus)

// Initialisation du joueur local
const currentPlayer = {
	id: null,
	x: 100,
	y: 100,
	vx: 0,
	vy: 0,
	radius: 30,
	keys: {},
	useKeyboard: true,
};

const camera = new Camera();

// Liste des autres joueurs
const otherPlayers = {};

// Gestion des événements socket
socket.on('connect', () => {
	currentPlayer.id = socket.id;
	console.log(`Connecté au serveur avec l'ID :`, currentPlayer.id);
});

socket.on('updatePlayers', players => {
	// Met à jour les autres joueurs et le joueur	 local
	console.log(players)
	for (const player in players) {
		console.log("id " + player.id);
		if (player.id === currentPlayer.id) {
			Object.assign(currentPlayer, players[player.id]); // Met à jour les données du joueur local
		} else {
			console.log("else");
			otherPlayers[player.id] = players[player.id];
		}
	}
});

socket.on('updateStains', serverStains => {
	// Vérifie si serverStains.stains est un tableau avant de le décomposer
	if (serverStains && Array.isArray(serverStains.stains)) {
		stains.length = 0;
		stains.push(...serverStains.stains);
	} else {
		console.error(
			'Les données reçues pour les taches ne sont pas valides :',
			serverStains
		);
	}
});

socket.on('playerDisconnected', id => {
	delete otherPlayers[id];
});

// Envoi des données du joueur local au serveur
function sendPlayerData() {
	socket.emit('updatePlayer', {
		id: currentPlayer.id,
		x: currentPlayer.x,
		y: currentPlayer.y,
		vx: currentPlayer.vx,
		vy: currentPlayer.vy,
		radius: currentPlayer.radius,
	});
}

function render() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	camera.adjustCameraPosition(currentPlayer, canvas.width, canvas.height);
	drawGame(context, currentPlayer, otherPlayers, stains, camera); // Ajout de camera
	requestAnimationFrame(render);
}

observeCanvas(() => {}, render);
