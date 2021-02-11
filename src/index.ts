import vertexShaderSrc from 'shaders/vertexShader.glsl';
import fragmentShaderSrc from 'shaders/fragmentShader.glsl';
import { createAndLoadBuffer, loadAndCompileShaders, resizeCanvasToDisplaySize } from './utils';
import { mat4 } from 'gl-matrix';
import './canvas.css';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
resizeCanvasToDisplaySize(canvas);

const gl = canvas.getContext('webgl');

// prettier-ignore
const vertices = [
  -1,-1,-1, 1,-1,-1, 1, 1,-1, -1, 1,-1,
  -1,-1, 1, 1,-1, 1, 1, 1, 1, -1, 1, 1,
  -1,-1,-1, -1, 1,-1, -1, 1, 1, -1,-1, 1,
  1,-1,-1, 1, 1,-1, 1, 1, 1, 1,-1, 1,
  -1,-1,-1, -1,-1, 1, 1,-1, 1, 1,-1,-1,
  -1, 1,-1, -1, 1, 1, 1, 1, 1, 1, 1,-1, 
];

// prettier-ignore
const indices = [
  0,1,2,    0,2,3,    4,5,6,    4,6,7,
  8,9,10,   8,10,11,  12,13,14, 12,14,15,
  16,17,18, 16,18,19, 20,21,22, 20,22,23 
];

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
const indexBuffer = createAndLoadBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices));
const colorBuffer = createAndLoadBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(colors));

const program = loadAndCompileShaders(gl, vertexShaderSrc, fragmentShaderSrc);

// "coord" attribute
const coordAttribute = gl.getAttribLocation(program, 'coord');
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.vertexAttribPointer(coordAttribute, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(coordAttribute);

// "color" attribute
const colorAttribute = gl.getAttribLocation(program, 'color');
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(colorAttribute, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(colorAttribute);

// Compute the uniform values
const projectionMatrix: mat4 = mat4.perspective(mat4.create(), Math.PI / 4, gl.canvas.width / gl.canvas.height, 1, 100);
const moveMatrix: mat4 = mat4.create();
const viewMatrix: mat4 = mat4.fromTranslation(mat4.create(), [0, 0, -6]);

const projectionUniform = gl.getUniformLocation(program, 'proj_matrix');
const viewUniform = gl.getUniformLocation(program, 'view_matrix');
const moveUniform = gl.getUniformLocation(program, 'move_matrix');

let timeOld = 0;
const animate = (time: number): void => {
  // Update the rotation matrices
  const dt = time - timeOld;
  mat4.rotateX(moveMatrix, moveMatrix, dt * 0.005);
  mat4.rotateY(moveMatrix, moveMatrix, dt * 0.002);
  mat4.rotateZ(moveMatrix, moveMatrix, dt * 0.003);
  mat4.translate(viewMatrix, viewMatrix, [0, 0, -0.0005 * dt]);
  timeOld = time;

  // Update the uniforms
  gl.uniformMatrix4fv(projectionUniform, false, projectionMatrix);
  gl.uniformMatrix4fv(viewUniform, false, viewMatrix);
  gl.uniformMatrix4fv(moveUniform, false, moveMatrix);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearColor(0, 0, 0, 1);
  gl.clearDepth(1.0);

  resizeCanvasToDisplaySize(canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw the triangles
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  window.requestAnimationFrame(animate);
};
animate(0);
