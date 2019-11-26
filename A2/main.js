var canvas;
var gl;

var program; //the current program ID

var near = 0.1;
var far = 1000;


var left = -6.0;
var right = 6.0;
var ytop = 6.0;
var bottom = -6.0;


var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0);
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0);

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(0.4, 0.4, 0.4, 1.0);
var materialShininess = 30.0;


var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix;
var modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye = vec3(-20, 10, -4);
var at = vec3(-5, 0, 0);
var up = vec3(0.0, 1.0, 0.0);

//angles and coordinates of the space ship
var shipCoordinates = vec3(-3, 3, 0);
var shipAngle = vec3(0, 0, -90);

//angles and coordinates of the human
var humanCoordinates = vec3(-3, 0.65, 0);
var legAngles = vec4(0, 0, 0, 0);
var armAngles = vec3(0, 0, 0);
var humanViewAngle = 0;

//camera angle for the 360 view at the end of the animation
var angleCam = 11.36;

//frames per second
var fps;
//counts the amount of frames in 2 seconds
var frameCount = 0;

var RX = 0;
var RY = 0;
var RZ = 0;

var MS = []; // The modeling matrix stack
var TIME = 0.0; // Realtime
var TIME = 0.0; // Realtime
var resetTimerFlag = true;
var animFlag = true;
var prevTime = 0.0;
var useTextures = 1;

//the global scene timer for each, resets to zero on each new scene
var sceneTimers = [0, 0, 0, 0];
var timer = 0;

// ------------ Images for textures stuff --------------
var texSize = 64;

var image1 = new Array()
for (var i = 0; i < texSize; i++)  image1[i] = new Array();
for (var i = 0; i < texSize; i++)
    for (var j = 0; j < texSize; j++)
        image1[i][j] = new Float32Array(4);
for (var i = 0; i < texSize; i++) for (var j = 0; j < texSize; j++) {
    var c = (((i & 0x8) == 0) ^ ((j & 0x8) == 0));
    image1[i][j] = [c, c, c, 1];
}

// Convert floats to ubytes for texture

var image2 = new Uint8Array(4 * texSize * texSize);

for (var i = 0; i < texSize; i++)
    for (var j = 0; j < texSize; j++)
        for (var k = 0; k < 4; k++)
            image2[4 * texSize * i + 4 * j + k] = 255 * image1[i][j][k];


var textureArray = [];



function isLoaded(im) {
    if (im.complete) {
        console.log("loaded");
        return true;
    }
    else {
        console.log("still not loaded!!!!");
        return false;
    }
}

function loadFileTexture(tex, filename) {
    tex.textureWebGL = gl.createTexture();
    tex.image = new Image();
    tex.image.src = filename;
    tex.isTextureReady = false;
    tex.image.onload = function () { handleTextureLoaded(tex); }
    // The image is going to be loaded asyncronously (lazy) which could be
    // after the program continues to the next functions. OUCH!
}

function loadImageTexture(tex, image) {
    tex.textureWebGL = gl.createTexture();
    tex.image = new Image();
    //tex.image.src = "CheckerBoard-from-Memory" ;

    gl.bindTexture(gl.TEXTURE_2D, tex.textureWebGL);
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);

    tex.isTextureReady = true;

}


//loading in all textures
function initTextures() {

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "cone.jpg");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "body.jpg");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "fin.jpg");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "moon.png");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "helmet.jpg");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "cdnFlg.jpg");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "space.jpg");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "space2.jpg");

    textureArray.push({});
    loadImageTexture(textureArray[textureArray.length - 1], image2);


}


function handleTextureLoaded(textureObj) {
    gl.bindTexture(gl.TEXTURE_2D, textureObj.textureWebGL);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // otherwise the image would be flipped upsdide down
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureObj.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);
    console.log(textureObj.image.src);

    textureObj.isTextureReady = true;
}

//----------------------------------------------------------------

function setColor(c) {
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program,
        "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program,
        "shininess"), materialShininess);
}

function toggleTextures() {
    useTextures = 1 - useTextures;
    gl.uniform1i(gl.getUniformLocation(program,
        "useTextures"), useTextures);
}

function waitForTextures1(tex) {
    setTimeout(function () {
        console.log("Waiting for: " + tex.image.src);
        wtime = (new Date()).getTime();
        if (!tex.isTextureReady) {
            console.log(wtime + " not ready yet");
            waitForTextures1(tex);
        }
        else {
            console.log("ready to render");
            window.requestAnimFrame(render);
        }
    }, 5);

}

// Takes an array of textures and calls render if the textures are created
function waitForTextures(texs) {
    setTimeout(function () {
        var n = 0;
        for (var i = 0; i < texs.length; i++) {
            console.log("boo" + texs[i].image.src);
            n = n + texs[i].isTextureReady;
        }
        wtime = (new Date()).getTime();
        if (n != texs.length) {
            console.log(wtime + " not ready yet");
            waitForTextures(texs);
        }
        else {
            console.log("ready to render");
            window.requestAnimFrame(render);
        }
    }, 5);

}

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 0.5, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load canonical objects and their attributes
    Cube.init(program);
    Cylinder.init(9, program);
    Cone.init(9, program);
    Sphere.init(36, program);

    gl.uniform1i(gl.getUniformLocation(program, "useTextures"), useTextures);

    // record the locations of the matrices that are used in the shaders
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    // set a default material
    setColor(materialDiffuse);



    // set the callbacks for the UI elements
    document.getElementById("sliderXi").oninput = function () {
        RX = this.value;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderYi").oninput = function () {
        RY = this.value;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderZi").oninput = function () {
        RZ = this.value;
        window.requestAnimFrame(render);
    };

    /*document.getElementById("animToggleButton").onclick = function () {
        if (animFlag) {
            animFlag = false;
        }
        else {
            animFlag = true;
            resetTimerFlag = true;
            window.requestAnimFrame(render);
        }
    };*/

    document.getElementById("textureToggleButton").onclick = function () {
        toggleTextures();
        window.requestAnimFrame(render);
    };

    /*var controller = new CameraController(canvas);
    controller.onchange = function (xRot, yRot) {
        RX = xRot;
        RY = yRot;
        window.requestAnimFrame(render);*/
    //};

    // load and initialize the textures
    initTextures();

    // Recursive wait for the textures to load
    waitForTextures(textureArray);
    //setTimeout (render, 100) ;

}

// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix, modelMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    normalMatrix = inverseTranspose(modelViewMatrix);
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix));
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    setMV();

}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
function drawCube() {
    setMV();
    Cube.draw();
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawSphere() {
    setMV();
    Sphere.draw();
}
// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
function drawCylinder() {
    setMV();
    Cylinder.draw();
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawCone() {
    setMV();
    Cone.draw();
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modelview matrix with the result
function gTranslate(x, y, z) {
    modelMatrix = mult(modelMatrix, translate([x, y, z]));
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modelview matrix with the result
function gRotate(theta, x, y, z) {
    modelMatrix = mult(modelMatrix, rotate(theta, [x, y, z]));
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modelview matrix with the result
function gScale(sx, sy, sz) {
    modelMatrix = mult(modelMatrix, scale(sx, sy, sz));
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop();
}

// pushes the current modelMatrix in the stack MS
function gPush() {
    MS.push(modelMatrix);
}

//variables that help to determine if the fire on the spaceship is on or not
var fireTime = 0;
var fireOn = true;

//this functions straightens the limbs of the human
//bennum represents which way the arms will bend(with or against legs)
function straightenLimbs(bendNum) {
    for (var i = 0; i < 2; i++) {
        if (legAngles[i] > 0) {
            legAngles[i] -= 0.5;
            armAngles[i] = bendNum * legAngles[i];
        }
        if (legAngles[i + 2] < 0) {
            legAngles[i + 2] += 0.5;
        }
    }
}

//to bend all libms of the person prior to jumping
//bend num determines which way the arms bend for the landing and take off of the jump
function bendLimbs(bendNum) {
    for (var i = 0; i < 2; i++) {
        if (legAngles[i] < 40) {
            legAngles[i] += 1;
            armAngles[i] = -bendNum * legAngles[i];
            legAngles[i + 2] -= 1.5;
        }
    }

    if (humanCoordinates[1] > -0.5) {
        humanCoordinates[1] -= 0.005;
    }
}


//scene one draws/animates a space flying and landing
function sceneOne() {

    //counting scnene time elapsed
    if (TIME - timer > 1) {
        sceneTimers[0] += (TIME - timer);
        timer = TIME;
    }


    if (sceneTimers[0] < 8) {
        //flickering the fire 
        if (TIME - fireTime > 0.5 && shipCoordinates[1] > 0) {
            fireTime = TIME;
            fireOn = !fireOn;
        }

        //moving camera fowards whilst moving the ship in +X direction
        if (at[0] > eye[0]) {

            //chaning ship and camera x
            shipCoordinates[0] += 0.05
            at[0] += 0.05
            eye[0] += 0.09;

            //ship wobbles
            shipAngle[0] = -15 * Math.sin(TIME);
            shipAngle[1] = -15 * Math.sin(TIME)
        }
        //ship beginning to land 
        else if (shipCoordinates[1] > -1.5) {
            eye[1] -= 0.05;
            eye[2] -= 0.05;
            //straighten the angle fo the ship downwards
            if (shipAngle[2] < 0 && shipAngle[2] != 0) { shipAngle[2]++; }
            shipCoordinates[1] -= 0.05;
        }
        else {
            //turn off flame after landing
            fireOn = false;;
        }
    }
    //camera pans out to infront of the ship after landing 
    else if (sceneTimers[0] < 14) {
        if (eye[0] < shipCoordinates[0] + 8) {
            eye[0] += 0.05;
        }
        if (eye[1] > shipCoordinates[1] + 3.4) {
            eye[1] -= 0.05;
        }
        if (eye[2] < shipCoordinates[2]) {
            eye[2] += 0.05
        }

        //looking in front of the ship
        at[0] += 0.08;

    }
}


//this scene starts with 1st person view of the human and looks right then left
//camera pans out and human will walk and prepare to jump
function sceneTwo() {
    //changing human coordinates at start of scene
    if (sceneTimers[1] == 0) {
        humanCoordinates[0] = eye[0] - 0.5;
        humanCoordinates[1] = eye[1] - 1.8;
        humanCoordinates[2] = eye[2];
    }

    //rasing arms
    else if (sceneTimers[1] < 4) {
        if (armAngles[0] < 100) { armAngles[0]++; }
        if (armAngles[1] < 100) { armAngles[1]++; }
    }
    //viewing right
    else if (sceneTimers[1] < 7) {
        if (humanViewAngle < 0.5) {
            humanViewAngle += 0.005;
            at[0] = 30 * Math.cos(humanViewAngle);
            at[2] = 30 * Math.sin(humanViewAngle);
        }
    }
    //viewing left
    else if (sceneTimers[1] < 11) {
        if (humanViewAngle > -0.5) {
            humanViewAngle -= 0.005;
            at[0] = 41 * Math.cos(humanViewAngle);
            at[2] = 41 * Math.sin(humanViewAngle);
        }
    }
    //pan out into 3rd person view and lower arms
    else if (sceneTimers[1] < 15) {
        if (eye[2] < 10) {
            eye[2] += 0.05;
        }
        if (eye[1] > 0) {
            eye[1] -= 0.005;
        }
        if (eye[0] < 30) {
            eye[0] += 0.05
        }
        if (at[0] > 24) {
            at[0] -= 0.05;
        }
        if (at[1] < 1) {
            at[1] += 0.05;
        }

        //lowering arms
        if (armAngles[0] > 0) { armAngles[0]--; }
        if (armAngles[1] > 0) { armAngles[1]--; }
    }
    //human is walking here
    else if (sceneTimers[1] < 25) {
        //human walks in +x direction and camera and at follow human
        humanCoordinates[0] += 0.005;
        eye[0] += 0.005
        at[0] += 0.005;

        //arms and legs swing back as walking
        armAngles[0] = legAngles[0];
        armAngles[1] = legAngles[1];
        legAngles[0] = Math.abs(20 * Math.cos(1.5 * TIME));
        legAngles[1] = Math.abs(20 * Math.sin(1.5 * TIME));

        //moving lower legs
        legAngles[2] = -Math.abs(45 * Math.cos(1.5 * TIME));
        legAngles[3] = -Math.abs(45 * Math.sin(1.5 * TIME));

    }
    //after walking straighten limbs
    else if (sceneTimers[1] < 28) {
        straightenLimbs(1);
    }
    //bend limbs and prepare to jump
    else if (sceneTimers[1] < 32) {
        bendLimbs(1);
    }
    //counting scnene time elapsed
    if (TIME - timer > 1) {
        sceneTimers[1] += (TIME - timer);
        timer = TIME;
    }
}


//updates variables for the thrid scene where the human is jumping and planting the flag
function sceneThree() {
    //counting scnene time elapsed
    if (TIME - timer > 1) {
        sceneTimers[2] += (TIME - timer);
        timer = TIME;
    }

    //human begins to jump and limbs straighten
    if (sceneTimers[2] < 3) {
        straightenLimbs(-1);
        humanCoordinates[1] += 0.065;
        humanCoordinates[0] += 0.05;
        eye[0] += 0.05;
        at[0] += 0.05;
    }
    //human begins to decsend and limbs bend 
    else if (sceneTimers[2] < 4) {
        bendLimbs(-1);
        humanCoordinates[1] -= 0.05;
        humanCoordinates[0] += 0.05;
        eye[0] += 0.05;
        at[0] += 0.05;
    }
    //starigten limbs upon landing and continue to drop human until they reach the ground
    else if (humanCoordinates[1] > 0) {
        straightenLimbs(1);
        humanCoordinates[1] -= 0.05;
        humanCoordinates[0] += 0.05;
        eye[0] += 0.05;
        at[0] += 0.05;
    }
    //planting the flag
    else {
        if (armAngles[1] < 90) {
            armAngles[1]++;
        }
    }
}


function render() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // set the projection matrix
    projectionMatrix = perspective(90, 1, near, far);

    // set the camera matrix
    viewMatrix = lookAt(eye, at, up);

    // initialize the modeling matrix stack
    MS = [];
    modelMatrix = mat4();

    // apply the slider rotations
    gRotate(RZ, 0, 0, 1);
    gRotate(RY, 0, 1, 0);
    gRotate(RX, 1, 0, 0);

    // send all the matrices to the shaders
    setAllMatrices();

    // get real time
    var curTime;
    if (animFlag) {
        curTime = (new Date()).getTime() / 1000;
        if (resetTimerFlag) {
            prevTime = curTime;
            resetTimerFlag = false;
        }
        TIME = TIME + curTime - prevTime;
        prevTime = curTime;
    }

    setAllMatrices();
    /*gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);*/


    /*gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "texture3"), 2);*/

    //counting every2 seconds
    if (TIME - sceneTimers[3] > 2) {
        sceneTimers[3] = TIME;

        //calculating fps per 2 seconds
        fps = frameCount / 2;

        //resetting the frame count
        frameCount = 0;

        //OUTPUTTING FPS
        console.log(fps + " FRAMES PER SECONDS");
    }

    //incrementing frame count 
    frameCount++;



    //play scene one 
    if (TIME < 14) {
        sceneOne();
    }
    //play scene 2
    else if (TIME < 43) {
        sceneTwo();
        DrawHuman(humanCoordinates[0], humanCoordinates[1], humanCoordinates[2], armAngles[0], armAngles[1], legAngles[0], legAngles[1], legAngles[2], legAngles[3]);
    }
    //play scene 3
    else if (TIME < 52) {
        sceneThree();
        DrawHuman(humanCoordinates[0], humanCoordinates[1], humanCoordinates[2], armAngles[0], armAngles[1], legAngles[0], legAngles[1], legAngles[2], legAngles[3]);
    }
    //play final scene
    else if (TIME < 60) {
        //360 camera view
        at[2] = humanCoordinates[2];
        eye[0] = 30.6 * Math.sin(angleCam) + 45;
        eye[2] = 30.6 * Math.cos(angleCam) + humanCoordinates[2];

        //incrementing camera angle
        if (angleCam < 20) {
            angleCam += 0.03;
        }

        //draw human
        DrawHuman(humanCoordinates[0], humanCoordinates[1], humanCoordinates[2], armAngles[0], armAngles[1], legAngles[0], legAngles[1], legAngles[2], legAngles[3]);
    }

    //drawing the rocket
    DrawRocket(shipCoordinates[0], shipCoordinates[1], shipCoordinates[2], shipAngle[2], shipAngle[0], shipAngle[1]);

    //drawing terrain
    gPush();
    {
        gTranslate(0, -5, 0);

        //drawing the ground terrain
        gPush();
        {
            gScale(80, 1, 80);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
            gl.uniform1i(gl.getUniformLocation(program, "texture2"), 0);
            drawCube();
        } gPop();

        //drawing the earth front image
        gPush(); {
            gTranslate(80, 15, 0);
            gRotate(90, 0, 0, 1);
            gScale(80, 1, 80);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textureArray[7].textureWebGL);
            gl.uniform1i(gl.getUniformLocation(program, "texture2"), 0);
            drawCube();
        } gPop();



        //sky box behind
        gPush(); {
            gTranslate(-40, 30, 0);
            gRotate(90, 0, 0, 1);
            gScale(30, 1, 80);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textureArray[6].textureWebGL);
            gl.uniform1i(gl.getUniformLocation(program, "texture2"), 0);
            drawCube();
        } gPop();
        //sky box front
        gPush(); {
            gTranslate(-40, 30, 0);
            gRotate(90, 0, 0, 1);
            gScale(30, 1, 80);
            drawCube();
        } gPop();


        //sky box side
        gPush(); {
            gTranslate(0, 30, -60);
            gRotate(90, 1, 0, 0);
            gScale(80, 1, 40);
            drawCube();
        } gPop();
        //sky box side
        gPush(); {
            gTranslate(0, 30, 60);
            gRotate(90, 1, 0, 0);
            gScale(80, 1, 40);
            drawCube();
        } gPop();

        //sky box cieling
        gPush(); {
            gTranslate(0, 50, 0);
            gScale(80, 1, 80);
            drawCube();
        } gPop();
    }
    gPop();


    if (animFlag)
        window.requestAnimFrame(render);
}

// A simple camera controller which uses an HTML element as the event
// source for constructing a view matrix. Assign an "onchange"
// function to the controller as follows to receive the updated X and
// Y angles for the camera:
//
//   var controller = new CameraController(canvas);
//   controller.onchange = function(xRot, yRot) { ... };
//
// The view matrix is computed elsewhere.
function CameraController(element) {
    var controller = this;
    this.onchange = null;
    this.xRot = 0;
    this.yRot = 0;
    this.scaleFactor = 3.0;
    this.dragging = false;
    this.curX = 0;
    this.curY = 0;

    // Assign a mouse down handler to the HTML element.
    element.onmousedown = function (ev) {
        controller.dragging = true;
        controller.curX = ev.clientX;
        controller.curY = ev.clientY;
    };

    // Assign a mouse up handler to the HTML element.
    element.onmouseup = function (ev) {
        controller.dragging = false;
    };

    // Assign a mouse move handler to the HTML element.
    element.onmousemove = function (ev) {
        if (controller.dragging) {
            // Determine how far we have moved since the last mouse move
            // event.
            var curX = ev.clientX;
            var curY = ev.clientY;
            var deltaX = (controller.curX - curX) / controller.scaleFactor;
            var deltaY = (controller.curY - curY) / controller.scaleFactor;
            controller.curX = curX;
            controller.curY = curY;
            // Update the X and Y rotation angles based on the mouse motion.
            controller.yRot = (controller.yRot + deltaX) % 360;
            controller.xRot = (controller.xRot + deltaY);
            // Clamp the X rotation to prevent the camera from going upside
            // down.
            if (controller.xRot < -90) {
                controller.xRot = -90;
            } else if (controller.xRot > 90) {
                controller.xRot = 90;
            }
            // Send the onchange event to any listener.
            if (controller.onchange != null) {
                controller.onchange(controller.xRot, controller.yRot);
            }
        }
    };
}


//this function draws the human in the animation as well as the flag taht the human is holding
//x, y, z represent the coordinates ofthe person
//armAngle1 and armAngle2 rep the angle of rotation for the arms about the shoulder
//thighAngle1 and thighAngle2 rep the angle of rotation for the upperlegs about the torso
//kneeAngle1 and kneeAngle2 rep the angle of rotation for the lower legs about the knee
function DrawHuman(x, y, z, armAngle1, armAngle2, thighAngle1, thighAngle2, kneeAngle1, kneeAngle2) {
    gPush(); {
        gTranslate(x, y, z);

        //drawing the astronaut and attachments
        gPush(); {
            gTranslate(0, 1.5, 0);
            toggleTextures();
            //drawing head
            gPush(); {
                gScale(0.4, 0.4, 0.4);
                setColor(vec4(1, 1, 1, 1.0));
                drawCube();
            } gPop();
            toggleTextures();
            //drawing helmet
            gPush(); {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, textureArray[4].textureWebGL);
                gl.uniform1i(gl.getUniformLocation(program, "texture2"), 0);
                gTranslate(0.4, 0, 0);
                gScale(0.01, 0.4, 0.4);
                drawCube();
            } gPop();
        } gPop();

        toggleTextures();
        //drawing body/torso
        gPush(); {
            gScale(0.4, 1, 0.75);
            drawCube();
        } gPop();
        toggleTextures();

        toggleTextures();

        //left arm
        gPush(); {
            gTranslate(0, 1, 0);
            gRotate(armAngle1, 0, 0, 1);

            gTranslate(0, -1, -1);
            gScale(0.3, 0.75, 0.25);
            setColor(vec4(1, 0, 1, 1));
            drawCube();
        } gPop();
        toggleTextures();

        //right arm and flag
        gPush(); {
            gTranslate(0, 1, 0);

            gRotate(armAngle2, 0, 0, 1);
            gTranslate(0, -1, 1);
            //drawing flag w pole
            gPush(); {

                gRotate(-90, 0, 0, 1);

                //pole
                gTranslate(0.8, 0.5, 0);
                gPush(); {
                    toggleTextures();
                    gTranslate(0, -2, 0);
                    gScale(0.05, 3.5, 0.05);
                    setColor(vec4(0.64, 0.16, 0.16, 1));
                    drawCube();
                    toggleTextures();
                } gPop();

                //flag
                gPush(); {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, textureArray[5].textureWebGL);
                    gl.uniform1i(gl.getUniformLocation(program, "texture2"), 0);
                    gTranslate(1, 0.9, 0);
                    gScale(1, 0.6, 0.05);
                    setColor(vec4(0, 0, 0, 1));
                    drawCube();
                } gPop();

            } gPop();
            toggleTextures();
            gScale(0.3, 0.75, 0.25);
            setColor(vec4(1, 0, 1, 1));

            drawCube();
            toggleTextures();
        } gPop();

        toggleTextures();

        //drawing legs 
        gPush(); {
            //drawing right leg
            gPush(); {
                gTranslate(0, -1.5, 0.4);
                gTranslate(0, 1, 0);
                gRotate(thighAngle2, 0, 0, 1);
                gTranslate(0, -1, 0);
                setColor(vec4(1, 0, 1, 1));
                gPush(); {
                    //drawing upper leg
                    gScale(0.3, 0.75, 0.25);
                    drawCube();
                } gPop();

                //drawing lower leg
                gPush(); {
                    gTranslate(0, -1.4, 0);
                    gTranslate(0, 1, 0);
                    gRotate(kneeAngle2, 0, 0, 1);
                    gTranslate(0, -1, 0);
                    gScale(0.3, 0.75, 0.25);
                    drawCube();
                } gPop();
            } gPop();


            //left leg
            gPush(); {
                gTranslate(0, -1.5, -0.4);
                gTranslate(0, 1, 0);
                gRotate(thighAngle1, 0, 0, 1);
                gTranslate(0, -1, 0);
                gPush(); {
                    //drawing upper leg
                    gScale(0.3, 0.75, 0.25);
                    drawCube();
                } gPop();

                //drawing lower leg
                gPush(); {
                    gTranslate(0, -1.4, 0);
                    gTranslate(0, 1, 0);
                    gRotate(kneeAngle1, 0, 0, 1);
                    gTranslate(0, -1, 0);
                    gScale(0.3, 0.75, 0.25);

                    drawCube();
                } gPop();
            } gPop();
        } gPop();
        toggleTextures();

    } gPop();
}



//this function draws the spaceship used in the animation
//x, y, z rep the coordinates of the spacehip
//theta1, 2, 3 represent the rotation fot he spaceship about the xyz axis
function DrawRocket(x, y, z, theta1, theta2, theta3) {
    gPush();
    {
        gTranslate(x, y, z);
        gRotate(theta1, 0, 0, 1);
        gRotate(theta3, 1, 0, 0);
        gRotate(-90, 0, 1, 0);
        gRotate(theta2, 0, 1, 0);

        //drawing the body of the ship
        gPush(); {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL);
            gl.uniform1i(gl.getUniformLocation(program, "texture2"), 0);
            gScale(0.75, 1.75, 0.75);
            drawSphere();
        } gPop();

        //drawing the top of the sship
        gPush();
        {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
            gl.uniform1i(gl.getUniformLocation(program, "texture2"), 0);
            gTranslate(0, 2, 0);
            gScale(0.6, 1.75, 0.6);
            gRotate(-90, 1, 0, 0);
            drawCone();
        }
        gPop();


        //drawing hte fin of the ship
        gPush();
        {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
            gl.uniform1i(gl.getUniformLocation(program, "texture2"), 0);
            gTranslate(0, 0, 0.8);
            gScale(0.05, 1, 1);
            gRotate(-90, 0, 0, 1);
            drawCone();
        }
        gPop();

        toggleTextures();
        gPush(); {
            //drawing flames
            if (fireOn) {
                gPush(); {
                    gTranslate(0, -2.2, 0);
                    gRotate(90, 1, 0, 0);
                    gScale(0.4, 0.4, 0.8);
                    setColor(vec4(1, 0, 0, 1));
                    drawCone();
                } gPop();

                //drawing flames
                for (var i = 0; i < 8; i++) {
                    gRotate(45 * i, 0, 1, 0);
                    gPush();
                    {
                        gTranslate(0.4, -1.8, 0);
                        gRotate(90, 1, 0, 0);
                        gPush(); {
                            gScale(0.25, 0.25, 0.25);
                            setColor(vec4(1, 1, 0, 1));
                            drawCone();
                        } gPop();

                    }
                    gPop();
                }
            }
        } gPop();
        toggleTextures();


        gPush(); {
            //drawing all of the 4 tail fins and flames
            for (var i = 0; i < 4; i++) {
                gRotate(90 * i, 0, 1, 0);
                gPush();
                {
                    gTranslate(0.65, -1.2, 0);

                    gPush(); {
                        gl.activeTexture(gl.TEXTURE0);
                        gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
                        gl.uniform1i(gl.getUniformLocation(program, "texture2"), 0);
                        gScale(0.75, 0.45, 0.05);
                        drawCube();
                    } gPop();

                    gPush();
                    {
                        gTranslate(0.35, -0.9, 0);
                        gScale(0.4, 0.45, 0.05);
                        drawCube();
                    }
                    gPop();

                }
                gPop();
            }
        } gPop();
    } gPop();
}