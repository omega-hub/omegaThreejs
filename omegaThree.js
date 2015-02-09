// Namespace
var omegaThree	= omegaThree || {};

////////////////////////////////////////////////////////////////////////////////
var onWindowResize = function() {
    console.log("resize " + window.innerWidth + " " + window.innerHeight)
    omegaThree.renderer.setSize( window.innerWidth, window.innerHeight );
}

////////////////////////////////////////////////////////////////////////////////
omegaThree.init = function() {
    omegaThree.camera = new THREE.Camera();
    // Disable the camera updateMatrixWorld method, we take care of computing
    // camera transforms in the omegalib runtime.
    omegaThree.camera.updateMatrixWorld = function() {}

    omegaThree.renderer = new THREE.WebGLRenderer();
    omegaThree.renderer.setSize( window.innerWidth, window.innerHeight);

    container = document.getElementById( 'output' );
    container.appendChild( omegaThree.renderer.domElement );
    
	window.addEventListener('resize', onWindowResize, false);
}

////////////////////////////////////////////////////////////////////////////////
omegaThree.frame = function() {
    omegaThree.camera.projectionMatrix.fromArray(omega.projection);
    omegaThree.camera.matrixWorld.fromArray(omega.modelview);
    
    if(omegaThree.scene) {
        omegaThree.renderer.render(omegaThree.scene, omegaThree.camera);
    }
}
