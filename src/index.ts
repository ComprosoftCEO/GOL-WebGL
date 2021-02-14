import { resizeCanvasToDisplaySize } from './utils';
import { mat4 } from 'gl-matrix';
import { Sphere } from './sphere';
import { DirectionalLight } from './light';
import { PerspectiveCamera } from './camera';
import './canvas.css';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
resizeCanvasToDisplaySize(canvas);

const gl = canvas.getContext('webgl');
gl.getExtension('OES_standard_derivatives');

// Static methods to load shaders
Sphere.loadShaders(gl);

// Objects in our scene
const light = new DirectionalLight([1, 0.5, 0], [0.7, 0.5, 1]);
const camera = new PerspectiveCamera(45, gl.canvas.width / gl.canvas.height, 1, 100);
const sphere = new Sphere(gl, 2);

mat4.translate(camera.viewMatrix, camera.viewMatrix, [0, 0, -6]);

// Animation
let timeOld = 0;
const animate = (time: number): void => {
  // Update the rotation matrices
  const dt = time - timeOld;
  // mat4.rotateX(modelMatrix, modelMatrix, dt * 0.005);
  mat4.rotateY(sphere.modelMatrix, sphere.modelMatrix, dt * 0.002);
  timeOld = time;

  // Clear the canvas
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearColor(0, 0, 0, 1);
  gl.clearDepth(1.0);

  resizeCanvasToDisplaySize(canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Redraw Everything
  const program = Sphere.loadProgram(gl);
  light.setLightUniforms(gl, program);
  camera.setCameraUniforms(gl, program);
  sphere.draw(gl);

  window.requestAnimationFrame(animate);
};
animate(0);
