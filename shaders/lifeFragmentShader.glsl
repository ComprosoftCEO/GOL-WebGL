#extension GL_OES_standard_derivatives : enable

// Fragment shaders don't have a default precision so we need to pick one.
//   mediump is a good default
precision mediump float;

// Lighting
uniform float u_ambLight;
uniform vec3 u_lightDirection;
varying vec3 v_normal;

void main() {
  vec3 normal = normalize(v_normal);

  // Compute the directional light
  float light = dot(normal, u_lightDirection);
  gl_FragColor = vec4(vec3(0, 1, 0.5) * (light + u_ambLight), 1);
}
