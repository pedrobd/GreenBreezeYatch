"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

const COLORS = ['#44C3B2', '#0A1F1C', '#82ca9d', '#ffc658'];
const STATUS_COLORS: Record<string, string> = {
    'Confirmado': '#44C3B2',
    'Pendente': '#f59e0b',
    'Cancelado': '#ef4444'
};

export function RevenueByBoatChart({ data }: { data: any[] }) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#0A1F1C" opacity={0.05} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#0A1F1C", opacity: 0.6, fontSize: 12, fontWeight: "500" }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#0A1F1C", opacity: 0.6, fontSize: 12, fontWeight: "500" }}
                        tickFormatter={(value) => `€${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            backdropFilter: "blur(8px)",
                            borderRadius: "16px",
                            border: "1px solid rgba(255, 255, 255, 0.5)",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                            color: "#0A1F1C",
                            fontWeight: "bold",
                        }}
                        cursor={{ fill: "rgba(10, 31, 28, 0.02)" }}
                        formatter={(value: any) => [`€${Number(value).toFixed(2)}`, 'Receita']}
                    />
                    <Bar dataKey="revenue" fill="#44C3B2" radius={[6, 6, 0, 0]} animationDuration={1500} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function StatusDistributionChart({ data }: { data: any[] }) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1500}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            backdropFilter: "blur(8px)",
                            borderRadius: "16px",
                            border: "1px solid rgba(255, 255, 255, 0.5)",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                            color: "#0A1F1C",
                            fontWeight: "bold",
                        }}
                        itemStyle={{ color: "#0A1F1C" }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-[#0A1F1C] font-medium text-sm ml-1">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export function TopInsightsList({ items, formatAsCurrency = false }: { items: { name: string, value: number }[], formatAsCurrency?: boolean }) {
    if (!items || items.length === 0) {
        return <div className="text-center py-6 text-sm text-muted-foreground font-body">Sem dados no período.</div>;
    }

    const max = Math.max(...items.map(i => i.value));

    return (
        <div className="space-y-4 w-full pt-2">
            {items.map((item, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-sm font-semibold text-[#0A1F1C] font-body">
                        <span className="truncate pr-4">{item.name}</span>
                        <span className="shrink-0 text-[#44C3B2]">
                            {formatAsCurrency
                                ? `€${item.value.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}`
                                : item.value}
                        </span>
                    </div>
                    <div className="h-2 w-full bg-[#0A1F1C]/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#44C3B2] rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${Math.max((item.value / max) * 100, 2)}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
