import { Renderer, RenderableObject, RenderCamera } from "@engine_core/renderer";


export const spriteMaterial = {
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

export class SpriteRenderer implements Partial<RenderableObject> {
    // x, y, u, v 
    material = spriteMaterial;
    handlePass = HandlePass;
    _currentTextureView?: GPUTextureView; // Track the texture view to detect changes
    _bindGroupLayout?: GPUBindGroupLayout; // Store bindGroupLayout for reuse
    textureIndex: number = 0;

    init() {
        InitRenderer(this);
    }

    // Update bindGroup when texture changes
    updateBindGroup(this: SpriteRenderer & RenderableObject) {
        if (!this.texture?.view) return;
        if (this._currentTextureView === this.texture.view) return; // No change
        if (!this._bindGroupLayout) return; // Not initialized yet

        const gpu = Renderer.device;
        this.bindGroup = gpu.createBindGroup({
            layout: this._bindGroupLayout,
            entries: [
                { binding: 0, resource: gpu.createSampler() },
                { binding: 1, resource: this.texture.view },
                { binding: 2, resource: { buffer: this.cameraMatrixBuffer } },
            ]
        });
        this._currentTextureView = this.texture.view;
    }
}


function InitRenderer(obj: SpriteRenderer & Partial<RenderableObject>) {
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
    // sprite spesific
    obj._bindGroupLayout = bindGroupLayout;
    obj._currentTextureView = texture.view;
}


function HandlePass(this: SpriteRenderer & RenderableObject & TransformInterface, pass: GPURenderPassEncoder, gpu: GPUDevice, camera: RenderCamera) {
    // Update bindGroup if texture changed
    if (this.updateBindGroup) {
        this.updateBindGroup();
    }

    // writes a single instance of the object to the buffer 
    pass.setPipeline(this.renderPipeline);
    pass.setVertexBuffer(0, this.vertexBuffer);

    const buffer = ([] as number[]).concat(
        this.GetTransformMatrix(),
        camera.ViewMatrix(),
        camera.PerspectiveMatrix(),
        [this.texture.width, this.texture.height, this.texture.pixelScale, this.textureIndex],
    );

    gpu.queue.writeBuffer(this.cameraMatrixBuffer, 0, new Float32Array(buffer));


    pass.setBindGroup(0, this.bindGroup); // attaches the texture (bindGroup) to the pass so i can draw it 
    pass.draw(this.vertexCount); // 6 vertices with 5 values per vertex(x,y,z,u,v)
}