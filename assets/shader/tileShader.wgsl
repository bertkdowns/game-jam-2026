// external binding groups
@group(0) @binding(0) var ourSampler: sampler;
@group(0) @binding(1) var ourTexture: texture_2d<f32>;
@group(0) @binding(2) var<storage, read> instances: array<InstanceBuffer>;
@group(0) @binding(3) var<uniform> t: Data;


struct Data{
    transformMatrix: mat4x4<f32>, 
    ViewMatrix: mat4x4<f32>, 
    ProjectionMatrix: mat4x4<f32>, 
    ssi: vec4<f32>,  // size.xy, scale.z, index.w
}

struct InstanceBuffer {
    offset: vec2f, 
};

// data structures     
struct VertexOutput {
    @builtin(position) pos: vec4f, 
    @location(0) uv: vec2<f32>, 
};  
  
@vertex
fn vertexMain(@location(0) pos: vec2f, @location(1) uv: vec2f, @builtin(instance_index) i : u32) -> VertexOutput {
    var out: VertexOutput; 
    let obj = instances[i];
    let offset = obj.offset.xy;

    var scaledPos = vec4f(((pos.xy * t.ssi.xy) + offset) * t.ssi.z, 0, 1); 
    out.pos = t.ProjectionMatrix *( t.ViewMatrix * (t.transformMatrix * scaledPos));
    out.uv =  uv;
    return out;
}
    
@fragment
fn fragmentMain(in: VertexOutput) -> @location(0) vec4f {
    let uv_coords = in.uv;
    return textureSample(ourTexture, ourSampler, in.uv); 
}