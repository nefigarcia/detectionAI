"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import LabelingModal from './labeling-modal';
import { useDataProvider } from '@/lib/dataProviderContext';
import { managedImages } from '@/lib/data';

export default function LabelingButton() {
  const provider = useDataProvider();
  const [images, setImages] = React.useState<any[]>([]);
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<{ id: number | string; url: string } | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const imgs = await provider.getImages?.(1) ?? [];
        // normalize to {id, url}
        const normalized = (imgs as any[]).map((i, idx) => ({
          id: i.id ?? (idx + 1),
          // if this is an API-backed image, point to the server proxy so private S3 objects load
          url: i.originalUrl ? `/api/images/${i.id}/proxy` : (i.url ?? i.originalUrl),
        }));
        setImages(normalized);
      } catch (e) {
        // fallback to managedImages
        const normalized = managedImages.map((m, idx) => ({ id: m.id, url: m.url }));
        setImages(normalized as any);
      }
    })();
  }, [provider]);

  const openFirstUnlabeled = () => {
    try {
      const labeledRaw = localStorage.getItem('labeledImages') || '[]';
      const labeled = new Set(JSON.parse(labeledRaw));
      const first = images.find((img) => !labeled.has(String(img.id)));
      if (first) {
        setSelected(first);
        setOpen(true);
      } else if (images.length > 0) {
        // if all labeled, open the first one
        setSelected(images[0]);
        setOpen(true);
      } else {
        alert('No images available to label');
      }
    } catch (e) {
      alert('Error opening labeling modal');
    }
  };

  const handleSave = (boxes: any[]) => {
    // future: send annotations to server or Roboflow
    // update local state so badge appears
    try {
      const labeledRaw = localStorage.getItem('labeledImages') || '[]';
      const labeled = new Set(JSON.parse(labeledRaw));
      if (selected) labeled.add(String(selected.id));
      localStorage.setItem('labeledImages', JSON.stringify(Array.from(labeled)));
      // notify other tabs
      window.dispatchEvent(new StorageEvent('storage', { key: 'labeledImages', newValue: JSON.stringify(Array.from(labeled)) } as any));
    } catch (e) {
      // ignore
    }
  };

  return (
    <>
      <Button variant="outline" onClick={openFirstUnlabeled}>Labeling</Button>
      {selected && (
        <LabelingModal
          imageUrl={selected.url}
          imageId={selected.id}
          open={open}
          onClose={() => setOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
