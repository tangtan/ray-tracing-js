class Color {
	constructor(r, g, b) {
		this.r = r;
		this.g = g;
		this.b = b;
	}

	copy() {
		return new Color(this.r, this.g, this.b);
	}

	add(c) {
		return new Color(this.r+c.r, this.g+c.g, this.b+c.b);
	}

	multiply(s) {
		return new Color(this.r*s, this.g*s, this.b*s);
	}

	modulate(c) {
		return new Color(this.r*c.r, this.g*c.g, this.b*c.b);
	}
}

Color.black = new Color(0,0,0);
Color.white = new Color(1,1,1);
Color.red = new Color(1,0,0);
Color.green = new Color(0,1,0);
Color.blue = new Color(0,0,1);

class LightSample {
	constructor(L, EL) {
		// then normalized opposition direction of incident light 
		this.L = L;
		// incident light intensity
		this.EL = EL;
	}
}

// shadow
LightSample.zero = new LightSample(Vector3.zero, Color.black);

class DirectionalLight {
	constructor(direction, irradiance) {
		this.irradiance = irradiance;
		this.direction = direction;
		this.L = direction.normalize().negate();
		this.shadow = false;
	}

	sample(scene, position) {
		// shadow test
		if (this.shadow) {
			var shadowRay = new Ray3(position, this.L);
			var shadowResult = scene.intersect(shadowRay);
			if (shadowResult.geometry) {
				return LightSample.zero;
			}
		}
		return new LightSample(this.L, this.irradiance);
	}
}

class PointLight {
	constructor(position, irradiance) {
		this.position = position;
		this.irradiance = irradiance;
		this.shadow = false;
	}

	sample(scene, position) {
		var delta = this.position.subtract(position);
		var rr = delta.sqrLength();
		var r = Math.sqrt(rr);
		var L = delta.divide(r);

		// shadow test
		if (this.shadow) {
			var shadowRay = new Ray3(position, this.L);
			var shadowResult = scene.intersect(shadowRay);
			if (shadowResult.geometry && shadowResult.distance <= r) {
				return LightSample.zero;
			}
		}

		// var attenuation = 1/rr;
		var attenuation = 1/Math.sqrt(r);
		return new LightSample(L, this.irradiance.multiply(attenuation*10));
	}
}