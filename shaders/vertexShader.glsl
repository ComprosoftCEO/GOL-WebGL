attribute vec3 coord;
attribute vec3 color;

varying vec3 v_color;

void main() {
  gl_Position = vec4(coord, 1.0);
  v_color = color;
}