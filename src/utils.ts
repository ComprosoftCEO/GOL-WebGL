export const resizeCanvasToDisplaySize = (
  canvas: HTMLCanvasElement,
): boolean => {
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  const needResize =
    canvas.width !== displayWidth || canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
};

export const createAndLoadBuffer = (
  gl: WebGLRenderingContext,
  type: number,
  data: BufferSource,
): WebGLBuffer => {
  const buffer = gl.createBuffer();
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, data, gl.STATIC_DRAW);
  gl.bindBuffer(type, null);

  return buffer;
};

export const loadAndCompileShaders = (
  gl: WebGLRenderingContext,
  vertexShaderSrc: string,
  fragmentShaderSrc: string,
): WebGLProgram => {
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

  return shaderProgram;
};
