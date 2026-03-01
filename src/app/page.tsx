import { ChatInterface } from '@/components/chat/ChatInterface';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
export default async function Home() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return (
    <div className="h-full w-full p-4 lg:p-6">
      <ChatInterface />
    </div>
  );
}
