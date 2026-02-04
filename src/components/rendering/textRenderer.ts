import { Renderer, type RenderableObject, RenderCamera } from "@engine_core/renderer";

const fontMaterial = {
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

interface TextRenderer {
    textLayout: Float32Array;
    layoutLastLength: number;
    transformBuffer?: GPUBuffer;

}


export const TextRenderer: TextRenderer & Partial<RenderableObject> = {

    material: fontMaterial,
    // empty as we will assign proper ones later 
    layoutLastLength: 0,
    textLayout: new Float32Array(),
    transformBuffer: undefined,
    handlePass: HandlePass,
    init() { InitRenderer(this); },
}

function InitRenderer(obj: TextRenderer & Partial<RenderableObject>) {
    const gpu = Renderer.device;
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
        throw new Error("no cameraMatrixBuffer set uniformBuffer(64 + 16)");
    if (!transformBuffer)
        throw new Error("no transformBuffer set uniformBuffer(large size)");



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


function HandlePass(this: TextRenderer & RenderableObject, pass: GPURenderPassEncoder, gpu: GPUDevice, camera: RenderCamera) {
    pass.setPipeline(this.renderPipeline);
    pass.setVertexBuffer(0, this.vertexBuffer);


    // calculates padding length so that no data from the prior frames textlayout is still in the buffer. 
    const length = this.textLayout.length;
    const padding = Math.max(0, this.layoutLastLength - length);
    this.layoutLastLength = length;

    // draw all instances 
    gpu.queue.writeBuffer(this.cameraMatrixBuffer as GPUBuffer, 0, new Float32Array(camera.UIToScreenMatrix().concat([6, 6, 0, 1])));
    gpu.queue.writeBuffer(this.transformBuffer as GPUBuffer, 0, new Float32Array(Array.from(this.textLayout).concat(Array(padding).fill(0))));
    pass.setBindGroup(0, this.bindGroup);
    pass.draw(6, this.textLayout.length / 3); // 6 vertices with 4 values per vertex(x,y,u,v) by list of (x,y,index)    
}