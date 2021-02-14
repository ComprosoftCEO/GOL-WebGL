#extension GL_OES_standard_derivatives : enable

// Fragment shaders don't have a default precision so we need to pick one.
//   mediump is a good default
precision mediump float;

uniform vec3 reverse_light_vector;
uniform vec4 color;

varying vec3 v_normal;

void main() {
  // Compute static flat shading for this model
  vec3 U = dFdx(v_normal);
  vec3 V = dFdy(v_normal);
  vec3 normal = normalize(cross(U, V));

  float light = dot(normal, reverse_light_vector);

  gl_FragColor = color;

  // Lets multiply just the color portion (not the alpha)
  // by the light
  gl_FragColor.rgb *= light;
}