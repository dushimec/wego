'use server';
/**
 * @fileOverview A car image generation AI agent.
 *
 * - getCarImage - A function that handles the car image generation.
 * - CarImageInput - The input type for the getCarImage function.
 * - CarImageOutput - The return type for the getCarImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CarImageInputSchema = z.object({
  carName: z.string().describe('The name of the car.'),
  carType: z.string().describe('The type of car (e.g., sedan, SUV, compact).'),
  carDescription: z.string().describe('A brief description of the car.'),
});
export type CarImageInput = z.infer<typeof CarImageInputSchema>;

const CarImageOutputSchema = z.object({
    imageUrl: z.string().describe('The URL of the generated image.'),
});
export type CarImageOutput = z.infer<typeof CarImageOutputSchema>;

export async function getCarImage(input: CarImageInput): Promise<CarImageOutput> {
  return carImageFlow(input);
}

const carImageFlow = ai.defineFlow(
  {
    name: 'carImageFlow',
    inputSchema: CarImageInputSchema,
    outputSchema: CarImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Generate a photorealistic image of a car. The car is a ${input.carName}, which is a ${input.carType}. 
      The description is: "${input.carDescription}". 
      The image should be high-resolution, suitable for a website, with a clean background.
      The car should be the main focus of the image.`,
    });
    
    if (!media.url) {
      throw new Error('Image generation failed.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
