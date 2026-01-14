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
                arrayStride: 32, // in 
                stepMode: "vertex",
                attributes: [{
                    format: "float32x3",
                    offset: 0,
                    shaderLocation: 0, // Position, see vertex shader
                }, {
                    format: "float32x2",
                    offset: 12,
                    shaderLocation: 1, // uv, see vertex shader
                }, {
                    format: "float32x2",
                    offset: 20, // offset in bytes
                    shaderLocation: 2, // normal, see vertex shader
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
                    }
                },
                writeMask: GPUColorWrite.ALL,
            }],
        },
        depthStencil: {
            format: 'depth24plus',
            depthWriteEnabled: true,
            depthCompare: 'less',
        },
        primitive: {
            topology: "triangle-strip",
            cullMode: "back",  // <- enable backface culling
            frontFace: "ccw"   // optional, default is "ccw" (counter-clockwise)
        }
    }
};

export const MeshRenderer = {
    // x, y, u, v 
    material: material,
    handlePass: HandlePass,
    init(gpu) {
        [
            this.renderPipeline, this.bindGroup] = InitRenderer.bind(this)(gpu),
        Object.assignByVal(this, new Transform());
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
    );
    gpu.queue.writeBuffer(this.cameraMatrixBuffer, 0, new Float32Array(buffer)); // camera.transformRotationScale(Math.sin(Date.now()/1000), Math.cos(Date.now()/1000), 0, -0.2)

    // Math.cos(Date.now()/1000)
    pass.setBindGroup(0, this.bindGroup); // attaches the texture (bindGroup) to the pass so i can draw it 
    pass.draw(this.vertexBuffer.vertCount); // 6 vertices with 4 values per vertex(x,y,u,v)
}


