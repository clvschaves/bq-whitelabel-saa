'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function TenantSelector() {
    const { login } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <CardTitle>Welcome to Data Insights</CardTitle>
                    <CardDescription>Select a mock user to continue.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <Button
                        variant="outline"
                        className="flex justify-between items-center h-14"
                        onClick={() => login('user-1')}
                    >
                        <div className="flex flex-col items-start gap-1">
                            <span className="font-semibold">Alice Admin</span>
                            <span className="text-xs text-muted-foreground">Tenant: Acme Corp (Blue)</span>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        className="flex justify-between items-center h-14"
                        onClick={() => login('user-2')}
                    >
                        <div className="flex flex-col items-start gap-1">
                            <span className="font-semibold">Bob User</span>
                            <span className="text-xs text-muted-foreground">Tenant: Globex Inc (Emerald)</span>
                        </div>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
