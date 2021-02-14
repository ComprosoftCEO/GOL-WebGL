// Fragment shaders don't have a default precision so we need to pick one.
//   mediump is a good default
precision mediump float;

uniform samplerCube u_skyboxTexture;

varying vec3 v_position;

void main() {
  gl_FragColor = textureCube(u_skyboxTexture, vec3(v_position.xy, 1));
}