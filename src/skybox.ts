import { createAndLoadBuffer, loadAndCompileShaders, loadCubeTexture } from './utils';

import skyboxVertexShader from 'shaders/skyboxVertexShader.glsl';
import skyboxFragmentShader from 'shaders/skyboxFragmentShader.glsl';
import positiveX from 'img/skybox-positive-x.jpg';
import negativeX from 'img/skybox-negative-x.jpg';
import positiveY from 'img/skybox-positive-y.jpg';
import negativeY from 'img/skybox-negative-y.jpg';
import positiveZ from 'img/skybox-positive-z.jpg';
import negativeZ from 'img/skybox-negative-z.jpg';

const TEXTURE_UNIFORM = 'u_skyboxTexture';
const POSITION_ATTRIBUTE = 'a_position';

const POSITIONS = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];

/**
 * Store all of the data for the skybox
 */
export class Skybox {
  static skyboxProgram: WebGLProgram;
  static skyboxTexture: WebGLTexture;
  static positionsBuffer: WebGLBuffer;

  static loadShaders(gl: WebGLRenderingContext): void {
    Skybox.skyboxProgram = loadAndCompileShaders(gl, skyboxVertexShader, skyboxFragmentShader);
    Skybox.skyboxTexture = loadCubeTexture(gl, 1024, {
      positiveX,
      negativeX,
      positiveY,
      negativeY,
      positiveZ,
      negativeZ,
    });
    Skybox.positionsBuffer = createAndLoadBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(POSITIONS));
  }

  constructor() {
    return;
  }

  static loadProgram(gl: WebGLRenderingContext): WebGLProgram {
    gl.useProgram(Skybox.skyboxProgram);
    return Skybox.skyboxProgram;
  }

  draw(gl: WebGLRenderingContext): void {
    // Positions
    const positionAttribute = gl.getAttribLocation(Skybox.skyboxProgram, POSITION_ATTRIBUTE);
    gl.bindBuffer(gl.ARRAY_BUFFER, Skybox.positionsBuffer);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribute);

    // Texture
    const textureUniform = gl.getUniformLocation(Skybox.skyboxProgram, TEXTURE_UNIFORM);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, Skybox.skyboxTexture);
    gl.uniform1i(textureUniform, 0);

    gl.depthFunc(gl.LEQUAL);
    gl.drawArrays(gl.TRIANGLES, 0, POSITIONS.length / 2);
    gl.depthFunc(gl.LESS);
  }
}
