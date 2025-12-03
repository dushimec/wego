import { NextRequest, NextResponse } from 'next/server';
import { run } from '@genkit-ai/flow';
import { chatbotFlow } from '@/ai/flows/chatbot-flow';
import { Message } from 'genkit/messages';

export async function POST(req: NextRequest) {
  const { history, prompt } = await req.json();

  const userMessage: Message = {
    role: 'user',
    content: [{ text: prompt }],
  };

  const messages: Message[] = [...(history || []), userMessage];

  try {
    // Note: The second argument to 'run' is passed as 'history' to the chatbotFlow's prompt
    const response = await run(chatbotFlow, messages);
    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Error running chatbot flow:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
