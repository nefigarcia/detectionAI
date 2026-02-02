'use server';

import { analyzeDefectMetrics } from '@/ai/flows/analyze-defect-metrics';
import type { Defect } from '@/lib/types';

export async function getAiInsights(defectData: Defect[]) {
  try {
    const stringifiedData = JSON.stringify(defectData, null, 2);
    const result = await analyzeDefectMetrics({
      defectMetrics: stringifiedData,
    });
    return { success: true, insights: result.insights };
  } catch (error) {
    console.error('Error analyzing defect metrics:', error);
    return {
      success: false,
      error: 'Failed to analyze metrics. Please try again later.',
    };
  }
}
