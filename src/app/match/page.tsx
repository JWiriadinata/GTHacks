'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { languages } from '@/lib/languages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { intelligentLanguageMatch, type IntelligentLanguageMatchOutput } from '@/ai/flows/intelligent-language-match';
import { Loader2, Zap } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

const FormSchema = z
  .object({
    nativeLanguage: z.string({ required_error: 'Please select your native language.' }),
    learningLanguage: z.string({ required_error: 'Please select a language to learn.' }),
  })
  .refine(data => data.nativeLanguage !== data.learningLanguage, {
    message: "Languages can't be the same.",
    path: ['learningLanguage'],
  });

type Step = 'select' | 'matching' | 'matched' | 'searching';

export default function MatchPage() {
  const [step, setStep] = useState<Step>('select');
  const [matchResult, setMatchResult] = useState<IntelligentLanguageMatchOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setStep('matching');
    setError(null);
    try {
      const nativeLangName = languages.find(l => l.code === data.nativeLanguage)?.name || data.nativeLanguage;
      const learningLangName = languages.find(l => l.code === data.learningLanguage)?.name || data.learningLanguage;

      const result = await intelligentLanguageMatch({
        nativeLanguage: nativeLangName,
        learningLanguage: learningLangName,
      });

      if (result.matchFound) {
        setMatchResult(result);
        setStep('matched');
        setTimeout(() => {
          setStep('searching');
          setTimeout(() => {
            const partnerNativeCode = languages.find(l => l.name === result.partnerNativeLanguage)?.code || 'en';
            const partnerLearningCode = languages.find(l => l.name === result.partnerLearningLanguage)?.code || 'es';
            router.push(
              `/chat?native=${data.nativeLanguage}&learning=${data.learningLanguage}&partnerNative=${partnerNativeCode}&partnerLearning=${partnerLearningCode}`
            );
          }, 2000);
        }, 3000);
      } else {
        setError(result.reason || "We couldn't find a suitable partner at this moment. Please try again later.");
        setStep('select');
      }
    } catch (e) {
      console.error(e);
      setError('An unexpected error occurred during matchmaking.');
      setStep('select');
    }
  }

  const renderContent = () => {
    switch (step) {
      case 'matching':
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-semibold">Analyzing your profile...</p>
            <p className="text-muted-foreground">Our AI is finding the perfect language partner for you.</p>
          </div>
        );
      case 'matched':
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Zap className="h-12 w-12 text-accent" />
            <p className="text-2xl font-bold">Match Found!</p>
            {matchResult && <p className="text-muted-foreground max-w-sm">{matchResult.reason}</p>}
          </div>
        );
      case 'searching':
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-semibold">Connecting you to your partner...</p>
            <p className="text-muted-foreground">Your session will begin shortly.</p>
          </div>
        );
      case 'select':
      default:
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Find Your Language Partner</CardTitle>
              <CardDescription>Select your languages to get started.</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertTitle>Matchmaking Failed</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <FormField
                    control={form.control}
                    name="nativeLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>I speak...</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your native language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages.map(lang => (
                              <SelectItem key={lang.code} value={lang.code}>
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="learningLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>I want to learn...</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a language to practice" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages.map(lang => (
                              <SelectItem key={lang.code} value={lang.code}>
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Find a Partner
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        );
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="absolute top-6 left-6">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <div className="flex-grow flex items-center justify-center w-full">{renderContent()}</div>
    </main>
  );
}
