import {
  dot,
  quatToMat4,
  invertMat4,
  multiplyMat4Vec4,
  normalize,
  subtract,
  Vec3,
} from "../engine_core/math";
import { createDepthTextureFromCanvas, Renderer } from "../engine_core/renderer";
import type { Vector4, Vector3, Matrix, Ray } from "../engine_core/math";
import type { TransformInterface } from "./types";


export interface Camera extends TransformInterface {
  resolution: [number, number];
  aspect: number;
  UIPixelScale: number;
  near: number;
  far: number;
  fovY: number;
  f: number;
}


export class Camera {
  resolution: [number, number] = [1280, 720];
  aspect = 1;
  // ui stuff (for pixelart)
  UIPixelScale = 1 / 256;
  // 3D perspective stuff
  near = 0.02;
  far = 1000;
  fovY = 60;
  f = 1 / Math.tan((this.fovY * Math.PI) / 360);

  // actual camera stuff
  initialise(canvas: HTMLCanvasElement) {
    const camera = this;
    // Set initial size
    camera.setFromCanvas(canvas);
    // Watch for size changes
    new ResizeObserver(() => camera.setFromCanvas(canvas)).observe(canvas);
  }
  setFromCanvas(canvas: HTMLCanvasElement) {
    // Get the display size (CSS size)
    const displayWidth = canvas.clientWidth || canvas.width;
    const displayHeight = canvas.clientHeight || canvas.height;

    // Update canvas internal resolution to match display size
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;

      // Update depth texture if renderer exists and GPU is initialized
      if (Renderer.depthTexture) {
        Renderer.depthTexture.destroy();
        Renderer.depthTexture = createDepthTextureFromCanvas(canvas);
      }
    }

    console.log("canvas setup/reset", canvas.width, canvas.height);
    this.aspect = canvas.width / canvas.height;
    this.resolution = [canvas.width, canvas.height];
  }




  // camera perspective projection
  PerspectiveMatrix(): Matrix {
    return [
      this.f / this.aspect, 0, 0, 0,
      0, this.f, 0, 0,
      0, 0, this.far / (this.far - this.near), 1,
      0, 0, (-this.near * this.far) / (this.far - this.near), 0,
    ];
  }

  // translation matrix functions
  ViewMatrix(): Matrix {
    const eye = this.position;
    const rot = quatToMat4(this.quaternion);

    // extract rotation columns
    const x = [rot[0], rot[1], rot[2]] as Vector3;
    const y = [rot[4], rot[5], rot[6]] as Vector3;
    const z = [rot[8], rot[9], rot[10]] as Vector3;

    return [
      x[0], y[0], z[0], 0,
      x[1], y[1], z[1], 0,
      x[2], y[2], z[2], 0,
      -dot(x, eye), -dot(y, eye), -dot(z, eye), 1,
    ];
  }


  UIToScreenMatrix(): Matrix {
    return [
      this.UIPixelScale / this.aspect, 0, 0,
      0, 0, this.UIPixelScale, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  }
  ScreenToUIMatrix(): Matrix {
    return [
      this.aspect / this.UIPixelScale, 0, 0, 0
      , 0, 1 / this.UIPixelScale, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  }

  //#region  /* will probably not need this after making sprites inherit from transform()  */

  screenToWorld(x: number, y: number, z: number = 1): Vector3 {
    // clip space
    const clip = [x, y, z, 1] as Vector4; // [nx, ny, z, 1];

    // transform from clip -> view space
    const invProj = invertMat4(this.PerspectiveMatrix()); // 4x4 inverse
    const viewSpace = multiplyMat4Vec4(invProj, clip);

    // perspective divide
    viewSpace[0] /= viewSpace[3];
    viewSpace[1] /= viewSpace[3];
    viewSpace[2] /= viewSpace[3];
    viewSpace[3] = 1;

    // transform from view -> world space
    const invView = invertMat4(this.ViewMatrix()); // 4x4 inverse
    const worldPos = multiplyMat4Vec4(invView, viewSpace);

    return worldPos.slice(0, 3) as Vector3;  // xyz
  }

  screenPositionToRay(x: number, y: number, z: number = 1): Ray {
    const origin = this.position; // camera pos in world
    const target = this.screenToWorld(x, y, z);
    const direction = normalize(subtract(target, origin));
    return { origin, direction };
  }

  rayPlaneZ0(ray: Ray): Vector3 {
    const [ox, oy, oz] = ray.origin;
    const [dx, dy, dz] = ray.direction;

    // avoid division by zero if ray is parallel to the plane
    if (Math.abs(dz) < 1e-6) return [NaN, NaN, NaN];

    // solve t in oz + dz * t = 0
    const t = -oz / dz;

    // intersection point
    return [ox + dx * t, oy + dy * t, 0];
  }
  //#endregion
}