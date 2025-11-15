'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = [
  { day: 'Mon', hours: Math.floor(Math.random() * 4) + 1 },
  { day: 'Tue', hours: Math.floor(Math.random() * 4) + 1 },
  { day: 'Wed', hours: Math.floor(Math.random() * 4) + 1 },
  { day: 'Thu', hours: Math.floor(Math.random() * 4) + 1 },
  { day: 'Fri', hours: Math.floor(Math.random() * 4) + 1 },
  { day: 'Sat', hours: Math.floor(Math.random() * 4) + 1 },
  { day: 'Sun', hours: Math.floor(Math.random() * 4) + 1 },
];

const chartConfig = {
  hours: {
    label: 'Hours',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function WeeklyProgressChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart accessibilityLayer data={chartData}>
          <XAxis
            dataKey="day"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tickFormatter={(value) => `${value}h`}
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }}
            content={<ChartTooltipContent hideIndicator />}
          />
          <Bar dataKey="hours" fill="hsl(var(--primary))" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
