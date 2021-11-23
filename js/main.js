"use strict";
var app = (function(){
    /**
     * Init canvas
     */
    var myCanvas = document.getElementById("drawing");
    var width = myCanvas.clientWidth;
    var height = myCanvas.clientHeight;
    console.log(width, height);
    myCanvas.setAttribute("width", width);
    myCanvas.setAttribute("height", height);

    /**
     * Sphere Camera setup
     */
    // // var lightSource = new DirectionalLight(new Vector3(-5,5,5), Color.white); // alternative light source
    var lightSource = new PointLight(new Vector3(1,1,-5), Color.white);
    var myCamera = new PerspectiveCamera(new Vector3(0, 0, 5), new Vector3(0, 0, 1), new Vector3(0, 1, 0), 90);
    var config = sphere;

    /**
     * Scene1 Camera setup
     */
    // var lightSource = new PointLight(new Vector3(0,9.8,0), Color.white);
    // // var lightSource = new DirectionalLight(new Vector3(1,0,-1), Color.white);
    // var myCamera = new PerspectiveCamera(new Vector3(0,5,25), new Vector3(0, 0, -1), new Vector3(0, 1, 0), 90);
    // var config = scene01;
    
    /**
     * Scene2 Camera setup
     */
    // var lightSource = new DirectionalLight(new Vector3(0,-1,0), Color.white);
    // var myCamera = new PerspectiveCamera(new Vector3(5,35,5), new Vector3(0,-1,0), new Vector3(0,0,1), 120);
    // var config = scene02;

    var mySource = document.getElementsByTagName('input')[0];
    mySource.addEventListener("change", function() {
        var file = this.files[0];
        var sourceFile = new SourceFile(file);
        d3.text(sourceFile.url, function(file) {
            var scene = sourceFile.parse(file, 2);
            configMaterial(scene, config);
            rayCasting(myCanvas, scene, myCamera, lightSource, 1);
        });
    });

    function configMaterial(scene, config) {
        for (var key in scene.objects) {
            var color = config[key];
            var polygons = scene.objects[key];
            for (var i in polygons) {
                polygons[i].material = new PhongMaterial(Color.white, color, Color.white, 14, 0.25);
            }
        }
    }

    /**
     * TODO: complex scene testing
     */
    // var plane = new Plane(new Vector3(0,1,0), 0);
    // var sphere1 = new Sphere(new Vector3(-10,10,-10), 10);
    // var sphere2 = new Sphere(new Vector3(10,10,-10), 10);
    // plane.material = new CheckerMaterial(0.1, 0.25);
    // sphere1.material = new PhongMaterial(Color.red, Color.white, 16, 0.25);
    // sphere2.material = new PhongMaterial(Color.blue, Color.white, 16, 0.25);
    // var myScene = new Union([plane, sphere1, sphere2]);
    // var myCamera = new PerspectiveCamera(new Vector3(0, 5, 15), new Vector3(0, 0, -1), new Vector3(0, 1, 0), 90);
    // // local illumination
    // rayCasting(myCanvas, myScene, myCamera, lightSource, 1);
    // // global illumination
    // rayTracing(myCanvas, myScene, myCamera, 5);
})();
