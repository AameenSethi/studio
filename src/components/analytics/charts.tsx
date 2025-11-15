'use client';

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Pie,
  PieChart,
  Cell,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useState, useMemo, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Plus, X, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { useHistory } from '@/hooks/use-history';

const studyTimeData = Array.from({ length: 30 }, (_, i) => ({
  date: `Day ${i + 1}`,
  hours: Number((Math.random() * 3 + 0.5).toFixed(1)),
}));

const testScoresData = [
    { range: '> 90%', value: 12, fill: "hsl(var(--chart-1))" },
    { range: '80-90%', value: 25, fill: "hsl(var(--chart-2))" },
    { range: '70-80%', value: 30, fill: "hsl(var(--chart-3))" },
    { range: '< 70%', value: 8, fill: "hsl(var(--chart-4))" },
];


const studyTimeConfig = {
  hours: {
    label: 'Study Hours',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const topicMasteryConfig = {
  mastery: {
    label: 'Mastery',
    color: 'hsl(var(--accent))',
  },
} satisfies ChartConfig;

export function StudyTimeChart() {
  return (
    <ChartContainer config={studyTimeConfig} className="h-[250px] w-full">
      <ResponsiveContainer>
        <LineChart data={studyTimeData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
          <Tooltip content={<ChartTooltipContent />} />
          <Line type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function TopicMasteryChart() {
  const { history } = useHistory();

  const { topicMasteryData, overallPerformance } = useMemo(() => {
    const testHistory = history.filter(item => item.type === 'Practice Test' && item.score !== undefined);

    const topicScores: { [topic: string]: { scores: number[], count: number } } = {};

    testHistory.forEach(item => {
      const topicMatch = item.title.match(/Test on: (.*)/);
      const topic = topicMatch ? topicMatch[1] : 'General';
      const percentage = (item.score! / item.content.length) * 100;

      if (!topicScores[topic]) {
        topicScores[topic] = { scores: [], count: 0 };
      }
      topicScores[topic].scores.push(percentage);
      topicScores[topic].count++;
    });

    const calculatedMasteryData = Object.entries(topicScores).map(([topic, data]) => {
      const averageScore = data.scores.reduce((acc, score) => acc + score, 0) / data.count;
      return {
        topic: topic,
        mastery: Math.round(averageScore),
      };
    });

    const totalTests = testHistory.length;
    const totalPercentage = testHistory.reduce((acc, item) => {
        const percentage = (item.score! / item.content.length) * 100;
        return acc + percentage;
    }, 0);

    const overallAverage = totalTests > 0 ? Math.round(totalPercentage / totalTests) : 0;

    return { topicMasteryData: calculatedMasteryData, overallPerformance: overallAverage };
  }, [history]);


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Topic Mastery</CardTitle>
          <CardDescription>
            Your estimated mastery level based on practice test performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
        {topicMasteryData.length > 0 ? (
          <ChartContainer config={topicMasteryConfig} className="h-[250px] w-full">
            <ResponsiveContainer>
              <RadarChart data={topicMasteryData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="topic" stroke="hsl(var(--muted-foreground))" fontSize={12}/>
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Radar name="Mastery" dataKey="mastery" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
            <div className="flex flex-col items-center justify-center h-[250px] text-center p-4 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No test data available.</p>
                <p className="text-sm text-muted-foreground">Complete some practice tests to see your mastery here.</p>
            </div>
        )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Overall Performance
          </CardTitle>
          <CardDescription>
            Your average score across all practice tests.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[250px]">
          <div className="relative h-40 w-40">
            <svg className="h-full w-full" viewBox="0 0 36 36">
              <path
                className="stroke-current text-gray-200 dark:text-gray-700"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeWidth="3"
              />
              <path
                className="stroke-current text-primary"
                strokeDasharray={`${overallPerformance}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary">{overallPerformance}%</span>
            </div>
          </div>
          <p className="mt-4 text-muted-foreground">
            Keep up the great work!
          </p>
        </CardContent>
      </Card>
    </>
  );
}


export function TestScoresChart() {
    return (
        <ChartContainer config={{}} className="h-[250px] w-full">
            <ResponsiveContainer>
                <PieChart>
                    <Tooltip content={<ChartTooltipContent nameKey="range" />} />
                    <Pie
                        data={testScoresData}
                        dataKey="value"
                        nameKey="range"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                         {testScoresData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
