import { DashboardHeader } from '@/components/dashboard-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { trainingJobs } from '@/lib/data';
import {
  Bot,
  CheckCircle,
  Clock,
  PlusCircle,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';

const statusIcons = {
  Completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  'In Progress': <Clock className="h-4 w-4 animate-spin text-blue-500" />,
  Failed: <XCircle className="h-4 w-4 text-destructive" />,
  Queued: <Clock className="h-4 w-4 text-muted-foreground" />,
};

const statusColors = {
  Completed: 'secondary',
  'In Progress': 'default',
  Failed: 'destructive',
  Queued: 'outline',
} as const;

export default function TrainingPage() {
  return (
    <>
      <DashboardHeader breadcrumbs={['Dashboard', 'Training']} />
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="flex items-center">
          <div className="flex-1">
            <h1 className="font-headline text-2xl font-bold">
              Model Training
            </h1>
            <p className="text-muted-foreground">
              Manage and monitor your model training jobs.
            </p>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Training Job
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Training Jobs</CardTitle>
            <CardDescription>
              A list of all your training jobs, past and present.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Model Name</TableHead>
                  <TableHead>Dataset</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainingJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.id}</TableCell>
                    <TableCell>{job.modelName}</TableCell>
                    <TableCell>{job.dataset}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[job.status]}>
                        <div className="flex items-center gap-2">
                          {statusIcons[job.status]}
                          <span>{job.status}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(job.createdAt), 'PPpp')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <Bot className="h-4 w-4" />
                        <span className="sr-only">View Details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
