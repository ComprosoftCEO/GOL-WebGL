// Fragment shaders don't have a default precision so we need to pick one.
//   mediump is a good default
precision mediump float;

varying vec3 v_color;

void main() { gl_FragColor = vec4(v_color, 1); }