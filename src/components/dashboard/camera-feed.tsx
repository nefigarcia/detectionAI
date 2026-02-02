'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CameraFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const { toast } = useToast();

  // This effect will run when `isCameraOn` changes.
  useEffect(() => {
    // This function will be called when the component is unmounted or `isCameraOn` changes.
    const cleanup = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    const startCamera = async () => {
      // First, clean up any existing streams to prevent issues.
      cleanup();

      // Small helper to normalize getUserMedia across browsers.
      const getUserMedia = (constraints: MediaStreamConstraints) => {
        if (typeof navigator === 'undefined') {
          return Promise.reject(new Error('Navigator is not available'));
        }

        // Modern API
        if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
          return navigator.mediaDevices.getUserMedia(constraints);
        }

        // Legacy callbacks (older browsers / WebKit)
        const legacyGetUserMedia = (navigator as any).getUserMedia || (navigator as any).webkitGetUserMedia || (navigator as any).mozGetUserMedia;
        if (legacyGetUserMedia) {
          return new Promise<MediaStream>((resolve, reject) => {
            try {
              legacyGetUserMedia.call(navigator, constraints, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        }

        return Promise.reject(new Error('getUserMedia is not supported in this browser'));
      };

      try {
        const stream = await getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.error('Error accessing camera:', err);
        const message = err?.name === 'NotAllowedError' || err?.message?.toLowerCase().includes('permission')
          ? 'Camera permission denied. Please allow camera access in your browser.'
          : (err?.message || 'Could not access the camera.');

        toast({
          variant: 'destructive',
          title: 'Camera Error',
          description: message,
        });
        setIsCameraOn(false); // Turn the toggle back off if we fail
      }
    };

    if (isCameraOn) {
      startCamera();
    } else {
      cleanup();
    }

    // The return function from useEffect is the cleanup function.
    // It's crucial for stopping the camera when the component unmounts.
    return cleanup;
  }, [isCameraOn, toast]);

  const handleToggleCamera = () => {
    setIsCameraOn(prev => !prev);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline">Live Defect Detection</CardTitle>
        <Button onClick={handleToggleCamera} size="sm">
          {isCameraOn ? <CameraOff className="mr-2 h-4 w-4" /> : <Camera className="mr-2 h-4 w-4" />}
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
          {!isCameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/80">
                <CameraOff className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Camera is off</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
