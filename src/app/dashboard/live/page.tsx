import { DashboardHeader } from '@/components/dashboard-header';
import { CameraFeed } from '@/components/dashboard/camera-feed';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

const recentDetections = [
  { time: '2 minutes ago', type: 'Scratch', confidence: '98.2%' },
  { time: '5 minutes ago', type: 'Scratch', confidence: '95.1%' },
  { time: '12 minutes ago', type: 'Dent', confidence: '89.7%' },
];

export default function LiveFeedPage() {
  return (
    <>
      <DashboardHeader breadcrumbs={['Dashboard', 'Live Feed']} />
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <CameraFeed />
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Recent Events</CardTitle>
              <CardDescription>
                Live detections from the camera feed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDetections.map((detection, index) => (
                    <TableRow key={index}>
                      <TableCell>{detection.time}</TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="flex w-fit items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {detection.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {detection.confidence}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
