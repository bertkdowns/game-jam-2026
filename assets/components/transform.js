import { Vec3, quatFromEuler, eulerFromQuaternion, degToRad, radToDeg, TransformFromTRS } from "../math.js";




export class Transform {
    _position = Vec3.zero();
    _scale = Vec3.one();
    // rotations are paired together in the constructor
    _rotation = Vec3.zero();
    _quaternion = [0, 0, 0, 0];

    constructor() {
        const t = this;
        // creates an interface that allows us to access the vec3.x etc properties as normal 
        // and inserts an update function to keep rotation and quaternion synced 
        // since updating the transform should be infrequent (maybe once per frame, the overhead introduced should be fine.
        // === rotation ===
        const eulerView = new Array();
        Object.defineProperties(eulerView, {
            // aenumerable: true,dds per axis setters 
            x: {enumerable: true, get() { return t._rotation[0]; }, set(v) { t._rotation[0] = v; t.UpdateQuaternion() } },
            y: {enumerable: true, get() { return t._rotation[1]; }, set(v) { t._rotation[1] = v; t.UpdateQuaternion() } },
            z: {enumerable: true, get() { return t._rotation[2]; }, set(v) { t._rotation[2] = v; t.UpdateQuaternion() } },
            0: {enumerable: true, get() { return t._rotation[0]; }, set(v) { t._rotation[0] = v; t.UpdateQuaternion() } },
            1: {enumerable: true, get() { return t._rotation[1]; }, set(v) { t._rotation[1] = v; t.UpdateQuaternion() } },
            2: {enumerable: true, get() { return t._rotation[2]; }, set(v) { t._rotation[2] = v; t.UpdateQuaternion() } },
        });
        eulerView.set = function (values) {
            const [x, y, z] = values;
            t._rotation[0] = x;
            t._rotation[1] = y;
            t._rotation[2] = z;
            t.UpdateQuaternion();
        }
        Object.defineProperty(t, "rotation", {
            get() { return eulerView },
            set(rotation) {
                if (rotation instanceof Vec3) {
                    console.log("was vec3")
                    t._rotation = rotation;
                }
                else if (Array.isArray(rotation)) {
                    console.log("was array");
                    t._rotation.set(rotation);

                } else return;
                console.log("updated, quaternion");
                t.UpdateQuaternion();
            }
        });

        // ===  quaternion  === 
        const quaternionView = new Array();
        Object.defineProperties(quaternionView, {
            // adds per axis setters 
            x: {enumerable: true, get() { return t._quaternion[0]; }, set(v) { t._quaternion[0] = v; t.UpdateEuler() } },
            y: {enumerable: true, get() { return t._quaternion[1]; }, set(v) { t._quaternion[1] = v; t.UpdateEuler() } },
            z: {enumerable: true, get() { return t._quaternion[2]; }, set(v) { t._quaternion[2] = v; t.UpdateEuler() } },
            w: {enumerable: true, get() { return t._quaternion[3]; }, set(v) { t._quaternion[3] = v; t.UpdateEuler() } },
            0: {enumerable: true, get() { return t._quaternion[0]; }, set(v) { t._quaternion[0] = v; t.UpdateEuler() } },
            1: {enumerable: true, get() { return t._quaternion[1]; }, set(v) { t._quaternion[1] = v; t.UpdateEuler() } },
            2: {enumerable: true, get() { return t._quaternion[2]; }, set(v) { t._quaternion[2] = v; t.UpdateEuler() } },
            3: {enumerable: true, get() { return t._quaternion[3]; }, set(v) { t._quaternion[3] = v; t.UpdateEuler() } },
        });
        Object.defineProperty(t, "quaternion", {
            get() { return quaternionView },
            set(quaternion) {
                console.log("updating quaternion");
                if (Array.isArray(quaternion) && quaternion.length == 4) {
                    t._quaternion = quaternion;
                }
                else return;
                t.UpdateEuler();
            },
        });


        // ===  position  ===
        const positionView = new Array();
        Object.defineProperties(positionView, {
            // adds per axis setters 
            x: {enumerable: true, get() { return t._position[0]; }, set(v) { t._position[0] = v; } },
            y: {enumerable: true, get() { return t._position[1]; }, set(v) { t._position[1] = v; } },
            z: {enumerable: true, get() { return t._position[2]; }, set(v) { t._position[2] = v; } },
            0: {enumerable: true, get() { return t._position[0]; }, set(v) { t._position[0] = v; } },
            1: {enumerable: true, get() { return t._position[1]; }, set(v) { t._position[1] = v; } },
            2: {enumerable: true, get() { return t._position[2]; }, set(v) { t._position[2] = v; } },
        });
        Object.defineProperty(t, "position", {
            get() { return positionView },
            set(position) {
                if (position instanceof Vec3) {
                    t._position = position;
                } else if (Array.isArray(position)) {
                    t._position.set(position);
                }
            },
        }); 
        positionView.set = t._position.set;

        // ===  scale  ===
        const scaleView = new Array();
        Object.defineProperties(scaleView, {
            // adds per axis setters 
            x: {enumerable: true,  get() { return t._scale[0]; }, set(v) { t._scale[0] = v; } },
            y: {enumerable: true,  get() { return t._scale[1]; }, set(v) { t._scale[1] = v; } },
            z: {enumerable: true,  get() { return t._scale[2]; }, set(v) { t._scale[2] = v; } },
            0: {enumerable: true,  get() { return t._scale[0]; }, set(v) { t._scale[0] = v; } },
            1: {enumerable: true,  get() { return t._scale[1]; }, set(v) { t._scale[1] = v; } },
            2: {enumerable: true,  get() { return t._scale[2]; }, set(v) { t._scale[2] = v; } },
        });
        Object.defineProperty(t, "scale", {
            get() { return scaleView },
            set(scale) {
                if (scale instanceof Vec3) {
                    t._scale = scale;
                } else if (Array.isArray(scale)) {
                    t._scale.set(scale);
                }
            },
        });
        scaleView.set = t._scale.set;


    }

    UpdateQuaternion() { 
        console.log("rotation is now",[...this._rotation]); 
        this._quaternion = quatFromEuler(this._rotation.map(deg => deg * degToRad));
        console.log("quaternion updated, is now", [...this.quaternion]);
        
    }
    UpdateEuler() { this._rotation = eulerFromQuaternion(this._quaternion).map(rad => rad * radToDeg) }

    GetTransformMatrix = () => TransformFromTRS(this._quaternion, this._position, this._scale);
}


window.Transform = Transform; // exposes the transform class to call in the console