'use client';

import { AuthProvider, useAuth } from '@/lib/auth/AuthContext';
import { TenantSelector } from '@/components/layout/TenantSelector';
import { AppShell } from '@/components/layout/AppShell';
import { ChatInterface } from '@/components/chat/ChatInterface';

// Inner component that actually uses the wrapper
function MainApp() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <TenantSelector />;
  }

  return (
    <AppShell>
      <div className="h-full w-full p-4 lg:p-6">
        <ChatInterface />
      </div>
    </AppShell>
  );
}

// Default export wrapping the AuthProvider
export default function Home() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
