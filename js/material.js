class CheckerMaterial {
	constructor(scale, reflectiveness) {
		this.scale = scale;
		this.reflectiveness = reflectiveness;
	}

	sample(ray, position, normal) {
		return Math.abs((Math.floor(position.x * 0.1) + Math.floor(position.z * this.scale)) % 2) < 1 ? Color.black : Color.white;
	}
}

class PhongMaterial {
	constructor(ambient, diffuse, specular, shininess, reflectiveness) {
		this.ambient = ambient;
		this.diffuse = diffuse;
		this.specular = specular;
		this.shininess = shininess;
		this.reflectiveness = reflectiveness;
	}

	sample(ray, position, normal, light) {
        var ambientTerm = this.ambient.modulate(this.diffuse.multiply(0.1));

        var NdotL = normal.dot(light.L);
        var diffuseTerm = this.diffuse.multiply(Math.max(NdotL, 0));

        var H = (light.L.subtract(ray.direction)).normalize();
        var NdotH = normal.dot(H);
        var specularTerm = this.specular.multiply(Math.pow(Math.max(NdotH, 0), this.shininess));
        
        return ambientTerm.add(light.EL.modulate(diffuseTerm.add(specularTerm)));
	}
}