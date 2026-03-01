'use client';

import React from 'react';
// @ts-ignore - Ignoring React Vega type issues temporarily
import { VegaEmbed } from 'react-vega';
import type { VisualizationSpec } from 'vega-embed';
import { useAuth } from '@/lib/auth/AuthContext';

export interface VegaChartProps {
    spec: VisualizationSpec;
    data?: any;
}

export function VegaChart({ spec, data }: VegaChartProps) {
    const { tenant } = useAuth();

    // We can dynamically inject tenant colors into the vega config
    const customConfig = {
        ...spec.config,
        background: 'transparent',
        view: {
            stroke: 'transparent',
        },
        ...(tenant?.primaryColor && {
            range: {
                category: [tenant.primaryColor, '#f43f5e', '#f59e0b', '#10b981', '#6366f1']
            }
        })
    };

    const finalSpec: any = {
        ...spec,
        ...(data ? { data: { values: data } } : {}),
        config: customConfig,
        width: 'container', // Make it responsive
        height: 300,
    };

    return (
        <div className="w-full h-full min-h-[300px] overflow-hidden rounded-md border bg-card p-4">
            <VegaEmbed
                spec={finalSpec}
                className="w-full h-full object-contain"
            />
        </div>
    );
}
