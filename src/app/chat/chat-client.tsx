'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Languages, Loader2, LogOut, Send, VideoOff } from 'lucide-react';
import { format } from 'date-fns';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { languages } from '@/lib/languages';
import { translateMessage } from '@/ai/flows/real-time-translation';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'partner';
  timestamp: Date;
};

type Translation = {
  text: string;
  loading: boolean;
};

const partnerMessages = [
  { text: 'Hola, ¿cómo estás?', delay: 2000 },
  { text: 'Estoy bien, gracias. ¿Y tú? ¿Qué te trae por aquí?', delay: 5000 },
  { text: '¡Genial! Me encanta hablar sobre películas. ¿Has visto alguna buena últimamente?', delay: 6000 },
  { text: 'Oh, no la he visto. "La Casa de Papel" es una serie, ¿verdad? Es muy popular.', delay: 8000 },
  { text: 'Entiendo. Mi película favorita es "El Laberinto del Fauno". Es una fantasía oscura muy hermosa.', delay: 7000 },
];

export default function ChatClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [translations, setTranslations] = useState<Record<number, Translation>>({});
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [partnerLeft, setPartnerLeft] = useState(false);

  const nativeLangCode = searchParams.get('native') || 'en';
  const learningLangCode = searchParams.get('learning') || 'es';
  const nativeLang = languages.find(l => l.code === nativeLangCode)?.name || 'English';
  const learningLang = languages.find(l => l.code === learningLangCode)?.name || 'Spanish';

  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');
  const partnerAvatar = PlaceHolderImages.find(p => p.id === 'partner-avatar');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isPartnerTyping]);

  useEffect(() => {
    // Simulate partner messages
    let messageIndex = 0;
    const timeouts: NodeJS.Timeout[] = [];

    const scheduleNextMessage = () => {
      if (messageIndex < partnerMessages.length) {
        const { text, delay } = partnerMessages[messageIndex];
        const t1 = setTimeout(() => {
          setIsPartnerTyping(true);
          const t2 = setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now(), text, sender: 'partner', timestamp: new Date() }]);
            setIsPartnerTyping(false);
            messageIndex++;
            scheduleNextMessage();
          }, 1500); // typing duration
          timeouts.push(t2);
        }, delay);
        timeouts.push(t1);
      }
    };
    scheduleNextMessage();

    // Simulate partner leaving
    const leaveTimeout = setTimeout(() => {
      setPartnerLeft(true);
    }, 60000); // Partner leaves after 1 minute
    timeouts.push(leaveTimeout);

    return () => timeouts.forEach(clearTimeout);
  }, []);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages(prev => [...prev, { id: Date.now(), text: inputValue, sender: 'user', timestamp: new Date() }]);
      setInputValue('');
    }
  };

  const handleTranslate = async (message: Message) => {
    if (translations[message.id]?.text) return; // Already translated

    setTranslations(prev => ({ ...prev, [message.id]: { text: '', loading: true } }));

    try {
      const result = await translateMessage({
        text: message.text,
        sourceLanguage: learningLang,
        targetLanguage: nativeLang,
      });
      setTranslations(prev => ({ ...prev, [message.id]: { text: result.translatedText, loading: false } }));
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Translation Failed',
        description: 'Could not translate the message at this time.',
      });
      setTranslations(prev => {
        const newTranslations = { ...prev };
        delete newTranslations[message.id];
        return newTranslations;
      });
    }
  };

  const handleEndChat = () => {
    router.push('/match');
  };

  return (
    <div className="flex h-screen w-full bg-background font-body">
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b p-4 shrink-0">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-semibold">Chatting with a {learningLang} speaker</p>
              <p className="text-sm text-muted-foreground">You are learning {learningLang}</p>
            </div>
            <Button variant="outline" onClick={handleEndChat}>
              <LogOut className="mr-2 h-4 w-4" /> End Chat
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <div className="grid h-full grid-cols-1 md:grid-cols-3">
            <div className="md:col-span-2 flex flex-col h-full">
              <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
                <div className="space-y-6">
                  {messages.map(msg => (
                    <div key={msg.id} className={cn('flex items-end gap-3', { 'justify-end': msg.sender === 'user' })}>
                      {msg.sender === 'partner' && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={partnerAvatar?.imageUrl} alt="Partner" data-ai-hint={partnerAvatar?.imageHint} />
                          <AvatarFallback>{learningLang.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn('max-w-xs lg:max-w-md rounded-lg p-3 shadow-sm', {
                          'bg-card rounded-bl-none': msg.sender === 'partner',
                          'bg-primary text-primary-foreground rounded-br-none': msg.sender === 'user',
                        })}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className="mt-1 text-xs opacity-70 text-right">{format(msg.timestamp, 'p')}</p>
                        {msg.sender === 'partner' && (
                          <div className="mt-2 border-t border-border/20 pt-2">
                            {translations[msg.id]?.loading ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : translations[msg.id]?.text ? (
                              <p className="text-sm italic">{translations[msg.id].text}</p>
                            ) : (
                              <Button variant="ghost" size="sm" className="-ml-2 h-auto p-1 text-xs" onClick={() => handleTranslate(msg)} disabled={partnerLeft}>
                                <Languages className="mr-1 h-3 w-3" /> Translate
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      {msg.sender === 'user' && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={userAvatar?.imageUrl} alt="You" data-ai-hint={userAvatar?.imageHint} />
                          <AvatarFallback>Y</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isPartnerTyping && (
                    <div className="flex items-end gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={partnerAvatar?.imageUrl} alt="Partner" />
                        <AvatarFallback>P</AvatarFallback>
                      </Avatar>
                      <div className="max-w-xs lg:max-w-md rounded-lg p-3 bg-card rounded-bl-none shadow-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse [animation-delay:0s]"></span>
                          <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse [animation-delay:0.2s]"></span>
                          <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse [animation-delay:0.4s]"></span>
                        </div>
                      </div>
                    </div>
                  )}
                  {partnerLeft && (
                    <Alert className="bg-accent/20 border-accent/50 text-accent-foreground">
                      <AlertTriangle className="h-4 w-4 !text-accent-foreground" />
                      <AlertTitle>Partner has left</AlertTitle>
                      <AlertDescription>Your practice partner has disconnected. You can find a new partner from the matchmaking page.</AlertDescription>
                    </Alert>
                  )}
                </div>
              </ScrollArea>
              <div className="border-t p-4 bg-card/50">
                <div className="relative">
                  <Textarea
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={partnerLeft ? 'Your partner has left the chat.' : 'Type your message...'}
                    className="pr-20"
                    disabled={partnerLeft}
                  />
                  <Button type="submit" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={handleSendMessage} disabled={!inputValue.trim() || partnerLeft}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="hidden md:flex flex-col border-l">
              <Card className="m-6 flex-1 flex flex-col items-center justify-center text-center bg-card/50 border-dashed">
                <CardHeader>
                  <CardTitle>Video Chat</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                  <VideoOff className="h-16 w-16" />
                  <p>Video streaming is not available in this demo.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
