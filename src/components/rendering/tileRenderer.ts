import { Renderer, type RenderableObject, RenderCamera } from "@engine_core/renderer";

// everything to do with rendering to the screen
const tileMaterial = {
    bindingGroupLayout: {
        entries: [{
            binding: 0,
            visibility: GPUShaderStage.FRAGMENT,
            sampler: {}
        }, {
            binding: 1,
            visibility: GPUShaderStage.FRAGMENT,
            texture: {}
        }, {
            binding: 2,
            visibility: GPUShaderStage.VERTEX,
            buffer: { type: "read-only-storage", }
        }, {
            binding: 3,
            visibility: GPUShaderStage.VERTEX,
            buffer: { type: "uniform", }
        }]
    },
    pipeline: {
        label: "shader pipeline",
        layout: "custom",
        vertex: {
            entryPoint: "vertexMain",
            buffers: [{
                arrayStride: 16,
                // vertex structure of object
                attributes: [{
                    label: "xy",
                    format: "float32x2",
                    offset: 0,
                    shaderLocation: 0, // Position, see vertex shader
                }, {
                    label: "uv",
                    format: "float32x2",
                    offset: 8, // offset in bytes
                    shaderLocation: 1, // Position, see vertex shader
                }]
            }]
        },
        alphaToCoverageEnabled: false,
        fragment: {
            entryPoint: "fragmentMain",
            targets: [{
                format: "bgra8unorm", // or whatever you're using
                blend: {
                    color: {
                        srcFactor: "one",
                        dstFactor: "one-minus-src-alpha",
                        operation: "add",
                    },
                    alpha: {
                        srcFactor: "one",
                        dstFactor: "one-minus-src-alpha",
                        operation: "add",
                    },
                },
            }],
        },
        depthStencil: {
            format: 'depth24plus',
            depthWriteEnabled: false,
            depthCompare: 'less',
        },
        primitive: {
            topology: "triangle-list",
            cullMode: "back",  // <- enable backface culling
            frontFace: "ccw"   // optional, default is "ccw" (counter-clockwise)
        }
    }
};


interface TileRenderer {
    tileLayout: Float32Array;
    transformBuffer?: GPUBuffer;
    textureIndex: number;
}


export const TileRenderer: TileRenderer & Partial<RenderableObject> & Partial<TransformInterface> = {

    material: tileMaterial,
    // empty as we will assign proper ones later 
    tileLayout: new Float32Array(),
    transformBuffer: undefined,
    textureIndex: 0,
    // to be attached to objects that get drawn to the screen
    handlePass: HandlePass,
    init() {

        InitRenderer(this);
    },
}

function InitRenderer(obj: TileRenderer & Partial<RenderableObject>) {
    const gpu = Renderer.device;


    //console.log(`transform: ${this.transformBuffer}, camera&data:${this.cameraMatrixBuffer}`, this);
    // DEFINES THE RENDER PIPELINE
    // needs a custom layout as were trying to do some form of gpu instancing
    const bindGroupLayout = gpu.createBindGroupLayout(obj.material.bindingGroupLayout);
    const pipelineLayout = gpu.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] });
    const pipeline = Object.murge({
        layout: pipelineLayout,
        vertex: { module: obj.shaderModule },
        fragment: {
            targets: [{ format: Renderer.canvasFormat }],
            module: obj.shaderModule
        }
    }, obj.material.pipeline);
    const renderPipeline = gpu.createRenderPipeline(pipeline);
    //  BINDING IT ALL TOGETHER 


    const texture = obj.texture;
    const cameraBuffer = obj.cameraMatrixBuffer;
    const transformBuffer = obj.transformBuffer;
    if (!texture)
        throw new Error("no texture set");
    if (!cameraBuffer)
        throw new Error("no cameraMatrixBuffer set uniformBuffer(3 * 64)");
    if (!transformBuffer)
        throw new Error("no cameraMatrixBuffer set uniformBuffer(3 * 64)");

    const bindGroup = gpu.createBindGroup({
        layout: bindGroupLayout,
        entries: [
            { binding: 0, resource: gpu.createSampler() }, // default sampler (uses nearest neighbor)
            { binding: 1, resource: texture.view },
            { binding: 2, resource: { buffer: transformBuffer } },
            { binding: 3, resource: { buffer: cameraBuffer } },
        ]
    });

    obj.renderPipeline = renderPipeline;
    obj.bindGroup = bindGroup;
}


function HandlePass(this: TileRenderer & RenderableObject & TransformInterface, pass: GPURenderPassEncoder, gpu: GPUDevice, camera: RenderCamera) {
    pass.setPipeline(this.renderPipeline);
    pass.setVertexBuffer(0, this.vertexBuffer);

    const buffer = ([] as Array<number>).concat(
        this.GetTransformMatrix(),
        camera.ViewMatrix(),
        camera.PerspectiveMatrix(),
        [this.texture.width, this.texture.height, this.texture.pixelScale, this.textureIndex],
    );
    // draw all instances 
    gpu.queue.writeBuffer(this.cameraMatrixBuffer as GPUBuffer, 0, new Float32Array(buffer));
    gpu.queue.writeBuffer(this.transformBuffer as GPUBuffer, 0, new Float32Array(this.tileLayout));
    pass.setBindGroup(0, this.bindGroup);
    pass.draw(6, this.tileLayout.length / 2); // 6 vertices with 4 values per vertex(x,y,u,v)

}