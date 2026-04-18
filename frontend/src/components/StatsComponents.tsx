import React from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card p-6 flex items-center justify-between overflow-hidden relative"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 -mr-10 -mt-10 rounded-full ${color}`} />
    <div className="relative z-10">
      <div className="font-micro mb-1 opacity-60 uppercase tracking-widest text-[10px]">{label}</div>
      <div className="text-3xl font-bold font-headline text-text-main">{value}</div>
    </div>
    <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 ${color.replace('bg-', 'text-')}`}>
      {icon}
    </div>
  </motion.div>
);

export const PerformanceAreaChart: React.FC<{ data: any[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center opacity-30">
        <p className="font-micro">Insufficient history data to map trends.</p>
      </div>
    );
  }

  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
            minTickGap={30}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(15, 15, 25, 0.95)', 
              borderRadius: '12px', 
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif'
            }}
            itemStyle={{ color: '#8b5cf6' }}
          />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#8b5cf6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorScore)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TopicAnalysisChart: React.FC<{ data: any[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" hide domain={[0, 100]} />
          <YAxis 
            dataKey="topic" 
            type="category" 
            width={120}
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
            contentStyle={{ 
              backgroundColor: 'rgba(15, 15, 25, 0.95)', 
              borderRadius: '12px', 
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              fontSize: '12px'
            }}
          />
          <Bar dataKey="avgScore" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8b5cf6' : '#06b6d4'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
