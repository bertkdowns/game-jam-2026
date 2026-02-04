import { Renderer, type RenderableObject, RenderCamera } from "@engine_core/renderer";

export const meshMaterial = {
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

export const meshRenderer: Partial<RenderableObject> = {
    // x, y, u, v 
    material: meshMaterial,
    handlePass: HandlePass,
    init() {
        InitRenderer(this);
    },
}


function InitRenderer(obj: Partial<RenderableObject>) {
    const gpu = Renderer.device;

    // DEFINES THE RENDER PIPELINE
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
    const buffer = obj.cameraMatrixBuffer;
    if (!texture)
        throw new Error("no texture set");
    if (!buffer)
        throw new Error("no cameraMatrixBuffer set uniformBuffer(3 * 64)");

    const bindGroup = gpu.createBindGroup({
        layout: bindGroupLayout,
        entries: [
            { binding: 0, resource: gpu.createSampler() }, // default sampler (uses nearest neighbor)
            { binding: 1, resource: texture.view },
            { binding: 2, resource: { buffer } },
        ]
    });

    obj.renderPipeline = renderPipeline;
    obj.bindGroup = bindGroup;
}





function HandlePass(this: RenderableObject, pass: GPURenderPassEncoder, gpu: GPUDevice, camera: RenderCamera) {
    // writes a single instance of the object to the buffer 
    pass.setPipeline(this.renderPipeline);
    pass.setVertexBuffer(0, this.vertexBuffer);

    const buffer = ([] as number[]).concat(
        this.GetTransformMatrix(),
        camera.ViewMatrix(),
        camera.PerspectiveMatrix(),
    );

    // camera matrix buffer is something you need to pass into the object via Renderer's AllocateUniformBuffer(size of buffer); 3*64 in this case as we concat 3 matrices. 
    gpu.queue.writeBuffer(this.cameraMatrixBuffer, 0, new Float32Array(buffer));

    // Math.cos(Date.now()/1000)
    pass.setBindGroup(0, this.bindGroup); // attaches the texture (bindGroup) to the pass so i can draw it 

    //obj.vertexBuffer.vertCount
    pass.draw(this.vertexCount); // 6 vertices with 4 values per vertex(x,y,u,v)
}