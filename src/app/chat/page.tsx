import { Suspense } from 'react';
import ChatClient from './chat-client';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">Loading Chat...</p>
        </div>
      }
    >
      <ChatClient />
    </Suspense>
  );
}
