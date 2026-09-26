import React, { useEffect, useRef } from 'react';

interface EvervaultShaderProps {
  className?: string;
}

export const EvervaultShader: React.FC<EvervaultShaderProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      console.warn('WebGL not supported');
      return;
    }

    // Vertex shader: Full-screen quad
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment shader: Evervault-style glowing atmospheric gradient dome & aurora waves
    const fsSource = `
      precision highp float;
      varying vec2 v_uv;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;

      // Hash & noise functions
      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
        for (int i = 0; i < 4; ++i) {
          v += a * noise(p);
          p = rot * p * 2.0 + shift;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

        // Normalize mouse
        vec2 mouse = u_mouse / u_resolution.xy;
        float mouseDist = length(uv - mouse);

        float t = u_time * 0.25;

        // Curved horizon wave distortion
        float wave1 = sin(p.x * 1.5 + t * 0.8) * 0.12;
        float wave2 = cos(p.x * 2.2 - t * 0.6) * 0.08;
        float wave = wave1 + wave2;

        // Distance from glowing dome center (arc situated near middle-bottom)
        vec2 domeCenter = vec2(0.0, -0.35 + wave * 0.5);
        float d = length(vec2(p.x * 0.85, p.y - domeCenter.y));

        // Multi-octave organic flow
        float n = fbm(vec2(p.x * 1.2, p.y * 1.2 - t * 0.4));
        float flow = fbm(p + vec2(t * 0.15, -t * 0.2) + n * 0.8);

        // Radial glow intensity (inspired by Evervault's radiant purple dome)
        float glow = 1.0 - smoothstep(0.0, 1.45 + wave * 0.3, d);
        glow = pow(glow, 1.6);

        // Vertical fade gradient (bright at center/bottom, fading into deep obsidian at top)
        float vFade = smoothstep(0.95, 0.15, uv.y);
        
        // Colors palette (Evervault glowing violet-indigo with subtle KRED emerald luminescence)
        vec3 deepNight   = vec3(0.035, 0.035, 0.055);
        vec3 darkIndigo  = vec3(0.12, 0.08, 0.28);
        vec3 vividViolet = vec3(0.42, 0.16, 0.86);
        vec3 electricLilac = vec3(0.68, 0.42, 0.98);
        vec3 softGlow    = vec3(0.85, 0.72, 1.0);
        vec3 emeraldHaze = vec3(0.06, 0.78, 0.48); // Subtle KRED emerald rim

        // Color blending
        vec3 col = deepNight;
        col = mix(col, darkIndigo, smoothstep(0.1, 0.6, glow * flow));
        col = mix(col, vividViolet, smoothstep(0.4, 0.85, glow * (0.8 + wave * 0.4)));
        col = mix(col, electricLilac, smoothstep(0.7, 0.96, glow));
        col = mix(col, softGlow, smoothstep(0.92, 1.0, glow));

        // Subtle emerald rim light on the outer crest
        float rim = smoothstep(0.55, 0.50, abs(d - 0.75 + wave * 0.2)) * 0.25;
        col = mix(col, emeraldHaze, rim * 0.4);

        // Mouse interactive soft lighting
        float mouseGlow = exp(-mouseDist * 3.5) * 0.25;
        col += electricLilac * mouseGlow;

        // Subtle film grain dither to prevent color banding
        float dither = (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.035;
        col += dither;

        // Overall alpha / intensity
        float alpha = clamp(glow * vFade * 1.25 + 0.15, 0.0, 1.0);

        gl_FragColor = vec4(col, alpha);
      }
    `;

    // Compile helper
    const compileShader = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Quad geometry (-1 to 1)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');

    let animationFrameId: number;
    let startTime = performance.now();
    let mousePos = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos = {
        x: e.clientX - rect.left,
        y: rect.height - (e.clientY - rect.top),
      };
    };

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const render = (timeNow: number) => {
      handleResize();
      const elapsed = (timeNow - startTime) * 0.001;

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uMouse, mousePos.x, mousePos.y);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full pointer-events-none ${className}`}
      style={{ display: 'block' }}
    />
  );
};

export default EvervaultShader;
