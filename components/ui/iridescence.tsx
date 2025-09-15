// @ts-nocheck
'use client';

// @ts-ignore
import { Renderer, Program, Mesh, Color, Triangle } from "ogl";
import { useEffect, useRef, forwardRef, useState, useCallback } from "react";
import { cn } from '@/lib/utils';

// Loading placeholder component
const IridescencePlaceholder = ({ className }: { className?: string }) => (
  <div className={cn(
    "relative w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center",
    className
  )}>
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
      <p className="text-sm text-gray-500">Loading graphics...</p>
    </div>
  </div>
);

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;
  uv += (uMouse - vec2(0.5)) * uAmplitude;
  
  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime * 0.5 * uSpeed;
  
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  
  gl_FragColor = vec4(col, 1.0);
}
`;

export interface IridescenceProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: [number, number, number];
  speed?: number;
  amplitude?: number;
  mouseReact?: boolean;
}

export const Iridescence = forwardRef<HTMLDivElement, IridescenceProps>(
  ({ className, color = [1, 1, 1], speed = 1.0, amplitude = 0.1, mouseReact = true, ...props }, ref) => {
    const domProps = { ...props };
    delete domProps.color;
    delete domProps.speed;
    delete domProps.amplitude;
    delete domProps.mouseReact;

    const ctnDom = useRef<HTMLDivElement>(null);
    const mousePos = useRef({ x: 0.5, y: 0.5 });
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    
    // Throttle mouse movement for better performance
    const throttledMouseMove = useCallback(
      (() => {
        let timeout: NodeJS.Timeout;
        return (e: MouseEvent, ctn: HTMLDivElement, program: any) => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            if (!mouseReact) return;
            const rect = ctn.getBoundingClientRect();
            mousePos.current = {
              x: (e.clientX - rect.left) / rect.width,
              y: 1.0 - (e.clientY - rect.top) / rect.height,
            };
            if (program && program.uniforms && program.uniforms.uMouse) {
              program.uniforms.uMouse.value = new Float32Array([mousePos.current.x, mousePos.current.y]);
            }
          }, 16); // ~60fps throttling
        };
      })()
    , [mouseReact]);

  useEffect(() => {
    if (!ctnDom.current) return;

    const ctn = ctnDom.current;
    let renderer: any;
    let gl: any;
    let animationId: number;
    
    try {
      renderer = new Renderer();
      gl = renderer.gl;
      gl.clearColor(1, 1, 1, 1);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize WebGL renderer:', error);
      setHasError(true);
      setIsLoading(false);
      return;
    }

      let program: Program;

      function resize() {
        const scale = 1;
        renderer.setSize(ctn.offsetWidth * scale, ctn.offsetHeight * scale);
        if (program) {
          program.uniforms.uResolution.value = new Color(
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / gl.canvas.height
          );
        }
      }

      window.addEventListener("resize", resize, false);
      resize();

      const geometry = new Triangle(gl);

      program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new Color(...color) },
          uResolution: {
            value: new Color(
              gl.canvas.width,
              gl.canvas.height,
              gl.canvas.width / gl.canvas.height
            ),
          },
          uMouse: { value: new Float32Array([mousePos.current.x, mousePos.current.y]) },
          uAmplitude: { value: amplitude },
          uSpeed: { value: speed },
        },
      });

      const mesh = new Mesh(gl, { geometry, program });

      const onMouseMove = (e: MouseEvent) => throttledMouseMove(e, ctn, program);

      ctn.addEventListener("mousemove", onMouseMove);
      ctn.appendChild(gl.canvas);

      function animate(t: number) {
        if (program && gl && !gl.isContextLost()) {
          program.uniforms.uTime.value = t * 0.001;
          renderer.render({ scene: mesh });
          animationId = requestAnimationFrame(animate);
        }
      }

      animationId = requestAnimationFrame(animate);

      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        ctn.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", resize);
        if (gl && gl.canvas && gl.canvas.parentNode) {
          gl.canvas.parentNode.removeChild(gl.canvas);
        }
        // OGL renderer doesn't have a dispose method, just cleanup canvas
        if (gl && gl.getExtension && !gl.isContextLost()) {
          try {
            gl.getExtension('WEBGL_lose_context')?.loseContext();
          } catch (error) {
            console.warn('Failed to lose WebGL context:', error);
          }
        }
      };
    }, [color, speed, amplitude, mouseReact]);

    // Show loading state or error fallback
    if (isLoading && !hasError) {
      return <IridescencePlaceholder className={cn("relative w-full h-full overflow-hidden", className)} />;
    }
    
    if (hasError) {
      return (
        <div className={cn(
          "relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center",
          className
        )}>
          <p className="text-sm text-gray-600">Graphics not available</p>
        </div>
      );
    }

    return (
      <div
        ref={(el) => {
          ctnDom.current = el;
          if (typeof ref === 'function') {
            ref(el);
          } else if (ref) {
            ref.current = el;
          }
        }}
        className={cn("relative w-full h-full overflow-hidden", className)}
        {...domProps}
      />
    );
  }
);

Iridescence.displayName = 'Iridescence';

export default Iridescence;