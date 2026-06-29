import React, { useRef, useEffect } from 'react';
// @ts-ignore
import { Renderer, Camera, Transform, Geometry, Program, Mesh } from 'ogl';

type SoftAuroraProps = {
  speed?: number;
  scale?: number;
  brightness?: number;
  color1?: string;
  color2?: string;
  noiseFrequency?: number;
  noiseAmplitude?: number;
  bandHeight?: number;
  bandSpread?: number;
  octaveDecay?: number;
  layerOffset?: number;
  colorSpeed?: number;
  enableMouseInteraction?: boolean;
  mouseInfluence?: number;
  className?: string;
};

// Minimal SoftAurora implementation using OGL
const SoftAurora: React.FC<SoftAuroraProps> = ({
  speed = 0.6,
  scale = 1.5,
  brightness = 1.0,
  color1 = '#94a3b8',
  color2 = '#ffffff',
  noiseFrequency = 2.5,
  noiseAmplitude = 1.0,
  bandHeight = 0.5,
  bandSpread = 1.0,
  octaveDecay = 0.1,
  layerOffset = 0,
  colorSpeed = 1.0,
  enableMouseInteraction = true,
  mouseInfluence = 0.25,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;
    const renderer = new Renderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    const gl = renderer.gl;
    const camera = new Camera(gl);
    camera.position.z = 1;

    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]) },
    });

    const vertex = `
      attribute vec2 position;
      varying vec2 vUv;
      void main(){
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0, 1);
      }
    `;
    const fragment = `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      // Simple noise function (hash based)
      float hash(vec2 p){
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      float noise(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        // Four corners
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      void main(){
        vec2 uv = vUv * uResolution / min(uResolution.x, uResolution.y);
        float n = 0.0;
        float amp = 1.0;
        float freq = ${noiseFrequency.toFixed(1)};
        for(int i=0;i<4;i++){
          n += noise(uv * freq + uTime * ${speed.toFixed(2)}) * amp;
          freq *= 2.0;
          amp *= ${octaveDecay.toFixed(2)};
        }
        n = smoothstep(${bandHeight.toFixed(2)} - ${bandSpread.toFixed(2)}/2.0, ${bandHeight.toFixed(2)} + ${bandSpread.toFixed(2)}/2.0, n);
        vec3 color = mix(uColor1, uColor2, n) * ${brightness.toFixed(2)};
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [gl.canvas.width, gl.canvas.height] },
        uColor1: { value: new Float32Array(hexToRgb(color1)) },
        uColor2: { value: new Float32Array(hexToRgb(color2)) },
      },
      transparent: true,
    });

    const mesh = new Mesh(gl, { geometry, program });
    const transform = new Transform();
    mesh.setParent(transform);
    transform.scale.set(scale, scale, 1);

    let frame = 0;
    const draw = () => {
      frame++;
      program.uniforms.uTime.value = frame * 0.016; // approx 60fps
      renderer.render({ scene: transform, camera });
      requestAnimationFrame(draw);
    };
    draw();

    const handleMouse = (e: MouseEvent) => {
      if (!enableMouseInteraction) return;
      const rect = gl.canvas.getBoundingClientRect();
      mouse.current.x = (e.clientX - rect.left) / rect.width - 0.5;
      mouse.current.y = (e.clientY - rect.top) / rect.height - 0.5;
    };
    window.addEventListener('mousemove', handleMouse);
    return () => {
      window.removeEventListener('mousemove', handleMouse);
      // @ts-ignore
      program.dispose();
      // @ts-ignore
      geometry.dispose();
      // @ts-ignore
      mesh.dispose();
    };
  }, [
    speed,
    scale,
    brightness,
    color1,
    color2,
    noiseFrequency,
    noiseAmplitude,
    bandHeight,
    bandSpread,
    octaveDecay,
    layerOffset,
    colorSpeed,
    enableMouseInteraction,
    mouseInfluence,
  ]);

  // Helper to convert hex to normalized RGB array
  const hexToRgb = (hex: string) => {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean, 16);
    const r = ((bigint >> 16) & 255) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;
    return [r, g, b];
  };

  return <canvas ref={canvasRef} className={className} style={{ width: '100%', height: '100%' }} />;
};

export default SoftAurora;
