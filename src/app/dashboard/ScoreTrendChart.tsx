"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Test = {
  id: string;
  score: number | null;
  createdAt: Date;
};

export default function ScoreTrendChart({ tests }: { tests: Test[] }) {
  const chartData = tests
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((test, index) => ({
      name: `Test ${index + 1}`,
      score: test.score || 0,
      date: new Date(test.createdAt).toLocaleDateString(),
    }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 200]} />
          <Tooltip 
            contentStyle={{ backgroundColor: "#1f2937", border: "none", color: "#fff" }}
            labelStyle={{ color: "#fff" }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#6366f1" 
            strokeWidth={4} 
            dot={{ fill: "#6366f1", r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
