/**
 * 柱状图组件 - 展示对比数据
 */
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BarData {
  name: string;
  value: number;
  color?: string;
}

interface BarChartCustomProps {
  data: BarData[];
  height?: number;
  color?: string;
}

export function BarChartCustom({ data, height = 300, color = 'var(--color-data-blue)' }: BarChartCustomProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200)" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-surface-card px-4 py-3 rounded-lg shadow-lg border border-line">
                  <div className="font-semibold text-text-primary mb-1">{data.name}</div>
                  <div className="text-sm text-text-secondary">数量: {data.value.toLocaleString()}</div>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
