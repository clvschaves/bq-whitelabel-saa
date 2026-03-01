'use client';

import * as React from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { createClient } from '@/lib/supabase/client';
import { LogOut, MessageSquare, Settings, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logout } from '@/app/actions/auth';

export function AppShell({ children }: { children: React.ReactNode }) {
    const [email, setEmail] = React.useState<string | null>(null);
    const router = useRouter();

    React.useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setEmail(user.email ?? null);
            }
        });
    }, []);

    const handleLogout = async () => {
        await logout(); // Server action handles clearing cookie and redirecting
    };

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full bg-background overflow-hidden">
                <Sidebar>
                    <SidebarHeader className="border-b p-4">
                        <div className="flex items-center gap-2">
                            <div
                                className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground font-bold"
                            >
                                B
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">Your Workspace</span>
                                <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                    {email || 'Loading...'}
                                </span>
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarMenu className="mt-4 px-2">
                            <SidebarMenuItem>
                                <SidebarMenuButton isActive>
                                    <MessageSquare />
                                    <span>Insights Chat</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <Database />
                                    <span>Data Sources</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <Settings />
                                    <span>Settings</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>

                    <SidebarFooter className="border-t p-2">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                                    <LogOut />
                                    <span>Log out</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>

                <main className="flex-1 flex flex-col h-full overflow-hidden">
                    <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 lg:px-6">
                        <SidebarTrigger />
                        <div className="flex-1 font-semibold text-lg">
                            Data Insights
                        </div>
                    </header>

                    <div className="flex-1 relative bg-muted/20">
                        <div className="absolute inset-0 pb-4">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
