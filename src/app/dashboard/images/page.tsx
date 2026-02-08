"use client";

import Image from 'next/image';
import { useState, type ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/components/ui/button';
import LabelingButton from '@/components/labeling-button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { managedImages } from '@/lib/data';
import { useDataProvider } from '@/lib/dataProviderContext';
import type { ImageSummary } from '@/lib/dataProviders';
import type { ManagedImage } from '@/lib/types';
import { Download, PlusCircle, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ImageManagementPage() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select an image file to upload.',
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('projectId', '1'); // Hardcoding project ID for now

    try {
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      toast({
        title: 'Upload successful',
        description: `${file.name} has been uploaded.`,
      });
      setOpen(false);
      setFile(null);
      // Refresh images list from provider so newly uploaded image appears
      await fetchImages();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const provider = useDataProvider();
  const [images, setImages] = useState<(ImageSummary | ManagedImage)[] | null>(null);
  const [labeledIds, setLabeledIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSavingDataset, setIsSavingDataset] = useState(false);
  const [datasetSaved, setDatasetSaved] = useState(false);
  const fetchImages = async () => {
    try {
      // Honor explicit demo mode (query param or localStorage) to avoid timing issues
      try {
        const params = new URLSearchParams(window.location.search);
        const demoQuery = params.get('demo');
        const demoStored = localStorage.getItem('demoMode');
        if (demoQuery === '1' || demoStored) {
          setImages(managedImages as ManagedImage[]);
          return;
        }
      } catch (e) {
        // ignore parsing errors and continue to provider
      }

      const imgs = await provider.getImages?.(1) ?? [];
      setImages(imgs as ImageSummary[]);
    } catch (err) {
      console.error('Failed to fetch images', err);
      setImages([]);
    }
  };

  useEffect(() => {
    let mounted = true;
    // whenever the provider changes (mock <-> api), re-fetch images
    fetchImages();
    // load labeled ids from localStorage
    try {
      const raw = localStorage.getItem('labeledImages') || '[]';
      setLabeledIds(new Set(JSON.parse(raw)));
    } catch (e) {
      setLabeledIds(new Set());
    }
    function onStorage(e: StorageEvent) {
      if (e.key === 'labeledImages') {
        try {
          setLabeledIds(new Set(JSON.parse(e.newValue || '[]')));
        } catch (err) {
          setLabeledIds(new Set());
        }
      }
    }
    window.addEventListener('storage', onStorage);
    return () => { mounted = false; };
  }, [provider]);


  return (
    <>
      <DashboardHeader breadcrumbs={['Dashboard', 'Image Management']} />
      <main className="flex-1 p-4 sm:px-6 sm:py-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-2xl font-bold">
              Image Management
            </h1>
            <p className="text-muted-foreground">
              Upload, organize, and label your images to create datasets.
            </p>
          </div>
          <div className="flex gap-2">
              <LabelingButton />
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Upload Images
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Upload Image</DialogTitle>
                  <DialogDescription>
                    Select an image file to upload to your project.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="image">Image</Label>
                    <Input id="image" type="file" onChange={handleFileChange} accept="image/*" />
                  </div>
                   {file && (
                    <div className="mt-4 flex items-center gap-4 rounded-md border p-2">
                        <Image
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            width={64}
                            height={64}
                            className="aspect-square rounded-md object-cover"
                        />
                        <div className="text-sm">
                            <p className="font-medium">{file.name}</p>
                            <p className="text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading || !file}
                  >
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {(images ?? managedImages).map((image) => {
            const isApi = 'originalUrl' in image;
            const id = String(image.id);
            const isLabeled = labeledIds.has(id);
            const src = isApi ? `/api/images/${image.id}/proxy` : (image as ManagedImage).url;
            const title = isApi ? (image as ImageSummary).filename ?? 'Image' : (image as ManagedImage).name;
            const uploadedAt = isApi ? (image as ImageSummary).createdAt : (image as ManagedImage).uploadedAt;
            return (
            <Card key={image.id} className="group relative overflow-hidden">
              <CardHeader className="absolute left-2 top-2 z-10 p-0 flex items-center gap-2">
                <Checkbox
                  className="h-5 w-5 rounded-md border-2 border-white bg-black/20 shadow-lg"
                  checked={selectedIds.has(id)}
                  onCheckedChange={(v) => {
                    setSelectedIds((prev) => {
                      const s = new Set(prev);
                      if (v) s.add(id); else s.delete(id);
                      return s;
                    });
                  }}
                />
                {isLabeled && (
                  <div className="ml-2 rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-emerald-100">Labeled</div>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <Image
                  src={src ?? ''}
                  alt={title}
                  width={400}
                  height={300}
                  className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105"
                  data-ai-hint="manufacturing defect"
                />
              </CardContent>
              <CardFooter className="flex flex-col items-start bg-secondary/50 p-3">
                <p className="font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">
                  Uploaded{' '}
                  {formatDistanceToNow(new Date(uploadedAt), {
                    addSuffix: true,
                  })}
                </p>
              </CardFooter>
            </Card>
            );
          })}
        </div>
        <div className="mt-8 flex justify-center">
            <Button variant="secondary">Load More</Button>
        </div>

        <div className="fixed bottom-10 left-1/2 -translate-x-1/2">
            <Card className="flex items-center gap-4 p-3 shadow-2xl">
                <p className="text-sm font-medium">{selectedIds.size} images selected</p>
                <Button
                    size="sm"
                    onClick={async () => {
                      // gather annotations and image info, then call API to export YOLO dataset
                      if (selectedIds.size === 0) return;
                      setIsSavingDataset(true);
                      try {
                        // collect image entries
                        const selected = Array.from(selectedIds);
                        const rawAnnotations = localStorage.getItem('labeledAnnotations') || '{}';
                        const parsedAnnotations = JSON.parse(rawAnnotations || '{}');
                        const payloadImages: any[] = [];
                        for (const id of selected) {
                          const img = (images ?? managedImages).find((i) => String(i.id) === id);
                          if (!img) continue;
                          const isApi = 'originalUrl' in img;
                          const entry = parsedAnnotations[id];
                          payloadImages.push({
                            id,
                            originalUrl: isApi ? (img as ImageSummary).originalUrl : (img as ManagedImage).url,
                            filename: isApi ? ((img as ImageSummary).filename ?? `${id}.jpg`) : ((img as ManagedImage).name ?? `${id}.jpg`),
                            width: entry?.width ?? null,
                            height: entry?.height ?? null,
                            annotations: entry?.boxes ?? [],
                          });
                        }

                        const body = {
                          projectId: 1, // TODO: make dynamic when multiple projects supported
                          images: payloadImages,
                        };

                        const resp = await fetch('/api/datasets/export', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(body),
                        });
                        if (!resp.ok) {
                          const err = await resp.json().catch(() => ({}));
                          throw new Error(err?.error || 'Dataset export failed');
                        }
                        const data = await resp.json();
                        setDatasetSaved(true);
                        toast({ title: 'Dataset saved', description: `Saved dataset id=${data.dataset?.id}` });
                      } catch (err) {
                        const msg = err instanceof Error ? err.message : 'Export failed';
                        toast({ variant: 'destructive', title: 'Export failed', description: msg });
                      } finally {
                        setIsSavingDataset(false);
                      }
                    }}
                    disabled={selectedIds.size === 0 || isSavingDataset || datasetSaved}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {datasetSaved ? 'Saved Dataset' : (isSavingDataset ? 'Saving...' : 'Save Dataset')}
                </Button>
                <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </Card>
        </div>
      </main>
    </>
  );
}
