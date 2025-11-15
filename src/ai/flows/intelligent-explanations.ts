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
    summary: z.string().describe("A concise one-sentence summary of the topic."),
    detailedExplanation: z.string().describe("The main, detailed explanation of the topic, formatted with markdown-style headers (e.g., **Header**) and lists (e.g., * item). The length should be appropriate for the topic and explanation level."),
    analogy: z.string().describe("A simple analogy to help understand the core concept."),
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
  prompt: `You are an expert educator skilled at explaining complex topics in simple terms. Your task is to provide a comprehensive explanation of a given topic tailored to a specific level of detail.

Topic: "{{topic}}"
Level: "{{explanationLevel}}"

Generate the following based on the topic and level:
1.  **Summary:** A concise, one-sentence summary.
2.  **Detailed Explanation:** A thorough explanation of the topic. Use markdown for structure, like **Headers** for sections and * for list items. The length and depth should match the requested "{{explanationLevel}}". Do not impose an artificial word limit.
3.  **Analogy:** A simple and relatable analogy to clarify the core concept.
`,
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
