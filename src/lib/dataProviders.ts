import { Defect, DefectTrend } from './types';
import { defectMetrics, defectTrends } from '@/lib/data';

export type ProjectSummary = {
  id: number;
  name: string;
  description?: string | null;
};

export type ImageSummary = {
  id: number;
  projectId: number;
  originalUrl: string;
  filename?: string | null;
  size?: number | null;
  mimetype?: string | null;
  uploadedBy?: number | null;
  createdAt: string;
};

export type DashboardDataProvider = {
  getDefectMetrics(): Promise<Defect[]>;
  getDefectTrends(): Promise<DefectTrend[]>;
  getProjects?(): Promise<ProjectSummary[]>;
  getImages?(projectId: number): Promise<ImageSummary[]>;
};

export const MockProvider: DashboardDataProvider = {
  async getDefectMetrics() {
    // return a copy to avoid accidental mutation
    return JSON.parse(JSON.stringify(defectMetrics)) as Defect[];
  },
  async getDefectTrends() {
    return JSON.parse(JSON.stringify(defectTrends)) as DefectTrend[];
  },
  async getProjects() {
    return [];
  },
  async getImages() {
    return [];
  },
};

export const ApiProvider: DashboardDataProvider = {
  async getDefectMetrics() {
    try {
      const res = await fetch('/api/dashboard/metrics', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch metrics');
      return (await res.json()) as Defect[];
    } catch (err) {
      console.error('ApiProvider.getDefectMetrics error', err);
      return [];
    }
  },
  async getDefectTrends() {
    try {
      const res = await fetch('/api/dashboard/trends', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch trends');
      return (await res.json()) as DefectTrend[];
    } catch (err) {
      console.error('ApiProvider.getDefectTrends error', err);
      return [];
    }
  },
  async getProjects() {
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch projects');
      return (await res.json()) as ProjectSummary[];
    } catch (err) {
      console.error('ApiProvider.getProjects error', err);
      return [];
    }
  },
  async getImages(projectId: number) {
    try {
      const res = await fetch(`/api/projects/${projectId}/images`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch images');
      return (await res.json()) as ImageSummary[];
    } catch (err) {
      console.error('ApiProvider.getImages error', err);
      return [];
    }
  },
};
