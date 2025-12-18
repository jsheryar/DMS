'use server';
/**
 * @fileOverview An AI flow for drafting an email to forward a document.
 *
 * - forwardDocument - A function that handles the email drafting process.
 * - ForwardDocumentInput - The input type for the forwardDocument function.
 * - ForwardDocumentOutput - The return type for the forwardDocument function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ForwardDocumentInputSchema = z.object({
  documentTitle: z.string().describe('The title of the document being forwarded.'),
  documentDescription: z.string().describe('The description of the document.'),
  recipientEmail: z.string().email().describe("The recipient's email address."),
  senderMessage: z.string().optional().describe('An optional message from the sender to include in the email body.'),
});
export type ForwardDocumentInput = z.infer<typeof ForwardDocumentInputSchema>;

const ForwardDocumentOutputSchema = z.object({
  emailBody: z.string().describe('The generated email body, ready to be sent.'),
});
export type ForwardDocumentOutput = z.infer<typeof ForwardDocumentOutputSchema>;

export async function forwardDocument(input: ForwardDocumentInput): Promise<ForwardDocumentOutput> {
  return forwardDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'forwardDocumentPrompt',
  input: { schema: ForwardDocumentInputSchema },
  output: { schema: ForwardDocumentOutputSchema },
  prompt: `You are an AI assistant tasked with drafting a professional email to forward a document.

The user wants to forward the following document:
- Title: {{{documentTitle}}}
- Description: {{{documentDescription}}}

The email will be sent to: {{{recipientEmail}}}

{{#if senderMessage}}
The user has included the following message:
"{{{senderMessage}}}"
{{/if}}

Please generate a clear and concise email body.
- Start with a polite greeting.
- State that a document is being forwarded.
- Include the document's title and description.
{{#if senderMessage}}
- Incorporate the sender's message naturally.
{{/if}}
- End with a professional closing.
- Do not include a subject line, only generate the body of the email.
`,
});

const forwardDocumentFlow = ai.defineFlow(
  {
    name: 'forwardDocumentFlow',
    inputSchema: ForwardDocumentInputSchema,
    outputSchema: ForwardDocumentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
