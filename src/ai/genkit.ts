import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI(apiKey: 'AIzaSyBVxAupeCOjNjmW1BG4L6lHyO1k21EAFQo')],
  model: 'googleai/gemini-2.5-flash',
});
