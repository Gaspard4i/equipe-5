import {
	canvas,
	context,
	observeCanvas,
	drawGame,
	drawPlayer,
} from './canvas.js';
import { io } from 'socket.io-client';
import { Camera } from './camera.js';
import {
	handleKeyDown,
	handleKeyUp,
	preventZoom,
	setCurrentControlMode,
} from './input.js';
import { updateProgressBar } from './progressBar.js';
import {
	setDebugCameraMode,
	setDebugPlayerMode,
	setDebugEntityMode,
	setDebugGridMode,
} from './debug.js';
const DEBUG = false;

export const socket = io(window.location.origin);

const stains = [];
const currentPlayer = {};
export const camera = new Camera();
const otherPlayers = {};
let isPlayerDead = false;
let globalLeaderboard = [];

// Variable globale pour stocker le dessin personnalisé
let playerCustomDrawing = null;

// Gestion des événements socket
function setupSocketEvents() {
	socket.on('connect', () => {
		console.log(`Connecté au serveur avec l'ID :`, socket.id);
	});

	socket.on('updatePlayers', players => updatePlayers(players));
	socket.on('updateStains', serverStains => updateStains(serverStains));
	socket.on('playerDisconnected', id => delete otherPlayers[id]);
	socket.on('updateLeaderboard', newPB => updateLeaderboard(newPB));
}

// Met à jour les joueurs
function updatePlayers(players) {
	for (const id in otherPlayers) {
		if (!players[id]) {
			delete otherPlayers[id];
		}
	}
	for (const id in players) {
		if (id === socket.id) {
			const existingDrawing = currentPlayer.customDrawing;
			Object.assign(currentPlayer, players[id]);
			if (existingDrawing && !currentPlayer.customDrawing) {
				currentPlayer.customDrawing = existingDrawing;
			}
			updateProgressBar(currentPlayer.score || 0, globalLeaderboard);
		} else {
			const existingDrawing =
				otherPlayers[id] && otherPlayers[id].customDrawing;
			otherPlayers[id] = players[id];
			if (existingDrawing && !otherPlayers[id].customDrawing) {
				otherPlayers[id].customDrawing = existingDrawing;
			}
		}
	}
}

// Met à jour les taches
function updateStains(serverStains) {
	if (serverStains && Array.isArray(serverStains.stains)) {
		stains.length = 0;
		stains.push(...serverStains.stains);
	} else {
		console.error(
			'Les données reçues pour les taches ne sont pas valides :',
			serverStains
		);
	}
}

function updateLeaderboard(newLeaderboard) {
	const scores = Object.values(newLeaderboard);
	scores.sort((a, b) => b.score - a.score);
	globalLeaderboard = [...scores];
	updateMainLeaderboard(scores);
	updateMiniLeaderboard(scores);
}

function updateMainLeaderboard(scores) {
	const leaderboardTable = document.querySelector('#score-screen table tbody');
	if (!leaderboardTable) return;
	leaderboardTable.innerHTML = '';
	for (let i = 0; i < scores.length; i++) {
		const entry = scores[i];
		const row = document.createElement('tr');
		if (i === 0) row.classList.add('first');
		else if (i === 1) row.classList.add('second');
		else if (i === 2) row.classList.add('third');
		row.innerHTML = `
            <td>${entry.pseudo}</td>
            <td>${entry.score.toLocaleString()}</td>
            <td>${entry.date}</td>
        `;
		leaderboardTable.appendChild(row);
	}
}

function updateMiniLeaderboard(scores) {
	const miniLeaderboardTable = document.querySelector(
		'#mini-score-screen table tbody'
	);
	if (!miniLeaderboardTable) return;
	miniLeaderboardTable.innerHTML = '';
	const maxEntries = Math.min(scores.length, 3);
	if (maxEntries === 0) {
		const row = document.createElement('tr');
		row.innerHTML = `
			<td colspan="2">Pas encore de scores</td>
		`;
		miniLeaderboardTable.appendChild(row);
		return;
	}
	for (let i = 0; i < maxEntries; i++) {
		const entry = scores[i];
		const row = document.createElement('tr');
		if (i === 0) row.classList.add('first');
		else if (i === 1) row.classList.add('second');
		else if (i === 2) row.classList.add('third');
		row.innerHTML = `
			<td>${entry.pseudo}</td>
			<td>${entry.score.toLocaleString()} pts</td>
		`;
		miniLeaderboardTable.appendChild(row);
	}
}

socket.on('playerDisconnected', id => {
	delete otherPlayers[id];
});

socket.on('lost', score => {
	const gameOverScreen = document.querySelector('.game-over-screen');
	updateProgressBar(score || 0, globalLeaderboard);
	gameOverScreen.classList.remove('hidden');
	isPlayerDead = true;
});

let fpsCounter = 0;
let lastFpsUpdate = 0;
let currentFps = 0;
let fpsDisplayEnabled = false;

function render() {
	context.clearRect(0, 0, canvas.width, canvas.height);

	if (canvas.classList.contains('background')) {
		camera.x = 6000;
		camera.y = 2500;
		camera.zoom = Math.min(canvas.width / 12000, canvas.height / 5000) * 5;
		drawGame(context, {}, otherPlayers, stains, [], camera);
	} else if (!isPlayerDead) {
		camera.adjustCameraPosition(currentPlayer, canvas.width, canvas.height);
		camera.zoom *= 1.1;
		drawGame(context, currentPlayer, otherPlayers, stains, [], camera);
	} else {
		drawGame(context, {}, otherPlayers, stains, [], camera);
	}

	fpsCounter++;
	const now = performance.now();
	if (now - lastFpsUpdate >= 1000) {
		currentFps = Math.round((fpsCounter * 1000) / (now - lastFpsUpdate));
		fpsCounter = 0;
		lastFpsUpdate = now;
		if (fpsDisplayEnabled) {
			const fpsDisplay = document.getElementById('fps-counter');
			fpsDisplay.textContent = `${currentFps} FPS`;
		}
	}

	requestAnimationFrame(render);
}

function setupGlobalEvents() {
	document.addEventListener('keydown', event => {
		const activeElement = document.activeElement;
		if (activeElement && activeElement.tagName === 'INPUT') return;
		if (!canvas.classList.contains('background') && event.key !== 'Escape') {
			handleKeyDown(event);
		}
	});

	document.addEventListener('keyup', event => {
		const activeElement = document.activeElement;
		if (activeElement && activeElement.tagName === 'INPUT') return;
		if (!canvas.classList.contains('background')) {
			handleKeyUp(event);
		}
	});

	preventZoom();
}

function setupSettingsButton() {
	const settingsIcon = document.querySelector(
		'.menu-options img[alt="Réglages"]'
	);
	const settingsPanel = document.getElementById('settings-panel');
	const closeSettingsButton = document.getElementById('close-settings');

	settingsIcon.addEventListener('click', () => {
		settingsPanel.classList.remove('hidden');
	});

	closeSettingsButton.addEventListener('click', () => {
		settingsPanel.classList.add('hidden');
	});

	document.addEventListener('mousedown', event => {
		if (
			!settingsPanel.classList.contains('hidden') &&
			!settingsPanel.contains(event.target) &&
			event.target !== settingsIcon
		) {
			settingsPanel.classList.add('hidden');
		}
	});

	const controlToggle = document.getElementById('control-toggle');
	const keyboardInfo = document.querySelector('.keyboard-info');
	const mouseInfo = document.querySelector('.mouse-info');

	controlToggle.addEventListener('change', () => {
		if (controlToggle.checked) {
			keyboardInfo.classList.add('hidden');
			mouseInfo.classList.remove('hidden');
			setControlMode('mouse');
		} else {
			mouseInfo.classList.add('hidden');
			keyboardInfo.classList.remove('hidden');
			setControlMode('keyboard');
		}
	});

	const fpsToggle = document.getElementById('fps-toggle');
	const fpsCounterEl = document.getElementById('fps-counter');

	fpsToggle.addEventListener('change', () => {
		if (fpsToggle.checked) {
			fpsCounterEl.classList.remove('hidden');
			fpsDisplayEnabled = true;
		} else {
			fpsCounterEl.classList.add('hidden');
			fpsDisplayEnabled = false;
		}
		localStorage.setItem('fpsDisplay', fpsToggle.checked);
	});

	const savedFpsDisplay = localStorage.getItem('fpsDisplay') === 'true';
	fpsToggle.checked = savedFpsDisplay;
	fpsDisplayEnabled = savedFpsDisplay;
	if (savedFpsDisplay) {
		fpsCounterEl.classList.remove('hidden');
	} else {
		fpsCounterEl.classList.add('hidden');
	}

	const customAlienButton = document.getElementById('custom-alien-button');

	customAlienButton.addEventListener('click', event => {
		event.preventDefault();
		settingsPanel.classList.add('hidden');
		document.getElementById('custom-alien-screen').classList.remove('hidden');
		initCustomAlienCanvas();
	});

	document.getElementById('custom-alien-back').addEventListener('click', () => {
		document.getElementById('custom-alien-screen').classList.add('hidden');
	});
}

function initCustomAlienCanvas() {
	const customCanvas = document.querySelector('.customAlien');
	const ctx = customCanvas.getContext('2d');
	customCanvas.width = 300;
	customCanvas.height = 300;

	let isDrawing = false;
	let lastX = 0;
	let lastY = 0;

	const colorPicker = document.getElementById('drawing-color');
	const brushSize = document.getElementById('brush-size');
	const clearButton = document.getElementById('clear-drawing');
	const saveButton = document.getElementById('save-drawing');

	const drawingCanvas = document.createElement('canvas');
	drawingCanvas.width = customCanvas.width;
	drawingCanvas.height = customCanvas.height;
	const drawingCtx = drawingCanvas.getContext('2d');

	const savedDrawing = localStorage.getItem('playerCustomDrawing');
	if (savedDrawing) {
		const savedImage = new Image();
		savedImage.onload = () => {
			drawingCtx.drawImage(savedImage, 0, 0);
		};
		savedImage.src = savedDrawing;
	}

	const previewPlayer = {
		x: customCanvas.width / 2,
		y: customCanvas.height / 2,
		radius: 80,
		direction: 0,
		color: currentPlayer.color || '#3498db',
		eyes: currentPlayer.eyes || 'default',
		mouth: currentPlayer.mouth || 'default',
		pseudo: currentPlayer.pseudo || 'Aperçu',
		accelerating: false,
	};

	function draw(e) {
		if (!isDrawing) return;
		const rect = customCanvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		drawingCtx.lineJoin = 'round';
		drawingCtx.lineCap = 'round';
		drawingCtx.strokeStyle = colorPicker.value;
		drawingCtx.lineWidth = brushSize.value;
		drawingCtx.beginPath();
		drawingCtx.moveTo(lastX, lastY);
		drawingCtx.lineTo(x, y);
		drawingCtx.stroke();
		lastX = x;
		lastY = y;
	}

	customCanvas.addEventListener('mousedown', e => {
		isDrawing = true;
		const rect = customCanvas.getBoundingClientRect();
		lastX = e.clientX - rect.left;
		lastY = e.clientY - rect.top;
	});

	customCanvas.addEventListener('mousemove', draw);
	customCanvas.addEventListener('mouseup', () => { isDrawing = false; });
	customCanvas.addEventListener('mouseout', () => { isDrawing = false; });

	clearButton.addEventListener('click', () => {
		drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
	});

	saveButton.addEventListener('click', () => {
		const imageData = drawingCanvas.toDataURL('image/png');
		localStorage.setItem('playerCustomDrawing', imageData);
		playerCustomDrawing = imageData;
		const notification = document.createElement('div');
		notification.className = 'save-notification';
		notification.textContent = 'Dessin sauvegardé !';
		document.querySelector('.custom-alien-content').appendChild(notification);
		setTimeout(() => { notification.remove(); }, 2000);
	});

	function animatePreview() {
		ctx.clearRect(0, 0, customCanvas.width, customCanvas.height);
		previewPlayer.direction = Math.sin(Date.now() / 1000) * 0.5;
		previewPlayer.accelerating = Math.sin(Date.now() / 500) > 0;
		drawPlayer(ctx, previewPlayer);
		ctx.drawImage(drawingCanvas, 0, 0);
		requestAnimationFrame(animatePreview);
	}

	animatePreview();
}

function setControlMode(mode) {
	localStorage.setItem('controlMode', mode);
	setCurrentControlMode(mode);
}

function initControlMode() {
	const savedMode = localStorage.getItem('controlMode') || 'keyboard';
	const controlToggle = document.getElementById('control-toggle');

	if (savedMode === 'mouse') {
		controlToggle.checked = true;
		document.querySelector('.keyboard-info').classList.add('hidden');
		document.querySelector('.mouse-info').classList.remove('hidden');
	} else {
		controlToggle.checked = false;
		document.querySelector('.mouse-info').classList.add('hidden');
		document.querySelector('.keyboard-info').classList.remove('hidden');
	}

	setControlMode(savedMode);
}

setDebugCameraMode(DEBUG);
setDebugPlayerMode(DEBUG);
setDebugEntityMode(DEBUG);
setDebugGridMode(DEBUG);

function setupToggleMenuButton() {
	const toggleMenuBtn = document.querySelector('#toggle-menu-btn');
	const startScreen = document.querySelector('#start-screen');
	const startGameButton = document.querySelector('#start-game');

	toggleMenuBtn.addEventListener('click', event => {
		event.preventDefault();
		if (startScreen.classList.contains('hidden')) {
			startScreen.classList.remove('hidden');
			startScreen.classList.add('overlay');
			startGameButton.textContent = 'Quitter';
		} else {
			startScreen.classList.add('hidden');
			startScreen.classList.remove('overlay');
			if (!isPlayerDead) {
				startGameButton.textContent = 'Jouer';
			}
		}
	});

	document.addEventListener('keydown', event => {
		if (event.key === 'Escape' && !canvas.classList.contains('background')) {
			toggleMenuBtn.click();
		}
	});
}

function setupStartButton() {
	const startGameButton = document.querySelector('#start-game');

	startGameButton.addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('#start-screen');
		if (startScreen.classList.contains('overlay')) {
			quitGame();
		} else {
			startGame();
		}
	});

	document.querySelector('#credits-button').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const creditsScreen = document.querySelector('.credits-screen');
		startScreen.classList.add('hidden');
		creditsScreen.classList.remove('hidden');
	});

	document.querySelector('#score-button').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const scoreScreen = document.querySelector('.score-screen');
		startScreen.classList.add('hidden');
		scoreScreen.classList.remove('hidden');
	});

	document.querySelector('#about-button').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const aboutScreen = document.querySelector('.about-screen');
		startScreen.classList.add('hidden');
		aboutScreen.classList.remove('hidden');
	});

	document.querySelector('#contact-button').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const contactScreen = document.querySelector('.contact-screen');
		startScreen.classList.add('hidden');
		contactScreen.classList.remove('hidden');
	});

	document.querySelector('#credits-back').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const creditsScreen = document.querySelector('.credits-screen');
		startScreen.classList.remove('hidden');
		creditsScreen.classList.add('hidden');
	});

	document.querySelector('#score-back').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const scoreScreen = document.querySelector('.score-screen');
		startScreen.classList.remove('hidden');
		scoreScreen.classList.add('hidden');
	});

	document.querySelector('#about-back').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const aboutScreen = document.querySelector('.about-screen');
		startScreen.classList.remove('hidden');
		aboutScreen.classList.add('hidden');
	});

	document.querySelector('#contact-back').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const contactScreen = document.querySelector('.contact-screen');
		startScreen.classList.remove('hidden');
		contactScreen.classList.add('hidden');
	});

	document.querySelector('#back-to-home').addEventListener('click', event => {
		event.preventDefault();
		const startScreen = document.querySelector('.start-screen');
		const gameOverScreen = document.querySelector('.game-over-screen');
		startScreen.classList.remove('hidden');
		gameOverScreen.classList.add('hidden');
	});

	document.querySelector('#restart-game').addEventListener('click', event => {
		event.preventDefault();
		const gameOverScreen = document.querySelector('.game-over-screen');
		gameOverScreen.classList.add('hidden');
		startGame();
	});
}

function quitGame() {
	const startScreen = document.querySelector('#start-screen');
	const canvas = document.querySelector('.gameCanvas');
	const score = document.querySelector('.score');
	const toggleMenuBtn = document.querySelector('#toggle-menu-btn');
	const startGameButton = document.querySelector('#start-game');

	startScreen.classList.remove('overlay');
	canvas.classList.add('background');
	score.classList.add('hidden');
	toggleMenuBtn.classList.add('hidden');
	startGameButton.textContent = 'Jouer';

	socket.emit('leaveGame');

	Object.keys(currentPlayer).forEach(key => delete currentPlayer[key]);
	Object.keys(otherPlayers).forEach(id => delete otherPlayers[id]);

	isPlayerDead = false;
}

function startGame() {
	const startScreen = document.querySelector('#start-screen');
	const canvas = document.querySelector('.gameCanvas');
	const score = document.querySelector('.score');
	const pseudoInput = document.querySelector('#player-pseudo');
	const pseudo = pseudoInput.value.trim() || 'Joueur';
	const toggleMenuBtn = document.querySelector('#toggle-menu-btn');
	const startGameButton = document.querySelector('#start-game');

	startScreen.classList.add('hidden');
	canvas.classList.remove('background');
	score.classList.remove('hidden');
	toggleMenuBtn.classList.remove('hidden');
	isPlayerDead = false;

	if (!playerCustomDrawing) {
		playerCustomDrawing = localStorage.getItem('playerCustomDrawing');
	}

	console.log(
		'Envoi du dessin personnalisé:',
		playerCustomDrawing ? 'Oui' : 'Non'
	);

	const gameData = {
		pseudo: pseudo,
		startTime: Date.now(),
	};

	if (playerCustomDrawing) {
		gameData.customDrawing = playerCustomDrawing;
		currentPlayer.customDrawing = playerCustomDrawing;
	}

	socket.emit('joinGame', gameData);
}

function init() {
	setupSocketEvents();
	setupGlobalEvents();
	setupStartButton();
	setupSettingsButton();
	setupToggleMenuButton();

	document.addEventListener('DOMContentLoaded', () => {
		initControlMode();
	});

	observeCanvas(() => {}, render);
}

init();
