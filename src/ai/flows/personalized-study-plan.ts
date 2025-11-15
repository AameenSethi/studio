'use server';

/**
 * @fileOverview Personalized study plan generator.
 *
 * - generatePersonalizedStudyPlan - A function that generates a personalized study plan.
 * - PersonalizedStudyPlanInput - The input type for the generatePersonalizedStudyPlan function.
 * - PersonalizedStudyPlanOutput - The return type for the generatePersonalizedStudyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedStudyPlanInputSchema = z.object({
  goals: z.string().describe('Your goals for studying.'),
  deadline: z.string().describe('Your deadline for achieving your goals.'),
  learningPace: z.string().describe('Your preferred learning pace (e.g., fast, moderate, slow).'),
});
export type PersonalizedStudyPlanInput = z.infer<typeof PersonalizedStudyPlanInputSchema>;

const PersonalizedStudyPlanOutputSchema = z.object({
  studyPlan: z.string().describe('A personalized study plan based on your goals, deadline, and learning pace.'),
});
export type PersonalizedStudyPlanOutput = z.infer<typeof PersonalizedStudyPlanOutputSchema>;

export async function generatePersonalizedStudyPlan(input: PersonalizedStudyPlanInput): Promise<PersonalizedStudyPlanOutput> {
  return personalizedStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedStudyPlanPrompt',
  input: {schema: PersonalizedStudyPlanInputSchema},
  output: {schema: PersonalizedStudyPlanOutputSchema},
  prompt: `You are an AI study plan generator. Generate a personalized study plan based on the user's goals, deadline, and learning pace.

Goals: {{{goals}}}
Deadline: {{{deadline}}}
Learning Pace: {{{learningPace}}}

Study Plan:`,
});

const personalizedStudyPlanFlow = ai.defineFlow(
  {
    name: 'personalizedStudyPlanFlow',
    inputSchema: PersonalizedStudyPlanInputSchema,
    outputSchema: PersonalizedStudyPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
