'use server';

/**
 * @fileOverview Implements real-time translation of text messages between users.
 *
 * - translateMessage - A function that translates a given text message from a source language to a target language.
 * - RealTimeTranslationInput - The input type for the translateMessage function.
 * - RealTimeTranslationOutput - The return type for the translateMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RealTimeTranslationInputSchema = z.object({
  text: z.string().describe('The text message to translate.'),
  sourceLanguage: z.string().describe('The language of the input text.'),
  targetLanguage: z.string().describe('The desired language for the output text.'),
});
export type RealTimeTranslationInput = z.infer<typeof RealTimeTranslationInputSchema>;

const RealTimeTranslationOutputSchema = z.object({
  translatedText: z.string().describe('The translated text message.'),
});
export type RealTimeTranslationOutput = z.infer<typeof RealTimeTranslationOutputSchema>;

export async function translateMessage(input: RealTimeTranslationInput): Promise<RealTimeTranslationOutput> {
  return realTimeTranslationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'realTimeTranslationPrompt',
  input: {schema: RealTimeTranslationInputSchema},
  output: {schema: RealTimeTranslationOutputSchema},
  prompt: `You are a translation expert.  You will translate the input text from the source language to the target language.  Respond ONLY with the translated text.

Source Language: {{{sourceLanguage}}}
Target Language: {{{targetLanguage}}}
Text to Translate: {{{text}}}`,
});

const realTimeTranslationFlow = ai.defineFlow(
  {
    name: 'realTimeTranslationFlow',
    inputSchema: RealTimeTranslationInputSchema,
    outputSchema: RealTimeTranslationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
