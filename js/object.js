class Sphere {
	constructor(center, radius) {
		this.center = center;
		this.radius = radius;
		this.sqrRadius = this.radius*this.radius;
	}

	intersect(ray) {
        var v = ray.origin.subtract(this.center);
        var a0 = v.sqrLength() - this.sqrRadius;
        var DdotV = ray.direction.dot(v);

        if (DdotV <= 0) {
            var discr = DdotV * DdotV - a0;
            if (discr >= 0) {
                var result = new IntersectResult();
                result.geometry = this;
                result.distance = -DdotV - Math.sqrt(discr);
                result.position = ray.getPoint(result.distance);
                result.normal = result.position.subtract(this.center).normalize();
                return result;
            }
        }
 
        return IntersectResult.noHit;
	}
}

class Plane {
	constructor(normal, d) {
		this.normal = normal;
		this.d = d;
	}

	intersect(ray) {
		var a = ray.direction.dot(this.normal);
		if (a >= 0) {
			return IntersectResult.noHit;
		}

		var b = this.d+this.normal.dot(ray.origin);
		var result = new IntersectResult();
		result.geometry = this;
		result.distance = -b/a;
		result.position = ray.getPoint(result.distance);
		result.normal = this.normal;
		return result;
	}
}

// Not Efficient
class Polygon {
	constructor(vertexs, normals) {
		this.vertexs = vertexs;
		this.normals = normals;
		var vertex0 = vertexs[0];
		var vertex1 = vertexs[1];
		var vertex2 = vertexs[2];
		var delta01 = vertex1.subtract(vertex0);
		var delta02 = vertex2.subtract(vertex0);
		// The normal of triangle patch matches the normal of vertexs???
		var normal = delta01.cross(delta02);
		this.normal = normal.normalize();
		// this.isOutside(this.normal);
		this.d = vertex1.dot(this.normal);
	}

	isOutside(n) {
		var n1 = this.normals[0].multiply(0.333);
		var n2 = this.normals[1].multiply(0.333);
		var n3 = this.normals[2].multiply(0.333);
		var _n = n1.add(n2.add(n3));
		if (n.dot(_n) < 0) {
			console.log("Normal Toward Inside");
		}
	}

	intersect(ray) {
		var a = ray.direction.dot(this.normal);
		if (a >= 0) {
			return IntersectResult.noHit;
		}

		var b = this.d+this.normal.dot(ray.origin);
		var result = new IntersectResult();
		result.geometry = this;
		result.distance = -b/a;
		if (result.distance < 0) {
			console.log("t<0");
		}
		result.position = ray.getPoint(result.distance);
		var flag = this.isInTriangle(result.position);

		if (flag[0] == 1) {
			// constant shading
			result.normal = this.normal;
			// phong shading
			result.normal = this.interpolate(flag[1], flag[2]);
			return result;
		} else {
			return IntersectResult.noHit;
		}
	}

	// both inside and on the border
	isInTriangle(p) {
		var error = 0;
		var result = [0, 0, 0];

		if (this.vertexs.length > 3) {
			console.warn("The patch is not triangle!");
			return result;
		}
		var v0 = this.vertexs[2].subtract(this.vertexs[0]);
		var v1 = this.vertexs[1].subtract(this.vertexs[0]);
		var v2 = p.subtract(this.vertexs[0]);

		var dot00 = v0.dot(v0);
		var dot01 = v0.dot(v1);
		var dot02 = v0.dot(v2);
		var dot11 = v1.dot(v1);
		var dot12 = v1.dot(v2);

		var inverDeno = 1 / (dot00 * dot11 - dot01 * dot01);

		var u = (dot11 * dot02 - dot01 * dot12) * inverDeno;
		if (u < 0 || u > 1) {
		    return result;
		}

		var v = (dot00 * dot12 - dot01 * dot02) * inverDeno;
		if (v < 0 || v > 1) {
		    return result;
		}

		if (u+v <= 1) {
			result = [1, u, v];
		}
		return result;
	}

	interpolate(u, v) {
		var norm0 = this.normals[0].multiply(1-u-v);
		var norm1 = this.normals[1].multiply(v);
		var norm2 = this.normals[2].multiply(u);
		return norm1.add(norm2.add(norm0));
	}
}

class Triangle {
	constructor(vertexs, normals) {
		this.vertexs = vertexs;
		this.normals = normals;
	}

	intersect(ray) {
		var orig = ray.origin;
		var dir = ray.direction;

		var v0 = this.vertexs[0];
		var v1 = this.vertexs[1];
		var v2 = this.vertexs[2];

		var E1 = v1.subtract(v0);
		var E2 = v2.subtract(v0);
		var P = dir.cross(E2);
		var det = E1.dot(P);

		if (det > 0) {
			var T = orig.subtract(v0);
		} else {
			var T = v0.subtract(orig);
			det = -det;
		}

		if (det < 1e-4) {
			return IntersectResult.noHit;
		}

		var u = T.dot(P);
		if (u < 1e-4 || u > det) {
			return IntersectResult.noHit;
		}

		var Q = T.cross(E1);
		var v = dir.dot(Q);
		if (v < 1e-4 || u+v > det) {
			return IntersectResult.noHit;
		}

		var t = E2.dot(Q);

		var inver = 1.0/det;
		t *= inver;
		u *= inver;
		v *= inver;

		var result = new IntersectResult();

		result.geometry = this;
		result.distance = t;
		result.position = ray.getPoint(t);
		result.normal = this.interpolate(v, u);

		return result;
	}

	interpolate(u, v) {
		var norm0 = this.normals[0].multiply(1-u-v);
		var norm1 = this.normals[1].multiply(v);
		var norm2 = this.normals[2].multiply(u);
		return norm1.add(norm2.add(norm0));
	}
}

class IntersectResult {
	constructor() {
		this.geometry = null;
		this.distance = 0;
		this.position = Vector3.zero;
		this.normal = Vector3.zero;
	}
}

IntersectResult.noHit = new IntersectResult();

class Union {
	constructor(objects) {
		this.objects = objects;
	}

	intersect(ray) {
		var minDistance = Infinity;
		var minResult = IntersectResult.noHit;
		for (var key in this.objects) {
			var geometries = this.objects[key];
			for (var i in geometries) {
				var result = geometries[i].intersect(ray);
				if (result.geometry && result.distance < minDistance) {
					minDistance = result.distance;
					minResult = result;
				}
			}
		}
		return minResult;
	}
}
