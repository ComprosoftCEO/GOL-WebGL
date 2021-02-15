import lifeVertexShader from 'shaders/lifeVertexShader.glsl';
import lifeFragmentShader from 'shaders/lifeFragmentShader.glsl';
import { createAndLoadBuffer, loadAndCompileShaders } from './utils';
import icomesh from 'icomesh';
import { vec3, mat4 } from 'gl-matrix';
import { Life, LifeRule } from './life';

const VERTEX_ATTRIBUTE = 'a_vertex';
const NORMAL_ATTRIBUTE = 'a_normal';
const HEIGHT_ATTRIBUTE = 'a_height';
const MODEL_UNIFORM = 'u_modelMatrix';
const INVERSE_TRANSPOSE_MODEL_UNIFORM = 'u_inverseTranspose';
const COLOR_UNIFORM = 'u_surfaceColor';

const MIN_SCALE = -0.01;
const MAX_SCALE = 0.1;

const SHOULD_SCALE: boolean[] = [
  [true, true, true],
  [false, false, true, false, true, true],
  [false, false, true, false, true, true],
  [false, false, true, false, true, true],
].flat();

type Vec3Array = [number, number, number];

/**
 * Draws the game of life to
 */
export class LifeSphere {
  public modelMatrix: mat4;
  public color: vec3;

  private verticesBuffer: WebGLBuffer;
  private normalsBuffer: WebGLBuffer;
  private triangles: Uint16Array;

  private heightData: number[];
  private heightBuffer: WebGLBuffer;

  static lifeSphereProgram: WebGLProgram;
  static loadShaders(gl: WebGLRenderingContext): void {
    LifeSphere.lifeSphereProgram = loadAndCompileShaders(gl, lifeVertexShader, lifeFragmentShader);
  }

  constructor(gl: WebGLRenderingContext, order: number, color: vec3) {
    const { vertices, triangles } = icomesh(order);

    const { allVertices, allNormals } = computeVerticesNormals(vertices, triangles);

    this.heightData = [...Array(allVertices.length).fill(0)];
    this.heightBuffer = gl.createBuffer();

    this.verticesBuffer = createAndLoadBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(allVertices));
    this.normalsBuffer = createAndLoadBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(allNormals));
    this.triangles = triangles;

    this.modelMatrix = mat4.create();
    this.color = color;
  }

  static loadProgram(gl: WebGLRenderingContext): WebGLProgram {
    gl.useProgram(LifeSphere.lifeSphereProgram);
    return LifeSphere.lifeSphereProgram;
  }

  createLife(rule: LifeRule): Life {
    return new Life(rule, this.triangles);
  }

  updateHeight(current: boolean[], next: boolean[], interpolation: number): void {
    for (let face = 0; face < this.triangles.length / 3; face += 1) {
      for (let offset = 0; offset < SHOULD_SCALE.length; offset += 1) {
        if (!SHOULD_SCALE[offset]) {
          continue;
        }

        if (current[face] === next[face]) {
          this.heightData[face * 21 + offset] = current[face] ? MAX_SCALE : MIN_SCALE;
        } else {
          const currentScale = current[face] ? MAX_SCALE : MIN_SCALE;
          const nextScale = next[face] ? MAX_SCALE : MIN_SCALE;
          this.heightData[face * 21 + offset] = linearInterpolation(currentScale, nextScale, interpolation);
        }
      }
    }
  }

  draw(gl: WebGLRenderingContext): void {
    // Vertices
    const vertexAttribute = gl.getAttribLocation(LifeSphere.lifeSphereProgram, VERTEX_ATTRIBUTE);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
    gl.vertexAttribPointer(vertexAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexAttribute);

    // Normals
    const normalAttribute = gl.getAttribLocation(LifeSphere.lifeSphereProgram, NORMAL_ATTRIBUTE);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
    gl.vertexAttribPointer(normalAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalAttribute);

    // Height
    const heightAttribute = gl.getAttribLocation(LifeSphere.lifeSphereProgram, HEIGHT_ATTRIBUTE);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.heightBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.heightData), gl.STREAM_DRAW);
    gl.vertexAttribPointer(heightAttribute, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(heightAttribute);

    // Model matrix
    const modelUniform = gl.getUniformLocation(LifeSphere.lifeSphereProgram, MODEL_UNIFORM);
    gl.uniformMatrix4fv(modelUniform, false, this.modelMatrix);

    // Inverse transpose of model matrix
    const inverseTranspose = mat4.clone(this.modelMatrix);
    mat4.invert(inverseTranspose, inverseTranspose);
    mat4.transpose(inverseTranspose, inverseTranspose);

    const inverseTransposeUniform = gl.getUniformLocation(
      LifeSphere.lifeSphereProgram,
      INVERSE_TRANSPOSE_MODEL_UNIFORM,
    );
    gl.uniformMatrix4fv(inverseTransposeUniform, false, inverseTranspose);

    // Color
    const colorUniform = gl.getUniformLocation(LifeSphere.lifeSphereProgram, COLOR_UNIFORM);
    gl.uniform3fv(colorUniform, this.color);

    // Draw all triangles
    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
    gl.drawArrays(gl.TRIANGLES, 0, (this.triangles.length / 3) * 21);
  }
}

// Compute all of the vertices and normal vectors for nubs
//  That come up above the sphere
function computeVerticesNormals(
  vertices: Float32Array,
  triangles: Uint16Array,
): {
  allVertices: Float32Array;
  allNormals: Float32Array;
} {
  const numVertices = (triangles.length / 3) * 21 * 3;
  const allVertices = new Float32Array(numVertices);
  const allNormals = new Float32Array(numVertices);

  for (let index = 0; index < triangles.length; index += 3) {
    const indexes = triangles.slice(index, index + 3);
    const sphereVertex1 = [...vertices.slice(indexes[0] * 3, indexes[0] * 3 + 3)] as Vec3Array;
    const sphereVertex2 = [...vertices.slice(indexes[1] * 3, indexes[1] * 3 + 3)] as Vec3Array;
    const sphereVertex3 = [...vertices.slice(indexes[2] * 3, indexes[2] * 3 + 3)] as Vec3Array;

    const scaledVertex1 = applyScale(sphereVertex1);
    const scaledVertex2 = applyScale(sphereVertex2);
    const scaledVertex3 = applyScale(sphereVertex3);

    allVertices.set(
      [
        [sphereVertex1, sphereVertex2, sphereVertex3],
        makeVectorQuad(sphereVertex1, sphereVertex2, sphereVertex2, sphereVertex1),
        makeVectorQuad(sphereVertex3, sphereVertex1, sphereVertex1, sphereVertex3),
        makeVectorQuad(sphereVertex2, sphereVertex3, sphereVertex3, sphereVertex2),
      ].flat(2),
      index * 21,
    );

    allNormals.set(
      [
        [scaledVertex1, scaledVertex2, scaledVertex3],
        makeNormalsQuad(scaledVertex1, scaledVertex2, sphereVertex2, sphereVertex1),
        makeNormalsQuad(scaledVertex3, scaledVertex1, sphereVertex1, sphereVertex3),
        makeNormalsQuad(scaledVertex3, scaledVertex2, sphereVertex2, sphereVertex3),
      ].flat(2),
      index * 21,
    );
  }

  return { allVertices, allNormals };
}

function applyScale(vector: Vec3Array): Vec3Array {
  const scaledVector = [...vector] as Vec3Array;
  vec3.normalize(scaledVector, scaledVector);
  vec3.scale(scaledVector, scaledVector, MAX_SCALE);
  vec3.add(scaledVector, scaledVector, vector);
  return scaledVector;
}

// 3,2,1,3,1,0
function makeVectorQuad(a: Vec3Array, b: Vec3Array, c: Vec3Array, d: Vec3Array): Vec3Array[] {
  return [d, c, b, d, b, a];
}

const NORMAL_LOOKUP = [
  [0, 1, 2],
  [1, 2, 0],
  [2, 0, 1],
  [3, 4, 5],
  [4, 5, 3],
  [5, 3, 4],
];

function makeNormalsQuad(a: Vec3Array, b: Vec3Array, c: Vec3Array, d: Vec3Array): Vec3Array[] {
  const vectors = makeVectorQuad(a, b, c, d);
  const normals = [];

  for (const lookup of NORMAL_LOOKUP) {
    normals.push(findNormal(vectors[lookup[0]], vectors[lookup[1]], vectors[lookup[2]]));
  }

  return normals;
}

function findNormal(a: Vec3Array, b: Vec3Array, c: Vec3Array): Vec3Array {
  const one = vec3.sub(vec3.create(), b, a);
  const two = vec3.sub(vec3.create(), c, a);
  const cross = vec3.cross(vec3.create(), one, two);
  vec3.normalize(cross, cross);

  return [cross[0], cross[1], cross[2]];
}

function linearInterpolation(x: number, y: number, a: number): number {
  return x * (1 - a) + y * a;
}
