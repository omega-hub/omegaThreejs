// Namespace
var omegaThree	= omegaThree || {};

w = 0;
h = 0;

////////////////////////////////////////////////////////////////////////////////
omegaThree.init = function(canvas) {
    gcanvas = document.getElementById(canvas);
    omegaThree.camera = new THREE.Camera();
    // Disable the camera updateMatrixWorld method, we take care of computing
    // camera transforms in the omegalib runtime.
    omegaThree.camera.updateMatrixWorld = function() {}
    omegaThree.renderer = new THREE.WebGLRenderer({canvas: gcanvas});
    //omegaThree.renderer.setPixelRatio(0.5)
    //omegaThree.renderer.setSize( 1920, 1080);
}

////////////////////////////////////////////////////////////////////////////////
omegaThree.frame = function(omega) {
    omegaThree.camera.projectionMatrix.fromArray(omega.projection);
    omegaThree.camera.matrixWorld.fromArray(omega.modelview);
    
    if(omegaThree.scene) {
        if(window.innerWidth != w || window.innerHeight != h) {
            console.log("resize " + window.innerWidth + " " + window.innerHeight)
            w = window.innerWidth;
            h = window.innerHeight;
            omegaThree.renderer.setSize( w,h );
        }

        omegaThree.renderer.render(omegaThree.scene, omegaThree.camera);
    }
}
