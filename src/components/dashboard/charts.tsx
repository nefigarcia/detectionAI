"use client";

import React from 'react';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChartConfig } from '@/components/ui/chart';
import { defectMetrics, defectTrends } from '@/lib/data';
import { useDataProvider } from '@/lib/dataProviderContext';
import type { Defect, DefectTrend } from '@/lib/types';

const defectMetricsChartConfig = {
  count: {
    label: 'Count',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function DefectTypesChart({ data }: { data?: Defect[] }) {
  const provider = useDataProvider();
  const [items, setItems] = React.useState<Defect[] | null>(data ?? null);

  React.useEffect(() => {
    let mounted = true;
    if (!items) {
      provider.getDefectMetrics().then((d) => {
        if (mounted) setItems(d);
      });
    }
    return () => { mounted = false; };
  }, [provider]);

  const chartData = items ?? defectMetrics;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Defects by Type</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <XAxis
              dataKey="type"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={false}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
              }}
            />
            <Bar
              dataKey="count"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

const defectTrendChartConfig = {
  Critical: {
    label: 'Critical',
    color: 'hsl(var(--destructive))',
  },
  Major: {
    label: 'Major',
    color: 'hsl(var(--primary))',
  },
  Minor: {
    label: 'Minor',
    color: 'hsl(var(--accent))',
  },
} satisfies ChartConfig;


export function DefectTrendChart({ data }: { data?: DefectTrend[] }) {
  const provider = useDataProvider();
  const [items, setItems] = React.useState<DefectTrend[] | null>(data ?? null);

  React.useEffect(() => {
    let mounted = true;
    if (!items) {
      provider.getDefectTrends().then((d) => {
        if (mounted) setItems(d);
      });
    }
    return () => { mounted = false; };
  }, [provider]);

  const chartData = items ?? defectTrends;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Defect Trend</CardTitle>
        <CardDescription>Daily defect counts by severity</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={true}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Critical"
              stroke={defectTrendChartConfig.Critical.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Major"
              stroke={defectTrendChartConfig.Major.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Minor"
              stroke={defectTrendChartConfig.Minor.color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
