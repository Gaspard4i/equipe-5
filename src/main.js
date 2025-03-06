const canvas = document.querySelector('.gameCanvas');
const context = canvas.getContext('2d');
let x = 0;
let y = 0;
let vx = 0;
let vy = 0;

const canvasResizeObserver = new ResizeObserver(() => resampleCanvas());
canvasResizeObserver.observe(canvas);

function resampleCanvas() {
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	draw();
}

function draw() {
	context.moveTo(0, 0);
	context.beginPath();
	context.arc(canvas.width / 2, canvas.height / 2, 30, 0, 2 * Math.PI);
	context.fill();
	context.stroke();
}

const tache1 = new Image();
tache1.src = '/image/stain.png';
tache1.addEventListener('load', event => {
	context.drawImage(tache1, 200, 200, 40, 40);
	console.log('loaded');
});
