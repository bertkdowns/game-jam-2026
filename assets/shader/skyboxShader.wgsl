struct Camera {
    invViewProj : mat4x4<f32>,
};

@group(0) @binding(0) var<uniform> camera : Camera;
@group(0) @binding(1) var envTex : texture_2d<f32>;
@group(0) @binding(2) var envSampler : sampler;

struct VSOut {
    @builtin(position) pos : vec4<f32>,
    @location(0) uv : vec2<f32>,
};

@vertex
fn vs(@builtin(vertex_index) i : u32) -> VSOut {
    // Fullscreen triangle
    var positions = array<vec2<f32>, 3>(
        vec2(-1.0, -1.0),
        vec2( 3.0, -1.0),
        vec2(-1.0,  3.0),
    );

    var out : VSOut;
    out.pos = vec4(positions[i], 0.0, 1.0);
    out.uv = positions[i] * 0.5 + 0.5;
    return out;
}

fn dirToEquirectUV(dir : vec3<f32>) -> vec2<f32> {
    let phi   = atan2(dir.z, dir.x);         // [-π, π]
    let theta = acos(clamp(dir.y, -1.0, 1.0)); // [0, π]

    let u = phi / (2.0 * 3.14159265) + 0.5;
    let v = theta / 3.14159265;
    return vec2(u, v);
}

@fragment
fn fs(in : VSOut) -> @location(0) vec4<f32> {
    // Reconstruct clip-space ray
    let clip = vec4(in.uv * 2.0 - 1.0, 1.0, 1.0);
    let world = camera.invViewProj * clip;
    let dir = normalize(world.xyz / world.w);

    let uv = dirToEquirectUV(dir);
    let color = textureSample(envTex, envSampler, uv);

    return vec4(color.rgb, 1.0);
}