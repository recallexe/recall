"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { chartData } from "@/app/lib/data";


const chartConfig = {
  performance: {
    label: "Performance",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function Chart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] max-h-[300px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip
          content={<ChartTooltipContent />}
          formatter={(value: number, name: string) => [`${name} - ${value} `]}
        />
        <Bar dataKey="performance" fill="var(--color-performance)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
