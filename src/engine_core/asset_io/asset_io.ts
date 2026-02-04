import { AllocateMesh, AllocateTexture, AllocateShaderModule, AllocateTextureArray, AllocateCubeMap, MeshRaw } from "@engine_core/renderer";
import { audioCtx } from "@engine_core/audio/audio";

export const loadImages = (...src: any[]) => Promise.all(src.map(loadImage));
export const loadCubeMaps = (...src: any[]) => Promise.all(src.map(loadCubeMap));
export const loadShaders = (...src: any[]) => Promise.all(src.map(loadShader));
export const loadAudioClips = (...src: any[]) => Promise.all(src.map(loadAudioClip));
export const loadObjects = (...src: any[]) => Promise.all(src.map(loadObject));
export const loadInkFiles = (...src: any[]) => Promise.all(src.map(loadInkFile));

export const loadImage = (src: string) => fetch(src).then((r) => r.blob()).then(decodeImage).then((bitmap) => AllocateTexture(bitmap)).catch((err) => console.error(err));
export const loadCubeMap = (src: string) => fetch(src).then((r) => r.blob()).then(decodeImage).then((bitmap) => AllocateCubeMap(bitmap)).catch((err) => console.error(err));
export const loadShader = (src: string) => fetch(src).then((r) => r.text()).then(decodeShader).then((text) => AllocateShaderModule({ label: src, code: text })).catch((err) => console.error(err));
export const loadAudioClip = (src: string) => fetch(src).then((r) => r.arrayBuffer()).then(decodeAudio).then((buffer) => { return { src, buffer }; }).catch((err) => console.error(err));
export const loadObject = (src: string) => fetch(src).then((r) => r.text()).then(decodeObject).then((array) => AllocateMesh(array)).catch((err) => console.error(err));

export const loadInkFile = (src: string) => fetch(src).then((r) => r.text());

export const loadTextureArray = (...src: any[]) =>
  Promise.all(src.map((src) => fetch(src).then((r) => r.blob()).then(decodeImage))).then((bitmaps) => AllocateTextureArray(bitmaps)).catch((err) => console.error(err));






/* converts the image from blob to byteArray*/
async function decodeImage(blob: Blob): Promise<Bitmap> {
  try {
    //return { data: {}, width: 0, height: 0, textureFormat:{ format: 'rgba8unorm', usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST }};

    const arrayBuffer = await blob.arrayBuffer();
    const bmp = await createImageBitmap(new Blob([arrayBuffer]), {
      premultiplyAlpha: "none",
    });

    // Draw into a canvas to extract pixel data

    const canvas = new OffscreenCanvas(bmp.width, bmp.height);
    const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;

    ctx.drawImage(bmp, 0, 0);

    const img = ctx.getImageData(0, 0, bmp.width, bmp.height);

    const textureFormat = {
      format: "rgba8unorm",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    };
    return {
      data: img.data,
      width: bmp.width,
      height: bmp.height,
      textureFormat,
    } as Bitmap;
  } catch (err) {
    console.error(err, blob);
    return {} as Bitmap;
  }
}

async function decodeShader(text: string): Promise<string> {
  return text;
}

async function decodeAudio(data: ArrayBuffer): Promise<AudioBuffer> {
  return audioCtx.decodeAudioData(data);
}

type vector = number[];

async function decodeObject(text = ""): Promise<MeshRaw> {
  const v: vector[] = [];
  const vt: vector[] = [];
  const vn: vector[] = [];
  const f: vector[][] = [];
  const buffer: vector[] = [];
  var label: string;

  // parse lines
  const lines = text.split("\n");
  lines.forEach((line) => {
    // splits lines by white space
    const token = line.trim().split(/\s+/);

    // uses the first token to check which type of data its targeting
    switch (token[0]) {
      case "v":
        v.push(destructVectorToken());
        break;
      case "vt":
        vt.push(destructVectorToken());
        break;
      case "vn":
        vn.push(destructVectorToken());
        break;
      case "f":
        f.push(destructFaceToken());
        break;
      case "o":
        label = token[1];

      default:
        break;
    }

    // parses the rest of the token (independant of length so can handle vec2 & vec3)
    function destructVectorToken(): vector {
      const p: vector = [];
      for (let i = 1; i < token.length; i++) p.push(parseFloat(token[i]));
      return p;
    }
    // goes through each token (corner) and stores the numbers so face = [[corner(xy,uv)as indices], [corner...] ...]
    function destructFaceToken() {
      const face: vector[] = [];
      for (let i = 1; i < token.length; i++) {
        const s = token[i].split("/");
        const corner: vector = [];
        for (let k = 0; k < s.length; k++) corner.push(parseInt(s[k]));
        face.push(corner);
      }
      return face;
    }
  });

  // counts the amount of verts so we have a number of verts/triangles to draw later.
  var vertCount = 0;
  f.forEach((face) => {
    // collect corners of face
    const corners = face.map((corner) => {
      // gets the vert, uv and normal data as arrays [[vert (xy)],[uv (xy)], [normal(empty for 2d)]]
      const vert = v[corner[0] - 1]; // .obj starts at 1 not 0
      const uv = vt[corner[1] - 1];
      const normal = vn[corner[2] - 1] || [];
      // flattens them so its now [x,y,z,u,v,nx,ny,nz] or in this 2d case [x,y,u,v]
      return [...vert, ...uv, ...normal];
    });

    /*
        // triangle-strip
        buffer.push(...corners);
        vertCount+= corners.length;
        */

    // writes each individual 'triangle' to the buffer buffer
    if (corners.length == 3) {
      // pushes all corners as in the case of a triangle
      buffer.push(...corners);
      vertCount += 3;
    } else if (corners.length == 4) {
      // if its a quad then, we triangulate it manually.
      // index the corners individually to make 2 triangles
      buffer.push(corners[0], corners[1], corners[2]);
      buffer.push(corners[0], corners[2], corners[3]);
      vertCount += 6;
    }

    // not handling ngons
  });

  //console.log(label, vertCount);

  // are building up an array of arrays so flatten it to a single buffer [[corner(x,y,u,v)],[corner(x,y,u,v)]] -> [x,y,u,v,x,y,u,v]
  return { vertCount, verts: new Float32Array(buffer.flat()) };
}
