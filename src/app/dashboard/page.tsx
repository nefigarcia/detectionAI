"use client";

import React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { getAiInsights } from '@/app/actions';
import { DashboardHeader } from '@/components/dashboard-header';
import {
  DefectTrendChart,
  DefectTypesChart,
} from '@/components/dashboard/charts';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useDataProvider, DataProviderProvider } from '@/lib/dataProviderContext';
import type { Defect, DefectTrend } from '@/lib/types';
import { AlertTriangle, Bot, CheckCircle2, Sigma } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Bot className="mr-2 h-4 w-4" />
      {pending ? 'Analyzing...' : 'Get AI Insights'}
    </Button>
  );
}

function AIInsightSection({ metrics }: { metrics: Defect[] }) {
  const initialState = { insights: '', error: '' };
  const getAiInsightsWithData = getAiInsights.bind(null, metrics);
  const [state, formAction] = useActionState(
    getAiInsightsWithData,
    initialState
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Bot className="h-6 w-6" />
          <span>AI-Powered Insights</span>
        </CardTitle>
        <CardDescription>
          Click the button to get AI-driven analysis and recommendations based
          on the latest defect data.
        </CardDescription>
      </CardHeader>
      <CardContent className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground">
        {state.insights && (
          <div
            dangerouslySetInnerHTML={{
              __html: state.insights.replace(/\n/g, '<br />'),
            }}
          />
        )}
        {state.error && <p className="text-destructive">{state.error}</p>}
        {!state.insights && !state.error && (
          <p className="text-muted-foreground">
            Analysis results will appear here.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <form action={formAction}>
          <SubmitButton />
        </form>
      </CardFooter>
    </Card>
  );
}

export default function AnalyticsPage() {
  return (
    <DataProviderProvider>
      <DashboardContent />
    </DataProviderProvider>
  );
}

function DashboardContent() {
  const provider = useDataProvider();
  const [metrics, setMetrics] = React.useState<Defect[] | null>(null);
  const [trends, setTrends] = React.useState<DefectTrend[] | null>(null);

  React.useEffect(() => {
    let mounted = true;
    provider.getDefectMetrics().then((d) => { if (mounted) setMetrics(d); });
    provider.getDefectTrends().then((t) => { if (mounted) setTrends(t); });
    return () => { mounted = false; };
  }, [provider]);

  const totalDefects = (metrics ?? []).reduce((sum, item) => sum + item.count, 0);

  return (
    <>
      <DashboardHeader breadcrumbs={["Dashboard", "Analytics"]} />
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Defects
              </CardTitle>
              <Sigma className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDefects}</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quality Score
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.85%</div>
              <p className="text-xs text-muted-foreground">
                Based on production volume
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Most Common Defect
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Scratch</div>
              <p className="text-xs text-muted-foreground">
                {metrics && metrics[0] ? metrics[0].count : '—'} instances this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Model Accuracy
              </CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">97.2%</div>
              <p className="text-xs text-muted-foreground">
                Confidence threshold: 85%
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
          <DefectTypesChart data={metrics ?? undefined} />
          <DefectTrendChart data={trends ?? undefined} />
        </div>

        <div>
          <AIInsightSection metrics={metrics ?? []} />
        </div>
      </main>
    </>
  );
}
