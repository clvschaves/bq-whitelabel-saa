'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the shape of our Tenant
export interface Tenant {
    id: string;
    name: string;
    primaryColor: string;
    logoUrl?: string;
}

// Define the shape of our User
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    tenantId: string;
}

interface AuthContextType {
    user: User | null;
    tenant: Tenant | null;
    login: (userId: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const mockTenants: Record<string, Tenant> = {
    'tenant-1': {
        id: 'tenant-1',
        name: 'Acme Corp',
        primaryColor: '#3b82f6', // blue-500
    },
    'tenant-2': {
        id: 'tenant-2',
        name: 'Globex Inc',
        primaryColor: '#10b981', // emerald-500
    },
};

const mockUsers: Record<string, User> = {
    'user-1': {
        id: 'user-1',
        name: 'Alice Admin',
        email: 'alice@acme.com',
        role: 'admin',
        tenantId: 'tenant-1',
    },
    'user-2': {
        id: 'user-2',
        name: 'Bob User',
        email: 'bob@globex.com',
        role: 'user',
        tenantId: 'tenant-2',
    },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Simulate initial load / session check
    useEffect(() => {
        const storedUserId = localStorage.getItem('mock_user_id') || 'user-1'; // Default to user-1 for demo
        if (storedUserId && mockUsers[storedUserId]) {
            const foundUser = mockUsers[storedUserId];
            setUser(foundUser);
            setTenant(mockTenants[foundUser.tenantId] || null);
        }
        setIsLoading(false);
    }, []);

    // Update CSS variables when tenant changes
    useEffect(() => {
        if (tenant) {
            document.documentElement.style.setProperty('--tenant-primary', tenant.primaryColor);
        } else {
            document.documentElement.style.removeProperty('--tenant-primary');
        }
    }, [tenant]);

    const login = (userId: string) => {
        const foundUser = mockUsers[userId];
        if (foundUser) {
            setUser(foundUser);
            setTenant(mockTenants[foundUser.tenantId] || null);
            localStorage.setItem('mock_user_id', userId);
        }
    };

    const logout = () => {
        setUser(null);
        setTenant(null);
        localStorage.removeItem('mock_user_id');
    };

    return (
        <AuthContext.Provider value={{ user, tenant, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
