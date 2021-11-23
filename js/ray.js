class Ray3 {
	constructor(origin, direction) {
		this.origin = origin;
		this.direction = direction;
	}

	getPoint(t) {
		return this.origin.add(this.direction.multiply(t));
	}
}