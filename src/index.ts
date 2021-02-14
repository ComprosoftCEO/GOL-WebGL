import vertexShaderSrc from 'shaders/vertexShader.glsl';
import fragmentShaderSrc from 'shaders/fragmentShader.glsl';
import { createAndLoadBuffer, loadAndCompileShaders, resizeCanvasToDisplaySize } from './utils';
import { mat4, vec3 } from 'gl-matrix';
import icomesh from 'icomesh';
import './canvas.css';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
resizeCanvasToDisplaySize(canvas);

const gl = canvas.getContext('webgl');
gl.getExtension('OES_standard_derivatives');

// prettier-ignore
const {vertices, triangles}  = icomesh(3);

// prettier-ignore
const colors = [
  1, 0.5, 0, 1, 0.5, 0, 1, 0.5, 0, 1, 0.5, 0, 
  1,1,3, 1,1,3, 1,1,3, 1,1,3,
  0,0,1, 0,0,1, 0,0,1, 0,0,1,
  1,0,0, 1,0,0, 1,0,0, 1,0,0,
  1,1,0, 1,1,0, 1,1,0, 1,1,0,
  0,1,0, 0,1,0, 0,1,0, 0,1,0
];

// Load in the static buffer data
const vertexBuffer = createAndLoadBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertices));
const indexBuffer = createAndLoadBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangles));
const colorBuffer = createAndLoadBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(colors));

const program = loadAndCompileShaders(gl, vertexShaderSrc, fragmentShaderSrc);

// "coord" attribute
const coordAttribute = gl.getAttribLocation(program, 'coord');
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.vertexAttribPointer(coordAttribute, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(coordAttribute);

// "color" attribute
// const colorAttribute = gl.getAttribLocation(program, 'color');
// gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
// gl.vertexAttribPointer(colorAttribute, 3, gl.FLOAT, false, 0, 0);
// gl.enableVertexAttribArray(colorAttribute);

// Compute the uniform values
const modelMatrix: mat4 = mat4.create();
const projectionMatrix: mat4 = mat4.perspective(mat4.create(), Math.PI / 4, gl.canvas.width / gl.canvas.height, 1, 100);
const viewMatrix: mat4 = mat4.fromTranslation(mat4.create(), [0, 0, -6]);

const modelUniform = gl.getUniformLocation(program, 'model_matrix');
const projectionUniform = gl.getUniformLocation(program, 'proj_matrix');
const viewUniform = gl.getUniformLocation(program, 'view_matrix');
const inverseTransposeUniform = gl.getUniformLocation(program, 'inverse_transpose');

const lightVectorUniform = gl.getUniformLocation(program, 'reverse_light_vector');
const colorUniform = gl.getUniformLocation(program, 'color');

gl.uniform3fv(lightVectorUniform, vec3.normalize(vec3.create(), [0.4, 0.5, 1]));
gl.uniform4fv(colorUniform, [1, 0.5, 0, 1]);

let timeOld = 0;
const animate = (time: number): void => {
  // Update the rotation matrices
  const dt = time - timeOld;
  // mat4.rotateX(modelMatrix, modelMatrix, dt * 0.005);
  mat4.rotateY(modelMatrix, modelMatrix, dt * 0.002);
  mat4.rotateY(viewMatrix, viewMatrix, dt * -0.001);
  timeOld = time;

  // Update the uniforms
  gl.uniformMatrix4fv(modelUniform, false, modelMatrix);
  gl.uniformMatrix4fv(projectionUniform, false, projectionMatrix);
  gl.uniformMatrix4fv(viewUniform, false, viewMatrix);

  const inverseTranspose = mat4.mul(mat4.create(), modelMatrix, mat4.create());
  mat4.invert(inverseTranspose, inverseTranspose);
  mat4.transpose(inverseTranspose, inverseTranspose);
  gl.uniformMatrix4fv(inverseTransposeUniform, false, inverseTranspose);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearColor(0, 0, 0, 1);
  gl.clearDepth(1.0);

  resizeCanvasToDisplaySize(canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw the triangles
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.drawElements(gl.TRIANGLES, triangles.length, gl.UNSIGNED_SHORT, 0);

  window.requestAnimationFrame(animate);
};
animate(0);
