import { Instantiate } from "./src/engine_core/utils.js";
import { input, InputUpdate, InputLateUpdate } from "./src/engine_core/input.js"
import { Time } from "./src/engine_core/time.js";
import { Manager } from "./src/engine_core/manager.js";
import { Scene } from "./src/engine_core/scene.js";
import { audioCtx, Play } from "./src/engine_core/audio.js";
import { loadAudioClips, loadImages, loadObjects, loadShaders, loadTextureArray, loadCubeMaps } from "./src/engine_core/asset_io.js";
import { Renderer, AllocateUniformBuffer, AllocateInstancedBuffer, newFrameView } from "./src/engine_core/renderer.js";


import { Camera } from "./src/components/camera.js";
import { SpriteRenderer } from "./src/components/spriteRenderer.js";
import { TextRenderer } from "./src/components/textRenderer.js";
import { TileRenderer } from "./src/components/tileRenderer.js";
import { MeshRenderer } from "./src/components/meshRenderer.js";
import { SkyboxRenderer } from "./src/components/skyboxRenderer.js";
import { material as HDRmaterial } from "./src/hdrMaterial.js";

import { InitTextSystem, textboxAt, DrawPage, ClearPage, DrawMap } from "./build/module.js";
import { DemoEntity } from "./src/components/StateMachine.js";
import { Transform } from "./src/components/transform.js";


import { testrun, switchCharacter, VISISING_BARON, STABLEMASTER, HEADCHEF, HEAD_ENGINEER, JESTER, BISHOP, STEWARD, MAYOR, GENERAL } from "./inkle/inkle.js"

// creates an instance of the object to use for the background (window scene allows me to access objects from the console)
const scene = window.scene = new Scene();

// initialises the renderer and camera from the canvas; 
const canvas = document.querySelector("canvas");
export const renderer = new Renderer();
await Promise.all([renderer.initialise(canvas)])

const camera = Instantiate(new Camera(), new Transform());
camera.initialise(canvas);

window.camera = camera
// sets the camera position
camera.position = [0, -1, -15];




// load in the assets 
console.log("waiting for assets...");
// write textures shaders etc into seperate arrays so we can either collect them as an array per type or referance them individually. 
const [
    [backgroundTexture, placeholderTexture],
    [playerTexture, fontTexture, tileTexture, flatColorTexture, skyboxTexture, stablemasterTexture, bishopTexture],
    explosionTexture,
    [spriteShader, tileShader, textShader, meshShader, skyboxShader, spriteShaderWithAtlus],
    [quadMesh, textMesh, cubeMesh, suzanne],
    audioClips,
] = await Promise.all([
    loadImages(
        `/assets/sprites/ballroom_background.png`,
        `/assets/sprites/characterPortraits/placeholder guy.png`,
    ).then(textures => textures.map(texture => Object.assign(texture, { pixelScale: 1 / 256 })))
    , loadImages(
        `/assets/sprites/character.png`,
        `/assets/sprites/font.png`,
        `/assets/sprites/groundTile.png`,
        `/assets/sprites/flatColor.png`,
        `/assets/sprites/skybox.png`,
        `/assets/sprites/characterStanding/stablemaster.png`,
        `/assets/sprites/characterStanding/bishop.png`,
    ).then(textures => textures.map(texture => Object.assign(texture, { pixelScale: 1 / 64 })))
    , loadTextureArray(
        `/assets/sprites/explosion/explosion0000.png`,
        `/assets/sprites/explosion/explosion0001.png`,
        `/assets/sprites/explosion/explosion0002.png`,
        `/assets/sprites/explosion/explosion0003.png`,
        `/assets/sprites/explosion/explosion0004.png`,
        `/assets/sprites/explosion/explosion0005.png`,
        `/assets/sprites/explosion/explosion0006.png`,
        `/assets/sprites/explosion/explosion0007.png`,
        `/assets/sprites/explosion/explosion0008.png`,
        `/assets/sprites/explosion/explosion0009.png`,
        `/assets/sprites/explosion/explosion0010.png`,
        `/assets/sprites/explosion/explosion0011.png`,
        `/assets/sprites/explosion/explosion0012.png`,
        `/assets/sprites/explosion/empty.png`,
    ).then(texture => Object.assign(texture, { pixelScale: 1 / 64 }))
    , loadShaders(
        `/assets/shader/spriteShader.wgsl`,
        `/assets/shader/tileShader.wgsl`,
        `/assets/shader/textShader.wgsl`,
        `/assets/shader/meshShader.wgsl`,
        `/assets/shader/skyboxShader.wgsl`,
        `/assets/shader/spriteShaderWithAtlus.wgsl`,
    ), loadObjects(
        `/assets/models/quad.obj`,
        `/assets/models/textQuad.obj`,
        `/assets/models/cube.obj`,
        `/assets/models/suzanne.obj`,
    ), loadAudioClips(
        `/assets/audio/footstep1.wav`,
        `/assets/audio/footstep2.wav`,
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


const interactablePerson = {
    interactionRadius : 3,
    hasTalked :false, 
    
    CheckPosition() {
        // 核心：计算玩家到NPC的距离
        const player = window.player;
        const dx = this.position[0] - player.position[0];
        const dy = this.position[1] - player.position[1];
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        // 🔑 靠近 + 按E键 → 触发对话
        if (distance < this.interactionRadius && input.KeyE && !this.hasTalked) {
            console.log("触发马夫对话！");
            switchCharacter(this.characterProfile);  // ← 直接调用你的 Ink 函数
            this.hasTalked = true;  // 防止1帧内多次触发
        }
        
        // 离开交互范围 → 重置状态（可以再聊）
        if (distance > this.interactionRadius * 1.5) {
            this.hasTalked = false;
        }
        
        // 可选：视觉提示（靠近时放大/变色）
        if(this.hasTalked){
            const scale = 1 + (1 - distance / this.interactionRadius) * 0.2;
            this.scale = [scale, scale];
        }
    }
}

scene.heirachy["stablemaster"] = Instantiate(SpriteDependencies, interactablePerson, { 
    texture: placeholderTexture, 
    characterProfile : VISISING_BARON,
    Start() {
        this.position = [10,5, 0];
    },
    Update(){
        this.CheckPosition(); 

        
    }
})


scene.heirachy["stablemaster2"] = Instantiate(SpriteDependencies, interactablePerson, { 
    texture: placeholderTexture,  
    characterProfile : STABLEMASTER,
    Start() {
        this.position = [10,-1, 0];
    },
    Update(){
        this.CheckPosition(); 

        
    }
})

scene.heirachy["stablemaster3"] = Instantiate(SpriteDependencies, interactablePerson, { 
    texture: placeholderTexture,  
    characterProfile : HEADCHEF,
    Start() {
        this.position = [10,-7, 0];
    },
    Update(){
        this.CheckPosition(); 

        
    }
})

scene.heirachy["stablemaster4"] = Instantiate(SpriteDependencies, interactablePerson, { 
    texture: placeholderTexture,  
    characterProfile : HEAD_ENGINEER,
    Start() {
        this.position = [5,8, 0];
    },
    Update(){
        this.CheckPosition(); 

        
    }
})

scene.heirachy["stablemaster5"] = Instantiate(SpriteDependencies, interactablePerson, { 
    texture: placeholderTexture,  
    characterProfile : JESTER,
    Start() {
        this.position = [-5,8, 0];
    },
    Update(){
        this.CheckPosition(); 

        
    }
})

scene.heirachy["stablemaster6"] = Instantiate(SpriteDependencies, interactablePerson, { 
    texture: placeholderTexture,  
    characterProfile : BISHOP,
    Start() {
        this.position = [-10,5, 0];
    },
    Update(){
        this.CheckPosition(); 

        
    }
})

scene.heirachy["stablemaster7"] = Instantiate(SpriteDependencies, interactablePerson, { 
    texture: placeholderTexture,  
    characterProfile : STEWARD,
    Start() {
        this.position = [-10,-1, 0];
    },
    Update(){
        this.CheckPosition(); 

        
    }
})

scene.heirachy["stablemaster8"] = Instantiate(SpriteDependencies, interactablePerson, { 
    texture: placeholderTexture,  
    characterProfile : MAYOR,
    Start() {
        this.position = [-10,-7, 0];
    },
    Update(){
        this.CheckPosition(); 

        
    }
})

scene.heirachy["stablemaster9"] = Instantiate(SpriteDependencies, interactablePerson, { 
    texture: placeholderTexture,  
    characterProfile : GENERAL,
    Start() {
        this.position = [1,-7, 0];
    },
    Update(){
        this.CheckPosition(); 

        
    }
})

scene.heirachy["stablemaster10"] = Instantiate(SpriteDependencies, interactablePerson, { 
    texture: placeholderTexture,  
    characterProfile : GENERAL,
    Start() {
        this.position = [1,0, 0];
    },
    Update(){
        this.CheckPosition(); 

        
    }
})







const player = window.player = scene.heirachy["player"] = Instantiate(SpriteDependencies, new DemoEntity(), {
    texture: playerTexture,
    Update() {
        (window.using3D) ? Move3D() : Move2D();
        this.position = [x, y];
        this.skillSystem.call("onEvent");
    },
});









// since we are assigning a new material (since its using a texture array, instead of single texture, need to assign it first to replace the existing texture) 
const explosion = scene.heirachy["explosion"] = Instantiate(SpriteDependencies, {
    shaderModule: spriteShaderWithAtlus,
    material: HDRmaterial,
    texture: explosionTexture,

    startTime: Date.now() / 1000,

    Start() {
        canvas.addEventListener("mousedown", (e) => {
            console.log("updating Explosiion position");
            // CALULATE ANIMATION START TIME
            const currentTime = Date.now() / 1000;
            explosion.startTime = currentTime;

            // POSITION AT CURSOR POSITION ON THE Z PLANE
            const x = document.pointerLockElement ? 0 : input.mouseX;
            const y = document.pointerLockElement ? 0 : input.mouseY;
            const ray = camera.screenPositionToRay(x, y);
            const hit = camera.rayPlaneZ0(ray);
            console.log(ray, hit);

            this.position = hit;

            // PLAY AUDIO CLIP 
            console.log("playing clip");
            const clip = Math.floor(Math.random() * 2);
            const volume = 0.9 + (Math.random() * 0.1);
            const pitch = 0.7 + (Math.random() * 0.3);

            Play(audioClips[clip], { delay: 0, offset: 0, volume, pitch });
        });
    },

    Update() {
        const currentTime = Time.getCurrentTime();
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

    //for better fps tracking

    lastFPS: 0,
    timeLastUpdate: 0,

    Start() {
        InitTextSystem();
    },
    Update() {
        // Layout For a page
        ClearPage();

        screenLeft = -camera.aspect * (0.5 / camera.pixelScale);
        screenTop = (0.5 / camera.pixelScale);


        // updates fps for
        const roundedTime = Time.getCurrentTime().toFixed(1);
        if (this.timeLastUpdate != roundedTime) {
            this.timeLastUpdate = roundedTime;
            this.lastFPS = 1 / Time.deltaTime;
        }


        textboxAt(screenLeft + 2, screenTop - 8, `fps ${(this.lastFPS).toFixed(1)}`);
        textboxAt(Math.sin(Date.now() / 1000) * 20, 10, "wooo!!");
        textboxAt(0, 0, "hello world");

        textboxAt(0, -10, "this is a test");
        textboxAt(0, -20, "the more lines the better");
        const el = document.getElementById("text");
        if (el) textboxAt(0, -40, el.value);
        textboxAt(0, -50, `mouse x:${input.mouseX.toPrecision(3)} y${input.mouseY.toPrecision(3)}`);

        // completes page draw
        textObj.textLayout = DrawPage();
    }
});









// INPUT/MOVEMENT CONTROL FOR SPRITE 2
var x = 0, y = -1, xv = 0, yv = 0, zv = 0;
const cameraMouseSensitivity = 1 / 20;
const cameraControllerSensitivity = 1 * 3;

function Move3D() {

    var dx = input.moveHorizontal;
    var dz = -input.moveVertical; // look axis is inverted (same for all controllers, so ive made the mouse and keyboard act the same)
    //console.log(dx, dz, deltaTime);

    // sets the players speed. 
    const speed = 5;
    xv += dx * speed * Time.deltaTime;
    zv += dz * speed * Time.deltaTime;

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


const MIN_X = -15
const MAX_X = 15
const MIN_Y = -15
const MAX_Y = 12.5

// MOVE 2D 
// MOVE 2D
function Move2D() {
    const speed = 2;
    var dx = input.moveHorizontal;
    var dy = -input.moveVertical;

    // Apply velocity
    xv += dx * speed * Time.deltaTime;
    yv += dy * speed * Time.deltaTime;

    // Apply friction
    xv *= 0.8;
    yv *= 0.8;

    // Predict next position
    let nextX = x + xv;
    let nextY = y + yv;

    // Clamp within world bounds
    nextX = Math.min(Math.max(nextX, MIN_X), MAX_X);
    nextY = Math.min(Math.max(nextY, MIN_Y), MAX_Y);

    // Check collisions with obstacles
    if (checkCollision(nextX, y)) {
        // Hit obstacle in X direction, stop movement in X
        xv = 0;
        nextX = x; // stay in place
    }

    if (checkCollision(x, nextY)) {
        // Hit obstacle in Y direction, stop movement in Y
        yv = 0;
        nextY = y; // stay in place
    }

    // Update player position
    x = nextX;
    y = nextY;

    // Background boundaries for camera
    const BG_WIDTH = 0.5;   // Half-width of the background
    const BG_HEIGHT = 7.3; // Half-height of the background

    // Calculate target camera position (usually follows the player)
    let targetCamX = x;
    let targetCamY = y;

    // Stop the camera at background edges
    if (targetCamX > BG_WIDTH) targetCamX = BG_WIDTH;
    if (targetCamX < -BG_WIDTH) targetCamX = -BG_WIDTH;
    if (targetCamY > BG_HEIGHT) targetCamY = BG_HEIGHT;
    if (targetCamY < -BG_HEIGHT) targetCamY = -BG_HEIGHT;

    // Smoothly follow the target position
    camera.position.x += (targetCamX - camera.position.x) * 0.05;
    camera.position.y += (targetCamY - camera.position.y) * 0.05;
}

// Obstacles
const obstacles = [
    { x:10, y: 12, width: 13, height: 8 }, // Center (x, y), width, height
    { x:-9, y: 12, width: 13, height: 8 },
];

// Collision check
function checkCollision(px, py) {
    for (const obs of obstacles) {
        const left = obs.x - obs.width / 2;
        const right = obs.x + obs.width / 2;
        const top = obs.y + obs.height / 2;
        const bottom = obs.y - obs.height / 2;

        if (px >= left && px <= right && py >= bottom && py <= top) {
            return true; // Collision detected
        }
    }
    return false;
}










//-- sets up the game update order (all functions are once per frame) -- 
Manager.AddUpdateEvents([
    InputUpdate,
    () => Scene.HandleUpdate(scene),
    () => renderer.RenderPasses([{
        // RENDER PASS
        init: newFrameView,
        drawPass: (pass, gpu) => scene.ForAllObjects(obj => obj?.handlePass?.(pass, gpu, camera)) // draws the scene heirachy 
    }]),
    InputLateUpdate
]);
// starts the game loop
Manager.StartUpdateLoop();
console.log("started gameloop");
testrun();



/* INPUT */
document.getElementById("to2D")?.addEventListener("click", () => {
    DisableCanvasLock();
    Enable2DMouse();
});

document.getElementById("to3D")?.addEventListener("click", () => {
    Disable2DMouse();
    EnableCanvasLock();
});


const fsBtn = document.getElementById("fullscreen");
fsBtn.addEventListener(
    "click",
    (e) => {
        e.stopImmediatePropagation();
        const el =
            document.getElementById("modal") || document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();
    },
    true,
);

console.log("added external 'inputs'");