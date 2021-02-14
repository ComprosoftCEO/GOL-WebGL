uniform mat4 u_modelMatrix;
uniform mat4 u_projMatrix;
uniform mat4 u_viewMatrix;

attribute vec3 a_vertex;

// Normal vector used for lighting
varying vec3 v_normal;
uniform mat4 u_inverseTranspose;

void main() {
  gl_Position =
      u_projMatrix * u_viewMatrix * u_modelMatrix * vec4(a_vertex, 1.0);

  v_normal = mat3(u_inverseTranspose) * a_vertex;
}
