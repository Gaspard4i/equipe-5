import { canvas, context, observeCanvas, drawGame } from './canvas.js';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8080');

let gameState = { players: [], stains: [] };

socket.on('gameState', state => {
	gameState = state;
});

function render() {
	drawGame(context, gameState);
	requestAnimationFrame(render);
}

observeCanvas(() => {}, render);
