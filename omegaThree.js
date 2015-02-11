// Namespace
var omegaThree	= omegaThree || {};

omegaThree.w = 0;
omegaThree.h = 0;

////////////////////////////////////////////////////////////////////////////////
// display mode
omegaThree.DisplayMono = 0;
omegaThree.DisplayInterleaved = 1;

////////////////////////////////////////////////////////////////////////////////
omegaThree.init = function(canvas) {
    my = omegaThree
    gcanvas = document.getElementById(canvas);
    
    my.camera = new THREE.Camera();
    // Disable the camera updateMatrixWorld method, we take care of computing
    // camera transforms in the omegalib runtime.
    my.camera.updateMatrixWorld = function() {}
    
    my.renderer = new THREE.WebGLRenderer({canvas: gcanvas});
    my.irenderer = new omegaThree.InterleavedRenderer(my.renderer);
}

////////////////////////////////////////////////////////////////////////////////
omegaThree.frame = function(omega) {
    my = omegaThree
    
    my.camera.projectionMatrix.fromArray(omega.projection);
    my.camera.matrixWorld.fromArray(omega.modelview);
    
    if(omegaThree.scene) {
        if(window.innerWidth != my.w || window.innerHeight != my.h) {
            console.log("resize " + window.innerWidth + " " + window.innerHeight)
            my.w = window.innerWidth;
            my.h = window.innerHeight;
            my.renderer.setSize( my.w,my.h );
        }

        omegaThree.irenderer.context = omega;
        omegaThree.irenderer.render(omegaThree.scene, omegaThree.camera);
    }
}

////////////////////////////////////////////////////////////////////////////////
// Stereo Interleaved renderer
omegaThree.InterleavedRenderer = function ( renderer ) {
    my = omegaThree

	my.cameraLeft = new THREE.Camera();
    my.cameraRight = new THREE.Camera();
	my.cameraLeft.updateMatrixWorld = function() {}
    my.cameraRight.updateMatrixWorld = function() {}

	_scene = new THREE.Scene();

	var _camera = new THREE.PerspectiveCamera( 53, 1, 1, 10000 );
	_camera.position.z = 2;
	_scene.add( _camera );
    
    this.context = null;

	var _params = { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat };

	my.renderTargetL = new THREE.WebGLRenderTarget( 512, 512, _params );
	my.renderTargetR = new THREE.WebGLRenderTarget( 512, 512, _params );

	my.material = new THREE.ShaderMaterial( {

		uniforms: {

			"mapLeft": { type: "t", value: my.renderTargetL },
			"mapRight": { type: "t", value: my.renderTargetR }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"	vUv = vec2( uv.x, uv.y );",
			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform sampler2D mapLeft;",
			"uniform sampler2D mapRight;",
			"varying vec2 vUv;",

			"void main() {",

			"	vec2 uv = vUv;",

			"	if ( ( mod( gl_FragCoord.y, 2.0 ) ) > 1.00 ) {",

			"		gl_FragColor = texture2D( mapLeft, uv );",

			"	} else {",

			"		gl_FragColor = texture2D( mapRight, uv );",

			"	}",

			"}"

		].join("\n")

	} );

	my.mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), my.material );
	_scene.add( my.mesh );

	this.setSize = function ( width, height ) {

		my.renderTargetL = new THREE.WebGLRenderTarget( width, height, _params );
		my.renderTargetR = new THREE.WebGLRenderTarget( width, height, _params );

		my.material.uniforms[ "mapLeft" ].value = my.renderTargetL;
		my.material.uniforms[ "mapRight" ].value = my.renderTargetR;

		renderer.setSize( width, height );
	};

	this.render = function ( scene, camera ) {
		scene.updateMatrixWorld();

        my.cameraLeft.projectionMatrix.fromArray(this.context.projectionLeft);
        my.cameraLeft.matrixWorld.fromArray(this.context.modelviewLeft);
        my.cameraRight.projectionMatrix.fromArray(this.context.projectionRight);
        my.cameraRight.matrixWorld.fromArray(this.context.modelviewRight);
        
		renderer.render( scene, my.cameraLeft, my.renderTargetL, true );
		renderer.render( scene, my.cameraRight, my.renderTargetR, true );

		my.scene.updateMatrixWorld();

		renderer.render( _scene, _camera );

	};

};
