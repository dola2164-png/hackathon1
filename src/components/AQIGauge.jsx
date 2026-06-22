import React from "react";
import { getAQILevel, getAQIGlow } from "../data/aqiColors.js";


export default function AQIGauge({ aqi, city, isFallback }) {
  const level = getAQILevel(aqi);
  const glow = getAQIGlow(aqi);

  // Arc calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const maxAQI = 500;
  const progress = Math.min(aqi / maxAQI, 1);
  const dashOffset = circumference * (1 - progress * 0.75); // 75% arc

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 0 16px",
      }}
    >
      <div style={{ position: "relative", width: 140, height: 140 }}>
        <svg
          width="140"
          height="140"
          viewBox="0 0 140 140"
          style={{ transform: "rotate(135deg)" }}
        >
          {/* Background track */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#252d45"
            strokeWidth="10"
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={level.color}
            strokeWidth="10"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)",
              filter: `drop-shadow(0 0 6px ${level.color})`,
            }}
          />
        </svg>
        {/* Center AQI number */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 38,
              fontWeight: 700,
              fontFamily: "JetBrains Mono, monospace",
              color: level.color,
              lineHeight: 1,
              textShadow: glow,
            }}
          >
            {aqi}
          </span>
          <span
            style={{
              fontSize: 10,
              color: "#8899cc",
              marginTop: 2,
              letterSpacing: "0.05em",
            }}
          >
            AQI
          </span>
        </div>
      </div>

      {/* Level badge */}
      <div
        style={{
          background: level.bg,
          border: `1px solid ${level.color}44`,
          borderRadius: 20,
          padding: "4px 16px",
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: level.color,
            boxShadow: `0 0 6px ${level.color}`,
          }}
        />
        <span style={{ color: level.color, fontWeight: 600, fontSize: 13 }}>
          {level.label}
        </span>
      </div>

      <p
        style={{
          color: "#8899cc",
          fontSize: 11,
          marginTop: 6,
          textAlign: "center",
          maxWidth: 180,
        }}
      >
        {level.description}
      </p>

      {isFallback && (
        <span
          style={{
            fontSize: 10,
            color: "#4a5680",
            background: "#161b2e",
            border: "1px solid #252d45",
            borderRadius: 4,
            padding: "2px 8px",
            marginTop: 6,
          }}
        >
          Estimated data
        </span>
      )}
    </div>
  );
}
