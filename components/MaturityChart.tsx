import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MaturityChartProps {
  data: Array<{ name: string; score: number }>;
}

const MaturityChart: React.FC<MaturityChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300} minHeight={256}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6}/>
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
        <XAxis dataKey="name" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', color: '#f5f5f5', borderRadius: '8px' }}
          itemStyle={{ color: '#fbbf24' }}
        />
        <Area type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MaturityChart;

