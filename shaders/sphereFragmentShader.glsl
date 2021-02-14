#extension GL_OES_standard_derivatives : enable

// Fragment shaders don't have a default precision so we need to pick one.
//   mediump is a good default
precision mediump float;

// Lighting
uniform float u_ambLight;
uniform vec3 u_lightDirection;
varying vec3 v_normal;

// Textures
varying highp vec2 v_textureCoord;
uniform sampler2D u_textureSampler;

void main() {
  // Compute flat shading normal for this model
  vec3 U = dFdx(v_normal);
  vec3 V = dFdy(v_normal);
  vec3 normal = normalize(cross(U, V));
  // vec3 normal = normalize(v_normal);

  // Compute the directional light
  float light = dot(normal, u_lightDirection);
  vec4 texelColor = texture2D(u_textureSampler, v_textureCoord);

  gl_FragColor = vec4(texelColor.rgb * (light + u_ambLight), texelColor.w);
}
