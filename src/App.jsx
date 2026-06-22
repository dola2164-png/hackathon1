import React, { useState, useEffect } from "react";
import AQIMap from "./components/AQIMap.jsx";
import CityPanel from "./components/CityPanel.jsx";
import { CITIES } from "./data/cities.js";
import { fetchCityAQI } from "./services/openaq.js";
import { getAQIColor, getAQILabel } from "./data/aqiColors.js";

export default function App() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityData, setCityData] = useState({}); // { cityId: { aqi, pm25, ... } }
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load AQI data for all cities on mount
  useEffect(() => {
    const loadAll = async () => {
      const results = await Promise.allSettled(
        CITIES.map((city) => fetchCityAQI(city))
      );
      const dataMap = {};
      results.forEach((res, i) => {
        if (res.status === "fulfilled") {
          dataMap[CITIES[i].id] = res.value;
        }
      });
      setCityData(dataMap);
      setLastUpdated(new Date());
    };
    loadAll();

    // Refresh every 5 minutes
    const interval = setInterval(loadAll, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const worstCity = CITIES.reduce((worst, city) => {
    const aqi = cityData[city.id]?.aqi || city.fallbackAQI;
    const worstAqi = cityData[worst?.id]?.aqi || worst?.fallbackAQI || 0;
    return aqi > worstAqi ? city : worst;
  }, CITIES[0]);

  const avgAQI = Math.round(
    CITIES.reduce((sum, c) => sum + (cityData[c.id]?.aqi || c.fallbackAQI), 0) /
      CITIES.length
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Top Header */}
      <header
        style={{
          height: 52,
          background: "#111520",
          borderBottom: "1px solid #252d45",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: 24,
          flexShrink: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "linear-gradient(135deg, #3d7eff, #00c8ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}
          >
            🌫️
          </div>
          <div>
            <span
              style={{
                color: "#e8edf8",
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: "-0.02em",
              }}
            >
              AQ Intel
            </span>
            <span
              style={{
                color: "#4a5680",
                fontSize: 11,
                marginLeft: 6,
              }}
            >
              Urban Air Quality Intelligence
            </span>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginLeft: "auto",
            alignItems: "center",
          }}
        >
          <Stat
            label="Cities Monitored"
            value={CITIES.length}
            color="#3d7eff"
          />
          <Stat
            label="National Avg AQI"
            value={avgAQI}
            color={getAQIColor(avgAQI)}
          />
          <Stat
            label="Worst City"
            value={worstCity?.name}
            color={getAQIColor(cityData[worstCity?.id]?.aqi || worstCity?.fallbackAQI)}
          />
          <Stat
  label="Response Time"
  value="4h"
  color="#00e676"
/>
          <div
            style={{
              height: 20,
              width: 1,
              background: "#252d45",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: Object.keys(cityData).length > 0 ? "#00e676" : "#ffa726",
                boxShadow: `0 0 6px ${
                  Object.keys(cityData).length > 0 ? "#00e676" : "#ffa726"
                }`,
                animation: "pulse 2s infinite",
              }}
            />
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
            <span style={{ color: "#8899cc", fontSize: 11 }}>
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Loading…"}
            </span>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Map */}
        <div style={{ flex: 1, position: "relative" }}>
          {/* City list sidebar hint */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 1000,
              background: "rgba(17,21,32,0.9)",
              border: "1px solid #252d45",
              borderRadius: 10,
              padding: "10px 12px",
              backdropFilter: "blur(8px)",
              maxWidth: 180,
            }}
          >
            <p style={{ color: "#8899cc", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              Click any city
            </p>
            {CITIES.slice(0, 5).map((city) => {
              const aqi = cityData[city.id]?.aqi || city.fallbackAQI;
              const color = getAQIColor(aqi);
              return (
                <div
                  key={city.id}
                  onClick={() => setSelectedCity(city)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "4px 0",
                    cursor: "pointer",
                    borderBottom: "1px solid #1a2035",
                  }}
                >
                  <span style={{ color: "#e8edf8", fontSize: 12 }}>{city.name}</span>
                  <span
                    style={{
                      color,
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {aqi}
                  </span>
                </div>
              );
            })}
            <p
              onClick={() => {}}
              style={{ color: "#4a5680", fontSize: 10, marginTop: 6, textAlign: "center" }}
            >
              + {CITIES.length - 5} more on map
            </p>
          </div>

          <AQIMap
            cities={CITIES}
            cityData={cityData}
            selectedCity={selectedCity}
            onCitySelect={setSelectedCity}
          />
        </div>

        {/* City Detail Panel */}
        {selectedCity && (
          <CityPanel
            city={selectedCity}
            onClose={() => setSelectedCity(null)}
          />
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p
        style={{
          color,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 15,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      <p style={{ color: "#4a5680", fontSize: 10, marginTop: 2 }}>{label}</p>
    </div>
  );
}
