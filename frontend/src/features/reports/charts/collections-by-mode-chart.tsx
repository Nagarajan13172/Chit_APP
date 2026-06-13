import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/format";
import type { CollectionsByMode } from "@/types/report";
import { CHART_COLORS } from "./chart-colors";

const MODE_LABEL: Record<CollectionsByMode["mode"], string> = {
  CASH: "Cash",
  UPI: "UPI",
  CHEQUE: "Cheque",
};

export function CollectionsByModeChart({ data }: { data: CollectionsByMode[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No collections in this range.
      </div>
    );
  }

  const chartData = data.map((d) => ({ name: MODE_LABEL[d.mode], value: d.amount }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
