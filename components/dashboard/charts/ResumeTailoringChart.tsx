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

export interface ResumeTailoringDataPoint {
  day: string;
  count: number;
}

interface ResumeTailoringChartProps {
  data?: ResumeTailoringDataPoint[];
}

const defaultMockData: ResumeTailoringDataPoint[] = [
  { day: "Mon", count: 2 },
  { day: "Tue", count: 4 },
  { day: "Wed", count: 1 },
  { day: "Thu", count: 5 },
  { day: "Fri", count: 3 },
  { day: "Sat", count: 0 },
  { day: "Sun", count: 1 },
];

export default function ResumeTailoringChart({ data = defaultMockData }: ResumeTailoringChartProps) {
  const totalCount = data?.reduce((sum, item) => sum + item.count, 0) || 0;

  // Check if data is empty
  if (!data || data.length === 0 || totalCount === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-text-muted">
        No tailoring activity recorded.
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
            dataKey="day"
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
            cursor={{ fill: "rgba(97, 168, 255, 0.05)" }}
          />
          <Bar
            dataKey="count"
            fill="#61A8FF"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
