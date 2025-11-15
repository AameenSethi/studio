'use server';

/**
 * @fileOverview A practice test generator AI agent.
 *
 * - generatePracticeTest - A function that handles the practice test generation process for students.
 * - generatePracticeTestForChild - A function that handles test generation for parents.
 * - GeneratePracticeTestInput - The input type for the generatePracticeTest function.
 * - GeneratePracticeTestOutput - The return type for the generatePracticeTest function.
 * - GeneratePracticeTestForChildInput - The input type for the parent-facing flow.
 * - GeneratePracticeTestForChildOutput - The return type for the parent-facing flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// For Students
const GeneratePracticeTestInputSchema = z.object({
  class: z.string().describe('The class level of the student and the educational board (e.g., "10th Grade (CBSE)").'),
  subject: z.string().describe('The subject for the test (e.g., "Mathematics").'),
  topic: z.string().describe('The specific topic within the subject (e.g., "Algebra").'),
  numberOfQuestions: z.number().describe('The number of questions to generate.'),
});
export type GeneratePracticeTestInput = z.infer<typeof GeneratePracticeTestInputSchema>;

const GeneratePracticeTestOutputSchema = z.object({
  testQuestions: z.array(z.string()).describe('The generated practice test questions.'),
});
export type GeneratePracticeTestOutput = z.infer<typeof GeneratePracticeTestOutputSchema>;

// For Parents
const GeneratePracticeTestForChildInputSchema = z.object({
    studentId: z.string().describe("The student's unique ID."),
    topic: z.string().describe('The topic for the practice test (e.g., "Algebra", "World History").'),
    numberOfQuestions: z.number().describe('The number of questions for the test.'),
    timeLimit: z.number().describe('The time limit for the test in minutes.'),
});
export type GeneratePracticeTestForChildInput = z.infer<typeof GeneratePracticeTestForChildInputSchema>;

const AnswerKeySchema = z.object({
    question: z.string().describe('A single test question.'),
    answer: z.string().describe('The correct answer to the question.'),
});

const GeneratePracticeTestForChildOutputSchema = z.object({
    answerKey: z.array(AnswerKeySchema).describe('An array of questions and their corresponding answers.'),
});
export type GeneratePracticeTestForChildOutput = z.infer<typeof GeneratePracticeTestForChildOutputSchema>;


export async function generatePracticeTest(input: GeneratePracticeTestInput): Promise<GeneratePracticeTestOutput> {
  return generatePracticeTestFlow(input);
}

export async function generatePracticeTestForChild(input: GeneratePracticeTestForChildInput): Promise<GeneratePracticeTestForChildOutput> {
    return generatePracticeTestForChildFlow(input);
}

const studentPrompt = ai.definePrompt({
  name: 'generatePracticeTestPrompt',
  input: {schema: GeneratePracticeTestInputSchema},
  output: {schema: GeneratePracticeTestOutputSchema},
  prompt: `You are an expert in generating practice tests for students.

  Class and Board: {{{class}}}
  Subject: {{{subject}}}
  Topic: {{{topic}}}

  Generate {{{numberOfQuestions}}} practice test questions based on the provided details. Return the questions as a JSON array of strings.
  `,
});

const parentPrompt = ai.definePrompt({
    name: 'generatePracticeTestForChildPrompt',
    input: { schema: GeneratePracticeTestForChildInputSchema },
    output: { schema: GeneratePracticeTestForChildOutputSchema },
    prompt: `You are an expert educator creating a practice test for a student. The test is being set by their parent.

Topic: {{{topic}}}
Number of Questions: {{{numberOfQuestions}}}

Generate a practice test with the specified number of questions on the given topic. For each question, provide a clear and correct answer.
Return the result as a JSON object containing an 'answerKey' which is an array of question-answer pairs.
`,
});

const generatePracticeTestFlow = ai.defineFlow(
  {
    name: 'generatePracticeTestFlow',
    inputSchema: GeneratePracticeTestInputSchema,
    outputSchema: GeneratePracticeTestOutputSchema,
  },
  async input => {
    const {output} = await studentPrompt(input);
    return output!;
  }
);

const generatePracticeTestForChildFlow = ai.defineFlow(
    {
        name: 'generatePracticeTestForChildFlow',
        inputSchema: GeneratePracticeTestForChildInputSchema,
        outputSchema: GeneratePracticeTestForChildOutputSchema,
    },
    async (input) => {
        const { output } = await parentPrompt(input);
        return output!;
    }
);

    