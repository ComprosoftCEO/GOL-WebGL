import { mat4 } from 'gl-matrix';
import icomesh from 'icomesh';
import { createAndLoadBuffer, loadAndCompileShaders, loadTexture } from './utils';
import sphereVertexShader from 'shaders/sphereVertexShader.glsl';
import sphereFragmentShader from 'shaders/sphereFragmentShader.glsl';
import planetTexture from 'img/planet-texture.png';

const VERTEX_ATTRIBUTE = 'a_vertex';
const MODEL_UNIFORM = 'u_modelMatrix';
const INVERSE_TRANSPOSE_MODEL_UNIFORM = 'u_inverseTranspose';
const TEXTURE_COORD_ATTRIBUTE = 'a_textureCoord';
const TEXTURE_UNIFORM = 'u_textureSampler';

/**
 * Represents a sphere object in the game
 */
export class Sphere {
  modelMatrix: mat4;

  private triangles: Uint16Array;
  private verticesBuffer: WebGLBuffer;
  private trianglesBuffer: WebGLBuffer;

  private uv: Float32Array;
  private uvBuffer: WebGLBuffer;

  static sphereProgram: WebGLProgram;
  static texture: WebGLTexture;

  static loadShaders(gl: WebGLRenderingContext): void {
    Sphere.sphereProgram = loadAndCompileShaders(gl, sphereVertexShader, sphereFragmentShader);
    Sphere.texture = loadTexture(gl, planetTexture, [128, 128, 128]);
  }

  constructor(gl: WebGLRenderingContext, order: number) {
    const { vertices, triangles, uv } = icomesh(order, true);

    this.triangles = triangles;
    this.verticesBuffer = createAndLoadBuffer(gl, gl.ARRAY_BUFFER, vertices);
    this.trianglesBuffer = createAndLoadBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, triangles);

    this.uv = uv;
    this.uvBuffer = createAndLoadBuffer(gl, gl.ARRAY_BUFFER, uv);

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

    // Texture
    const textureUniform = gl.getUniformLocation(Sphere.sphereProgram, TEXTURE_UNIFORM);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, Sphere.texture);
    gl.uniform1i(textureUniform, 0);

    // Texture coordinates
    const textureCoordAttribute = gl.getAttribLocation(Sphere.sphereProgram, TEXTURE_COORD_ATTRIBUTE);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(textureCoordAttribute);

    // Draw all triangles
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trianglesBuffer);
    gl.drawElements(gl.TRIANGLES, this.triangles.length, gl.UNSIGNED_SHORT, 0);
  }
}
