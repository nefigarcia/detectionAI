'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/badge';

type Detection = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
};

export function CameraFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detection, setDetection] = useState<Detection | null>(null);

  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraOn(true);
        setError(null);
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Could not access the camera. Please check permissions.');
        setIsCameraOn(false);
      }
    } else {
      setError('Camera not supported by this browser.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    setDetection(null);
  };

  useEffect(() => {
    let detectionInterval: NodeJS.Timeout;

    if (isCameraOn) {
      detectionInterval = setInterval(() => {
        // Simulate a detection
        if (Math.random() > 0.6) {
          setDetection({
            x: Math.random() * 300 + 50,
            y: Math.random() * 200 + 50,
            width: Math.random() * 100 + 50,
            height: Math.random() * 80 + 40,
            label: 'Scratch',
            confidence: Math.random() * 0.2 + 0.75,
          });
        } else {
          setDetection(null);
        }
      }, 3000);
    }

    return () => {
      if (detectionInterval) clearInterval(detectionInterval);
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraOn]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas && video && isCameraOn) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationFrameId: number;

      const render = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detection) {
          ctx.strokeStyle = 'hsl(var(--accent))';
          ctx.lineWidth = 4;
          ctx.strokeRect(
            detection.x,
            detection.y,
            detection.width,
            detection.height
          );

          ctx.fillStyle = 'hsl(var(--accent))';
          ctx.font = '16px "Space Grotesk", sans-serif';
          const label = `${detection.label} (${detection.confidence.toFixed(
            2
          )})`;
          const textWidth = ctx.measureText(label).width;
          ctx.fillRect(detection.x, detection.y - 24, textWidth + 10, 24);
          ctx.fillStyle = 'hsl(var(--accent-foreground))';
          ctx.fillText(label, detection.x + 5, detection.y - 6);
        }
        animationFrameId = requestAnimationFrame(render);
      };
      render();

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [detection, isCameraOn]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline">Live Defect Detection</CardTitle>
        <Button onClick={isCameraOn ? stopCamera : startCamera} size="sm">
          {isCameraOn ? (
            <CameraOff className="mr-2 h-4 w-4" />
          ) : (
            <Camera className="mr-2 h-4 w-4" />
          )}
          {isCameraOn ? 'Stop Camera' : 'Start Camera'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-secondary">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
          <canvas ref={canvasRef} className="absolute inset-0" />

          {!isCameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/80">
              {error ? (
                <>
                  <AlertCircle className="h-12 w-12 text-destructive" />
                  <p className="mt-4 text-center text-destructive-foreground">
                    {error}
                  </p>
                </>
              ) : (
                <>
                  <CameraOff className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">Camera is off</p>
                </>
              )}
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary p-3">
          <span className="font-medium">Status:</span>
          {detection ? (
            <Badge variant="destructive" className="animate-pulse">
              Defect Detected
            </Badge>
          ) : (
            <Badge variant="secondary">Monitoring</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
