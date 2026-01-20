import { Instantiate } from "./assets/engine_core/utils.js";
import { input, Enable2DMouse, Disable2DMouse, DisableCanvasLock, EnableCanvasLock, InputUpdate, InputLateUpdate } from "./assets/engine_core/input.js"
import { Manager } from "./assets/engine_core/manager.js";
import { Scene } from "./assets/engine_core/scene.js";
import { audioCtx, Play } from "./assets/engine_core/audio.js";
import { loadAudioClips, loadImages, loadObjects, loadShaders, loadTextureArray, loadCubeMaps } from "./assets/engine_core/asset_io.js";
import { Renderer, AllocateUniformBuffer, AllocateInstancedBuffer, newFrameView } from "./assets/engine_core/renderer.js";


import { Camera } from "./assets/components/camera.js";
import { SpriteRenderer } from "./assets/components/spriteRenderer.js";
import { TextRenderer } from "./assets/components/textRenderer.js";
import { TileRenderer } from "./assets/components/tileRenderer.js";
import { MeshRenderer } from "./assets/components/meshRenderer.js";
import { SkyboxRenderer } from "./assets/components/skyboxRenderer.js";
import { material as HDRmaterial } from "./assets/shader/hdrMaterial.js";

import { InitTextSystem, textboxAt, DrawPage, ClearPage, DrawMap } from "./build/module.js";
import { DemoEntity } from "./assets/components/StateMachine.js";
import { Transform } from "./assets/components/transform.js";

import { BeginHosting } from "./assets/components/multiplayerHost.js";
import { BeginClient } from "./assets/components/multiplayerClient.js";


// creates an instance of the object to use for the background (window scene allows me to access objects from the console)
const scene = window.scene = new Scene();

// initialises the renderer and camera from the canvas; 
const [canvas, canvas2] = document.querySelectorAll("canvas");
export const [renderer, renderer2] = [new Renderer(), /* new Renderer()*/];
await Promise.all([renderer.initialise(canvas), /*renderer2.initialise(canvas2)*/]);

const camera = Instantiate(new Camera(), new Transform());
camera.initialise(canvas);
window.camera = camera;

// sets the camera position
camera.position = [0, -1, -10];


// load in the assets 
console.log("waiting for assets...");
// write textures shaders etc into seperate arrays so we can either collect them as an array per type or referance them individually. 
const [
    [playerTexture, fontTexture, tileTexture, backgroundTexture, flatColorTexture, skyboxTexture],
    explosionTexture,
    [spriteShader, tileShader, textShader, meshShader, skyboxShader, spriteShaderWithAtlus],
    [quadMesh, textMesh, cubeMesh, suzanne],
    audioClips,
] = await Promise.all([
    loadImages(
        "./assets/sprites/character.png",
        "./assets/sprites/font.png",
        "./assets/sprites/groundTile.png",
        "./assets/sprites/background.png",
        "./assets/sprites/flatColor.png",
        "./assets/sprites/skybox.png",
    ).then(textures => textures.map(texture => Object.assign(texture, { pixelScale: 1 / 64 })))
    , loadTextureArray(
        "./assets/sprites/explosion/explosion0000.png",
        "./assets/sprites/explosion/explosion0001.png",
        "./assets/sprites/explosion/explosion0002.png",
        "./assets/sprites/explosion/explosion0003.png",
        "./assets/sprites/explosion/explosion0004.png",
        "./assets/sprites/explosion/explosion0005.png",
        "./assets/sprites/explosion/explosion0006.png",
        "./assets/sprites/explosion/explosion0007.png",
        "./assets/sprites/explosion/explosion0008.png",
        "./assets/sprites/explosion/explosion0009.png",
        "./assets/sprites/explosion/explosion0010.png",
        "./assets/sprites/explosion/explosion0011.png",
        "./assets/sprites/explosion/explosion0012.png",
        "./assets/sprites/explosion/empty.png",
    ).then(texture => Object.assign(texture, { pixelScale: 1 / 64 }))
    , loadShaders(
        "./assets/shader/spriteShader.wgsl",
        "./assets/shader/tileShader.wgsl",
        "./assets/shader/textShader.wgsl",
        "./assets/shader/meshShader.wgsl",
        "./assets/shader/skyboxShader.wgsl",
        "./assets/shader/spriteShaderWithAtlus.wgsl",
    ), loadObjects(
        "./assets/models/quad.obj",
        "./assets/models/textQuad.obj",
        "./assets/models/cube.obj",
        "./assets/models/suzanne.obj",
    ), loadAudioClips(
        "./assets/audio/footstep1.wav",
        "./assets/audio/footstep2.wav",
    ),

]);

console.log("loaded assets");




// abstracted out the dependancies for sprites. 
// (can be passed in directly to the instantiate function)
export const SpriteDependencies = () => ([
    new SpriteRenderer(),
    new Transform(),
    {
        cameraMatrixBuffer: AllocateUniformBuffer(208),
        vertexBuffer: quadMesh,
        shaderModule: spriteShader,
    }
]);
// abstracted out dependancies for meshes.
export const MeshDependacies = () => ([MeshRenderer, new Transform(), {
        cameraMatrixBuffer: AllocateUniformBuffer(3 * 64),
        shaderModule: meshShader,
    }
]);
window.playerTexture = playerTexture; 



// 3d skybox behind everything.
const skybox = scene.heirachy["skybox"] = Instantiate(SkyboxRenderer, new Transform(), {
    vertexBuffer: cubeMesh,
    cameraMatrixBuffer: AllocateUniformBuffer(2 * 64),
    shaderModule: skyboxShader,
    texture: skyboxTexture,
});

// creates seperate instances of the object, order follows sorting order, higher is further back.  
const background = window.background = scene.heirachy["background"] = Instantiate(SpriteDependencies, {
    texture: backgroundTexture,
    Start() {
        this.position = [0, 0, 0];
    },
});




scene.heirachy["ground"] = Instantiate(TileRenderer, quadMesh, new Transform(), {
    transformBuffer: AllocateInstancedBuffer(8, (100 * 100)),
    cameraMatrixBuffer: AllocateUniformBuffer(208),
    tileLayout: DrawMap(0),
    vertexBuffer: quadMesh,
    shaderModule: tileShader,
    texture: tileTexture,

    Update() {
        this.tileLayout = DrawMap(Date.now() / 1000);
    }
});


scene.heirachy["sprite1"] = Instantiate(SpriteDependencies, {
    texture: playerTexture,
    Start() {
        this.position = [0, 0, 10];

    },
    distance: 0.2,
    Update() {
        const rotation = lastTime * 5;
        this.position = [Math.sin(rotation) * this.distance, Math.cos(rotation) * this.distance, 0];
    },

});

const player = window.player = scene.heirachy["player"] = Instantiate(SpriteDependencies, new DemoEntity(), {
    texture: playerTexture,
    Update() {
        this.position = [x, y];
        this.skillSystem.call("onEvent");
    },
});






// #region 3D SCENE 




const cube = window.cube = scene.heirachy["cube"] = Instantiate(MeshDependacies, {
    vertexBuffer: suzanne,
    texture: flatColorTexture,
    Start() {
        this.position = [0, -1, -6];
        this.scale = [0.4, 0.4, 0.4];
    },
    Update() {
        this.rotation = [Date.now() / 50 % 360, 0, 0];
        this.position.x = Math.sin(Date.now() / 1000) * 0.2;



        //console.log(this.quaternion); 
    }
});



const plane = window.plane = scene.heirachy["plane"] = Instantiate(MeshDependacies, {
    vertexBuffer: cubeMesh,
    texture: backgroundTexture,
    Start() {
        this.position = [1, -11, -20];
        this.rotation = [0, 0, 0];
        this.scale = [20, 1, 20];
    }
});

//#endregion */




// since we are assigning a new material (since its using a texture array, instead of single texture, need to assign it first to replace the existing texture) 
const explosion = scene.heirachy["explosion"] = Instantiate(SpriteDependencies, {
    shaderModule: spriteShaderWithAtlus,
    material: HDRmaterial,
    texture: explosionTexture,

    startTime: Date.now() / 1000,

    Start() {
        canvas.addEventListener("mousedown", (e) => {
            console.log("updating Explosiion position");
            const currentTime = Date.now() / 1000;
            explosion.startTime = currentTime;

            const x = using3D ? 0 : input.mouseX;
            const y = using3D ? 0 : input.mouseY;
            const ray = camera.screenPositionToRay(x, y);
            const hit = camera.rayPlaneZ0(ray);
            console.log(ray, hit);

            this.position = hit;
        });
    },

    Update() {
        const currentTime = Date.now() / 1000;
        const animStartTime = this.startTime || currentTime;
        const timePerFrame = 1 / 12;
        const currentFrame = Math.min(Math.floor((currentTime - animStartTime) / timePerFrame), explosionTexture.layers - 1);

        //console.log(currentFrame, `started ${currentTime - animStartTime} seconds ago`, (currentTime - animStartTime) * timePerFrame); 

        this.textureIndex = currentFrame;
        //console.log(this); 
    }
});


const textObj = scene.heirachy["textObj"] = Instantiate(TextRenderer, new Transform(), {
    vertexBuffer: textMesh,
    cameraMatrixBuffer: AllocateUniformBuffer(88),
    transformBuffer: AllocateInstancedBuffer(256, 1000, 255),
    shaderModule: textShader,
    texture: fontTexture,

    Start() {
        InitTextSystem();
    },
    Update() {
        // Layout For a page
        ClearPage();

        screenLeft = -camera.aspect * (0.5 / camera.pixelScale);
        screenTop = (0.5 / camera.pixelScale);

        textboxAt(screenLeft + 2, screenTop - 8, `fps ${(lastFPS).toFixed(1)}`);
        textboxAt(Math.sin(Date.now() / 1000) * 20, 10, "wooo!!");
        textboxAt(0, 0, "hello world");

        textboxAt(0, -10, "this is a test");
        textboxAt(0, -20, "the more lines the better");
        const el = document.getElementById("text");
        textboxAt(0, -40, el.value);
        textboxAt(0, -50, `mouse x:${input.mouseX.toPrecision(3)} y${input.mouseY.toPrecision(3)}`);

        // completes page draw
        textObj.textLayout = DrawPage();
    }
});









// sets up delta time for frame independant movement *almost
var lastTime = Date.now();
var deltaTime = 1;
var smoothedFPS = 0.1;
var lastFPS = 0;
var fpsCounter = 0;


function HandleTime() {
    const currentTime = Date.now() / 1000; // time in seconds 
    deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    const fps = 1 / deltaTime;

    if (Math.abs(smoothedFPS - fps) > smoothedFPS || smoothedFPS != Number.isFinite)
        smoothedFPS = fps;
    smoothedFPS = (smoothedFPS * 0.9) + (fps * 0.1);

    if (fpsCounter != currentTime.toFixed(1)) {
        fpsCounter = currentTime.toFixed(1);
        lastFPS = smoothedFPS;
    }
}


// INPUT/MOVEMENT CONTROL FOR SPRITE 2
var x = 0, y = -1, xv = 0, yv = 0, zv = 0;
window.xv = xv;
window.xv = yv;
window.zv = zv;


const cameraMouseSensitivity = 1 / 20;
const cameraControllerSensitivity = 1 * 3;

function Move3D() {

    var dx = input.moveHorizontal;
    var dz = -input.moveVertical; // look axis is inverted (same for all controllers, so ive made the mouse and keyboard act the same)
    //console.log(dx, dz, deltaTime);

    // sets the players speed. 
    const speed = 5;
    xv += dx * speed * deltaTime;
    zv += dz * speed * deltaTime;

    // adds drag
    xv *= 0.8;
    zv *= 0.8;

    // allows mouse and controller look
    HandleCameraRotation();

    // moves relitive to camera direction
    const sin = Math.sin(camera.rotation.x * Math.PI / 180);
    const cos = Math.cos(camera.rotation.x * Math.PI / 180);

    //console.warn(sin, cos,xv, zv);

    camera.position.x += sin * zv + cos * xv;
    camera.position.z += cos * zv - sin * xv;

}



function HandleCameraRotation() {
    // controller look rotation 
    camera.rotation.x += input.lookHorizontal * cameraControllerSensitivity;
    camera.rotation.y += input.lookVertical * cameraControllerSensitivity;
    // mouse look rotation
    camera.rotation.x += input.mouseX * cameraMouseSensitivity;
    camera.rotation.y += input.mouseY * cameraMouseSensitivity;

    // clamps camera look rotation so you cant get upside down
    if (Math.abs(camera.rotation.y) > 90)
        camera.rotation.y = Math.sign(camera.rotation.y) * 90;
}


// MOVE 2D 
function Move2D() {
    const speed = 2;
    var dx = input.moveHorizontal;
    var dy = -input.moveVertical;

    xv += dx * speed * deltaTime;
    yv += dy * speed * deltaTime;

    xv *= 0.8;
    yv *= 0.8;

    x += xv;
    y += yv;


    camera.position.x += ((x - camera.position.x) * 0.05);
    camera.position.y += ((y - camera.position.y) * 0.05);

}








// initialisation of all the objects in the scene 

scene.ForAllObjects(obj => {
    //console.log(obj);
    obj.init?.(renderer.device);
    obj.Start?.();
});

function HandleUpdate() {
    scene.ForAllObjects(obj => {
        obj.Update?.();
    });
}

//-- sets up the game update order (all functions are once per frame) -- 
Manager.AddUpdateEvents([
    HandleTime,
    InputUpdate,
    HandleUpdate,
    () => (using3D) ? Move3D() : Move2D(),
    /*begin rendering*/
    () => renderer.RenderPasses([{
        init: newFrameView,
        drawPass: (pass, gpu) => scene.ForAllObjects(obj => obj?.handlePass?.(pass, gpu, camera)) // draws the scene heirachy 
    }]),
    InputLateUpdate
]);
// starts the game loop
Manager.StartUpdateLoop();
console.log("started gameloop");


























// #region Input Elements 
var using3D = false;
document.getElementById("to2D").addEventListener("click", (e) => {
    DisableCanvasLock();
    Enable2DMouse();
    using3D = false;
});
document.getElementById("to3D").addEventListener("click", (e) => {
    Disable2DMouse();
    EnableCanvasLock();
    using3D = true;
});
document.getElementById("fullscreen").addEventListener("click", (e) => {

    const elem = canvas;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
});
//#endregion
console.log("added external 'inputs'");





//#region  AUDIO
// on user start called only on first user input, 
document.addEventListener("mousedown", OnUserStart);
function OnUserStart() {
    // makes sure the user permissions haven't paused the audio 
    audioCtx.resume();
    console.log("starting audio");
    document.removeEventListener("mousedown", OnUserStart);
};
// click to play clip
document.addEventListener("mousedown", () => {
    console.log("playing clip");
    const clip = Math.floor(Math.random() * 2);
    const volume = 0.9 + (Math.random() * 0.1);
    const pitch = 0.7 + (Math.random() * 0.3);

    Play(audioClips[clip], { delay: 0, offset: 0, volume, pitch });
});
//#endregion
console.log("added audio");