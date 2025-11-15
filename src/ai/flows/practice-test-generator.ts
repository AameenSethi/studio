'use server';

/**
 * @fileOverview A practice test generator AI agent.
 *
 * - generatePracticeTest - A function that handles the practice test generation process.
 * - GeneratePracticeTestInput - The input type for the generatePracticeTest function.
 * - GeneratePracticeTestOutput - The return type for the generatePracticeTest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePracticeTestInputSchema = z.object({
  studyPlan: z
    .string()
    .describe('The study plan to generate a practice test for.'),
  learningHistory: z
    .string()
    .describe('The learning history of the user.'),
  numberOfQuestions: z
    .number()
    .describe('The number of questions to generate.'),
});
export type GeneratePracticeTestInput = z.infer<typeof GeneratePracticeTestInputSchema>;

const GeneratePracticeTestOutputSchema = z.object({
  testQuestions: z.array(z.string()).describe('The generated practice test questions.'),
});
export type GeneratePracticeTestOutput = z.infer<typeof GeneratePracticeTestOutputSchema>;

export async function generatePracticeTest(input: GeneratePracticeTestInput): Promise<GeneratePracticeTestOutput> {
  return generatePracticeTestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePracticeTestPrompt',
  input: {schema: GeneratePracticeTestInputSchema},
  output: {schema: GeneratePracticeTestOutputSchema},
  prompt: `You are an expert in generating practice tests based on a user's study plan and learning history.

  Study Plan: {{{studyPlan}}}
  Learning History: {{{learningHistory}}}

  Generate {{{numberOfQuestions}}} practice test questions based on the study plan and learning history. Return the questions as a JSON array of strings.
  `,
});

const generatePracticeTestFlow = ai.defineFlow(
  {
    name: 'generatePracticeTestFlow',
    inputSchema: GeneratePracticeTestInputSchema,
    outputSchema: GeneratePracticeTestOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
