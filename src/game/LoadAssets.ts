import { MeshRenderer } from "../components/meshRenderer";
import { SpriteRenderer } from "../components/spriteRenderer";
import { Transform } from "../components/transform";
import {
  loadAudioClips,
  loadImages,
  loadObjects,
  loadShaders,
  loadTextureArray,
  loadInkFiles, 
} from "../engine_core/asset_io";
import { AllocateUniformBuffer } from "../engine_core/renderer";

// Export variables that will be set after loading
export let backgroundTexture: any;
export let placeholderTexture: any;
export let tutorialTexture: any;
export let endingTexture: any;
export let playerTexture: any;
export let fontTexture: any;
export let flatColorTexture: any;
export let skyboxTexture: any;
export let stablemasterTexture: any;
export let bishopTexture: any;
export let explosionTexture: any;
export let spriteShader: any;
export let tileShader: any;
export let textShader: any;
export let meshShader: any;
export let skyboxShader: any;
export let spriteShaderWithAtlus: any;
export let quadMesh: any;
export let textMesh: any;
export let cubeMesh: any;
export let suzanne: any;
export let audioClips: any[];
export let endingStory: string;
export let tutorialStory: string;
export let inkStory: string;


// Function to load all assets (must be called after renderer is initialized)
export async function loadAllAssets() {
  const [
    [bgTexture, placeholderTex, tutorialTex , playerTex,],
    [
      fontTex,
      flatColorTex,
      skyboxTex,
      stablemasterTex,
      bishopTex,
    ],
    explosionTex,
    [spriteSh, tileSh, textSh, meshSh, skyboxSh, spriteShaderWithAtlusSh],
    [quadM, textM, cubeM, suzanneM],
    audioClipsArray,
    [endingInk, storyInk, tutorialInk], 
  ] = await Promise.all([
    loadImages(
      `/assets/sprites/ballroom_background.png`,
      `/assets/sprites/characterPortraits/placeholder guy.png`,
      `/assets/sprites/intro_background.png`,
      `/assets/sprites/character.png`,
    ).then((textures) =>
      textures.map((texture: any) =>
        Object.assign(texture, { pixelScale: 1 / 256 })
      )
    ),
    loadImages( 
      `/assets/sprites/font.png`,
      `/assets/sprites/flatColor.png`,
      `/assets/sprites/skybox.png`,
      `/assets/sprites/characterStanding/stablemaster.png`,
      `/assets/sprites/characterStanding/bishop.png`
    ).then((textures) =>
      textures.map((texture: any) =>
        Object.assign(texture, { pixelScale: 1 / 64 })
      )
    ),
    loadTextureArray(
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
      `/assets/sprites/explosion/empty.png`
    ).then((texture: any) => Object.assign(texture, { pixelScale: 1 / 64 })),
    loadShaders(
      `/assets/shader/spriteShader.wgsl`,
      `/assets/shader/tileShader.wgsl`,
      `/assets/shader/textShader.wgsl`,
      `/assets/shader/meshShader.wgsl`,
      `/assets/shader/skyboxShader.wgsl`,
      `/assets/shader/spriteShaderWithAtlus.wgsl`
    ),
    loadObjects(
      `/assets/models/quad.obj`,
      `/assets/models/textQuad.obj`,
      `/assets/models/cube.obj`,
      `/assets/models/suzanne.obj`
    ),
    loadAudioClips(
      `/assets/audio/footstep1.wav`,
      `/assets/audio/footstep2.wav`
    ),
    loadInkFiles(
      `/assets/dialogue/ending.ink`, 
      `/assets/dialogue/inkstory.ink`, 
      `/assets/dialogue/tutorial.ink`, 
    ), 

    
  ]);

  // Assign to exported variables
  backgroundTexture = bgTexture;
  placeholderTexture = placeholderTex;
  tutorialTexture = tutorialTex;
  endingTexture = tutorialTex; // using tutorial texture for ending until we have an ending background
  playerTexture = playerTex;
  fontTexture = fontTex;
  flatColorTexture = flatColorTex;
  skyboxTexture = skyboxTex;
  stablemasterTexture = stablemasterTex;
  bishopTexture = bishopTex;
  explosionTexture = explosionTex;
  spriteShader = spriteSh;
  tileShader = tileSh;
  textShader = textSh;
  meshShader = meshSh;
  skyboxShader = skyboxSh;
  spriteShaderWithAtlus = spriteShaderWithAtlusSh;
  quadMesh = quadM;
  textMesh = textM;
  cubeMesh = cubeM;
  suzanne = suzanneM;
  audioClips = audioClipsArray;
  endingStory = endingInk;
  tutorialStory= tutorialInk;
  inkStory = storyInk;
  
}

// abstracted out the dependancies for sprites.
// (can be passed in directly to the instantiate function)
export const SpriteDependencies = () => [
  new SpriteRenderer(),
  new Transform(),
  {
    cameraMatrixBuffer: AllocateUniformBuffer(208),
    vertexBuffer: quadMesh,
    shaderModule: spriteShader,
  },
];
// abstracted out dependancies for meshes.
export const MeshDependacies = () => [
  MeshRenderer,
  new Transform(),
  {
    cameraMatrixBuffer: AllocateUniformBuffer(3 * 64),
    shaderModule: meshShader,
  },
];
