// src/app/test/page.tsx
import { Suspense } from 'react';
import TestClient from './TestClient';

export const dynamic = 'force-dynamic';

export default function TestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent animate-spin rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    }>
      <TestClient />
    </Suspense>
  );
}
