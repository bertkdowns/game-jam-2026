// external binding groups
@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var tex: texture_2d<f32>;
@group(0) @binding(2) var<storage, read> instances: array<InstanceBuffer>;
@group(0) @binding(3) var<uniform> t: Data;


struct Data{
    viewProjectionMatrix: mat4x4<f32>, 
    size: vec4f,
}

struct InstanceBuffer {
    offset: vec4f, 
};

// data structures     
struct VertexOutput {
    @builtin(position) pos: vec4f, 
    @location(0) uv: vec2<f32>, 
};
    
@vertex
fn vertexMain(@location(0) pos: vec2f, @location(1) uv: vec2f,  @builtin(instance_index) i : u32) -> VertexOutput {
    var out: VertexOutput; 
    let obj = instances[i];
    let offset = obj.offset.xy; 
    let index = obj.offset.z;
    
    // t.viewProjectionMatrix is making the text disappear. x2 as im using a 0->1 half size quad so the pixels look half the size
    out.pos = t.viewProjectionMatrix * vec4f(((pos.xy * t.size.xy) + offset.xy) * 2 , 0, 1);

    // positions the iv coordinates so that the correct letter appears
    out.uv =  uv + vec2f(0, index * 0.02); 
  return out;
}
    
@fragment
fn fragmentMain(in: VertexOutput) -> @location(0) vec4f {                 
    return textureSample(tex, texSampler, in.uv) * vec4f(1,0,0,1); 
}