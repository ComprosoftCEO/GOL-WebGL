import { vec3 } from 'gl-matrix';

const COLOR_UNIFORM = 'u_lightColor';
const DIRECTION_UNIFORM = 'u_lightDirection';

/**
 * Generic light interface
 */
export interface Light {
  setLightUniforms(gl: WebGLRenderingContext, program: WebGLProgram): void;
}

/**
 * Represents a directional light in the scene
 *
 * This expects shaders to have uniforms:
 *   vec3 u_lightColor      = Color of the light
 *   vec3 u_lightDirection  = Reverse normalized direction of the light
 */
export class DirectionalLight {
  color: vec3;
  direction: vec3;

  constructor(color: vec3, direction: vec3) {
    this.color = color;
    this.direction = direction;
  }

  setLightUniforms(gl: WebGLRenderingContext, program: WebGLProgram): void {
    // Color
    const colorUniform = gl.getUniformLocation(program, COLOR_UNIFORM);
    gl.uniform3fv(colorUniform, this.color);

    // Direction
    const reverseDirection = vec3.inverse(vec3.create(), this.direction);
    vec3.normalize(reverseDirection, reverseDirection);

    const directionUniform = gl.getUniformLocation(program, DIRECTION_UNIFORM);
    gl.uniform3fv(directionUniform, reverseDirection);
  }
}
