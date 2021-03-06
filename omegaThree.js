// Namespace
var omegaThree	= omegaThree || {};

omegaThree.w = 0;
omegaThree.h = 0;
omegaThree.x = 0;
omegaThree.y = 0;

////////////////////////////////////////////////////////////////////////////////
// display mode
omegaThree.DisplayMono = 0;
omegaThree.DisplayLineInterleaved = 1;

////////////////////////////////////////////////////////////////////////////////
omegaThree.init = function(renderer) {
    my = omegaThree
    
    my.camera = new THREE.PerspectiveCamera();
    // Disable the camera updateMatrixWorld method, we take care of computing
    // camera transforms in the omegalib runtime.
    my.camera.updateMatrixWorld = function() {}
    
    my.renderer = renderer;
    my.irenderer = new omegaThree.InterleavedRenderer(my.renderer);
}

////////////////////////////////////////////////////////////////////////////////
omegaThree.frame = function(omega) {
    my = omegaThree
    
    if(omega.projection != null) {
        my.camera.projectionMatrix.fromArray(omega.projection);
        my.camera.matrixWorld.fromArray(omega.modelview);
        my.camera.position.x = omega.cameraPosition[0]
        my.camera.position.y = omega.cameraPosition[1]
        my.camera.position.z = omega.cameraPosition[2]
    }
    
    if(omegaThree.scene) {
        if(omega.projection != null) {
            if(window.innerWidth != my.w || window.innerHeight != my.h ||
                my.x != omega.activeRect[0] || my.y != omega.activeRect[1]) {
                console.log("resize " + window.innerWidth + " " + window.innerHeight + " " + omega.activeRect[0] + " " + omega.activeRect[1])
                my.w = window.innerWidth;
                my.h = window.innerHeight;
                my.x = omega.activeRect[0];
                my.y = omega.activeRect[1];
                my.renderer.setSize( my.w,my.h );
                my.irenderer.setSize( my.w,my.h , omega.activeRect);
            }
        } else {
            if(window.innerWidth != my.w || window.innerHeight != my.h) {
                my.w = window.innerWidth;
                my.h = window.innerHeight;
                my.x = 0;
                my.y = 0;
                my.renderer.setSize( my.w,my.h );
                my.irenderer.setSize( my.w,my.h , omega.activeRect);
            }
        }
        if(omega.projection != null) {
            if(omega.stereoMode == omegaThree.DisplayMono)
            {
                omegaThree.renderer.render(omegaThree.scene, omegaThree.camera);
            }
            else if(omega.stereoMode == omegaThree.DisplayLineInterleaved)
            {
                omegaThree.irenderer.context = omega;
                omegaThree.irenderer.render(omegaThree.scene, omegaThree.camera);
            }
        }
        else {
            omegaThree.renderer.render(omegaThree.scene, omegaThree.camera);
        }
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

	my.renderTargetL = new THREE.WebGLRenderTarget( 256, 128, _params );
	my.renderTargetR = new THREE.WebGLRenderTarget( 256, 128, _params );

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

			"		gl_FragColor = texture2D( mapRight, uv );",

			"	} else {",

			"		gl_FragColor = texture2D( mapLeft, uv );",
            

			"	}",

			"}"

		].join("\n")

	} );

	my.mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), my.material );
	_scene.add( my.mesh );

	this.setSize = function ( width, height, vp ) {

		my.renderTargetL = new THREE.WebGLRenderTarget( width, height / 2, _params );
		my.renderTargetR = new THREE.WebGLRenderTarget( width, height / 2, _params );

        if(vp[1] % 2 == height % 2) {
            console.log("NORMAL " + vp[1] + " " + height)
            my.material.uniforms[ "mapLeft" ].value = my.renderTargetL;
            my.material.uniforms[ "mapRight" ].value = my.renderTargetR;
        }
        else {
            console.log("INVERT " + vp[1] + " " + height)
            my.material.uniforms[ "mapLeft" ].value = my.renderTargetR;
            my.material.uniforms[ "mapRight" ].value = my.renderTargetL;
        }
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
