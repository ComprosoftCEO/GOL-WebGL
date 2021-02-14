uniform mat4 u_projMatrix;
uniform mat4 u_viewMatrix;

attribute vec2 a_position;
varying vec3 v_position;

void main() {
  // mat4 rotation = u_projMatrix * u_viewMatrix;

  v_position = vec3(a_position, 1);
  gl_Position = vec4(a_position, 1, 1);
}