//je vais pas mentir j'ai regardé un tuto et je me suis aidé de l'ia: -Gaspard
export class Grid {
	constructor(chunkSize, width, height) {
		this.chunkSize = chunkSize;
		this.cols = Math.ceil(width / chunkSize);
		this.rows = Math.ceil(height / chunkSize);
		this.grid = Array.from({ length: this.cols }, () =>
			Array.from({ length: this.rows }, () => [])
		);
	}

	clear() {
		for (let col = 0; col < this.cols; col++) {
			for (let row = 0; row < this.rows; row++) {
				this.grid[col][row] = [];
			}
		}
	}

	addEntity(entity) {
		const minCol = Math.floor((entity.x - entity.radius) / this.chunkSize);
		const maxCol = Math.floor((entity.x + entity.radius) / this.chunkSize);
		const minRow = Math.floor((entity.y - entity.radius) / this.chunkSize);
		const maxRow = Math.floor((entity.y + entity.radius) / this.chunkSize);

		for (
			let col = Math.max(0, minCol);
			col <= Math.min(this.cols - 1, maxCol);
			col++
		) {
			for (
				let row = Math.max(0, minRow);
				row <= Math.min(this.rows - 1, maxRow);
				row++
			) {
				this.grid[col][row].push(entity);
			}
		}
	}

	// récup les entités proches d'une autre entité donnée
	getNearbyEntities(entity) {
		const nearbyEntities = [];
		const minCol = Math.floor((entity.x - entity.radius) / this.chunkSize);
		const maxCol = Math.floor((entity.x + entity.radius) / this.chunkSize);
		const minRow = Math.floor((entity.y - entity.radius) / this.chunkSize);
		const maxRow = Math.floor((entity.y + entity.radius) / this.chunkSize);

		for (
			let col = Math.max(0, minCol);
			col <= Math.min(this.cols - 1, maxCol);
			col++
		) {
			for (
				let row = Math.max(0, minRow);
				row <= Math.min(this.rows - 1, maxRow);
				row++
			) {
				nearbyEntities.push(...this.grid[col][row]);
			}
		}

		return nearbyEntities;
	}
}
