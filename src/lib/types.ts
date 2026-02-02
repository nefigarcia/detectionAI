export type Defect = {
  type: string;
  count: number;
};

export type DefectTrend = {
  date: string;
  Critical: number;
  Major: number;
  Minor: number;
};

export type TrainingJob = {
  id: string;
  modelName: string;
  dataset: string;
  status: 'Queued' | 'In Progress' | 'Completed' | 'Failed';
  createdAt: string;
};

export type ManagedImage = {
  id: string;
  url: string;
  name: string;
  uploadedAt: string;
};
