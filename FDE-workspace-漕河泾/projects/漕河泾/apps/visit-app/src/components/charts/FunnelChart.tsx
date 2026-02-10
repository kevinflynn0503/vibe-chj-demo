/**
 * 漏斗图组件 - 展示转化流程
 * 使用 Recharts BarChart 模拟漏斗效果
 */
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';

interface FunnelData {
  stage: string;
  value: number;
  color: string;
}

interface FunnelChartProps {
  data: FunnelData[];
  height?: number;
}

export function FunnelChart({ data, height = 300 }: FunnelChartProps) {
  // 计算转化率
  const total = data[0]?.value || 1;
  const dataWithRate = data.map(d => ({
    ...d,
    rate: ((d.value / total) * 100).toFixed(2) + '%',
    displayValue: d.value.toLocaleString()
  }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={dataWithRate}
          layout="horizontal"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis type="category" dataKey="stage" />
          <YAxis type="number" />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-slate-200">
                    <div className="font-semibold text-slate-900 mb-1">{data.stage}</div>
                    <div className="text-sm text-slate-600">数量: {data.displayValue}</div>
                    <div className="text-sm text-slate-600">占比: {data.rate}</div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {dataWithRate.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* 文字标注 */}
      <div className="mt-4 flex justify-around">
        {dataWithRate.map((d, i) => (
          <div key={i} className="text-center">
            <div className="text-2xl font-bold" style={{ color: d.color }}>{d.displayValue}</div>
            <div className="text-xs text-slate-500 mt-1">{d.stage}</div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">{d.rate}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
