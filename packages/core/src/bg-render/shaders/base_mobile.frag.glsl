#version 300 es
precision mediump float;

uniform sampler2D src;
in vec2 f_v_coord;
out vec4 fragColor;

void main() {
    fragColor = texture(src, f_v_coord);
}
