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
import { useHistory } from '@/hooks/use-history';
import { useMemo } from 'react';
import { format, subDays, getDay, parseISO } from 'date-fns';

const chartConfig = {
  activities: {
    label: 'Activities',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function WeeklyProgressChart() {
    const { history } = useHistory();

    const chartData = useMemo(() => {
        const days = Array.from({ length: 7 }).map((_, i) => {
            const date = subDays(new Date(), 6 - i);
            return {
                day: format(date, 'eee'),
                date: format(date, 'yyyy-MM-dd'),
                activities: 0,
            };
        });

        history.forEach(item => {
            const itemDate = parseISO(item.timestamp);
            const formattedDate = format(itemDate, 'yyyy-MM-dd');
            const dayEntry = days.find(d => d.date === formattedDate);
            if (dayEntry) {
                dayEntry.activities += 1;
            }
        });

        return days;
    }, [history]);

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
            allowDecimals={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }}
            content={<ChartTooltipContent hideIndicator />}
          />
          <Bar dataKey="activities" fill="hsl(var(--primary))" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
