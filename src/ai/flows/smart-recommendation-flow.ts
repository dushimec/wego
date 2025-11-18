'use server';
/**
 * @fileOverview A smart car rental recommendation AI agent.
 *
 * - getSmartRecommendations - A function that handles the car rental recommendation process.
 * - SmartRecommendationsInput - The input type for the getSmartRecommendations function.
 * - SmartRecommendationsOutput - The return type for the getSmartRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartRecommendationsInputSchema = z.object({
  priceRange: z.string().describe('The desired price range for the car rental in RWF.'),
  carType: z.string().describe('The preferred type of car (e.g., sedan, SUV, compact).'),
  features: z.string().describe('Specific features the user is looking for (e.g., GPS, automatic transmission, air conditioning).'),
  purpose: z.string().describe('The purpose of car rental (e.g. business trip, family trip, vacation)'),
  location: z.string().describe('The location where the car rental is required, likely in Rwanda.'),
});
export type SmartRecommendationsInput = z.infer<typeof SmartRecommendationsInputSchema>;

const SmartRecommendationsOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      carName: z.string().describe('The name of the recommended car.'),
      rentalCompany: z.string().describe('The rental company offering the car.'),
      price: z.number().describe('The price per day of the rental in RWF.'),
      suitabilityScore: z.number().describe('A score indicating how well the car matches the user preferences (0-1).'),
      reasoning: z.string().describe('Explanation of why the car is recommended'),
    })
  ).describe('A list of car rental recommendations based on the user preferences.'),
});
export type SmartRecommendationsOutput = z.infer<typeof SmartRecommendationsOutputSchema>;

export async function getSmartRecommendations(input: SmartRecommendationsInput): Promise<SmartRecommendationsOutput> {
  return smartRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartRecommendationsPrompt',
  input: {schema: SmartRecommendationsInputSchema},
  output: {schema: SmartRecommendationsOutputSchema},
  prompt: `You are an AI assistant specialized in providing smart car rental recommendations for users in Rwanda.

  Based on the user's specified preferences, provide a list of car rental options that best match their needs.
  Consider the price range (in RWF), car type, desired features, and rental location within Rwanda.
  Explain the reasoning behind each recommendation and assign a suitability score.

  Preferences:
  - Price Range: {{{priceRange}}} RWF
  - Car Type: {{{carType}}}
  - Features: {{{features}}}
  - Purpose: {{{purpose}}}
  - Location: {{{location}}}

  Provide the recommendations in JSON format.
  Ensure that the suitabilityScore is between 0 and 1.
  `,
});

const smartRecommendationsFlow = ai.defineFlow(
  {
    name: 'smartRecommendationsFlow',
    inputSchema: SmartRecommendationsInputSchema,
    outputSchema: SmartRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
