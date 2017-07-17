"use strict";

var canvas;
var gl;

var rotY = 0;
var rotZ = 0;
var pos3 = vec3(0,0,0);
var scale3 = vec3(0.6,0.6,0.6);
var modelView;
var texture;

var flag = true;


var coordinateVertices = [
    -20, 0, 0, 1,
    20, 0, 0, 1,
    0, -20, 0, 1,
    0, 20, 0, 1,
    0, 0, -20, 1,
    0, 0, 20, 1
 ];


var near = 0.3;
var far = 11.0;
var radius = 1;  
//var theta  = 0.5;
//var phi    = 0.5;
var dr = 5.0 * Math.PI/180.0;
var eyeX = 0;
var eyeY = 0;
var eyeZ = 5;
var tarX = 0;
var tarY = 0;
var tarZ = 0;

var  fovy = 45.0;   // Field-of-view in Y direction angle (in degrees)
var  aspect = 1.0;       // Viewport aspect ratio

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;

  var red=0.4;
  var green=0.6;
  var blue=0.8;
  
  var spe=1.0;
  var amb=1.0;
var x=1.0;
var y=1.0;
var z=1.0;
var shine;
var i=0;
  
var materialShininess=50.0;
 
var lightPosition = vec4(x, y, z, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialDiffuse = vec4( red, green, blue, 1.0 );

	var materialAmbient=vec4(amb,amb,amb,1.0);
	 var materialSpecular=vec4(spe,spe,spe,1.0);


var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );



  var ambientProduct;
    var diffuseProduct;
    var specularProduct ;
	
      var ambientV=1.0;
	  var diffuseV=1.0;
	  var specularV=1.0;
	    
		
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var normalMatrix, normalMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var program;
var axes_vBuffer, sphere_vBuffer, sphere_iBuffer, sphere_nBuffer;
var vPosition, vNormal;
var red;
var green;
var blue;

//var stacks,slices;
var nStacks = 8;  
var nSlices = 16;   
var spherePoints = [];
var sphereNormals = [];
 var sphereIndices = [];

 
 var theta =[0, 0, 0];

var thetaLoc;


var shadingType = 0; //0 Gouraud, 1 Phong, 2 Wireframe

function generateSphere(){

    //first make sure that all arrays are empty
    spherePoints = [];
    sphereIndices = [];
    sphereNormals = [];
   

    //TODO: you need to provide correct normals, current normals are not used in the shader

  
  
   for (var latNumber=0; latNumber <=nStacks; latNumber++) {
            var theta = latNumber * Math.PI / nStacks;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);
            for (var longNumber=0; longNumber <= nSlices; longNumber++) {
                var phi = longNumber * 2 * Math.PI / nSlices;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);
                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
                //var u = 1 - (longNumber / nSlices);
                //var v = 1 - (latNumber / nStacks);
                sphereNormals.push(x);
                sphereNormals.push(y);
                sphereNormals.push(z);
                //textureCoordData.push(u);
                //textureCoordData.push(v);
                spherePoints.push(radius * x);
                spherePoints.push(radius * y);
                spherePoints.push(radius * z);
				
            }
        }
  
         for (var latNumber=0; latNumber < nStacks; latNumber++) {
            for (var longNumber=0; longNumber < nSlices; longNumber++) {
                var first = (latNumber * (nSlices + 1)) + longNumber;
                var second = first + nSlices + 1;   //nSlices
                sphereIndices.push(first);
                sphereIndices.push(second);
                sphereIndices.push(first + 1);
                sphereIndices.push(second);
                sphereIndices.push(second + 1);
                sphereIndices.push(first + 1);
            }
        }
  
  
  


    //for debug
    console.log(spherePoints);

    sphere_iBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, sphere_iBuffer);
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereIndices), gl.STATIC_DRAW );
    sphere_iBuffer.itemSize=1;
	sphere_iBuffer.numItems=sphereIndices.length;
	
	
    //TODO: You need to perform everything below for normals too
    sphere_vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, sphere_vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(spherePoints), gl.STATIC_DRAW );
    sphere_vBuffer.itemSize = 3;                                                                 
    sphere_vBuffer.numItems = spherePoints.length / 3;                                           
	
	
    

	//ekledim.
	sphere_nBuffer=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphere_nBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereNormals), gl.STATIC_DRAW)
    sphere_nBuffer.itemSize = 3;
    sphere_nBuffer.numItems = sphereNormals.length / 3;
	
	vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, sphere_vBuffer.itemSize, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, sphere_nBuffer.itemSize, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );
	
	modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

  


}




function change_SpecularV(specularV){
	
	materialSpecular=vec4(specularV,specularV,specularV,1.0);
	setupScene();
	
}

function setupShading(){
    if (shadingType == 0) {
        program = initShaders( gl, "gouraud-vertex-shader", "gouraud-fragment-shader" );
    }else{
        program = initShaders( gl, "phong-vertex-shader", "phong-fragment-shader" );
    }
    gl.useProgram( program );

   
        generateSphere();

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

}

function setupScene(){
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    aspect =  canvas.width/canvas.height;

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    axes_vBuffer = gl.createBuffer();                     
    gl.bindBuffer( gl.ARRAY_BUFFER, axes_vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(coordinateVertices), gl.STATIC_DRAW);
    axes_vBuffer.itemSize = 4;
    axes_vBuffer.numItems = 6;

    setupShading();
	
	
	ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
	
	
	

    //builds the sphere position, normals, indices etc.
    generateSphere();

    // sliders for viewing parameters
    document.getElementById("fovySlider").oninput = function(event) {
        fovy = event.target.value;//* Math.PI/180.0;
    };

    document.getElementById("objRotationYSlider").oninput = function(event) {
        rotY = event.target.value;//* Math.PI/180.0;
    };

    document.getElementById("objRotationZSlider").oninput = function(event) {
        rotZ = event.target.value;//* Math.PI/180.0;
    };

    document.getElementById("inp_tarX").onchange = function(event) {
        tarX = event.target.value;
    };
    document.getElementById("inp_tarY").onchange = function(event) {
        tarY = event.target.value;
    };
    document.getElementById("inp_tarZ").onchange = function(event) {
        tarZ = event.target.value;
    };
    document.getElementById("inp_camX").onchange = function(event) {
        eyeX = event.target.value;
    };
    document.getElementById("inp_camY").onchange = function(event) {
        eyeY = event.target.value;
    };
    document.getElementById("inp_camZ").onchange = function(event) {
        eyeZ = event.target.value;
    };
    document.getElementById("inp_objX").onchange = function(event) {
        pos3[0] = event.target.value;
    };
    document.getElementById("inp_objY").onchange = function(event) {
        pos3[1] = event.target.value;
    };
    document.getElementById("inp_objZ").onchange = function(event) {
        pos3[2] = event.target.value;
    };
    document.getElementById("inp_obj_scaleX").onchange = function(event) {
        scale3[0] = event.target.value;
    };
    document.getElementById("inp_obj_scaleY").onchange = function(event) {
        scale3[1] = event.target.value;
    };
    document.getElementById("inp_obj_scaleZ").onchange = function(event) {
        scale3[2] = event.target.value;
    };
   
    document.getElementById("lightPosXSlider").oninput = function(event) {
        x=event.target.value;
		uLight(x,y,z);
    };
    document.getElementById("lightPosYSlider").oninput = function(event) {
         y=event.target.value;
		 uLight(x,y,z);
    };
    document.getElementById("lightPosZSlider").oninput = function(event) {
         z=event.target.value;
		 uLight(x,y,z);
    };
    document.getElementById("shadingMenu").onchange = function(event) {
       shadingType = event.target.value;
       if (shadingType != 2) {
            setupShading();
            generateSphere();
       }
    };
    document.getElementById("inp_slices").onchange = function(event) {
         nSlices= Math.round(event.target.value);
		 generateSphere();
    };
    document.getElementById("inp_stacks").onchange = function(event) {
        nStacks= Math.round(event.target.value);
		generateSphere();
    };
    document.getElementById("redSlider").oninput = function(event) {
        red=event.target.value;
		uColor(red,green,blue);
		
    };
    document.getElementById("greenSlider").oninput = function(event) {
        green=event.target.value;
		uColor(red,green,blue);
    };
    document.getElementById("blueSlider").oninput = function(event) {
        blue=event.target.value;
		uColor(red,green,blue);
    };
    document.getElementById("shininessSlider").oninput = function(event) {
        shine=event.target.value;
		uShininess(shine);
    };
    document.getElementById("diffuseSlider").oninput = function(event) {
        diffuseV=event.target.value;
		uDiffuse(diffuseV);
    };
    document.getElementById("specularSlider").oninput = function(event) {
       	specularV=event.target.value;
		change_SpecularV(specularV);
    };
    document.getElementById("ambientSlider").oninput = function(event) {
        amb = event.target.value;
		uAmbient(amb);
    };
	
	
	gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"),(materialShininess ));
	
	
	var image = document.getElementById("texImage");

    configureTexture( image );


    render();
}

window.onload = function init() {
    setupScene();
}

function uLight(x,y,z)
{
  lightPosition=vec4(x,y,z,0.0);
  setupScene();
}

function uShininess(materialShininess)
{
	   materialShininess=shine;

    gl.uniform1f( gl.getUniformLocation(program,
       "shininess"),materialShininess );
	   
}
function uDiffuse(diffuseV)
{
	materialDiffuse=vec4(diffuseV,diffuseV,diffuseV,1.0);
	setupScene();
}

function uSpecular(specularV)
{
	materialSpecular=vec4(specularV,specularV,specularV,1.0);
	setupScene();
}

function uAmbient(amb)
{
	materialAmbient=vec4(amb,amb,amb,1.0);
	setupScene();
}


function uColor(red,green,blue){
	materialDiffuse=vec4(red,green,blue,1.0);
	setupScene();
}

function drawAxes(){

    gl.bindBuffer(gl.ARRAY_BUFFER, axes_vBuffer);
    gl.vertexAttribPointer(vPosition, axes_vBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.LINES, 0, 6);

}

function drawSphere(){
    //TODO: bind normals too
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere_vBuffer);
    gl.vertexAttribPointer(vPosition, sphere_vBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere_iBuffer);
	

	 
    if(shadingType == 2)
        gl.drawElements( gl.LINE_LOOP, sphereIndices.length, gl.UNSIGNED_SHORT, 0 );
    else
        gl.drawElements( gl.TRIANGLES, sphereIndices.length, gl.UNSIGNED_SHORT, 0 );
    
}



	
var sphere1Angle=90.0;
var sphere2Angle=90.0;

 var lastTime = 0;
 
     function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

	
function animate() {
        var timeNow = new Date().getTime();
        if (lastTime != 0) {
            var elapsed = timeNow - lastTime;

            sphere1Angle += 0.05 * elapsed;
            sphere2Angle += 0.05 * elapsed;
        }
        lastTime = timeNow;
    }
	
	
	function configureTexture( image ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

var render = function(){

	
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   
    //initial setup for modelview and projection matrices
    eye = vec3(eyeX, eyeY, eyeZ);
    at = vec3(tarX, tarY, tarZ);
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fovy, aspect, near, far);
	
	
    normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];
	
	  
	
	gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );
	
	drawAxes();
		
	// normal matrix only really need if there is nonuniform scaling
    // it's here for generality but since there is
    // no scaling in this example we could just use modelView matrix in shaders


			
    //update modelview matrix before drawing the sphere 
    modelViewMatrix = mult(modelViewMatrix, translate(pos3[0],pos3[1],pos3[2]));
    modelViewMatrix = mult(modelViewMatrix, rotate(rotY, 0, 1, 0 ));
    modelViewMatrix = mult(modelViewMatrix, rotate(rotZ, 0, 0, 1 ));
    modelViewMatrix = mult(modelViewMatrix, scalem(scale3[0],scale3[1],scale3[2]));
	
	
	 if(flag) theta[axis] += 10.0;

    modelViewMatrix = mult(modelViewMatrix, rotate(sphere1Angle, [0, 1, 0] ));
	
	gl.uniformMatrix4fv( gl.getUniformLocation(program,
            "modelViewMatrix"), false, flatten(modelViewMatrix) );
			drawSphere();
			animate();
			
		
	gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );
	
	
		 
	drawSphere();
	
	
	
	   
    modelViewMatrix = mult(modelViewMatrix, translate(2.5,0.0,0.0));
    modelViewMatrix = mult(modelViewMatrix, scalem(0.45,0.45,0.45));
	
	 if(flag) theta[axis] += 10.0;

    modelViewMatrix = mult(modelViewMatrix, rotate(sphere1Angle, [0, 1, 0] ));
	
	gl.uniformMatrix4fv( gl.getUniformLocation(program,
            "modelViewMatrix"), false, flatten(modelViewMatrix) );
		drawSphere();
		animate();
  
/***************************************************************************************************/
	
	
	modelViewMatrix = mult(modelViewMatrix, translate(2.5,0.0,0.0));
    modelViewMatrix = mult(modelViewMatrix, scalem(0.45,0.45,0.45));
	 
	 if(flag) theta[axis] += 10.0;

    modelViewMatrix = mult(modelViewMatrix, rotate(sphere2Angle, [0, 1, 0] ));
	
	gl.uniformMatrix4fv( gl.getUniformLocation(program,
            "modelViewMatrix"), false, flatten(modelViewMatrix) );
			drawSphere();
			animate();

		  
    window.requestAnimFrame(render);
}
