// external binding groups
@group(0) @binding(0) var ourSampler: sampler;
@group(0) @binding(1) var ourTexture: texture_2d<f32>;
@group(0) @binding(2) var<uniform> t: Data;


struct Data{
    transformMatrix: mat4x4<f32>, 
    ViewMatrix: mat4x4<f32>, 
    ProjectionMatrix: mat4x4<f32>, 
    
}

// data structures     
struct VertexOutput {
    @builtin(position) pos: vec4f, 
    @location(0) uv: vec2<f32>, 
    @location(1) n: vec3<f32>, 
};  
  
@vertex
fn vertexMain(@location(0) pos: vec3f, @location(1) uv: vec2f,  @location(2) n: vec3f) -> VertexOutput {
    var out: VertexOutput; 
    out.pos = t.ProjectionMatrix *( t.ViewMatrix * ( t.transformMatrix * vec4f(pos, 1.0)));  
    out.n = (t.transformMatrix * vec4f(n,1.0)).xyz; 
    out.uv =  uv;
    return out;
}
    
@fragment
fn fragmentMain(in: VertexOutput) -> @location(0) vec4f {
    let uv_coords = in.uv;

    let diffuse =  max(1 + dot(normalize(in.n), normalize(vec3f(3,4,0.1))), 0.0)/2;

    return textureSample(ourTexture, ourSampler, in.uv) * vec4f(diffuse,diffuse,diffuse,1);
}