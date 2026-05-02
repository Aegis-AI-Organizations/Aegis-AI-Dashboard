import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { css } from "styled-system/css";

interface UsageData {
  date: string;
  total_consumed: number;
}

interface Props {
  data: UsageData[];
}

export const BillingUsageChart: React.FC<Props> = ({ data }) => {
  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: format(parseISO(item.date), "dd MMM", { locale: fr }),
  }));

  return (
    <div className={css({ w: "full", h: "300px", mt: "4" })}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData}>
          <defs>
            <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--colors-brand-primary)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="var(--colors-brand-primary)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(255,255,255,0.05)"
          />
          <XAxis
            dataKey="formattedDate"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--colors-text-muted)", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--colors-text-muted)", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--colors-bg-card)",
              border: "1px solid var(--colors-white-alpha-100)",
              borderRadius: "8px",
              color: "#fff",
            }}
            itemStyle={{ color: "var(--colors-brand-primary)" }}
          />
          <Area
            type="monotone"
            dataKey="total_consumed"
            stroke="var(--colors-brand-primary)"
            fillOpacity={1}
            fill="url(#colorUsage)"
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
