uniform mat4 model_matrix;
uniform mat4 proj_matrix;
uniform mat4 view_matrix;
uniform mat4 inverse_transpose;

attribute vec3 coord;

// Normal vector used for lighting
varying vec3 v_normal;

void main() {
  gl_Position = proj_matrix * view_matrix * model_matrix * vec4(coord, 1.0);
  v_normal = mat3(inverse_transpose) * coord;
}