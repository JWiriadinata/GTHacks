'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Languages, Loader2, LogOut, Send, Video, VideoOff } from 'lucide-react';
import { format } from 'date-fns';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { languages } from '@/lib/languages';
import { translateMessage } from '@/ai/flows/real-time-translation';
import { partnerChat } from '@/ai/flows/partner-chat';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>();

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      // Using `setTimeout` to allow the DOM to update before scrolling
      setTimeout(() => {
        scrollArea.scrollTo({ top: scrollArea.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isPartnerTyping]);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();
  }, [toast]);

  const getPartnerResponse = async (currentMessages: Message[]) => {
    setIsPartnerTyping(true);
    const messageHistory = currentMessages
      .map(m => `${m.sender === 'user' ? 'User' : 'Partner'}: ${m.text}`)
      .join('\n');

    try {
      const result = await partnerChat({
        nativeLanguage: nativeLang,
        learningLanguage: learningLang,
        messageHistory,
      });

      const newPartnerMessage: Message = {
        id: Date.now(),
        text: result.response,
        sender: 'partner',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newPartnerMessage]);
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'AI Partner Error',
        description: 'Could not get a response from the partner at this time.',
      });
    } finally {
      setIsPartnerTyping(false);
    }
  };

  useEffect(() => {
    // Initial message from partner
    getPartnerResponse([]);

    // Simulate partner leaving
    const leaveTimeout = setTimeout(() => {
      setPartnerLeft(true);
    }, 60000); // Partner leaves after 1 minute
    return () => clearTimeout(leaveTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const newUserMessage: Message = {
        id: Date.now(),
        text: inputValue,
        sender: 'user',
        timestamp: new Date(),
      };
      const newMessages = [...messages, newUserMessage];
      setMessages(newMessages);
      setInputValue('');
      await getPartnerResponse(newMessages);
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
    <div className="flex h-screen w-full flex-col bg-background font-body">
      <header className="flex shrink-0 items-center justify-between border-b p-4">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="font-semibold">Chatting with a {learningLang} speaker</p>
            <p className="text-sm text-muted-foreground">You are learning {learningLang}</p>
          </div>
          <Button variant="outline" onClick={handleEndChat}>
            <LogOut className="mr-2 h-4 w-4" /> End Chat
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="flex h-full flex-col items-center justify-center space-y-4 p-4">
              <Card className="relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden border-dashed bg-card/50 text-center">
                <CardHeader>
                  <CardTitle>Partner's Video</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                  <VideoOff className="h-16 w-16" />
                  <p>Your partner's video is off</p>
                </CardContent>
              </Card>
              <div className="relative aspect-video w-full">
                <video ref={videoRef} className="aspect-video w-full rounded-md bg-muted" autoPlay muted />
                {hasCameraPermission === false && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-md bg-black/50 p-4 text-white">
                    <VideoOff className="mb-2 h-10 w-10" />
                    <p className="text-center font-semibold">Camera Access Required</p>
                    <p className="text-center text-sm">Please allow camera access to use video chat.</p>
                  </div>
                )}
                {hasCameraPermission === undefined && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-md bg-black/50 p-4 text-white">
                    <Loader2 className="h-10 w-10 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70}>
            <div className="flex h-full flex-col">
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
                        className={cn('max-w-xs rounded-lg p-3 shadow-sm lg:max-w-md', {
                          'rounded-bl-none bg-card': msg.sender === 'partner',
                          'rounded-br-none bg-primary text-primary-foreground': msg.sender === 'user',
                        })}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className="mt-1 text-right text-xs opacity-70">{format(msg.timestamp, 'p')}</p>
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
                      <div className="max-w-xs rounded-lg bg-card p-3 shadow-sm lg:max-w-md rounded-bl-none">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:0s]"></span>
                          <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.2s]"></span>
                          <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.4s]"></span>
                        </div>
                      </div>
                    </div>
                  )}
                  {partnerLeft && (
                    <Alert className="border-accent/50 bg-accent/20 text-accent-foreground">
                      <AlertTriangle className="h-4 w-4 !text-accent-foreground" />
                      <AlertTitle>Partner has left</AlertTitle>
                      <AlertDescription>Your practice partner has disconnected. You can find a new partner from the matchmaking page.</AlertDescription>
                    </Alert>
                  )}
                </div>
              </ScrollArea>
              <div className="border-t bg-card/50 p-4">
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
                    disabled={partnerLeft || isPartnerTyping}
                  />
                  <Button type="submit" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={handleSendMessage} disabled={!inputValue.trim() || partnerLeft || isPartnerTyping}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
}
