'use server';

/**
 * @fileOverview An AI-powered assistant to answer user questions about the StudyPal app.
 *
 * - askQuestion - A function that handles answering user questions.
 * - AskQuestionInput - The input type for the askQuestion function.
 * - AskQuestionOutput - The return type for the askQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskQuestionInputSchema = z.object({
  question: z.string().describe("The user's question about the StudyPal application."),
});
export type AskQuestionInput = z.infer<typeof AskQuestionInputSchema>;

const AskQuestionOutputSchema = z.object({
    answer: z.string().describe("A helpful and concise answer to the user's question. The answer should be formatted with markdown-style headers (e.g., **Header**) and lists (e.g., * item)."),
});
export type AskQuestionOutput = z.infer<typeof AskQuestionOutputSchema>;

export async function askQuestion(
  input: AskQuestionInput
): Promise<AskQuestionOutput> {
  return askQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askQuestionPrompt',
  input: {schema: AskQuestionInputSchema},
  output: {schema: AskQuestionOutputSchema},
  prompt: `You are a friendly and helpful support assistant for an application called "StudyPal". Your goal is to answer user questions about how to use the app.

Here are the main features of StudyPal:
- **Dashboard**: Shows an overview of weekly progress and quick actions.
- **Explanations**: An "Intelligent Explanations" feature to break down complex topics. Users input a topic and a detail level (Simple, Detailed, Expert).
- **Practice**: A "Practice Test Generator" where users can create quizzes for any subject and topic.
- **Analytics**: A dashboard with charts for Study Time, Topic Mastery, and Performance by Topic. Users can manage which topics they track.
- **Progress**: A "Student Progress Report" generator for teachers/parents to get an AI summary of a student's weekly work.
- **History**: A log of all generated study plans, explanations, and practice tests.
- **Profile**: Users can update their name, class, and field of study.
- **Students**: (For teachers/parents) A roster to manage students and view their individual progress.

Based on the user's question, provide a clear, concise, and helpful answer. Use markdown for formatting, like **headers** and * for lists. Be friendly and encouraging.

User's Question: "{{question}}"
`,
});

const askQuestionFlow = ai.defineFlow(
  {
    name: 'askQuestionFlow',
    inputSchema: AskQuestionInputSchema,
    outputSchema: AskQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
