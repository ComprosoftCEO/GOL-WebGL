import vertexShaderSrc from 'shaders/vertexShader.glsl';
import fragmentShaderSrc from 'shaders/fragmentShader.glsl';
import { resizeCanvasToDisplaySize } from './utils';
import './canvas.css';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
resizeCanvasToDisplaySize(canvas);

const gl = canvas.getContext('webgl');

const vertices = [
  [-0.5, 0.5, 0.0],
  [-0.5, -0.5, 0.0],
  [0.5, -0.5, 0.0],
  [0.5, 0.5, 0.0],
].flat();

const indices = [3, 2, 1, 3, 1, 0];

const colors = [
  [0, 0, 1],
  [1, 0, 0],
  [0, 1, 0],
  [1, 0, 1],
].flat();

// Load in the static buffer data
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(
  gl.ELEMENT_ARRAY_BUFFER,
  new Uint16Array(indices),
  gl.STATIC_DRAW,
);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

// Create the vertex shader
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSrc);
gl.compileShader(vertexShader);

// Create the fragment shader
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSrc);
gl.compileShader(fragmentShader);

// Build the shader program
const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);

gl.useProgram(shaderProgram);

// Configure the vertex buffer attribute
const coordAttribute = gl.getAttribLocation(shaderProgram, 'coord');
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.vertexAttribPointer(coordAttribute, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(coordAttribute);

// Configue the color buffer attribute
const colorAttribute = gl.getAttribLocation(shaderProgram, 'color');
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(colorAttribute, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(colorAttribute);

// Draw the shape
gl.clearColor(0, 0, 0, 1);
gl.enable(gl.DEPTH_TEST);
gl.clear(gl.COLOR_BUFFER_BIT);

resizeCanvasToDisplaySize(canvas);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// Draw the triangles
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
