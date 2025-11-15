'use server';

/**
 * @fileOverview AI-powered tool that breaks down complex topics into easy-to-understand concepts.
 *
 * - intelligentExplanation - A function that handles the process of simplifying complex topics.
 * - IntelligentExplanationInput - The input type for the intelligentExplanation function.
 * - IntelligentExplanationOutput - The return type for the intelligentExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentExplanationInputSchema = z.object({
  topic: z.string().describe('The complex topic to be explained.'),
  explanationLevel: z.enum(['Simple', 'Detailed', 'Expert']).describe('The desired level of detail for the explanation.'),
});
export type IntelligentExplanationInput = z.infer<typeof IntelligentExplanationInputSchema>;

const IntelligentExplanationOutputSchema = z.object({
  explanation: z.string().describe('The explanation of the topic in text format.'),
});
export type IntelligentExplanationOutput = z.infer<typeof IntelligentExplanationOutputSchema>;

export async function intelligentExplanation(
  input: IntelligentExplanationInput
): Promise<IntelligentExplanationOutput> {
  return intelligentExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentExplanationPrompt',
  input: {schema: IntelligentExplanationInputSchema},
  output: {schema: IntelligentExplanationOutputSchema},
  prompt: `You are an expert educator skilled at explaining complex topics in simple terms.

You will explain the topic "{{topic}}" at a "{{explanationLevel}}" level.

Ensure the explanation is clear, text-based, and tailored to the requested level of detail.

Explanation:`,
});

const intelligentExplanationFlow = ai.defineFlow(
  {
    name: 'intelligentExplanationFlow',
    inputSchema: IntelligentExplanationInputSchema,
    outputSchema: IntelligentExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
