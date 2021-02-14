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
 */
export class PerspectiveCamera {
  projectionMatrix: mat4;
  viewMatrix: mat4;

  constructor(fovDegrees: number, aspect: number, near: number, far: number) {
    this.projectionMatrix = mat4.perspective(mat4.create(), (fovDegrees * Math.PI) / 180, aspect, near, far);
    this.viewMatrix = mat4.create();
  }

  setCameraUniforms(gl: WebGLRenderingContext, program: WebGLProgram): void {
    // Projection Matrix
    const projUniform = gl.getUniformLocation(program, PROJECTION_MATRIX_UNIFORM);
    gl.uniformMatrix4fv(projUniform, false, this.projectionMatrix);

    // View Matrix
    const viewUniform = gl.getUniformLocation(program, VIEW_MATRIX_UNIFORM);
    gl.uniformMatrix4fv(viewUniform, false, this.viewMatrix);
  }
}
