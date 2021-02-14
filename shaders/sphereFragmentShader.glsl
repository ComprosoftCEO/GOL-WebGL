#extension GL_OES_standard_derivatives : enable

// Fragment shaders don't have a default precision so we need to pick one.
//   mediump is a good default
precision mediump float;

uniform vec3 u_lightColor;
uniform vec3 u_lightDirection;

varying vec3 v_normal;

void main() {
  // Compute flat shading normal for this model
  vec3 U = dFdx(v_normal);
  vec3 V = dFdy(v_normal);
  vec3 normal = normalize(cross(U, V));

  // Compute the directional light
  float light = dot(normal, u_lightDirection);
  gl_FragColor = vec4(u_lightColor * light, 1);
}
