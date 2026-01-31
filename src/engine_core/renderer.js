export var gpu;

export const newFrameView = (renderer) => ({
  colorAttachments: [
    {
      view: renderer.context.getCurrentTexture().createView(),
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
  depthStencilAttachment: attachmentFromDepthTexture(renderer.depthTexture),
});
const previousFrameView = (renderer) => ({
  colorAttachments: [
    {
      view: renderer.context.getCurrentTexture().createView(),
      loadOp: "load",
      storeOp: "store",
    },
  ],
  depthStencilAttachment: attachmentFromDepthTexture(renderer.depthTexture),
});

const attachmentFromDepthTexture = (depthTexture) => ({
  view: depthTexture.createView(),
  depthLoadOp: "clear",
  depthStoreOp: "store",
  depthClearValue: 1.0,
});
export const createDepthTextureFromCanvas = (canvas) =>
  gpu.createTexture({
    size: {
      width: canvas.width,
      height: canvas.height,
      depthOrArrayLayers: 1,
    },
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

export class Renderer {
  // variables
  context;
  device;
  depthTexture;

  async initialise(canvas) {
    const context = (this.context = canvas.getContext("webgpu"));

    //check if webgpu exists/supported
    if (!navigator.gpu)
      throw new Error("WebGPU not supported on this browser.");
    console.log("waiting for adapter...");
    const adapter = await navigator.gpu.requestAdapter();

    if (!adapter) throw new Error("No appropriate GPUAdapter found.");
    // gets the addressable version of the gpu
    console.log("waiting for device...");
    const device = (this.device = await adapter.requestDevice());
    const format = navigator.gpu.getPreferredCanvasFormat();

    Object.assign(device, { canvasFormat: format, canvas });
    context.configure({ device, format });

    gpu = device;
    this.depthTexture = createDepthTextureFromCanvas(canvas);
    window.renderer = this;
  }

  // draws all the passes, then submits the resulting comandbuffer to the gpu
  RenderPasses(passes) {
    const renderer = this;
    const CB_encoder = gpu.createCommandEncoder();

    for (const pass of passes) {
      // starts pass (add whatever to renderpass then end it)
      const renderPass = CB_encoder.beginRenderPass(pass.init(renderer));
      pass.drawPass(renderPass, gpu);
      renderPass.end();
      // ends the pass
    }

    gpu.queue.submit([CB_encoder.finish()]); // submits the commandbuffer directly
  }
}

export function AllocateTexture(bitmap) {
  const texture = gpu.createTexture(
    Object.assign({ size: [bitmap.width, bitmap.height] }, bitmap.textureFormat)
  );
  gpu.queue.writeTexture(
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

export function AllocateCubeMap(bitmap) {
  const texture = gpu.createTexture(
    Object.assign({ size: [bitmap.width, bitmap.height] }, bitmap.textureFormat)
  );
  gpu.queue.writeTexture(
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

export function AllocateTextureArray(bitmaps) {
  const width = bitmaps[0].width;
  const height = bitmaps[0].height;
  const layers = bitmaps.length;
  const textureArray = gpu.createTexture(
    Object.assign({ size: [width, height, layers] }, bitmaps[0].textureFormat)
  );

  for (let i = 0; i < layers; i++) {
    const bmp = bitmaps[i];
    gpu.queue.writeTexture(
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
    ppi: bitmaps[0].ppi,
  };
}

export function AllocateMesh(mesh) {
  const createBuffer = (arr, usage) => {
    let desc = {
      size: (arr.byteLength + 3) & ~3, // Align to 4 bytes (thanks @chrimsonite)
      usage,
      mappedAtCreation: true,
    };
    let buffer = gpu.createBuffer(desc);
    const writeArray =
      arr instanceof Uint16Array
        ? new Uint16Array(buffer.getMappedRange())
        : new Float32Array(buffer.getMappedRange());
    writeArray.set(arr);
    buffer.unmap();
    return buffer;
  };
  return Object.assign(createBuffer(mesh.verts, GPUBufferUsage.VERTEX), {
    vertCount: mesh.vertCount,
  });
}

export function AllocateShaderModule(shader) {
  return gpu.createShaderModule(shader); // new shader module from wgsl-string
}

export function AllocateUniformBuffer(size, strideOffset = 16) {
  strideOffset--;
  return gpu.createBuffer({
    label: ` uniform Buffer, ${size} `,
    size: (size + strideOffset) & ~strideOffset,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
}

export function AllocateInstancedBuffer(
  sizePerInstance,
  count,
  strideOffset = 16
) {
  strideOffset--;
  return gpu.createBuffer({
    label: ` uniform Buffer, ${sizePerInstance}x${count} `,
    size: count * ((sizePerInstance + strideOffset) & ~strideOffset),
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
}
