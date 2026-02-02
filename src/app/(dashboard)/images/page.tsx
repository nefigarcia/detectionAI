import Image from 'next/image';
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { managedImages } from '@/lib/data';
import { Download, PlusCircle, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ImageManagementPage() {
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
            <Button variant="outline">
              <Tag className="mr-2 h-4 w-4" />
              Label in Roboflow
            </Button>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Upload Images
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {managedImages.map((image) => (
            <Card key={image.id} className="group relative overflow-hidden">
              <CardHeader className="absolute left-2 top-2 z-10 p-0">
                <Checkbox className="h-5 w-5 rounded-md border-2 border-white bg-black/20 shadow-lg" />
              </CardHeader>
              <CardContent className="p-0">
                <Image
                  src={image.url}
                  alt={image.name}
                  width={400}
                  height={300}
                  className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105"
                  data-ai-hint="manufacturing defect"
                />
              </CardContent>
              <CardFooter className="flex flex-col items-start bg-secondary/50 p-3">
                <p className="font-semibold">{image.name}</p>
                <p className="text-xs text-muted-foreground">
                  Uploaded{' '}
                  {formatDistanceToNow(new Date(image.uploadedAt), {
                    addSuffix: true,
                  })}
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
            <Button variant="secondary">Load More</Button>
        </div>

        <div className="fixed bottom-10 left-1/2 -translate-x-1/2">
            <Card className="flex items-center gap-4 p-3 shadow-2xl">
                <p className="text-sm font-medium">3 images selected</p>
                <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Dataset
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
