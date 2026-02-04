export const degToRad = Math.PI / 180;
export const radToDeg = 180 / Math.PI;


declare global {
    interface Window {
        Vec3: Vec3;
    }
    type Vector3 = [number, number, number] | Vec3;
    type Vector4 = [number, number, number, number];
    type Matrix = number[] & { length: 16 };

    interface Ray {
        origin: Vector3;
        direction: Vector3;
    }
    interface Vec3 extends Array<number> {
        get x(): number;
        set x(v: number);
        get y(): number;
        set y(v: number);
        get z(): number;
        set z(v: number);

        0: number;
        1: number;
        2: number;
    }
}


// vector math
export class Vec3 extends Array<number> {
    constructor(x: number | [number, number, number] = 0, y: number = 0, z: number = 0) {
        if (Array.isArray(x))
            super(...x);
        else
            super(x, y, z);
    }
    get x() { return this[0]; }
    set x(v) { this[0] = v; }

    get y() { return this[1]; }
    set y(v) { this[1] = v; }

    get z() { return this[2]; }
    set z(v) { this[2] = v; }

    static zero() { return new Vec3(0, 0, 0) };
    static one() { return new Vec3(1, 1, 1) };
}


export function dot(a: Vector3, b: Vector3) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
export function normalize(v: Vector3): Vector3 {
    const len = Math.hypot(...v);
    return v.map(x => x / len) as Vector3;
}
export function cross(a: Vector3, b: Vector3): Vector3 {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];
}
export function subtract(a: Vector3, b: Vector3): Vector3 {
    return a.map((v, i) => v - b[i]) as Vector3;
}


// Matrix multiplication  
export function multiplyMat4Vec4(m: Matrix, v: Vector4): Vector4 {
    const [x, y, z, w] = v;
    return [
        m[0] * x + m[4] * y + m[8] * z + m[12] * w,
        m[1] * x + m[5] * y + m[9] * z + m[13] * w,
        m[2] * x + m[6] * y + m[10] * z + m[14] * w,
        m[3] * x + m[7] * y + m[11] * z + m[15] * w,
    ];
}


export function multiplyMat4(a: Matrix, b: Matrix): Matrix {
    const out = new Array(16) as Matrix;

    const
        a00 = a[0], a10 = a[1], a20 = a[2], a30 = a[3],
        a01 = a[4], a11 = a[5], a21 = a[6], a31 = a[7],
        a02 = a[8], a12 = a[9], a22 = a[10], a32 = a[11],
        a03 = a[12], a13 = a[13], a23 = a[14], a33 = a[15];

    let b0, b1, b2, b3;

    // column 0
    b0 = b[0]; b1 = b[1]; b2 = b[2]; b3 = b[3];
    out[0] = a00 * b0 + a01 * b1 + a02 * b2 + a03 * b3;
    out[1] = a10 * b0 + a11 * b1 + a12 * b2 + a13 * b3;
    out[2] = a20 * b0 + a21 * b1 + a22 * b2 + a23 * b3;
    out[3] = a30 * b0 + a31 * b1 + a32 * b2 + a33 * b3;

    // column 1
    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = a00 * b0 + a01 * b1 + a02 * b2 + a03 * b3;
    out[5] = a10 * b0 + a11 * b1 + a12 * b2 + a13 * b3;
    out[6] = a20 * b0 + a21 * b1 + a22 * b2 + a23 * b3;
    out[7] = a30 * b0 + a31 * b1 + a32 * b2 + a33 * b3;

    // column 2
    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = a00 * b0 + a01 * b1 + a02 * b2 + a03 * b3;
    out[9] = a10 * b0 + a11 * b1 + a12 * b2 + a13 * b3;
    out[10] = a20 * b0 + a21 * b1 + a22 * b2 + a23 * b3;
    out[11] = a30 * b0 + a31 * b1 + a32 * b2 + a33 * b3;

    // column 3
    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = a00 * b0 + a01 * b1 + a02 * b2 + a03 * b3;
    out[13] = a10 * b0 + a11 * b1 + a12 * b2 + a13 * b3;
    out[14] = a20 * b0 + a21 * b1 + a22 * b2 + a23 * b3;
    out[15] = a30 * b0 + a31 * b1 + a32 * b2 + a33 * b3;

    return out;
}

// Inverts A matrix
export function invertMat4(m: Matrix): Matrix {
    const inv = new Array(16);
    const [
        m00, m10, m20, m30,
        m01, m11, m21, m31,
        m02, m12, m22, m32,
        m03, m13, m23, m33
    ] = m;

    inv[0] = m11 * m22 * m33 - m11 * m23 * m32 - m21 * m12 * m33 + m21 * m13 * m32 + m31 * m12 * m23 - m31 * m13 * m22;
    inv[4] = -m01 * m22 * m33 + m01 * m23 * m32 + m21 * m02 * m33 - m21 * m03 * m32 - m31 * m02 * m23 + m31 * m03 * m22;
    inv[8] = m01 * m12 * m33 - m01 * m13 * m32 - m11 * m02 * m33 + m11 * m03 * m32 + m31 * m02 * m13 - m31 * m03 * m12;
    inv[12] = -m01 * m12 * m23 + m01 * m13 * m22 + m11 * m02 * m23 - m11 * m03 * m22 - m21 * m02 * m13 + m21 * m03 * m12;

    inv[1] = -m10 * m22 * m33 + m10 * m23 * m32 + m20 * m12 * m33 - m20 * m13 * m32 - m30 * m12 * m23 + m30 * m13 * m22;
    inv[5] = m00 * m22 * m33 - m00 * m23 * m32 - m20 * m02 * m33 + m20 * m03 * m32 + m30 * m02 * m23 - m30 * m03 * m22;
    inv[9] = -m00 * m12 * m33 + m00 * m13 * m32 + m10 * m02 * m33 - m10 * m03 * m32 - m30 * m02 * m13 + m30 * m03 * m12;
    inv[13] = m00 * m12 * m23 - m00 * m13 * m22 - m10 * m02 * m23 + m10 * m03 * m22 + m20 * m02 * m13 - m20 * m03 * m12;

    inv[2] = m10 * m21 * m33 - m10 * m23 * m31 - m20 * m11 * m33 + m20 * m13 * m31 + m30 * m11 * m23 - m30 * m13 * m21;
    inv[6] = -m00 * m21 * m33 + m00 * m23 * m31 + m20 * m01 * m33 - m20 * m03 * m31 - m30 * m01 * m23 + m30 * m03 * m21;
    inv[10] = m00 * m11 * m33 - m00 * m13 * m31 - m10 * m01 * m33 + m10 * m03 * m31 + m30 * m01 * m13 - m30 * m03 * m11;
    inv[14] = -m00 * m11 * m23 + m00 * m13 * m21 + m10 * m01 * m23 - m10 * m03 * m21 - m20 * m01 * m13 + m20 * m03 * m11;

    inv[3] = -m10 * m21 * m32 + m10 * m22 * m31 + m20 * m11 * m32 - m20 * m12 * m31 - m30 * m11 * m22 + m30 * m12 * m21;
    inv[7] = m00 * m21 * m32 - m00 * m22 * m31 - m20 * m01 * m32 + m20 * m02 * m31 + m30 * m01 * m22 - m30 * m02 * m21;
    inv[11] = -m00 * m11 * m32 + m00 * m12 * m31 + m10 * m01 * m32 - m10 * m02 * m31 - m30 * m01 * m12 + m30 * m02 * m11;
    inv[15] = m00 * m11 * m22 - m00 * m12 * m21 - m10 * m01 * m22 + m10 * m02 * m21 + m20 * m01 * m12 - m20 * m02 * m11;

    let det = m00 * inv[0] + m01 * inv[1] + m02 * inv[2] + m03 * inv[3];
    if (det === 0) {
        throw new Error("matrix inversion not valid");
    }

    det = 1.0 / det;
    for (let i = 0; i < 16; i++) inv[i] *= det;
    return inv as Matrix;
}



// Matrix from Quaternion. 
export function quatToMat4(q: Vector4): Matrix {
    const x = q[0], y = q[1], z = q[2], w = q[3];

    const xx = x * x, yy = y * y, zz = z * z;
    const xy = x * y, xz = x * z, yz = y * z;
    const wx = w * x, wy = w * y, wz = w * z;

    return [
        1 - 2 * (yy + zz), 2 * (xy + wz), 2 * (xz - wy), 0,
        2 * (xy - wz), 1 - 2 * (xx + zz), 2 * (yz + wx), 0,
        2 * (xz + wy), 2 * (yz - wx), 1 - 2 * (xx + yy), 0,
        0, 0, 0, 1
    ];
}




export function quatFromMat4(m: Matrix): Vector4 {
    // m is a 16-element column-major array (WebGPU/GL style)
    const m00 = m[0], m01 = m[4], m02 = m[8];
    const m10 = m[1], m11 = m[5], m12 = m[9];
    const m20 = m[2], m21 = m[6], m22 = m[10];

    const trace = m00 + m11 + m22;
    let x, y, z, w;

    if (trace > 0) {
        const s = 0.5 / Math.sqrt(trace + 1.0);
        w = 0.25 / s;
        x = (m21 - m12) * s;
        y = (m02 - m20) * s;
        z = (m10 - m01) * s;
    } else if (m00 > m11 && m00 > m22) {
        const s = 2.0 * Math.sqrt(1.0 + m00 - m11 - m22);
        w = (m21 - m12) / s;
        x = 0.25 * s;
        y = (m01 + m10) / s;
        z = (m02 + m20) / s;
    } else if (m11 > m22) {
        const s = 2.0 * Math.sqrt(1.0 + m11 - m00 - m22);
        w = (m02 - m20) / s;
        x = (m01 + m10) / s;
        y = 0.25 * s;
        z = (m12 + m21) / s;
    } else {
        const s = 2.0 * Math.sqrt(1.0 + m22 - m00 - m11);
        w = (m10 - m01) / s;
        x = (m02 + m20) / s;
        y = (m12 + m21) / s;
        z = 0.25 * s;
    }

    return [x, y, z, w];
}


// Multiplies a Quaternion (add B to A)
export function quatMul(a: Vector4, b: Vector4): Vector4 {
    const ax = a[0], ay = a[1], az = a[2], aw = a[3];
    const bx = b[0], by = b[1], bz = b[2], bw = b[3];

    return [
        aw * bx + ax * bw + ay * bz - az * by,
        aw * by - ax * bz + ay * bw + az * bx,
        aw * bz + ax * by - ay * bx + az * bw,
        aw * bw - ax * bx - ay * by - az * bz
    ];
}

// Quaternion From [x,y,z]
export function quatFromEuler([pitch = 0, roll = 0, yaw = 0]: Vector3): Vector4 {

    // all in radians
    const cy = Math.cos(yaw * 0.5);
    const sy = Math.sin(yaw * 0.5);
    const cp = Math.cos(pitch * 0.5);
    const sp = Math.sin(pitch * 0.5);
    const cr = Math.cos(roll * 0.5);
    const sr = Math.sin(roll * 0.5);

    return [
        sr * cp * cy - cr * sp * sy, // x
        cr * sp * cy + sr * cp * sy, // y
        cr * cp * sy - sr * sp * cy, // z
        cr * cp * cy + sr * sp * sy  // w
    ];
}



export function eulerFromQuaternion([x, y, z, w]: Vector4): Vector3 {
    // roll (X axis)
    const sinr_cosp = 2 * (w * x + y * z);
    const cosr_cosp = 1 - 2 * (x * x + y * y);
    const roll = Math.atan2(sinr_cosp, cosr_cosp);

    // pitch (Y axis)
    const sinp = 2 * (w * y - z * x);
    const pitch = Math.abs(sinp) >= 1
        ? Math.sign(sinp) * Math.PI / 2
        : Math.asin(sinp);

    // yaw (Z axis)
    const siny_cosp = 2 * (w * z + x * y);
    const cosy_cosp = 1 - 2 * (y * y + z * z);
    const yaw = Math.atan2(siny_cosp, cosy_cosp);

    // match your original argument order
    return [pitch, roll, yaw];
}



// GENERATING MATRICES for rotating to look in a direction doesnt include translation
export function MatrixLookingInDirection(direction: Vector3, up: Vector3): Matrix {
    const z = normalize(direction);             //  .forward
    const x = normalize(cross(up, z));          //  .right
    const y = cross(z, x);                      //  .up
    return [
        x[0], y[0], z[0], 0,
        x[1], y[1], z[1], 0,
        x[2], y[2], z[2], 0,
        0, 0, 0, 1,
    ];
}

// GENERATING MATRIX from Quaternion Position Scale
export function TransformFromTRS([qx, qy, qz, qw]: Vector4, [tx, ty, tz]: Vector3, [sx, sy, sz]: Vector3): Matrix {
    const x2 = qx + qx, y2 = qy + qy, z2 = qz + qz;

    const xx = qx * x2, yy = qy * y2, zz = qz * z2;
    const xy = qx * y2, xz = qx * z2, yz = qy * z2;
    const wx = qw * x2, wy = qw * y2, wz = qw * z2;

    return [
        (1 - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0,
        (xy - wz) * sy, (1 - (xx + zz)) * sy, (yz + wx) * sy, 0,
        (xz + wy) * sz, (yz - wx) * sz, (1 - (xx + yy)) * sz, 0,
        tx, ty, tz, 1,
    ];
}


