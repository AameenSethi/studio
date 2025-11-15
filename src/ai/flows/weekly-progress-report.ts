'use server';

/**
 * @fileOverview This file defines the Genkit flow for generating weekly progress reports.
 *
 * The flow takes user learning data as input and uses AI to create a comprehensive report
 * summarizing progress, highlighting strengths and weaknesses, and suggesting areas for improvement.
 *
 * @exported {
 *   generateWeeklyProgressReport: (input: WeeklyProgressReportInput) => Promise<WeeklyProgressReportOutput>;
 *   WeeklyProgressReportInput: z.infer<typeof WeeklyProgressReportInputSchema>;
 *   WeeklyProgressReportOutput: z.infer<typeof WeeklyProgressReportOutputSchema>;
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SubjectProgressSchema = z.object({
  subject: z.string().describe('The name of the subject.'),
  topicsStudied: z.array(z.string()).describe('A list of topics studied within the subject.'),
  timeSpent: z.string().describe('Total time spent studying this subject during the week (e.g., "4 hours").'),
  practiceTestScores: z.array(z.object({
    testName: z.string().describe('Name or description of the test/quiz.'),
    score: z.string().describe('The score obtained (e.g., "78%").'),
  })).describe('Scores from practice tests taken for this subject.'),
});

// Input schema for the weekly progress report flow
const WeeklyProgressReportInputSchema = z.object({
  userId: z.string().describe('The ID of the user.'),
  startDate: z.string().describe('The start date of the week for the report (YYYY-MM-DD).'),
  endDate: z.string().describe('The end date of the week for the report (YYYY-MM-DD).'),
  learningData: z.array(SubjectProgressSchema).describe('An array of learning data for each subject studied during the week.'),
  overallSummary: z.object({
    totalTimeSpent: z.string().describe('Total time spent across all subjects.'),
    generalObservations: z.string().optional().describe('Any general observations or notes about the student\'s week.'),
  }).describe('An overall summary of the week\'s learning activities.'),
});

export type WeeklyProgressReportInput = z.infer<typeof WeeklyProgressReportInputSchema>;

// Output schema for the weekly progress report flow
const WeeklyProgressReportOutputSchema = z.object({
  report: z.string().describe('A comprehensive report summarizing the user\'s weekly learning progress, including insights and areas for improvement.'),
});

export type WeeklyProgressReportOutput = z.infer<typeof WeeklyProgressReportOutputSchema>;

// Exported function to generate the weekly progress report
export async function generateWeeklyProgressReport(input: WeeklyProgressReportInput): Promise<WeeklyProgressReportOutput> {
  return weeklyProgressReportFlow(input);
}

// Define the prompt for generating the weekly progress report
const weeklyProgressReportPrompt = ai.definePrompt({
  name: 'weeklyProgressReportPrompt',
  input: {schema: WeeklyProgressReportInputSchema},
  output: {schema: WeeklyProgressReportOutputSchema},
  prompt: `You are an AI learning assistant. Generate a detailed weekly progress report for the user based on their learning data for the week of {{{startDate}}} to {{{endDate}}}.

  The report should be structured, insightful, and encouraging. For each subject, provide a clear analysis.

  **Overall Summary:**
  - Start with a summary of the total time spent: {{{overallSummary.totalTimeSpent}}}.
  - Mention any general observations if provided: {{{overallSummary.generalObservations}}}

  **Subject-by-Subject Analysis:**
  For each subject in the learning data, create a section.
  {{#each learningData}}
  **Subject: {{subject}}**
  - **Time Spent:** {{timeSpent}}
  - **Topics Covered:** {{#join topicsStudied ", "}}{{/join}}
  - **Practice Test Performance:**
    {{#each practiceTestScores}}
    - {{testName}}: {{score}}
    {{/each}}
  - **Analysis & Insights:**
    - Analyze the test scores to identify strengths and potential weaknesses. For example, if scores are improving, mention that. If a score is low, suggest revisiting the topic.
    - Comment on the time spent in relation to the topics covered.
  {{/each}}

  **Strengths & Areas for Improvement:**
  - Based on all the data, create a "Key Strengths" section highlighting where the student is excelling.
  - Create a "Focus Areas for Next Week" section with actionable suggestions for topics or subjects that need more attention.

  **Concluding Remarks:**
  - End with an encouraging and supportive message to motivate the student for the upcoming week.

  Generate the report in a clear, well-formatted text.
  `,
});

// Define the Genkit flow for generating the weekly progress report
const weeklyProgressReportFlow = ai.defineFlow(
  {
    name: 'weeklyProgressReportFlow',
    inputSchema: WeeklyProgressReportInputSchema,
    outputSchema: WeeklyProgressReportOutputSchema,
  },
  async input => {
    const {output} = await weeklyProgressReportPrompt(input);
    return output!;
  }
);
