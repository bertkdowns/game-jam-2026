import {
  dot,
  quatToMat4,
  invertMat4,
  multiplyMat4Vec4,
  normalize,
  subtract,
} from "../engine_core/math";
import { createDepthTextureFromCanvas, gpu } from "../engine_core/renderer";


export class Camera {
  // actual camera stuff
  initialise(canvas) {
    const camera = this;
    // Set initial size
    camera.setFromCanvas(canvas);
    // Watch for size changes
    new ResizeObserver(() => camera.setFromCanvas(canvas)).observe(canvas);
  }
  setFromCanvas(canvas) {
    // Get the display size (CSS size)
    const displayWidth = canvas.clientWidth || canvas.width;
    const displayHeight = canvas.clientHeight || canvas.height;

    // Update canvas internal resolution to match display size
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;

      // Update depth texture if renderer exists and GPU is initialized
      if (window.renderer && window.renderer.depthTexture && gpu) {
        window.renderer.depthTexture.destroy();
        window.renderer.depthTexture = createDepthTextureFromCanvas(canvas);
      }
    }

    console.log("canvas setup/reset", canvas.width, canvas.height);
    this.aspect = canvas.width / canvas.height;
    this.resolution = [canvas.width, canvas.height];
  }

  // world scale intends for there to be 32pixels per unit, and 8 units to make up the screen height

  aspect = 1;
  //   resolution = [1280, 720];

  // 3D perspective stuff
  near = 0.02;
  far = 1000;
  fovY = 60;
  f = 1 / Math.tan((this.fovY * Math.PI) / 360);

  // camera perspective projection
  PerspectiveMatrix() {
    return [
      this.f / this.aspect,
      0,
      0,
      0,
      0,
      this.f,
      0,
      0,
      0,
      0,
      this.far / (this.far - this.near),
      1,
      0,
      0,
      (-this.near * this.far) / (this.far - this.near),
      0,
    ];
  }

  // translation matrix functions
  ViewMatrix() {
    const eye = this.position;
    const rot = quatToMat4(this.quaternion);

    // extract rotation columns
    const x = [rot[0], rot[1], rot[2]];
    const y = [rot[4], rot[5], rot[6]];
    const z = [rot[8], rot[9], rot[10]];

    return [
      x[0],
      y[0],
      z[0],
      0,
      x[1],
      y[1],
      z[1],
      0,
      x[2],
      y[2],
      z[2],
      0,
      -dot(x, eye),
      -dot(y, eye),
      -dot(z, eye),
      1,
    ];
  }

  pixelScale = 1 / 256;
  UIToScreenMatrix() {
    return [
      this.pixelScale / this.aspect,
      0,
      0,
      0,
      0,
      this.pixelScale,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
    ];
  }
  ScreenToUIMatrix() {
    return [
      this.aspect / this.pixelScale,
      0,
      0,
      0,
      0,
      1 / this.pixelScale,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
    ];
  }

  //#region  /* will probably not need this after making sprites inherit from transfrom()  */
  WorldToScreenMatrix() {
    return [
      1 / (this.aspect * this.pixelScale),
      0,
      0,
      0,
      0,
      1 / this.pixelScale,
      0,
      0,
      0,
      0,
      1,
      0,
      -this.position.x / this.aspect,
      -this.position.y,
      0,
      1,
    ];
  }
  ScreenToWorldMatrix() {
    return [
      this.aspect * this.pixelScale,
      0,
      0,
      0,
      0,
      this.pixelScale,
      0,
      0,
      0,
      0,
      1,
      0,
      this.position.x * this.aspect,
      this.position.y,
      0,
      1,
    ];
  }

  screenToWorld(x, y, z = 1) {
    // screenX, screenY in pixels, (0,0) top-left
    //const nx = (screenX / this.viewportWidth) * 2 - 1;  // normalized -1..1
    //const ny = 1 - (screenY / this.viewportHeight) * 2; // flip Y

    // clip space
    const clip = [x, y, z, 1]; // [nx, ny, z, 1];

    // transform from clip -> view space
    const invProj = invertMat4(this.PerspectiveMatrix()); // 4x4 inverse
    const viewSpace = multiplyMat4Vec4(invProj, clip);

    // perspective divide
    viewSpace[0] /= viewSpace[3];
    viewSpace[1] /= viewSpace[3];
    viewSpace[2] /= viewSpace[3];

    // transform from view -> world space
    const invView = invertMat4(this.ViewMatrix()); // 4x4 inverse
    const worldPos = multiplyMat4Vec4(invView, [...viewSpace, 1]);

    return worldPos.slice(0, 3); // xyz
  }

  screenPositionToRay(x, y, z = 1) {
    const origin = camera.position; // camera pos in world
    const target = camera.screenToWorld(x, y, z);
    const direction = normalize(subtract(target, origin));
    return { origin, direction };
  }

  rayPlaneZ0(ray) {
    const [ox, oy, oz] = ray.origin;
    const [dx, dy, dz] = ray.direction;

    // avoid division by zero if ray is parallel to the plane
    if (Math.abs(dz) < 1e-6) return null;

    // solve t in oz + dz * t = 0
    const t = -oz / dz;

    // intersection point
    return [ox + dx * t, oy + dy * t, 0];
  }
  /*
    intersectRayZ0(ray) {
        if (Math.abs(ray.direction[2]) < 1e-6) return null; // parallel
        const t = -ray.origin[2] / ray.direction[2];
        return add(ray.origin, scale(ray.direction, t));
    }*/

  //#endregion
}
