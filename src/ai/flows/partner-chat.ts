'use server';

/**
 * @fileOverview A conversational AI agent for language practice.
 *
 * - partnerChat - A function that generates a response from the AI partner.
 * - PartnerChatInput - The input type for the partnerChat function.
 * - PartnerChatOutput - The return type for the partnerChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PartnerChatInputSchema = z.object({
  nativeLanguage: z.string().describe('The native language of the user.'),
  learningLanguage: z.string().describe('The language the user is learning and the partner should speak.'),
  messageHistory: z.string().describe('The history of the conversation so far.'),
});
export type PartnerChatInput = z.infer<typeof PartnerChatInputSchema>;

const PartnerChatOutputSchema = z.object({
  response: z.string().describe('The AI partner\'s response in the conversation.'),
});
export type PartnerChatOutput = z.infer<typeof PartnerChatOutputSchema>;

export async function partnerChat(input: PartnerChatInput): Promise<PartnerChatOutput> {
  return partnerChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'partnerChatPrompt',
  input: {schema: PartnerChatInputSchema},
  output: {schema: PartnerChatOutputSchema},
  prompt: `You are a friendly and encouraging language practice partner. Your native language is {{{learningLanguage}}}.
The user's native language is {{{nativeLanguage}}}.
You are having a conversation with a user who is learning your language.
Behave like a real person having a natural conversation. Keep your responses concise and friendly.
ALWAYS respond in {{{learningLanguage}}}. Do not use English or {{{nativeLanguage}}} unless it is the same as {{{learningLanguage}}}.
If the conversation history is empty, start the conversation by greeting the user in {{{learningLanguage}}}.

Here is the conversation history (prefixed with "User:" or "Partner:"):
{{{messageHistory}}}

Your turn to speak.`,
});

const partnerChatFlow = ai.defineFlow(
  {
    name: 'partnerChatFlow',
    inputSchema: PartnerChatInputSchema,
    outputSchema: PartnerChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
