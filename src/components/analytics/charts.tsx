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
import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

const studyTimeData = Array.from({ length: 30 }, (_, i) => ({
  date: `Day ${i + 1}`,
  hours: Number((Math.random() * 3 + 0.5).toFixed(1)),
}));

const initialTopicMasteryData = [
  { topic: 'Calculus', mastery: Math.floor(Math.random() * 60) + 40 },
  { topic: 'Algebra', mastery: Math.floor(Math.random() * 60) + 40 },
  { topic: 'Statistics', mastery: Math.floor(Math.random() * 60) + 40 },
  { topic: 'Geometry', mastery: Math.floor(Math.random() * 60) + 40 },
  { topic: 'Trigonometry', mastery: Math.floor(Math.random() * 60) + 40 },
  { topic: 'Probability', mastery: Math.floor(Math.random() * 60) + 40 },
];

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
  const [topicMasteryData, setTopicMasteryData] = useState(initialTopicMasteryData);
  const [newSubject, setNewSubject] = useState('');

  const handleAddSubject = () => {
    if (newSubject.trim() !== '') {
      const newTopic = {
        topic: newSubject.trim(),
        mastery: Math.floor(Math.random() * 60) + 40,
      };
      setTopicMasteryData([...topicMasteryData, newTopic]);
      setNewSubject('');
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Topic Mastery</CardTitle>
        <CardDescription>
          Your estimated mastery level for each topic.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
         <div className="mt-4 flex gap-2">
            <Input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Add a new subject"
                className="flex-grow"
            />
            <Button onClick={handleAddSubject} size="icon">
                <Plus className="h-4 w-4" />
            </Button>
        </div>
      </CardContent>
    </Card>
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
