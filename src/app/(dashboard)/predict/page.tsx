'use client';
import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import Image from 'next/image';

export default function AdHocPredictionPage() {
  const [image, setImage] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detection, setDetection] = useState<any | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setDetection(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetect = () => {
    setIsDetecting(true);
    // Simulate API call
    setTimeout(() => {
      setDetection({
        x: 120,
        y: 150,
        width: 180,
        height: 60,
        label: 'Discoloration',
        confidence: 0.91,
      });
      setIsDetecting(false);
    }, 1500);
  };

  return (
    <>
      <DashboardHeader breadcrumbs={['Dashboard', 'Predict']} />
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Ad-hoc Prediction</CardTitle>
            <p className="text-muted-foreground">
              Quickly check a single image for defects without adding it to a
              dataset.
            </p>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-md border-2 border-dashed">
              <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
              <p className="mb-2 text-muted-foreground">
                Drag & drop an image here, or click to upload
              </p>
              <input
                type="file"
                className="hidden"
                id="image-upload"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <Button asChild>
                  <span>Browse File</span>
                </Button>
              </label>
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-secondary">
              {image ? (
                <>
                  <Image
                    src={image}
                    alt="Uploaded for prediction"
                    fill
                    className="object-contain"
                  />
                  {detection && (
                    <div
                      className="absolute box-border animate-pulse border-4 border-accent"
                      style={{
                        left: `${detection.x}px`,
                        top: `${detection.y}px`,
                        width: `${detection.width}px`,
                        height: `${detection.height}px`,
                      }}
                    >
                      <div className="absolute -top-7 left-0 bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground">
                        {detection.label} ({detection.confidence.toFixed(2)})
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">
                    Image preview will appear here
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardContent>
            <Button
              onClick={handleDetect}
              disabled={!image || isDetecting}
              className="w-full md:w-auto"
            >
              {isDetecting ? 'Detecting...' : 'Detect Defects'}
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
