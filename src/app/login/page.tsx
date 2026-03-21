// app/login/page.tsx
import { Suspense } from 'react';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic'; // ← this helps avoid prerender issues on auth pages

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Suspense
        fallback={
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            Loading login form...
          </div>
        }
      >
        <LoginClient />
      </Suspense>
    </div>
  );
}
