import { resizeCanvasToDisplaySize } from './utils';
import { mat4 } from 'gl-matrix';
import { Sphere } from './sphere';
import { AmbientLight, DirectionalLight } from './light';
import { PerspectiveCamera } from './camera';
import { LifeSphere } from './lifeSphere';
import { Skybox } from './skybox';
import { LifeRule } from './life';
import './styles.css';
import { initDomControls } from './dom';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
resizeCanvasToDisplaySize(canvas);

const gl = canvas.getContext('webgl');
gl.getExtension('OES_standard_derivatives');

// Static methods to load shaders
Skybox.loadShaders(gl);
Sphere.loadShaders(gl);
LifeSphere.loadShaders(gl);

// Objects in our scene
const skybox = new Skybox();
const ambLight = new AmbientLight(0.2);
const dirLight = new DirectionalLight([0.7, 0.5, 1]);
const camera = new PerspectiveCamera(45, gl.canvas.width / gl.canvas.height, 1, 100);
const sphere = new Sphere(gl, 4);
const lifeSphere = new LifeSphere(gl, 3, [1, 1, 0.5]);

// Adjust the scale and camera of our objects
mat4.scale(sphere.modelMatrix, sphere.modelMatrix, [2, 2, 2]);
mat4.scale(lifeSphere.modelMatrix, lifeSphere.modelMatrix, [2, 2, 2]);
mat4.translate(camera.viewMatrix, camera.viewMatrix, [0, 0, -6]);

// Life Animation
const life = lifeSphere.createLife(new LifeRule(new Set([3]), new Set([2, 3, 4])));
let currentCells = life.get();
let nextCells = life.randomize(0.25);
let heightAmount = 0;
const resetLife = () => {
  currentCells = Array(life.numCells()).fill(false);
  nextCells = life.get();
  heightAmount = 0;
};

initDomControls(lifeSphere.color, life, resetLife);

// Animation
let timeOld = 0;
const animate = (time: number): void => {
  const dt = time - timeOld;
  timeOld = time;

  // Update the rotation matrices
  mat4.rotateY(sphere.modelMatrix, sphere.modelMatrix, dt * 0.0001);
  mat4.rotateY(lifeSphere.modelMatrix, lifeSphere.modelMatrix, dt * 0.0001);

  // Fancy height animation for cells
  const newHeightAmount = heightAmount + dt * 0.001;
  heightAmount = newHeightAmount % 1.0;
  if (Math.floor(newHeightAmount / 1.0) > 0) {
    currentCells = nextCells;
    nextCells = life.nextGeneration();
  }
  lifeSphere.updateHeight(currentCells, nextCells, heightAmount);

  // Clear the canvas
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearColor(0, 0, 0, 1);
  gl.clearDepth(1.0);

  resizeCanvasToDisplaySize(canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  camera.aspect = gl.canvas.width / gl.canvas.height;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Redraw Everything
  let program = Skybox.loadProgram(gl);
  camera.setCameraUniforms(gl, program);
  skybox.draw(gl);

  program = Sphere.loadProgram(gl);
  ambLight.setLightUniforms(gl, program);
  dirLight.setLightUniforms(gl, program);
  camera.setCameraUniforms(gl, program);
  sphere.draw(gl);

  program = LifeSphere.loadProgram(gl);
  ambLight.setLightUniforms(gl, program);
  dirLight.setLightUniforms(gl, program);
  camera.setCameraUniforms(gl, program);
  lifeSphere.draw(gl);

  window.requestAnimationFrame(animate);
};
animate(0);
