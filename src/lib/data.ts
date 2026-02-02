import type {
  Defect,
  DefectTrend,
  TrainingJob,
  ManagedImage,
} from '@/lib/types';
import { PlaceHolderImages } from './placeholder-images';

export const defectMetrics: Defect[] = [
  { type: 'Scratch', count: 128 },
  { type: 'Dent', count: 89 },
  { type: 'Discoloration', count: 54 },
  { type: 'Crack', count: 32 },
  { type: 'Missing Part', count: 15 },
];

export const defectTrends: DefectTrend[] = [
  { date: '2023-05-01', Critical: 12, Major: 30, Minor: 45 },
  { date: '2023-05-02', Critical: 15, Major: 32, Minor: 50 },
  { date: '2023-05-03', Critical: 10, Major: 28, Minor: 42 },
  { date: '2023-05-04', Critical: 18, Major: 35, Minor: 55 },
  { date: '2023-05-05', Critical: 14, Major: 31, Minor: 48 },
  { date: '2023-05-06', Critical: 20, Major: 40, Minor: 60 },
  { date: '2023-05-07', Critical: 16, Major: 33, Minor: 52 },
];

export const trainingJobs: TrainingJob[] = [
  {
    id: 'job-003',
    modelName: 'Model_v3_Prod_Line_A',
    dataset: 'Dataset_Prod_A_May24',
    status: 'Completed',
    createdAt: '2024-05-20T10:00:00Z',
  },
  {
    id: 'job-002',
    modelName: 'Model_v2_Prod_Line_B',
    dataset: 'Dataset_Prod_B_Apr24',
    status: 'In Progress',
    createdAt: '2024-05-22T14:30:00Z',
  },
  {
    id: 'job-001',
    modelName: 'Model_v1_Alpha',
    dataset: 'Initial_Test_Data',
    status: 'Failed',
    createdAt: '2024-04-15T09:00:00Z',
  },
];

export const managedImages: ManagedImage[] = PlaceHolderImages.filter((img) =>
  img.id.startsWith('sample-defect')
).map((img, index) => ({
  id: img.id,
  url: img.imageUrl,
  name: `IMG_${7321 + index}.jpg`,
  uploadedAt: new Date(
    Date.now() - (index + 1) * 1000 * 60 * 60 * 3
  ).toISOString(),
}));
