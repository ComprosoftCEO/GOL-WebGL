uniform mat4 proj_matrix;
uniform mat4 view_matrix;
uniform mat4 move_matrix;

attribute vec3 coord;
attribute vec3 color;

varying vec3 v_color;

void main() {
  gl_Position = proj_matrix * view_matrix * move_matrix * vec4(coord, 1.0);
  v_color = color;
}