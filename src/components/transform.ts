import { Vec3, quatFromEuler, eulerFromQuaternion, degToRad, radToDeg, TransformFromTRS } from "../engine_core/math";


declare global {
    export interface TransformInterface extends Transform { }
}

export interface Transform {

    get position(): Vec3;
    set position(position: Vec3 | Vector3 | [number, number]);

    get scale(): Vec3;
    set scale(scale: Vec3 | Vector3 | [number, number]);

    get rotation(): Vec3;
    set rotation(rotation: Vec3 | Vector3);
    quaternion: Vector4;

    UpdateQuaternion: () => void;
    UpdateEuler: () => void;
    getTransformMatrix: () => Matrix;
}


export class Transform {
    _position: Vector3 = [0, 0, 0];
    _scale: Vector3 = [1, 1, 1];
    // rotations are paired together in the constructor
    _rotation: Vector3 = [0, 0, 0];
    _quaternion: Vector4 = [0, 0, 0, 0];


    constructor() {
        const t = this;

        // needs to be created this way so 't' and 'this' target the same thing
        Object.defineProperties(t, {
            UpdateQuaternion: { value: () => { t._quaternion = quatFromEuler(t._rotation.map(deg => deg * degToRad) as Vector3) } },
            UpdateEuler: { value: () => { t._rotation = eulerFromQuaternion(t._quaternion).map(rad => rad * radToDeg) as Vector3 } },
            GetTransformMatrix: { value: () => TransformFromTRS(t._quaternion, t._position, t._scale) }
        });

        // creates an interface that allows us to access the vec3.x etc properties as normal 
        // and inserts an update function to keep rotation and quaternion synced 
        // since updating the transform should be infrequent (maybe once per frame, the overhead introduced should be fine.

        // ===  quaternion  === 
        const quaternionView = new Array();
        Object.defineProperty(t, "quaternion", {
            get() { return quaternionView },
            set(quaternion: Vector4) {
                t._quaternion = quaternion;
                t.UpdateEuler();
            },
        });
        var x = { enumerable: true, get() { return t._quaternion[0]; }, set(v: number) { t._quaternion[0] = v; t.UpdateEuler() } };
        var y = { enumerable: true, get() { return t._quaternion[1]; }, set(v: number) { t._quaternion[1] = v; t.UpdateEuler() } };
        var z = { enumerable: true, get() { return t._quaternion[2]; }, set(v: number) { t._quaternion[2] = v; t.UpdateEuler() } };
        var w = { enumerable: true, get() { return t._quaternion[3]; }, set(v: number) { t._quaternion[3] = v; t.UpdateEuler() } };
        Object.defineProperties(quaternionView, { x, y, z, w, 0: x, 1: y, 2: z, 3: w, });

        // === rotation ===

        const eulerView = new Array();
        Object.defineProperty(t, "rotation", {
            get() { return eulerView },
            set(rotation: Vector3) {
                t._rotation = rotation;
                t.UpdateQuaternion();
            }
        });
        x = { enumerable: true, get() { return t._rotation[0]; }, set(v: number) { t._rotation[0] = v; t.UpdateQuaternion() } };
        y = { enumerable: true, get() { return t._rotation[1]; }, set(v: number) { t._rotation[1] = v; t.UpdateQuaternion() } };
        z = { enumerable: true, get() { return t._rotation[2]; }, set(v: number) { t._rotation[2] = v; t.UpdateQuaternion() } };
        Object.defineProperties(eulerView, { x, y, z, 0: x, 1: y, 2: z });


        // ===  position  ===
        const positionView = new Array();
        Object.defineProperty(t, "position", {
            get() { return positionView },
            set(position: Vector3) {
                t._position = position;
            },
        });
        x = { enumerable: true, get() { return t._position[0]; }, set(v: number) { t._position[0] = v; } };
        y = { enumerable: true, get() { return t._position[1]; }, set(v: number) { t._position[1] = v; } };
        z = { enumerable: true, get() { return t._position[2]; }, set(v: number) { t._position[2] = v; } };
        Object.defineProperties(positionView, { x, y, z, 0: x, 1: y, 2: z, });


        // ===  scale  ===
        const scaleView = new Array();
        Object.defineProperty(t, "scale", {
            get() { return scaleView },
            set(scale: Vector3) {
                t._scale = scale;
            },
        });
        x = { enumerable: true, get() { return t._scale[0]; }, set(v: number) { t._scale[0] = v; } };
        y = { enumerable: true, get() { return t._scale[1]; }, set(v: number) { t._scale[1] = v; } };
        z = { enumerable: true, get() { return t._scale[2]; }, set(v: number) { t._scale[2] = v; } };
        Object.defineProperties(scaleView, { x, y, z, 0: x, 1: y, 2: z, });
    }
}


declare global {
    interface Window {
        Transform: Transform;
    }
}
