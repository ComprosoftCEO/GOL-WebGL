import { mat4 } from 'gl-matrix';

const PROJECTION_MATRIX_UNIFORM = 'u_projMatrix';
const VIEW_MATRIX_UNIFORM = 'u_viewMatrix';

/**
 * Generic camera interface
 */
export interface Camera {
  setCameraUniforms(gl: WebGLRenderingContext, program: WebGLProgram): void;
}

/**
 * Represents a perspective camera
 *
 * This expects shaders to have uniforms:
 *   mat4 u_projMatrix  = Matrix for perspective projection
 *   mat4 u_viewMatrix  = Matrix for camera location
 *
 * Or, for skybox cameras:
 *   mat4 u_inverseProjView = Inverse of the view-projection matrix
 */
export class PerspectiveCamera {
  public fovDegrees: number;
  public aspect: number;
  public near: number;
  public far: number;
  public viewMatrix: mat4;

  constructor(fovDegrees: number, aspect: number, near: number, far: number) {
    this.fovDegrees = fovDegrees;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
    this.viewMatrix = mat4.create();
  }

  setCameraUniforms(gl: WebGLRenderingContext, program: WebGLProgram): void {
    const projectionMatrix = mat4.perspective(
      mat4.create(),
      (this.fovDegrees * Math.PI) / 180,
      this.aspect,
      this.near,
      this.far,
    );

    // Projection Matrix
    const projUniform = gl.getUniformLocation(program, PROJECTION_MATRIX_UNIFORM);
    gl.uniformMatrix4fv(projUniform, false, projectionMatrix);

    // View Matrix
    const viewUniform = gl.getUniformLocation(program, VIEW_MATRIX_UNIFORM);
    gl.uniformMatrix4fv(viewUniform, false, this.viewMatrix);
  }
}
