"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export interface JobsFoundDataPoint {
  day: string;
  count: number;
}

interface JobsFoundChartProps {
  data?: JobsFoundDataPoint[];
}

const defaultMockData: JobsFoundDataPoint[] = [
  { day: "Mon", count: 12 },
  { day: "Tue", count: 18 },
  { day: "Wed", count: 8 },
  { day: "Thu", count: 24 },
  { day: "Fri", count: 15 },
  { day: "Sat", count: 5 },
  { day: "Sun", count: 7 },
];

export default function JobsFoundChart({ data = defaultMockData }: JobsFoundChartProps) {
  const totalCount = data?.reduce((sum, item) => sum + item.count, 0) || 0;

  if (!data || data.length === 0 || totalCount === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-text-muted">
        No job discovery data available.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="jobsFoundGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0.0} />
            </linearGradient>
          </defs>
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
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#7C5CFC"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#jobsFoundGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
