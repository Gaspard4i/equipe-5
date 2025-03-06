const canvas = document.querySelector('.gameCanvas');
const context = canvas.getContext('2d');

context.moveTo(0, 0);
context.beginPath();
context.arc(
	canvas.getAttribute('width') / 2,
	canvas.getAttribute('height') / 2,
	10,
	0,
	2 * Math.PI
);
context.fill();
context.stroke();
