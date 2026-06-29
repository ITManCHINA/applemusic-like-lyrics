#version 300 es
precision mediump float;

uniform sampler2D src;
in vec2 f_v_coord;
out vec4 fragColor;

/* Gradient noise from Jorge Jimenez's presentation: */
/* http://www.iryoku.com/next-generation-post-processing-in-call-of-duty-advanced-warfare */
float gradientNoise(in vec2 uv) {
    return fract(52.9829189f * fract(dot(uv, vec2(0.06711056f, 0.00583715f))));
}

void main() {
    float dither = (1.0f / 255.0f) * gradientNoise(gl_FragCoord.xy) - (0.5f / 255.0f);
    vec4 color = texture(src, f_v_coord);
    color += dither;
    fragColor = color;
}
