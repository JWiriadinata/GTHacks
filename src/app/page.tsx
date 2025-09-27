import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center p-8 bg-background">
      <div className="flex flex-col items-center justify-center gap-8 text-center max-w-2xl">
        <Logo />
        <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl font-headline">
          Speak with confidence. Connect with the world.
        </h2>
        <p className="text-lg text-muted-foreground">
          ConnexUs instantly connects you with native speakers for real-time language practice. No accounts, no waiting. Just leap into conversation.
        </p>
        <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-accent">
          <Link href="/match">
            Start Your Language Journey <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </main>
  );
}
