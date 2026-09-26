/**
 * ==============================================================================
 *  Made by Cuttleshift
 * 
 *         /\
 *        /  \
 *       /____\
 *      |\    /|
 *      | \  / |
 *      |  \/  |
 *       \    /
 *        \  /
 *         \/
 * 
 *  Interactive WebGL & Shader Canvas Studio
 * ==============================================================================
 */

import React, { useEffect, useRef } from 'react';

export interface BoltHorizonProps {
  className?: string;
  curveSize?: number;
  curveHeight?: number;
  glowIntensity?: number;
  colorDeep?: string;
  colorMid?: string;
  colorCore?: string;
  bgTop?: string;
  bgBot?: string;
  ground?: string;
}

// Helper to convert hex to rgb array [r, g, b]
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255
  ] : [0, 0, 0];
};

export function BoltHorizon({
  className = "",
  curveSize = 12.0,
  curveHeight = -0.10,
  glowIntensity = 1.0,
  colorDeep = "#0040cc", // [0.0, 0.25, 0.8]
  colorMid = "#00b3ff", // [0.0, 0.7, 1.0]
  colorCore = "#ffffff", // [1.0, 1.0, 1.0]
  bgTop = "#050d14", // [0.02, 0.05, 0.08]
  bgBot = "#000000", // [0.0, 0.0, 0.0]
  ground = "#0a0a0b" // [0.04, 0.04, 0.045]
}: BoltHorizonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const propsRef = useRef({ curveSize, curveHeight, glowIntensity, colorDeep, colorMid, colorCore, bgTop, bgBot, ground });
  
  useEffect(() => {
    propsRef.current = { curveSize, curveHeight, glowIntensity, colorDeep, colorMid, colorCore, bgTop, bgBot, ground };
  }, [curveSize, curveHeight, glowIntensity, colorDeep, colorMid, colorCore, bgTop, bgBot, ground]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
          gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      
      uniform vec2 u_resolution;
      uniform float u_time;
      
      uniform float u_curveSize;
      uniform float u_curveHeight;
      uniform float u_glowIntensity;
      
      uniform vec3 u_colorDeep;
      uniform vec3 u_colorMid;
      uniform vec3 u_colorCore;
      uniform vec3 u_bgTop;
      uniform vec3 u_bgBottom;
      uniform vec3 u_ground;

      float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          vec2 p = (uv - 0.5) * 2.0;
          p.x *= u_resolution.x / u_resolution.y;

          vec2 planetCenter = vec2(0.0, -u_curveSize + u_curveHeight);
          
          float distToCenter = length(p - planetCenter);
          float surfaceDist = distToCenter - u_curveSize;

          float verticalGrad = max(0.0, p.y * 0.5 + 0.5);
          vec3 finalColor = mix(u_bgBottom, u_bgTop, verticalGrad);

          float radialSpot = exp(-length(p - vec2(0.0, 0.4)) * 1.2);
          finalColor += u_bgTop * radialSpot * 0.8;

          if (surfaceDist > 0.0) {
              float coreGlow = exp(-surfaceDist * 150.0);
              float innerGlow = exp(-surfaceDist * 35.0);
              float midGlow = exp(-surfaceDist * 8.0);
              float vastAtmosphere = exp(-surfaceDist * 2.0);

              float pulse = sin(u_time * 1.5) * 0.05 + 0.95;
              float wave = sin(p.x * 5.0 - u_time * 1.5) * 0.2 + 0.8;
              float wave2 = cos(p.x * 2.5 + u_time * 1.0) * 0.15 + 0.85;

              finalColor += u_colorDeep * vastAtmosphere * 0.4 * pulse * u_glowIntensity;
              finalColor += u_colorDeep * midGlow * 0.8 * wave * u_glowIntensity;
              finalColor += u_colorMid * innerGlow * 1.2 * wave2 * u_glowIntensity;
              finalColor += u_colorCore * coreGlow * 2.0 * u_glowIntensity; 
          } else {
              finalColor = u_ground;
          }

          float edgeBlend = smoothstep(-0.005, 0.005, surfaceDist);
          finalColor = mix(u_ground, finalColor, edgeBlend);

          finalColor += (random(uv) - 0.5) * 0.015;

          gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const vertices = new Float32Array([
      -1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0, -1.0,  1.0,  1.0
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const locs = {
      res: gl.getUniformLocation(program, 'u_resolution'),
      time: gl.getUniformLocation(program, 'u_time'),
      size: gl.getUniformLocation(program, 'u_curveSize'),
      height: gl.getUniformLocation(program, 'u_curveHeight'),
      glow: gl.getUniformLocation(program, 'u_glowIntensity'),
      colorDeep: gl.getUniformLocation(program, 'u_colorDeep'),
      colorMid: gl.getUniformLocation(program, 'u_colorMid'),
      colorCore: gl.getUniformLocation(program, 'u_colorCore'),
      bgTop: gl.getUniformLocation(program, 'u_bgTop'),
      bgBot: gl.getUniformLocation(program, 'u_bgBottom'),
      ground: gl.getUniformLocation(program, 'u_ground')
    };

    let animationFrameId: number;
    let resizeObserver: ResizeObserver;

    function resizeCanvas() {
      if (!canvas || !gl) return;
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(locs.res, canvas.width, canvas.height);
      }
    }

    resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    resizeCanvas();

    const startTime = performance.now();

    // Lerp state for smooth transitions
    let currentState = {
      size: propsRef.current.curveSize,
      height: propsRef.current.curveHeight,
      glow: propsRef.current.glowIntensity,
      deep: hexToRgb(propsRef.current.colorDeep),
      mid: hexToRgb(propsRef.current.colorMid),
      core: hexToRgb(propsRef.current.colorCore),
      bgTop: hexToRgb(propsRef.current.bgTop),
      bgBot: hexToRgb(propsRef.current.bgBot),
      ground: hexToRgb(propsRef.current.ground)
    };

    function lerp(start: number, end: number, amt: number) {
      return (1 - amt) * start + amt * end;
    }
    
    function lerpArray(startArr: number[], endArr: number[], amt: number) {
      return startArr.map((v, i) => lerp(v, endArr[i], amt));
    }

    function render(time: number) {
      if (!gl) return;
      
      const elapsed = time - startTime;
      
      const target = propsRef.current;
      const tDeep = hexToRgb(target.colorDeep);
      const tMid = hexToRgb(target.colorMid);
      const tCore = hexToRgb(target.colorCore);
      const tBgTop = hexToRgb(target.bgTop);
      const tBgBot = hexToRgb(target.bgBot);
      const tGround = hexToRgb(target.ground);

      const speed = 0.05;
      currentState.size = lerp(currentState.size, target.curveSize, speed);
      currentState.height = lerp(currentState.height, target.curveHeight, speed);
      currentState.glow = lerp(currentState.glow, target.glowIntensity, speed);
      currentState.deep = lerpArray(currentState.deep, tDeep, speed);
      currentState.mid = lerpArray(currentState.mid, tMid, speed);
      currentState.core = lerpArray(currentState.core, tCore, speed);
      currentState.bgTop = lerpArray(currentState.bgTop, tBgTop, speed);
      currentState.bgBot = lerpArray(currentState.bgBot, tBgBot, speed);
      currentState.ground = lerpArray(currentState.ground, tGround, speed);

      gl.uniform1f(locs.time, elapsed * 0.001);
      gl.uniform1f(locs.size, currentState.size);
      gl.uniform1f(locs.height, currentState.height);
      gl.uniform1f(locs.glow, currentState.glow);
      
      gl.uniform3fv(locs.colorDeep, currentState.deep);
      gl.uniform3fv(locs.colorMid, currentState.mid);
      gl.uniform3fv(locs.colorCore, currentState.core);
      gl.uniform3fv(locs.bgTop, currentState.bgTop);
      gl.uniform3fv(locs.bgBot, currentState.bgBot);
      gl.uniform3fv(locs.ground, currentState.ground);
      
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, []); // Run setup once
  
  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}

export default BoltHorizon;
