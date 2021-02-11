import vertexShader from 'shaders/vertexShader.glsl';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const gl = canvas.getContext('webgl');
console.log(vertexShader);
