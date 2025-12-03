'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message as GenkitMessage } from 'genkit/messages';

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<GenkitMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    const newHistory: GenkitMessage[] = [...history, { role: 'user', content: [{ text: prompt }] }];
    setHistory(newHistory);
    setPrompt('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ history: newHistory, prompt }),
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
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button onClick={() => setIsOpen(!isOpen)} size="icon" className="rounded-full h-14 w-14 shadow-lg">
          <span className="material-symbols-outlined text-3xl">{isOpen ? 'close' : 'smart_toy'}</span>
        </Button>
      </div>

      {
        isOpen && (
          <div
            className="fixed bottom-24 right-6 z-50"
          >
            <Card className="w-[350px] h-[500px] flex flex-col shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="material-symbols-outlined">smart_toy</span>
                  Chatbot
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow p-0">
                <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {history.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <span className="material-symbols-outlined">smart_toy</span>}
                        <div
                          className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                           {Array.isArray(msg.content) && msg.content.map((c) => c.text).join('')}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-end gap-2">
                        <span className="material-symbols-outlined">smart_toy</span>
                        <div className="rounded-lg px-3 py-2 bg-muted flex items-center">
                          <span className="material-symbols-outlined text-muted-foreground animate-spin text-sm mr-2">progress_activity</span>
                           Thinking...
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
              <div className="p-4 border-t">
                <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                  <Input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Type your message..."
                    autoComplete="off"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading} size="icon">
                    <span className="material-symbols-outlined">send</span>
                  </Button>
                </form>
                {error && <p className="text-destructive text-xs mt-2 text-center">{error}</p>}
              </div>
            </Card>
          </div>
        )
      }
    </>
  );
}
