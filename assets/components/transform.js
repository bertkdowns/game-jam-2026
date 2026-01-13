import { Vec3, quatFromEuler } from "../math.js";


const degToRad = Math.PI/180; 

export const Transform = {
   
    rotation : new Vec3(0,0,0),
    position : new Vec3(0,0,0),
    scale : new Vec3(1,1,1),

    quaternion : [0,0,0,0],
    transformMatrix : [ 1,0,0,0 ,0,1,0,0 ,0,0,1,0 ,0,0,0,1],

    UpdateTransformMatrix() { 

        this.quaternion = quatFromEuler(this.rotation.map(deg=> deg * degToRad));
        this.transformMatrix = TransformFromTRS(this.quaternion, this.position, this.scale);

        return [this.quaternion, this.transformMatrix];
    },
}



export function TransformFromTRS([qx, qy, qz, qw], [tx, ty, tz], [sx, sy, sz]) {
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
    