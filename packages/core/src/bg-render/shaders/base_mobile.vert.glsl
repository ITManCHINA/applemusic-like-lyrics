#version 300 es
precision mediump float;

in vec2 v_coord;
out vec2 f_v_coord;

void main() {
    gl_Position = vec4(v_coord, 0.0f, 1.0f);
    f_v_coord = v_coord * 0.5f + 0.5f;
}
