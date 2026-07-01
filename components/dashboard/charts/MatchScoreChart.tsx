"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export interface MatchScoreDataPoint {
  range: string;
  count: number;
}

interface MatchScoreChartProps {
  data?: MatchScoreDataPoint[];
}

const defaultMockData: MatchScoreDataPoint[] = [
  { range: "50-60%", count: 3 },
  { range: "60-70%", count: 8 },
  { range: "70-80%", count: 15 },
  { range: "80-90%", count: 22 },
  { range: "90-100%", count: 11 },
];

export default function MatchScoreChart({ data = defaultMockData }: MatchScoreChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-text-muted">
        No match score data available.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E7EAF3" vertical={false} />
          <XAxis
            dataKey="range"
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #E7EAF3",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#101828",
              boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
            }}
            cursor={{ fill: "rgba(16, 185, 129, 0.05)" }}
          />
          <Bar
            dataKey="count"
            fill="#10B981"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
