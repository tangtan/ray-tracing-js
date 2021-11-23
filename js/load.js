class SourceFile {
    constructor(file) {
        var url = null;
        if (window.createObjectURL !== undefined) {
            url = window.createObjectURL(file)
        } else if (window.URL !== undefined) {
            url = window.URL.createObjectURL(file)
        } else if (window.webkitURL !== undefined) {
            url = window.webkitURL.createObjectURL(file)
        }
        this.url = url;
        this.vertexs = [];
        this.normals = [];
        // group polygons according to objects
        this.objects = {};
        this.key = null;
    }

    parse(str, scale) {
        var textLines = str.split("\n");
        for (var i in textLines) {
            var fields = textLines[i].split(" ");
            switch (fields[0]) {
                case "v":
                    this.parseVertexLine(fields, scale);
                    break;
                case "vn":
                    this.parseNormalLine(fields);
                    break;
                case "f":
                    this.parsePolygonLine(fields);
                    break;
                case "g":
                    this.parseObject(fields[1]);
                    break;
            }
        }
        return new Union(this.objects);
    }

    parseVertexLine(arr, scale) {
        var x = scale*parseFloat(arr[1]);
        var y = scale*parseFloat(arr[2]);
        var z = scale*parseFloat(arr[3]);
        this.vertexs.push(new Vector3(x, y, z));
    }

    parseNormalLine(arr) {
        var nx = parseFloat(arr[1]);
        var ny = parseFloat(arr[2]);
        var nz = parseFloat(arr[3]);
        this.normals.push(new Vector3(nx, ny, nz));
    }

    parsePolygonLine(arr) {
        var vertexs = [];
        var normals = [];
        for (var j=1, jLen=arr.length; j<jLen; j++) {
            var subFields = arr[j].split("/");
            var vertexId = parseInt(subFields[0])-1;
            var normalId = parseInt(subFields[2])-1;
            vertexs.push(this.vertexs[vertexId]);
            normals.push(this.normals[normalId]);
        }
        this.dividePolygon(vertexs, normals);
    }

    dividePolygon(vertexs, normals) {
        for (var i=1, iLen=vertexs.length-1; i<iLen; i++) {
            var tmpVerts = [vertexs[0], vertexs[i], vertexs[i+1]];
            var tmpNorms = [normals[0], normals[i], normals[i+1]];
            // var tmpPolygon = new Polygon(tmpVerts, tmpNorms);
            var tmpPolygon = new Triangle(tmpVerts, tmpNorms);
            this.objects[this.key].push(tmpPolygon);
        }
    }

    parseObject(key) {
        if ((key != "default") && (key != undefined)) {
            this.objects[key] = [];
            this.key = key;
        }
    }
}