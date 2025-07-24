import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import styles from './ScratchImageReveal.module.css';
import MaskedImage from '../MaskedImage/MaskedImage.tsx';

type Props = {
  imageUrl: string;
  maskUrl: string;
};

export type ScratchImageRevealHandle = {
  resetMask: () => void;
};

const ScratchImageReveal = forwardRef<ScratchImageRevealHandle, Props>(
  ({ imageUrl, maskUrl }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [maskImage, setMaskImage] = useState<HTMLImageElement | null>(null);
    const [isErasing, setIsErasing] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [maskOpacity, setMaskOpacity] = useState(1);

    // Загрузка маски
    useEffect(() => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = maskUrl;
      img.onload = () => {
        setMaskImage(img);
      };
    }, [maskUrl]);

    // Отрисовка маски
    const drawMask = () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = 300;
      canvas.height = 300;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.globalCompositeOperation = 'source-over';

      if (maskImage) {
        context.drawImage(maskImage, 0, 0, canvas.width, canvas.height);
      } else {
        // 🔶 Оранжевая заливка, пока маска не загружена
        context.fillStyle = 'orange';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.lineWidth = 30;
      context.globalCompositeOperation = 'destination-out';

      setCtx(context);
      setMaskOpacity(1);
      setRevealed(false);
    };

    // Перерисовать при загрузке маски
    useEffect(() => {
      drawMask();
    }, [maskImage]);

    // Первоначальный рендер с оранжевой маской
    useEffect(() => {
      drawMask();
    }, []);

    useEffect(() => {
      const handleGlobalPointerUp = () => {
        setIsErasing(false);
      };

      window.addEventListener('mouseup', handleGlobalPointerUp);
      window.addEventListener('touchend', handleGlobalPointerUp);

      return () => {
        window.removeEventListener('mouseup', handleGlobalPointerUp);
        window.removeEventListener('touchend', handleGlobalPointerUp);
      };
    }, []);

    useImperativeHandle(ref, () => ({
      resetMask() {
        drawMask();
      },
    }));

    const checkRevealPercent = () => {
      if (!canvasRef.current || !ctx) return;
      const canvas = canvasRef.current;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let transparentPixels = 0;

      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) transparentPixels++;
      }

      const percent =
        (transparentPixels / (canvas.width * canvas.height)) * 100;

      if (percent >= 30 && !revealed) {
        setRevealed(true);
        let opacity = 1;
        const fadeOut = () => {
          opacity -= 0.05;
          if (opacity <= 0) {
            setMaskOpacity(0);
            return;
          }
          setMaskOpacity(opacity);
          requestAnimationFrame(fadeOut);
        };
        fadeOut();
      }
    };

    const eraseAt = (x: number, y: number) => {
      if (!ctx || revealed) return;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();
      checkRevealPercent();
    };

    const getPointerPos = (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>
    ) => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      if ('touches' in e && e.touches.length > 0) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
      } else if ('clientX' in e) {
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      }
      return { x: 0, y: 0 };
    };

    const handlePointerDown = (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>
    ) => {
      if (revealed) return;
      setIsErasing(true);
      const pos = getPointerPos(e);
      eraseAt(pos.x, pos.y);
    };

    const handlePointerMove = (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>
    ) => {
      if (!isErasing || revealed) return;
      const pos = getPointerPos(e);
      eraseAt(pos.x, pos.y);
    };

    const handlePointerUp = () => {
      setIsErasing(false);
    };

    return (
      <div className={styles.container}>
        <MaskedImage src={imageUrl} />
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          style={{ opacity: maskOpacity, transition: 'opacity 0.5s ease-out' }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
      </div>
    );
  }
);

export default ScratchImageReveal;
