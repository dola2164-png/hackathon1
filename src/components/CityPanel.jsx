import React, { useEffect, useState } from "react";
import AQIGauge from "./AQIGauge.jsx";
import ForecastChart from "./ForecastChart.jsx";
import AIAnalysis from "./AIAnalysis.jsx";
import { fetchCityAQI, fetchHistory } from "../services/openaq.js";
import { analyseCity } from "../services/gemini.js";
import { getAQIColor } from "../data/aqiColors.js";

export default function CityPanel({ city, onClose }) {
  const [cityData, setCityData] = useState(null);
  const [history, setHistory] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [simulation, setSimulation] = useState(null);

  useEffect(() => {
    if (!city) return;
    setIsLoadingData(true);
    setCityData(null);
    setHistory([]);
    setAnalysis(null);

    Promise.all([fetchCityAQI(city), fetchHistory(city)]).then(([data, hist]) => {
      setCityData(data);
      setHistory(hist);
      setIsLoadingData(false);
    });
  }, [city?.id]);

  const handleAnalyse = async () => {
    if (!cityData || isLoadingAI) return;
    setIsLoadingAI(true);
    setAnalysis(null);
    try {
      const result = await analyseCity(cityData);
      setAnalysis(result);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const runSimulation = () => {
    const currentAQI = cityData?.aqi || 200;

    setSimulation({
      current: currentAQI,
      predicted: Math.round(currentAQI * 0.78),
      reduction: 22,
    });
  };

  const aqiColor = cityData ? getAQIColor(cityData.aqi) : "#3d7eff";

  return (
    <div
      style={{
        width: 340,
        height: "100%",
        background: "#111520",
        borderLeft: "1px solid #252d45",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #252d45",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          background: "#161b2e",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: aqiColor,
                boxShadow: `0 0 8px ${aqiColor}`,
                animation: "pulse 2s infinite",
              }}
            />
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
            <h2 style={{ color: "#e8edf8", fontSize: 18, fontWeight: 700 }}>
              {city.name}
            </h2>
          </div>
          <p style={{ color: "#8899cc", fontSize: 12 }}>
            {city.state} · Pop. {city.population}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#4a5680",
            fontSize: 20,
            cursor: "pointer",
            padding: "0 4px",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      {/* Scrollable content */}
      <div
        className="panel-scroll"
        style={{ flex: 1, overflowY: "auto", padding: "0 20px 24px" }}
      >
        {isLoadingData ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <div
              style={{
                width: 32,
                height: 32,
                border: "2px solid #252d45",
                borderTopColor: "#3d7eff",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            {/* AQI Gauge */}
            <AQIGauge
              aqi={cityData.aqi}
              city={city}
              isFallback={cityData.isFallback}
            />

            {/* Pollutant readings */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {[
                { label: "PM2.5", value: cityData.pm25, unit: "μg/m³" },
                { label: "PM10", value: cityData.pm10, unit: "μg/m³" },
                {
                  label: "Wind",
                  value: cityData.wind?.speed,
                  unit: cityData.wind?.direction || "",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: "#0d1117",
                    border: "1px solid #252d45",
                    borderRadius: 8,
                    padding: "10px 10px 8px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      color: "#e8edf8",
                      fontSize: 16,
                      fontWeight: 700,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {item.value}
                  </p>
                  <p style={{ color: "#4a5680", fontSize: 10, marginTop: 2 }}>
                    {item.label}
                  </p>
                  <p style={{ color: "#8899cc", fontSize: 9 }}>{item.unit}</p>
                </div>
              ))}
            </div>

            {/* 7-Day Chart */}
            <div
              style={{
                background: "#0d1117",
                border: "1px solid #252d45",
                borderRadius: 10,
                padding: "14px 14px 10px",
                marginBottom: 20,
              }}
            >
              <ForecastChart history={history} />
            </div>

            {/* Divider */}
            <div
              style={{
                borderTop: "1px solid #252d45",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  color: "#4a5680",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  background: "#111520",
                  padding: "0 8px",
                  marginTop: -8,
                }}
              >
                AI Intelligence
              </span>
            </div>

            {/* AI Analysis */}
            <AIAnalysis
              analysis={analysis}
              isLoading={isLoadingAI}
              onAnalyse={handleAnalyse}
              cityData={cityData}
            />

            {/* Forecast Intelligence */}
            <div
              style={{
                background: "#0d1117",
                border: "1px solid #252d45",
                borderRadius: 10,
                padding: 14,
                marginTop: 20,
              }}
            >
              <h3 style={{ color: "#e8edf8" }}>24-Hour AQI Forecast</h3>

              <p style={{ color: "#8899cc" }}>+6 hrs → {cityData.aqi + 20}</p>
              <p style={{ color: "#8899cc" }}>+12 hrs → {cityData.aqi + 40}</p>
              <p style={{ color: "#8899cc" }}>+24 hrs → {cityData.aqi + 60}</p>

              <p
                style={{
                  color: "#ff7043",
                  fontWeight: 700,
                  marginTop: 10,
                }}
              >
                Expected Category: Very Poor
              </p>
            </div>

            {/* Enforcement Actions */}
            <div
              style={{
                background: "#0d1117",
                border: "1px solid #252d45",
                borderRadius: 10,
                padding: 14,
                marginTop: 20,
              }}
            >
              <h3 style={{ color: "#e8edf8" }}>
                Recommended Enforcement Actions
              </h3>

              <ul
                style={{
                  color: "#cfd8dc",
                  fontSize: 13,
                  paddingLeft: 18,
                  lineHeight: 1.8,
                }}
              >
                <li>Inspect construction hotspots</li>
                <li>Restrict heavy vehicle movement</li>
                <li>Industrial emission audit</li>
                <li>Increase monitoring frequency</li>
              </ul>
            </div>

            {/* Impact Simulator */}
            <div
              style={{
                background: "#0d1117",
                border: "1px solid #252d45",
                borderRadius: 10,
                padding: 14,
                marginTop: 20,
                marginBottom: 20,
              }}
            >
              <h3 style={{ color: "#e8edf8" }}>
                Intervention Impact Simulator
              </h3>

              <button
                onClick={runSimulation}
                style={{
                  background: "#3d7eff",
                  border: "none",
                  color: "white",
                  padding: "10px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                  marginTop: 10,
                }}
              >
                Simulate Restricting Heavy Vehicles
              </button>

              {simulation && (
                <div style={{ marginTop: 14 }}>
                  <p style={{ color: "#8899cc" }}>
                    Current AQI: {simulation.current}
                  </p>

                  <p style={{ color: "#8899cc" }}>
                    Predicted AQI: {simulation.predicted}
                  </p>

                  <h3 style={{ color: "#00e676" }}>
                    AQI Improvement: {simulation.reduction}%
                  </h3>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}