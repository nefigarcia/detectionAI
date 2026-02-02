'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing defect metrics and providing insights and recommendations.
 *
 * - analyzeDefectMetrics - A function that takes defect metrics as input and returns insights and recommendations.
 * - AnalyzeDefectMetricsInput - The input type for the analyzeDefectMetrics function.
 * - AnalyzeDefectMetricsOutput - The return type for the analyzeDefectMetrics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDefectMetricsInputSchema = z.object({
  defectMetrics: z
    .string()
    .describe(
      'Defect metrics data in JSON format, including defect types, counts, and timestamps.'
    ),
});

export type AnalyzeDefectMetricsInput = z.infer<typeof AnalyzeDefectMetricsInputSchema>;

const AnalyzeDefectMetricsOutputSchema = z.object({
  insights: z.string().describe('Insights and recommendations based on the defect metrics.'),
});

export type AnalyzeDefectMetricsOutput = z.infer<typeof AnalyzeDefectMetricsOutputSchema>;

export async function analyzeDefectMetrics(
  input: AnalyzeDefectMetricsInput
): Promise<AnalyzeDefectMetricsOutput> {
  return analyzeDefectMetricsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDefectMetricsPrompt',
  input: {schema: AnalyzeDefectMetricsInputSchema},
  output: {schema: AnalyzeDefectMetricsOutputSchema},
  prompt: `You are an expert quality control analyst. Analyze the following defect metrics data and provide insights and recommendations for potential root causes or areas for improvement.

Defect Metrics:
{{defectMetrics}}

Provide a concise summary of the key trends and potential issues identified in the data, along with actionable recommendations to improve quality control processes.`,
});

const analyzeDefectMetricsFlow = ai.defineFlow(
  {
    name: 'analyzeDefectMetricsFlow',
    inputSchema: AnalyzeDefectMetricsInputSchema,
    outputSchema: AnalyzeDefectMetricsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
