#version 300 es
precision mediump float;

uniform sampler2D src;
uniform float lerp;
uniform float u_invScale;
in vec2 f_v_coord;
out vec4 fragColor;

void main() {
    vec2 tex_coord = f_v_coord * u_invScale;
    vec4 srcColor = texture(src, tex_coord);
    fragColor = vec4(srcColor.rgb, srcColor.a * lerp);
}
