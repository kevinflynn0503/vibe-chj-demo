/**
 * 饼图组件 - 展示分布数据
 */
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PieData {
  name: string;
  value: number;
  color: string;
}

interface PieChartCustomProps {
  data: PieData[];
  height?: number;
}

export function PieChartCustom({ data, height = 300 }: PieChartCustomProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value, percent }) => `${name}: ${value} (${((percent || 0) * 100).toFixed(1)}%)`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              const percent = ((data.value / total) * 100).toFixed(1);
              return (
                <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-slate-200">
                  <div className="font-semibold text-slate-900 mb-1">{data.name}</div>
                  <div className="text-sm text-slate-600">数量: {data.value.toLocaleString()}</div>
                  <div className="text-sm text-slate-600">占比: {percent}%</div>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
