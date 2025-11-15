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

// Input schema for the weekly progress report flow
const WeeklyProgressReportInputSchema = z.object({
  userId: z.string().describe('The ID of the user.'),
  startDate: z.string().describe('The start date of the week for the report (YYYY-MM-DD).'),
  endDate: z.string().describe('The end date of the week for the report (YYYY-MM-DD).'),
  learningData: z.string().describe('The learning data for the week, including topics studied, practice test scores, and time spent learning.'),
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
  prompt: `You are an AI learning assistant. Generate a weekly progress report for the user based on their learning data.

  The report should include:
  - A summary of the topics studied during the week (between {{{startDate}}} and {{{endDate}}}).
  - An analysis of the user\'s performance on practice tests.
  - Identification of the user\'s strengths and weaknesses.
  - Suggestions for areas where the user can improve.
  - A tone that is encouraging, supportive, and insightful

  Here is the user\'s learning data:
  {{learningData}}
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
