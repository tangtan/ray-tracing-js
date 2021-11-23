class PerspectiveCamera {
	constructor(eye, front, up, fov) {
		this.eye = eye;
		this.front = front;
		this.refUp = up;
		this.fov = fov;
		this.right = front.cross(up);
		this.up = this.right.cross(front);
		this.fovScale = Math.tan(fov*0.5*Math.PI/180)*2;
	}

	generateRay(x, y) {
		var r = this.right.multiply((x-0.5)*this.fovScale);
		var u = this.up.multiply((y-0.5)*this.fovScale);
		return new Ray3(this.eye, this.front.add(r).add(u).normalize());
	}
}