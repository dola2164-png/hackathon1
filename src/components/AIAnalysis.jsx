import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getAQIColor } from "../data/aqiColors.js";

const SOURCE_COLORS = [
  "#3d7eff",
  "#00c8ff",
  "#a855f7",
  "#f59e0b",
  "#10b981",
];

export default function AIAnalysis({ analysis, isLoading, onAnalyse, cityData }) {
  const [advisoryLang, setAdvisoryLang] = useState("en");

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: 200,
          gap: 16,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid #252d45",
            borderTopColor: "#3d7eff",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: "#8899cc", fontSize: 13 }}>Analysing with Gemini AI…</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div style={{ padding: "16px 0" }}>
        <button
          onClick={onAnalyse}
          style={{
            width: "100%",
            padding: "14px 0",
            background: "linear-gradient(135deg, #3d7eff22, #00c8ff22)",
            border: "1px solid #3d7eff55",
            borderRadius: 10,
            color: "#3d7eff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #3d7eff33, #00c8ff33)";
            e.currentTarget.style.borderColor = "#3d7eff99";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #3d7eff22, #00c8ff22)";
            e.currentTarget.style.borderColor = "#3d7eff55";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
          </svg>
          Run AI Analysis
        </button>
        <p style={{ color: "#4a5680", fontSize: 11, textAlign: "center", marginTop: 8 }}>
          Powered by Gemini 2.0 Flash
        </p>
      </div>
    );
  }

  const aqiColor = getAQIColor(cityData?.aqi || 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Pollution Sources Bar Chart */}
      <div>
        <h4 style={{ color: "#8899cc", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
          Pollution Attribution
        </h4>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart
            data={analysis.sources}
            layout="vertical"
            margin={{ top: 0, right: 30, bottom: 0, left: 0 }}
          >
            <XAxis type="number" domain={[0, 100]} tick={{ fill: "#4a5680", fontSize: 10 }} unit="%" axisLine={false} tickLine={false} />
            <YAxis
              dataKey="category"
              type="category"
              width={110}
              tick={{ fill: "#8899cc", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.[0] ? (
                  <div style={{ background: "#161b2e", border: "1px solid #252d45", borderRadius: 8, padding: "8px 12px", maxWidth: 200 }}>
                    <p style={{ color: payload[0].color, fontWeight: 700, fontSize: 15, fontFamily: "JetBrains Mono, monospace" }}>
                      {payload[0].value}%
                    </p>
                    <p style={{ color: "#8899cc", fontSize: 11, marginTop: 4 }}>
                      {payload[0].payload.reason}
                    </p>
                  </div>
                ) : null
              }
            />
            <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
              {analysis.sources.map((_, i) => (
                <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Enforcement Actions */}
      <div>
        <h4 style={{ color: "#8899cc", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
          Enforcement Actions
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {analysis.actions.map((action, i) => (
            <div
              key={i}
              style={{
                background: "#0d1117",
                border: "1px solid #252d45",
                borderLeft: `3px solid ${SOURCE_COLORS[i]}`,
                borderRadius: "0 8px 8px 0",
                padding: "10px 12px",
              }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span
                  style={{
                    background: SOURCE_COLORS[i] + "22",
                    color: SOURCE_COLORS[i],
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: "JetBrains Mono, monospace",
                    padding: "2px 6px",
                    borderRadius: 4,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  P{action.priority}
                </span>
                <div>
                  <p style={{ color: "#e8edf8", fontSize: 13, lineHeight: 1.4 }}>{action.action}</p>
                  <p style={{ color: "#4a5680", fontSize: 11, marginTop: 4 }}>→ {action.impact}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 24h Forecast */}
      <div
        style={{
          background: "#0d1117",
          border: "1px solid #252d45",
          borderRadius: 8,
          padding: "10px 14px",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: 16 }}>🔮</span>
        <div>
          <p style={{ color: "#8899cc", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>24h Forecast</p>
          <p style={{ color: "#e8edf8", fontSize: 12, lineHeight: 1.5 }}>{analysis.forecast_24h}</p>
        </div>
      </div>

      {/* Health Risk */}
      <div
        style={{
          background: aqiColor + "11",
          border: `1px solid ${aqiColor}33`,
          borderRadius: 8,
          padding: "10px 14px",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: 16 }}>⚠️</span>
        <p style={{ color: "#e8edf8", fontSize: 12, lineHeight: 1.5 }}>{analysis.health_risk}</p>
      </div>

      {/* Citizen Advisory — bilingual toggle */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h4 style={{ color: "#8899cc", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Citizen Advisory
          </h4>
          <div
            style={{
              display: "flex",
              background: "#0d1117",
              border: "1px solid #252d45",
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            {["en", "hi"].map((lang) => (
              <button
                key={lang}
                onClick={() => setAdvisoryLang(lang)}
                style={{
                  padding: "4px 12px",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  background: advisoryLang === lang ? "#3d7eff" : "transparent",
                  color: advisoryLang === lang ? "#fff" : "#8899cc",
                  transition: "all 0.15s",
                }}
              >
                {lang === "en" ? "EN" : "हि"}
              </button>
            ))}
          </div>
        </div>
        <div
          style={{
            background: "#0d1117",
            border: "1px solid #252d45",
            borderRadius: 8,
            padding: "12px 14px",
          }}
        >
          <p
            style={{
              color: "#e8edf8",
              fontSize: 13,
              lineHeight: 1.7,
              fontFamily: advisoryLang === "hi" ? "'Noto Sans Devanagari', sans-serif" : "inherit",
            }}
          >
            {advisoryLang === "en" ? analysis.advisory_en : analysis.advisory_hi}
          </p>
        </div>
      </div>

      {/* Re-run button */}
      <button
        onClick={onAnalyse}
        style={{
          background: "transparent",
          border: "1px solid #252d45",
          borderRadius: 8,
          color: "#4a5680",
          fontSize: 12,
          padding: "8px",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3d7eff55"; e.currentTarget.style.color = "#8899cc"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#252d45"; e.currentTarget.style.color = "#4a5680"; }}
      >
        ↻ Re-run analysis
      </button>
    </div>
  );
}
