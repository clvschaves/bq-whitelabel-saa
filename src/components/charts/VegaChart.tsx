'use client';

import React from 'react';
// @ts-ignore - Ignoring React Vega type issues temporarily
import { VegaEmbed } from 'react-vega';
import type { VisualizationSpec } from 'vega-embed';

export interface VegaChartProps {
    spec: VisualizationSpec;
    data?: any;
}

export function VegaChart({ spec, data }: VegaChartProps) {
    // We can dynamically inject tenant colors into the vega config
    const customConfig = {
        ...spec.config,
        background: 'transparent',
        view: {
            stroke: 'transparent',
        },
        range: {
            category: ['#3b82f6', '#f43f5e', '#f59e0b', '#10b981', '#6366f1'] // Default theme colors
        }
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
