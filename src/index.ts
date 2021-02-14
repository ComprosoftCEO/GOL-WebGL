import { resizeCanvasToDisplaySize } from './utils';
import { mat4 } from 'gl-matrix';
import { Sphere } from './sphere';
import { DirectionalLight } from './light';
import { PerspectiveCamera } from './camera';
import './canvas.css';
import { LifeSphere } from './lifeSphere';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
resizeCanvasToDisplaySize(canvas);

const gl = canvas.getContext('webgl');
gl.getExtension('OES_standard_derivatives');

// Static methods to load shaders
Sphere.loadShaders(gl);
LifeSphere.loadShaders(gl);

// Objects in our scene
const light = new DirectionalLight([1, 0.5, 0], [0.7, 0.5, 1]);
const camera = new PerspectiveCamera(45, gl.canvas.width / gl.canvas.height, 1, 100);
const sphere = new Sphere(gl, 3);
const lifeSphere = new LifeSphere(gl, 2);

mat4.translate(camera.viewMatrix, camera.viewMatrix, [0, 0, -6]);

let currentCells = Array(lifeSphere.numLifeCells()).fill(false);
let nextCells = Array(lifeSphere.numLifeCells()).fill(false);
nextCells[0] = true;
nextCells[3] = true;
nextCells[21] = true;

// Animation
let timeOld = 0;
let heightAmount = 0;
const animate = (time: number): void => {
  const dt = time - timeOld;
  timeOld = time;

  // Update the rotation matrices
  mat4.rotateY(sphere.modelMatrix, sphere.modelMatrix, dt * 0.0001);
  mat4.rotateY(lifeSphere.modelMatrix, lifeSphere.modelMatrix, dt * 0.0001);
  // mat4.rotateY(camera.viewMatrix, camera.viewMatrix, dt * -0.001);

  const newHeightAmount = heightAmount + dt * 0.001;
  heightAmount = newHeightAmount % 1.0;
  if (Math.floor(newHeightAmount / 1.0) > 0) {
    currentCells = nextCells;
    nextCells = Array(lifeSphere.numLifeCells())
      .fill(0)
      .map(() => Math.random() > 0.8);
  }
  lifeSphere.updateHeight(currentCells, nextCells, heightAmount);

  // Clear the canvas
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearColor(0, 0, 0, 1);
  gl.clearDepth(1.0);

  resizeCanvasToDisplaySize(canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Redraw Everything
  let program = Sphere.loadProgram(gl);
  light.setLightUniforms(gl, program);
  camera.setCameraUniforms(gl, program);
  sphere.draw(gl);

  program = LifeSphere.loadProgram(gl);
  light.setLightUniforms(gl, program);
  camera.setCameraUniforms(gl, program);
  lifeSphere.draw(gl);

  window.requestAnimationFrame(animate);
};
animate(0);
