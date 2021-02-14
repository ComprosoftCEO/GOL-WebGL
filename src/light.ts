import { vec3 } from 'gl-matrix';

const AMBIENT_UNIFORM = 'u_ambLight';
const DIRECTION_UNIFORM = 'u_lightDirection';

/**
 * Generic light interface
 */
export interface Light {
  setLightUniforms(gl: WebGLRenderingContext, program: WebGLProgram): void;
}

/**
 * Represents an ambient light in the scene
 *
 * This expects shaders to have uniforms:
 *   float u_ambLight  = Amount of ambient light, between 0.0 and 1.0
 */
export class AmbientLight {
  level: number;

  constructor(level: number) {
    this.level = level;
  }

  setLightUniforms(gl: WebGLRenderingContext, program: WebGLProgram): void {
    const ambientUniform = gl.getUniformLocation(program, AMBIENT_UNIFORM);
    gl.uniform1f(ambientUniform, this.level);
  }
}

/**
 * Represents a directional light in the scene
 *
 * This expects shaders to have uniforms:
 *   vec3 u_lightDirection  = Reverse normalized direction of the light
 */
export class DirectionalLight {
  direction: vec3;

  constructor(direction: vec3) {
    this.direction = direction;
  }

  setLightUniforms(gl: WebGLRenderingContext, program: WebGLProgram): void {
    // Compute reverse normalized vector
    const reverseDirection = vec3.inverse(vec3.create(), this.direction);
    vec3.normalize(reverseDirection, reverseDirection);

    const directionUniform = gl.getUniformLocation(program, DIRECTION_UNIFORM);
    gl.uniform3fv(directionUniform, reverseDirection);
  }
}
