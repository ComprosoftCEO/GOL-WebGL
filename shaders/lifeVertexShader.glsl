uniform mat4 u_modelMatrix;
uniform mat4 u_projMatrix;
uniform mat4 u_viewMatrix;

// Vertex and height of the "nubs"
attribute vec3 a_vertex;
attribute vec3 a_normal;
attribute float a_height; // 0 to height

// Normal vector used for lighting
varying vec3 v_normal;
uniform mat4 u_inverseTranspose;

void main() {

  vec3 scaled = a_vertex + normalize(a_vertex) * a_height;

  gl_Position = u_projMatrix * u_viewMatrix * u_modelMatrix * vec4(scaled, 1.0);

  v_normal = mat3(u_inverseTranspose) * a_normal;
}
