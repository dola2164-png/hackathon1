import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getAQIColor } from "../data/aqiColors.js";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const aqi = payload[0].value;
    return (
      <div
        style={{
          background: "#161b2e",
          border: "1px solid #252d45",
          borderRadius: 8,
          padding: "8px 12px",
        }}
      >
        <p style={{ color: "#8899cc", fontSize: 11, marginBottom: 2 }}>{label}</p>
        <p
          style={{
            color: getAQIColor(aqi),
            fontWeight: 700,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 16,
          }}
        >
          {aqi} <span style={{ fontSize: 11, fontWeight: 400 }}>AQI</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function ForecastChart({ history }) {
  if (!history || history.length === 0) return null;

  const avgAQI = Math.round(history.reduce((s, d) => s + d.aqi, 0) / history.length);
  const color = getAQIColor(avgAQI);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <span style={{ color: "#8899cc", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          7-Day Trend
        </span>
        <span
          style={{
            color,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          avg {avgAQI}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart data={history} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            tick={{ fill: "#4a5680", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide domain={["dataMin - 20", "dataMax + 20"]} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="aqi"
            stroke={color}
            strokeWidth={2}
            fill="url(#aqiGrad)"
            dot={{ fill: color, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: color, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
