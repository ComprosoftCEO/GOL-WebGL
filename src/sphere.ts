import { mat4 } from 'gl-matrix';
import icomesh from 'icomesh';
import { createAndLoadBuffer, loadAndCompileShaders } from './utils';
import sphereVertexShader from 'shaders/sphereVertexShader.glsl';
import sphereFragmentShader from 'shaders/sphereFragmentShader.glsl';

const VERTEX_ATTRIBUTE = 'a_vertex';
const MODEL_UNIFORM = 'u_modelMatrix';
const INVERSE_TRANSPOSE_MODEL_UNIFORM = 'u_inverseTranspose';

/**
 * Represents a sphere object in the game
 */
export class Sphere {
  modelMatrix: mat4;

  triangles: Uint16Array;
  verticesBuffer: WebGLBuffer;
  trianglesBuffer: WebGLBuffer;

  static sphereProgram: WebGLProgram;

  static loadShaders(gl: WebGLRenderingContext): void {
    Sphere.sphereProgram = loadAndCompileShaders(gl, sphereVertexShader, sphereFragmentShader);
  }

  constructor(gl: WebGLRenderingContext, order: number) {
    const { vertices, triangles } = icomesh(order);

    this.triangles = triangles;
    this.verticesBuffer = createAndLoadBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertices));
    this.trianglesBuffer = createAndLoadBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangles));

    this.modelMatrix = mat4.create();
  }

  static loadProgram(gl: WebGLRenderingContext): WebGLProgram {
    gl.useProgram(Sphere.sphereProgram);
    return Sphere.sphereProgram;
  }

  draw(gl: WebGLRenderingContext): void {
    // Vertices
    const vertexAttribute = gl.getAttribLocation(Sphere.sphereProgram, VERTEX_ATTRIBUTE);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
    gl.vertexAttribPointer(vertexAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexAttribute);

    // Model matrix
    const modelUniform = gl.getUniformLocation(Sphere.sphereProgram, MODEL_UNIFORM);
    gl.uniformMatrix4fv(modelUniform, false, this.modelMatrix);

    // Inverse transpose of model matrix
    const inverseTranspose = mat4.clone(this.modelMatrix);
    mat4.invert(inverseTranspose, inverseTranspose);
    mat4.transpose(inverseTranspose, inverseTranspose);

    const inverseTransposeUniform = gl.getUniformLocation(Sphere.sphereProgram, INVERSE_TRANSPOSE_MODEL_UNIFORM);
    gl.uniformMatrix4fv(inverseTransposeUniform, false, inverseTranspose);

    // Draw all triangles
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trianglesBuffer);
    gl.drawElements(gl.TRIANGLES, this.triangles.length, gl.UNSIGNED_SHORT, 0);
  }
}
