import React from 'react';
import type { TableData } from '@/types/chat';

export function DataTable({ data }: { data: TableData }) {
    if (!data || !data.headers || !data.rows) {
        return null;
    }

    return (
        <div className="w-full rounded-md border bg-card overflow-x-auto">
            <table className="w-full text-sm text-left text-card-foreground">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                    <tr>
                        {data.headers.map((header, i) => (
                            <th key={i} scope="col" className="px-6 py-3 font-medium">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b last:border-0 hover:bg-muted/30">
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="px-6 py-4 whitespace-nowrap">
                                    {cell !== null && cell !== undefined ? String(cell) : '-'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
