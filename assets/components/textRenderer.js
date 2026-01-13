import { Transform } from "./transform.js";

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


export const TextRenderer = {
    textLayout: [],
    layoutLastLength: 0,
    material: fontMaterial,
    handlePass: HandlePass,
    init(gpu) {
        [this.renderPipeline, this.bindGroup] = InitRenderer.bind(this)(gpu)
        Object.assignByVal(this, Transform);
    },
}

function InitRenderer(gpu) {
    // DEFINES THE RENDER PIPELINE
    // needs a custom layout as were trying to do some form of gpu instancing
    const bindGroupLayout = gpu.createBindGroupLayout(this.material.bindingGroupLayout);
    const pipelineLayout = gpu.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] });
    const pipeline = Object.murge({
        layout: pipelineLayout,
        vertex: { module: this.shaderModule },
        fragment: {
            targets: [{ format: gpu.canvasFormat }],
            module: this.shaderModule
        }
    }, this.material.pipeline);
    const renderPipeline = gpu.createRenderPipeline(pipeline);
    //  BINDING IT ALL TOGETHER 
    const bindGroup = gpu.createBindGroup({
        layout: bindGroupLayout,
        entries: [
            { binding: 0, resource: gpu.createSampler() }, // default sampler (uses nearest neighbor)
            { binding: 1, resource: this.texture.view },
            { binding: 2, resource: { buffer: this.transformBuffer } },
            { binding: 3, resource: { buffer: this.cameraMatrixBuffer } },
        ]
    });
    return [renderPipeline, bindGroup];
}


function HandlePass(pass, gpu, camera) {
    pass.setPipeline(this.renderPipeline);
    pass.setVertexBuffer(0, this.vertexBuffer);


    // calculates padding length so that no data from the prior frames textlayout is still in the buffer. 
    const length = this.textLayout.length;
    const padding = Math.max(0, this.layoutLastLength - length);
    this.layoutLastLength = length;

    // draw all instances 
    gpu.queue.writeBuffer(this.cameraMatrixBuffer, 0, new Float32Array(camera.UIToScreenMatrix().concat([6, 6, 0, 1])));
    gpu.queue.writeBuffer(this.transformBuffer, 0, new Float32Array(Array.from(this.textLayout).concat(Array(padding).fill(0))));
    pass.setBindGroup(0, this.bindGroup);
    pass.draw(6, this.textLayout.length / 3); // 6 vertices with 4 values per vertex(x,y,u,v) by list of (x,y,index)    
}