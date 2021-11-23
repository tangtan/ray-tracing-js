// Depth Test
function renderDepth() {
    var myCanvas = document.getElementById("drawing");
    var myContext = myCanvas.getContext("2d");
    var width = myCanvas.clientWidth;
    var height = myCanvas.clientHeight;
    // myContext.fillStyle = "rgb(0,0,0)";
    // myContext.fillRect(0, 0, 200, 200);
    var imageData = myContext.getImageData(0, 0, 200, 200);
    var w = imageData.width;
    var h = imageData.height;
    var pixels = imageData.data;

    var mySphere = new Sphere(new Vector3(0, 10, -10), 10);
    var myCamera = new PerspectiveCamera(new Vector3(0, 10, 10), new Vector3(0, 0, -1), new Vector3(0, -1, 0), 90);
    var maxDepth = 20;

    var i = 0;

    for(var y = 0; y < h; y++) {
        var sy = 1-y/h;
        for (var x = 0; x < w; x++) {
            var sx = x/w;
            var sampleRay = myCamera.generateRay(sx, sy);
            var result = mySphere.intersect(sampleRay);
            if (result.geometry) {
                var depth = parseInt(255-Math.min((result.distance/maxDepth)*255, 255));
                pixels[i] = depth;
                pixels[i+1] = depth;
                pixels[i+2] = depth;
                pixels[i+3] = 255;
            }
            i += 4;
        }
    }

    myContext.putImageData(imageData, 0, 0);
}

function rayCasting(canvas, scene, camera, source, samples) {
    var ctx = canvas.getContext("2d");
    var imageData = ctx.getImageData(0, 0, 200, 200);
    var w = imageData.width;
    var h = imageData.height;
    var pixels = imageData.data;

    var i = 0;

    for(var y = 0; y < h; y++) {
        // var sy = 1-y/h;
        for (var x = 0; x < w; x++) {
            // var sx = x/w;
            var rgbBuffer = [];
            var rgb = [0,0,0];
            var inver = 1.0/samples;
            for (var k = 0; k < samples; k++) {
                var jitterX = Math.random()-0.5;
                var jitterY = Math.random()-0.5;
                var sx = (x+jitterX)/w;
                var sy = 1-(y+jitterY)/h;
                var sampleRay = camera.generateRay(sx, sy);
                var result = scene.intersect(sampleRay);
                if (result.geometry) {
                    var light = source.sample(scene, result.position);
                    var color = result.geometry.material.sample(sampleRay, result.position, result.normal, light);
                    rgbBuffer.push([color.r, color.g, color.b]);
                    rgb[0] += color.r*inver;
                    rgb[1] += color.g*inver;
                    rgb[2] += color.b*inver;
                }
            }
            if (rgbBuffer.length > 0) {
                pixels[i] = Math.floor(rgb[0]*255);
                pixels[i+1] = Math.floor(rgb[1]*255);
                pixels[i+2] = Math.floor(rgb[2]*255);
                pixels[i+3] = 255;
            }
            i += 4;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function rayTracing(canvas, scene, camera, maxReflect) {
    var ctx = canvas.getContext("2d");
    var imageData = ctx.getImageData(0, 0, 500, 500);
    var w = imageData.width;
    var h = imageData.height;
    var pixels = imageData.data;

    var i = 0;

    for(var y = 0; y < h; y++) {
        var sy = 1-y/h;
        for (var x = 0; x < w; x++) {
            var sx = x/w;
            var sampleRay = camera.generateRay(sx, sy);
            var result = scene.intersect(sampleRay);
            if (result.geometry) {
                var color = rayTraceRecursive(scene, sampleRay, maxReflect);
                pixels[i] = Math.floor(color.r*255);
                pixels[i+1] = Math.floor(color.g*255);
                pixels[i+2] = Math.floor(color.b*255);
                pixels[i+3] = 255;
            }
            i += 4;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function rayTraceRecursive(scene, ray, maxReflect) {
    var result = scene.intersect(ray);

    if (result.geometry) {
        var reflectiveness = result.geometry.material.reflectiveness;
        var color = result.geometry.material.sample(ray, result.position, result.normal);
        color = color.multiply(1-reflectiveness);

        if (reflectiveness > 0 && maxReflect > 0) {
            var r = result.normal.multiply(-2 * result.normal.dot(ray.direction)).add(ray.direction);
            ray = new Ray3(result.position, r);
            var reflectedColor = rayTraceRecursive(scene, ray, maxReflect-1);
            color = color.add(reflectedColor.multiply(reflectiveness));
        }
        return color;
    } else {
        return Color.white;
    }
}