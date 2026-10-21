import { useEffect, useRef } from 'react';

const MAX_PIXELS = 1_400_000;
const MAX_DPR = 1.25;
const FRAME_INTERVAL_MS = 1000 / 30;

function setCanvasState(canvas: HTMLCanvasElement, state: 'active' | 'reduced' | 'paused' | 'static') {
  canvas.dataset.atmosphereState = state;
}

export function AtmosphereCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const root = document.documentElement;
    const previousReady = root.dataset.atmosphereReady;
    const context = canvas.getContext('2d');
    const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let frameId: number | null = null;
    let lastFrameAt = 0;
    let width = 0;
    let height = 0;
    let scale = 1;
    let disposed = false;

    root.dataset.atmosphereReady = 'true';

    const resize = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      scale = Math.min(dpr, Math.sqrt(MAX_PIXELS / (width * height)));
      canvas.width = Math.max(1, Math.floor(width * scale));
      canvas.height = Math.max(1, Math.floor(height * scale));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context?.setTransform(scale, 0, 0, scale, 0, 0);
      draw(0);
    };

    const draw = (time: number) => {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      const phase = time / 18_000;
      const radius = Math.max(width, height) * 0.72;
      const glow = (
        x: number,
        y: number,
        color: string,
      ) => {
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(5, 7, 15, 0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
      };

      glow(width * (0.16 + Math.sin(phase * Math.PI * 2) * 0.035), height * 0.23, 'rgba(75, 125, 255, 0.16)');
      glow(width * (0.82 + Math.cos(phase * Math.PI * 2) * 0.035), height * 0.2, 'rgba(139, 92, 246, 0.14)');
      glow(width * 0.51, height * (0.84 + Math.sin(phase * Math.PI * 2 + 1) * 0.035), 'rgba(52, 221, 218, 0.075)');
    };

    const stop = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }
    };

    const animate = (time: number) => {
      frameId = null;
      if (disposed || document.visibilityState === 'hidden' || motionQuery?.matches) return;
      if (time - lastFrameAt >= FRAME_INTERVAL_MS) {
        draw(time);
        lastFrameAt = time;
      }
      frameId = window.requestAnimationFrame(animate);
    };

    const start = () => {
      if (!context || disposed || document.visibilityState === 'hidden' || motionQuery?.matches || frameId !== null) return;
      setCanvasState(canvas, 'active');
      frameId = window.requestAnimationFrame(animate);
    };

    const syncState = () => {
      stop();
      if (!context) {
        setCanvasState(canvas, 'static');
        return;
      }
      if (motionQuery?.matches) {
        setCanvasState(canvas, 'reduced');
        draw(0);
        return;
      }
      if (document.visibilityState === 'hidden') {
        setCanvasState(canvas, 'paused');
        return;
      }
      start();
    };

    const onVisibilityChange = () => syncState();
    const onMotionChange = () => syncState();

    resize();
    if (!context) setCanvasState(canvas, 'static');
    else syncState();

    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    motionQuery?.addEventListener?.('change', onMotionChange);
    motionQuery?.addListener?.(onMotionChange);

    return () => {
      disposed = true;
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      motionQuery?.removeEventListener?.('change', onMotionChange);
      motionQuery?.removeListener?.(onMotionChange);
      if (previousReady === undefined) delete root.dataset.atmosphereReady;
      else root.dataset.atmosphereReady = previousReady;
    };
  }, []);

  return <canvas ref={canvasRef} className="atmosphere-canvas" aria-hidden="true" data-atmosphere-state="static" />;
}
