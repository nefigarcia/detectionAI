"use client";

import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Box = { x: number; y: number; w: number; h: number; label?: string };

export default function LabelingModal({
  imageUrl,
  imageId,
  open,
  onClose,
  onSave,
}: {
  imageUrl: string;
  imageId: number | string;
  open: boolean;
  onClose: () => void;
  onSave: (boxes: Box[]) => void;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const [boxes, setBoxes] = React.useState<Box[]>([]);
  const drawingRef = React.useRef<{ startX: number; startY: number } | null>(null);

  React.useEffect(() => {
    setBoxes(() => {
      // load existing annotations from localStorage
      try {
        const raw = localStorage.getItem('labeledAnnotations');
        if (!raw) return [];
        const parsed = JSON.parse(raw || '{}');
        const entry = parsed[String(imageId)];
        if (!entry) return [];
        // entry may be stored as { boxes, width, height }
        return entry.boxes || [];
      } catch (e) {
        return [];
      }
    });
  }, [imageId]);

  React.useEffect(() => {
    function draw() {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (!canvas || !img) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // draw existing boxes
      ctx.strokeStyle = 'rgba(255,0,0,0.9)';
      ctx.lineWidth = 3;
      boxes.forEach((b) => {
        ctx.strokeRect(b.x, b.y, b.w, b.h);
      });
    }
    draw();
  }, [boxes, imageUrl]);

  // mouse handlers
  const onMouseDown = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    drawingRef.current = { startX: x, startY: y };
  };
  const onMouseUp = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x2 = e.clientX - rect.left;
    const y2 = e.clientY - rect.top;
    const start = drawingRef.current;
    if (!start) return;
    const newBox: Box = {
      x: Math.min(start.startX, x2),
      y: Math.min(start.startY, y2),
      w: Math.abs(x2 - start.startX),
      h: Math.abs(y2 - start.startY),
      label: 'defect',
    };
    setBoxes((s) => [...s, newBox]);
    drawingRef.current = null;
  };

  const handleSave = () => {
    try {
      const raw = localStorage.getItem('labeledAnnotations') || '{}';
      const parsed = JSON.parse(raw);
      // store boxes along with the natural image dimensions so exports can
      // correctly normalize coordinates to the original image size
      const img = imgRef.current;
      parsed[String(imageId)] = {
        boxes,
        width: img?.naturalWidth ?? img?.clientWidth ?? null,
        height: img?.naturalHeight ?? img?.clientHeight ?? null,
      };
      localStorage.setItem('labeledAnnotations', JSON.stringify(parsed));
      // mark labeled image
      const labeledRaw = localStorage.getItem('labeledImages') || '[]';
      const labeled = new Set(JSON.parse(labeledRaw));
      labeled.add(String(imageId));
      localStorage.setItem('labeledImages', JSON.stringify(Array.from(labeled)));
    } catch (e) {
      // ignore
    }
    onSave(boxes);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="w-[90vw] max-w-3xl">
        <DialogHeader>
          <DialogTitle>Label Image</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="max-h-[60vh] overflow-auto">
            <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
              <img
                ref={imgRef}
                src={imageUrl}
                alt="label"
                style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
                onLoad={() => {
                  // set canvas to match displayed image size
                  const img = imgRef.current;
                  const canvas = canvasRef.current;
                  if (img && canvas) {
                    // use client dimensions so drawing coordinates map to displayed pixels
                    canvas.width = img.clientWidth;
                    canvas.height = img.clientHeight;
                    canvas.style.width = `${img.clientWidth}px`;
                    canvas.style.height = `${img.clientHeight}px`;
                  }
                  // redraw when image loaded
                  setBoxes((b) => b.slice());
                }}
              />
              <canvas
                ref={canvasRef}
                style={{ position: 'absolute', left: 0, top: 0, cursor: 'crosshair' }}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
              />
            </div>
          </div>
          <div className="w-full">
            <div className="mb-2 font-semibold">Annotations</div>
            <ul className="space-y-2">
              {boxes.map((b, i) => (
                <li key={i} className="flex items-center justify-between">
                  <div>#{i + 1} {b.label} — x:{Math.round(b.x)} y:{Math.round(b.y)} w:{Math.round(b.w)} h:{Math.round(b.h)}</div>
                  <Button size="sm" variant="ghost" onClick={() => setBoxes((s) => s.filter((_, idx) => idx !== i))}>Remove</Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
