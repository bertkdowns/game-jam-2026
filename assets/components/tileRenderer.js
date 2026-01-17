import { Transform } from "./transform.js";

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



export const TileRenderer = {

    material: tileMaterial,
    tileLayout: [],

    // to be attached to objects that get drawn to the screen
    handlePass: HandlePass,
    init(gpu) {
        [this.renderPipeline, this.bindGroup] = InitRenderer.bind(this)(gpu);
        Object.assignByVal(this, new Transform());
    },
}

function InitRenderer(gpu) {

    //console.log(`transform: ${this.transformBuffer}, camera&data:${this.cameraMatrixBuffer}`, this);
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

    const buffer = [].concat(
        this.GetTransformMatrix(),
        camera.ViewMatrix(),
        camera.PerspectiveMatrix(),
        [this.texture.width, this.texture.height, this.texture.pixelScale, this.textureIndex || 0],
    );
    // draw all instances 
    gpu.queue.writeBuffer(this.cameraMatrixBuffer, 0, new Float32Array(buffer));
    gpu.queue.writeBuffer(this.transformBuffer, 0, new Float32Array(this.tileLayout));
    pass.setBindGroup(0, this.bindGroup);
    pass.draw(6, this.tileLayout.length / 2); // 6 vertices with 4 values per vertex(x,y,u,v)

}