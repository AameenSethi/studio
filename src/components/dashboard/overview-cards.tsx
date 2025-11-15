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
import { format, subDays, parseISO } from 'date-fns';

const chartConfig = {
  hours: {
    label: 'Hours',
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
                hours: 0,
            };
        });

        history.forEach(item => {
            if (item.type === 'Practice Test' && item.duration) {
                const itemDate = parseISO(item.timestamp);
                const formattedDate = format(itemDate, 'yyyy-MM-dd');
                const dayEntry = days.find(d => d.date === formattedDate);
                if (dayEntry) {
                    dayEntry.hours += item.duration / 3600; // convert seconds to hours
                }
            }
        });

        // Round to 2 decimal places
        days.forEach(day => {
            day.hours = parseFloat(day.hours.toFixed(2));
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
            allowDecimals={true}
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
