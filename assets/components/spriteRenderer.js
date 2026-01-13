import { Transform } from "./transform.js";

export const material = {
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
            buffer: { type: "uniform", }
        }]
    },
    pipeline: {
        label: "shader pipeline",
        layout: "auto",
        vertex: {
            entryPoint: "vertexMain",
            buffers: [{
                arrayStride: 16, // in 
                attributes: [{
                    format: "float32x2",
                    offset: 0,
                    shaderLocation: 0, // Position, see vertex shader
                }, {
                    format: "float32x2",
                    offset: 8, // offset in bytes
                    shaderLocation: 1, // Position, see vertex shader
                }]
            }]
        },
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
        }, depthStencil: {
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

export const SpriteRenderer = {
    // x, y, u, v 
    material: material,
    handlePass: HandlePass,
    init(gpu) {
        [this.renderPipeline, this.bindGroup] = InitRenderer.bind(this)(gpu)
        Object.assignByVal(this, Transform);
    },
}


function InitRenderer(gpu) {
    // DEFINES THE RENDER PIPELINE
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
            { binding: 2, resource: { buffer: this.cameraMatrixBuffer } },
        ]
    });

    return [renderPipeline, bindGroup];
}


function HandlePass(pass, gpu, camera) {
    // writes a single instance of the object to the buffer 
    pass.setPipeline(this.renderPipeline);
    pass.setVertexBuffer(0, this.vertexBuffer);

    const buffer = [].concat(
        this.transformMatrix,
        camera.ViewMatrix(),
        camera.PerspectiveMatrix(),
        [this.texture.width, this.texture.height, this.texture.pixelScale, this.textureIndex || 0],
    );

    gpu.queue.writeBuffer(this.cameraMatrixBuffer, 0, new Float32Array(buffer));


    pass.setBindGroup(0, this.bindGroup); // attaches the texture (bindGroup) to the pass so i can draw it 
    pass.draw(this.vertexBuffer.vertCount); // 6 vertices with 5 values per vertex(x,y,z,u,v)
}



