"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";

interface RevenueChartProps {
    data: {
        date: string;
        amount: number;
    }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 10,
                        left: 10,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#44C3B2" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#44C3B2" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#0A1F1C" opacity={0.05} />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#0A1F1C", opacity: 0.4, fontSize: 10, fontWeight: "bold" }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#0A1F1C", opacity: 0.4, fontSize: 10, fontWeight: "bold" }}
                        tickFormatter={(value) => `€${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(8px)",
                            borderRadius: "16px",
                            border: "1px solid rgba(255, 255, 255, 0.5)",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                            color: "#0A1F1C",
                            fontWeight: "bold",
                            fontSize: "12px",
                        }}
                        itemStyle={{ color: "#44C3B2" }}
                        cursor={{ stroke: "#44C3B2", strokeWidth: 2, strokeDasharray: "5 5" }}
                    />
                    <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#44C3B2"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        animationDuration={2000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
