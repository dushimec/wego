'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message as GenkitMessage } from 'genkit/messages';

const chatFormSchema = z.object({
  prompt: z.string().min(1, 'Please enter a message.'),
});

type ChatFormValues = z.infer<typeof chatFormSchema>;

export default function ChatPage() {
  const [history, setHistory] = useState<GenkitMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<ChatFormValues>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: {
      prompt: '',
    },
  });

  async function onSubmit(data: ChatFormValues) {
    setIsLoading(true);
    setError(null);

    const newHistory = [...history, { role: 'user', content: [{ text: data.prompt }] }];
    setHistory(newHistory);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ history: newHistory, prompt: data.prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }

      const result = await response.json();
      const botMessage: GenkitMessage = {
        role: 'model',
        content: [{ text: result.response }],
      };

      setHistory([...newHistory, botMessage]);
      form.reset();
    } catch (e: any) {
      setError(e.message || 'Failed to get response. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [history]);

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col h-[80vh]">
      <div className="text-center mb-8">
        <span className="material-symbols-outlined text-5xl text-primary mb-4 mx-auto">smart_toy</span>
        <h1 className="text-4xl font-headline font-bold mb-2">Chatbot</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ask me anything! I can help you with car rentals and more.
        </p>
      </div>

      <Card className="flex-grow flex flex-col">
        <CardContent className="flex-grow p-0">
          <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
              {history.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'model' && <span className="material-symbols-outlined">smart_toy</span>}
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                      }`}>
                    {Array.isArray(msg.content) && msg.content.map((c, i) => c.text).join('')}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-2">
                  <span className="material-symbols-outlined">smart_toy</span>
                  <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                    <span className="material-symbols-outlined text-muted-foreground animate-spin mr-2">progress_activity</span>
                     Thinking...
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <div className="p-4 border-t">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 items-center">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input placeholder="Type your message..." {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} size="icon">
                <span className="material-symbols-outlined">send</span>
              </Button>
            </form>
          </Form>
          {error && <p className="text-destructive text-sm mt-2 text-center">{error}</p>}
        </div>
      </Card>
    </div>
  );
}
