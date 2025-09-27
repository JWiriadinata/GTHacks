'use server';

/**
 * @fileOverview An AI agent for intelligent language matching.
 *
 * - intelligentLanguageMatch - A function that handles the language matching process.
 * - IntelligentLanguageMatchInput - The input type for the intelligentLanguageMatch function.
 * - IntelligentLanguageMatchOutput - The return type for the intelligentLanguageMatch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentLanguageMatchInputSchema = z.object({
  nativeLanguage: z.string().describe('The native language of the user.'),
  learningLanguage: z.string().describe('The language the user wants to learn.'),
});
export type IntelligentLanguageMatchInput = z.infer<typeof IntelligentLanguageMatchInputSchema>;

const IntelligentLanguageMatchOutputSchema = z.object({
  matchFound: z.boolean().describe('Whether a suitable language partner has been found.'),
  partnerNativeLanguage: z.string().describe('The native language of the matched partner.'),
  partnerLearningLanguage: z.string().describe('The language the matched partner wants to learn.'),
  reason: z.string().describe('The reason why this partner was matched with the user.'),
});
export type IntelligentLanguageMatchOutput = z.infer<typeof IntelligentLanguageMatchOutputSchema>;

export async function intelligentLanguageMatch(input: IntelligentLanguageMatchInput): Promise<IntelligentLanguageMatchOutput> {
  return intelligentLanguageMatchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentLanguageMatchPrompt',
  input: {schema: IntelligentLanguageMatchInputSchema},
  output: {schema: IntelligentLanguageMatchOutputSchema},
  prompt: `You are an expert in language exchange matchmaking.

You will receive information about a user's native language and the language they want to learn. Your task is to determine if a suitable language partner can be found based on complementary language learning goals. In other words, the user wants to learn the language that their partner is fluent in and vice versa.

Consider the following user:

Native Language: {{{nativeLanguage}}}
Learning Language: {{{learningLanguage}}}

Based on this information, determine if a match can be found. If a match is found, specify the partner's native language, the language they want to learn, and the reason for the match. If no match is found, indicate that no match was found and provide a reason.

Output a JSON object with the following format:
{
  "matchFound": true/false,
  "partnerNativeLanguage": "language", // If matchFound is true
  "partnerLearningLanguage": "language", // If matchFound is true
  "reason": "Explanation for the match or why no match was found." // A brief explanation
}
`,
});

const intelligentLanguageMatchFlow = ai.defineFlow(
  {
    name: 'intelligentLanguageMatchFlow',
    inputSchema: IntelligentLanguageMatchInputSchema,
    outputSchema: IntelligentLanguageMatchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
