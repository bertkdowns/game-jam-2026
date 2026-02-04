
// makes Texture... etc, something i can Referance without having to import types to everything that uses them
declare global {
  interface Window {
    renderer: Renderer;
  }

  interface Texture {
    view: GPUTextureView,
    width: number,
    height: number,
  }
  interface TextureArray extends Texture {
    layers: number;
  }


  interface RenderPass {
    init: (renderer: Renderer) => GPURenderPassDescriptor,
    drawPass: (renderPass: GPURenderPassEncoder, gpu: GPUDevice) => void,
  }


  interface Bitmap {
    width: number;
    height: number;
    textureFormat: GPUTextureDescriptor;
    data: ImageDataArray | GPUAllowSharedBufferSource;
    view: GPUTextureView;
    pixelScale: number | 0.015625; // 1/64
  }
  interface Mesh {
    vertexBuffer: GPUBuffer,
    vertexCount: number
  }
}

export interface MeshRaw {
  verts: Float32Array;
  vertCount: number;
}


export interface RenderableObject {
  renderPipeline: GPURenderPipeline;
  bindGroup: GPUBindGroup;

  vertexBuffer: GPUBuffer;
  vertexCount: number;
  cameraMatrixBuffer: GPUBuffer;
  material: any;
  shaderModule: GPUShaderModuleDescriptor;
  texture: Bitmap;

  GetTransformMatrix: () => number[]; // & { length: 16 };
  handlePass: (pass: GPURenderPassEncoder, gpu: GPUDevice, camera: RenderCamera) => void;
  init: () => void;
}

export interface RenderCamera {
  ViewMatrix: () => Matrix;
  PerspectiveMatrix: () => Matrix;
  UIToScreenMatrix: () => Matrix;

}

export const newFrameView = (renderer: Renderer) => ({
  colorAttachments: [
    {
      view: Renderer.context?.getCurrentTexture().createView(),
      loadOp: "clear",
      clearValue: {
        r: Math.sin(Date.now() / 1000) / 2 + 0.5,
        g: 0.4,
        b: 0.4,
        a: 1,
      },
      storeOp: "store",
    },
  ],
  depthStencilAttachment: attachmentFromDepthTexture(Renderer.depthTexture),
}) as GPURenderPassDescriptor;

export const previousFrameView = () => ({
  colorAttachments: [
    {
      view: Renderer.context?.getCurrentTexture().createView(),
      loadOp: "load",
      storeOp: "store",
    },
  ],
  depthStencilAttachment: attachmentFromDepthTexture(Renderer.depthTexture),
}) as GPURenderPassDescriptor;

const attachmentFromDepthTexture = (depthTexture: GPUTexture) => ({
  view: depthTexture.createView(),
  depthLoadOp: "clear",
  depthStoreOp: "store",
  depthClearValue: 1.0,
});
export const createDepthTextureFromCanvas = (canvas: HTMLCanvasElement) =>
  Renderer.device.createTexture({
    size: {
      width: canvas.width,
      height: canvas.height,
      depthOrArrayLayers: 1,
    },
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });


// === RENDERER === 
export class Renderer {
  // variables
  static canvas: HTMLCanvasElement;
  static canvasFormat: GPUTextureFormat = "bgra8unorm";
  static context: GPUCanvasContext | null;
  static device: GPUDevice;
  static depthTexture: GPUTexture;

  static async CreateFromCanvas(canvas: HTMLCanvasElement) {

    const context = canvas.getContext("webgpu");  // canvas.getContext("webgpu");
    console.log("context", context);


    //check if webgpu exists/supported
    if (!navigator.gpu || !context)
      throw new Error("WebGPU not supported on this browser.");

    console.log("waiting for adapter...");
    const adapter = await navigator.gpu.requestAdapter();

    if (!adapter) throw new Error("No appropriate GPUAdapter found.");
    // gets the addressable version of the gpu
    console.log("waiting for device...");
    const device = await adapter.requestDevice();
    const format = navigator.gpu.getPreferredCanvasFormat();

    return new Renderer(canvas, context, device, format);
  }


  constructor(canvas: HTMLCanvasElement, context: GPUCanvasContext, device: GPUDevice, format: GPUTextureFormat) {

    Renderer.canvas = canvas;
    Renderer.context = context;
    Renderer.context.configure({ device, format });
    Renderer.device = device;
    Renderer.canvasFormat = format;
    Renderer.depthTexture = createDepthTextureFromCanvas(canvas);
    window.renderer = this;
  }


  // draws all the passes, then submits the resulting comandbuffer to the gpu
  RenderPasses(passes: RenderPass[]) {
    const renderer = this;
    const CB_encoder = Renderer.device.createCommandEncoder();

    for (const pass of passes) {
      // starts pass (add whatever to renderpass then end it)
      const renderPass = CB_encoder.beginRenderPass(pass.init(renderer));
      pass.drawPass(renderPass, Renderer.device);
      renderPass.end();
      // ends the pass
    }

    Renderer.device.queue.submit([CB_encoder.finish()]); // submits the commandbuffer directly
  }
}










// (ASSET -> GPU) INITIALSATION FUNCTIONS 

export function AllocateTexture(bitmap: Bitmap): Texture {
  const texture = Renderer.device.createTexture(
    Object.assign({ size: [bitmap.width, bitmap.height] }, bitmap.textureFormat)
  );
  Renderer.device.queue.writeTexture(
    { texture },
    bitmap.data,
    { bytesPerRow: bitmap.width * 4 },
    { width: bitmap.width, height: bitmap.height }
  );
  return {
    view: texture.createView(),
    width: bitmap.width,
    height: bitmap.height,
  };
}

export function AllocateCubeMap(bitmap: Bitmap): Texture {
  const texture = Renderer.device.createTexture(
    Object.assign({ size: [bitmap.width, bitmap.height] }, bitmap.textureFormat)
  );
  Renderer.device.queue.writeTexture(
    { texture },
    bitmap.data,
    { bytesPerRow: bitmap.width * 4 },
    { width: bitmap.width, height: bitmap.height }
  );
  return {
    view: texture.createView({ dimension: "cube" }),
    width: bitmap.width,
    height: bitmap.height,
  };
}

export function AllocateTextureArray(bitmaps: Bitmap[]): TextureArray {
  const width = bitmaps[0].width;
  const height = bitmaps[0].height;
  const layers = bitmaps.length;
  const textureArray = Renderer.device.createTexture(
    Object.assign({ size: [width, height, layers] }, bitmaps[0].textureFormat)
  );

  for (let i = 0; i < layers; i++) {
    const bmp = bitmaps[i];
    Renderer.device.queue.writeTexture(
      {
        texture: textureArray,
        origin: { x: 0, y: 0, z: i },
      },
      bmp.data,
      { bytesPerRow: width * 4 },
      { width, height }
    );
  }

  return {
    view: textureArray.createView({
      dimension: "2d-array",
      arrayLayerCount: layers,
    }),
    width,
    height,
    layers,
  };
}

export function AllocateMesh(mesh: MeshRaw): Mesh {
  const createBuffer = (arr: Float32Array, usage: number) => {
    let desc = {
      size: (arr.byteLength + 3) & ~3, // Align to 4 bytes (thanks @chrimsonite)
      usage,
      mappedAtCreation: true,
    };

    let buffer = Renderer.device.createBuffer(desc);
    const writeArray =
      arr instanceof Uint16Array
        ? new Uint16Array(buffer.getMappedRange())
        : new Float32Array(buffer.getMappedRange());
    writeArray.set(arr);
    buffer.unmap();
    return buffer;
  };
  return { vertexBuffer: createBuffer(mesh.verts, GPUBufferUsage.VERTEX), vertexCount: mesh.vertCount };
}


export function AllocateShaderModule(shader: GPUShaderModuleDescriptor): GPUShaderModule {
  return Renderer.device.createShaderModule(shader); // new shader module from wgsl-string
}

export function AllocateUniformBuffer(size: number, strideOffset: number = 16): GPUBuffer {
  strideOffset--;
  return Renderer.device.createBuffer({
    label: ` uniform Buffer, ${size} `,
    size: (size + strideOffset) & ~strideOffset,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
}

export function AllocateInstancedBuffer(sizePerInstance: number, count: number, strideOffset: number = 16): GPUBuffer {
  strideOffset--;
  return Renderer.device.createBuffer({
    label: ` uniform Buffer, ${sizePerInstance}x${count} `,
    size: count * ((sizePerInstance + strideOffset) & ~strideOffset),
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
}
