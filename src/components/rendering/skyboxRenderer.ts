import { invertMat4, multiplyMat4 } from "@engine_core/math";

export const skyboxMaterial = {
    bindingGroupLayout: {
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                buffer: { type: "uniform", }
            }, {
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                texture: {}
            }, {
                binding: 2,
                visibility: GPUShaderStage.FRAGMENT,
                sampler: {}
            }
        ]
    },
    pipeline: {
        label: "shader pipeline",
        layout: "auto",
        vertex: {
            entryPoint: "vs",
            buffers: [{
                arrayStride: 12, // total byte width of attributes
                attributes: [{
                    shaderLocation: 0,
                    offset: 0,
                    format: "float32x3"
                },
                ]
            }]
        },
        fragment: {
            entryPoint: "fs",
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
            depthCompare: 'less-equal',
        },
        primitive: {
            topology: "triangle-list",
            cullMode: "none",
        }
    }
};

export const SkyboxRenderer = {
    // x, y, u, v 
    material: skyboxMaterial,
    handlePass: HandlePass,
    init() {
        const gpu = window.renderer.device;
        [this.renderPipeline, this.bindGroup] = InitRenderer.bind(this)(gpu)
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
            { binding: 0, resource: { buffer: this.cameraMatrixBuffer } },
            { binding: 1, resource: this.texture.view },
            {
                binding: 2, resource: gpu.createSampler({
                    magFilter: "linear",
                    minFilter: "linear",
                    mipmapFilter: "linear",
                    addressModeU: "repeat",
                    addressModeV: "clamp-to-edge",
                })
            }, // default sampler (uses nearest neighbor)

        ]
    });

    return [renderPipeline, bindGroup];
}


function HandlePass(pass, gpu, camera) {
    // writes a single instance of the object to the buffer 
    pass.setPipeline(this.renderPipeline);
    pass.setVertexBuffer(0, this.vertexBuffer);


    const ViewMatrix = multiplyMat4(camera.PerspectiveMatrix(), stripTranslation(camera.ViewMatrix()))

    gpu.queue.writeBuffer(this.cameraMatrixBuffer, 0, new Float32Array(invertMat4(ViewMatrix)));


    pass.setBindGroup(0, this.bindGroup); // attaches the texture (bindGroup) to the pass so i can draw it 
    pass.draw(this.vertexBuffer.vertCount); // 6 vertices with 5 values per vertex(x,y,z,u,v)
}


function stripTranslation(m) {
    m[12] = m[13] = m[14] = 0;
    return m;
}

