// services/openaq.js
// Switched to WAQI API to bypass OpenAQ CORS limitations during the hackathon
// Docs: https://project.waqi.info/api/

const TOKEN = "64703d233baf5af8a598e069560876316bc6ae7d";

// How long to cache results (ms) — avoids hammering the API during demo
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = {};

// ─── Fetch latest AQI for all cities at once ──────────────────────────────────

/**
 * fetchAllCities — call this on app load to populate the map
 *
 * @param {Array} cities — array from data/cities.js
 * @returns {Promise<Array>} cities with aqi, pm25, pm10, no2 populated
 */
export async function fetchAllCities(cities) {
  const results = await Promise.allSettled(
    cities.map((city) => fetchCityAQI(city))
  );

  return cities.map((city, i) => {
    const result = results[i];
    if (result.status === "fulfilled" && result.value) {
      return { ...city, ...result.value };
    }
    const cityName = typeof city === "string" ? city : city?.name || "Unknown";
    // Return city with fallback values — never leave a blank marker
    return { ...city, ...getFallbackReadings(cityName) };
  });
}

// ─── Fetch latest pollutants for one city ─────────────────────────────────────

/**
 * fetchCityAQI — get the most recent PM2.5, PM10, NO₂ for a city via WAQI
 *
 * @param {string|Object} city — e.g. "Delhi", "Mumbai" or city object
 * @returns {Promise<Object>} { pm25, pm10, no2, aqi, lastUpdated }
 */
export async function fetchCityAQI(city) {
  const cityName = typeof city === "string" ? city : city?.name || "Unknown";
  const cacheKey = `latest_${cityName}`;
  
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(
      `https://api.waqi.info/feed/${encodeURIComponent(cityName)}/?token=${TOKEN}`
    );

    if (!res.ok) throw new Error(`WAQI ${res.status}`);

    const data = await res.json();

    if (data.status !== "ok" || !data.data) {
      throw new Error(data.data || "Invalid response status");
    }

    // 1. Extract wind parameters ('w' for speed, 'wd' for degrees) from iaqi
    const liveWindSpeed = data.data.iaqi?.w?.v || 0;
    const liveWindDegrees = data.data.iaqi?.wd?.v;

    // 2. Convert raw meteorological degrees (0–360) into standard text directions
    const getWindDirectionLabel = (deg) => {
      if (deg === undefined || deg === null) return "N";
      const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
      const index = Math.round(((deg % 360) / 45)) % 8;
      return directions[index];
    };

    // WAQI returns global AQI directly. Let's capture raw pollutant sub-indices safely.
    const result = {
      aqi: Number(data.data.aqi) || 0,
      pm25: Math.round(data.data.iaqi?.pm25?.v || 0),
      pm10: Math.round(data.data.iaqi?.pm10?.v || 0),
      no2: Math.round(data.data.iaqi?.no2?.v || 0),
      
      // 3. Add the structural wind object your UI expects
      wind: {
        speed: Math.round(liveWindSpeed),
        direction: getWindDirectionLabel(liveWindDegrees)
      },
      
      lastUpdated: new Date().toISOString(),
      isFallback: false,
    };

    setCache(cacheKey, result);
    return result;
  } catch (e) {
    console.warn(`fetchCityAQI(${cityName}) failed, using fallback:`, e.message);
    return getFallbackReadings(cityName);
  }
}

// ─── Fetch 7-day history for sparkline chart ─────────────────────────────────

/**
 * fetchHistory — get daily average PM2.5/AQI for the past 7 days via WAQI
 *
 * @param {string|Object} city
 * @returns {Promise<Array>} [{ date: "Mon", aqi: 145 }, ...]  7 items
 */
export async function fetchHistory(city) {
  const cityName = typeof city === "string" ? city : city?.name || "Unknown";
  const cacheKey = `history_${cityName}`;
  
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(
      `https://api.waqi.info/feed/${encodeURIComponent(cityName)}/?token=${TOKEN}`
    );

    if (!res.ok) throw new Error(`WAQI History ${res.status}`);

    const data = await res.json();
    
    const pm25Forecast = data.data?.forecast?.daily?.pm25;
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    if (pm25Forecast && pm25Forecast.length > 0) {
      const formattedHistory = pm25Forecast.slice(0, 7).map((day) => {
        const d = new Date(day.day);
        return {
          date: dayLabels[d.getDay()],
          pm25: day.avg,
          aqi: calculateAQI({ pm25: day.avg })
        };
      });
      
      setCache(cacheKey, formattedHistory);
      return formattedHistory;
    }

    return getFallbackHistory(cityName);
  } catch (err) {
    console.warn(`fetchHistory(${cityName}) failed, using fallback:`, err.message);
    return getFallbackHistory(cityName);
  }
}

// ─── CPCB AQI Calculator ──────────────────────────────────────────────────────

export function calculateAQI({ pm25, pm10, no2 }) {
  const subIndices = [];

  if (pm25 != null) subIndices.push(subIndexPM25(pm25));
  if (pm10 != null) subIndices.push(subIndexPM10(pm10));
  if (no2  != null) subIndices.push(subIndexNO2(no2));

  if (subIndices.length === 0) return 0;
  return Math.round(Math.max(...subIndices));
}

function subIndexPM25(c) {
  const bp = [
    [0,    30,   0,   50],
    [30,   60,   51,  100],
    [60,   90,   101, 200],
    [90,   120,  201, 300],
    [120,  250,  301, 400],
    [250,  500,  401, 500],
  ];
  return linearInterp(c, bp);
}

function subIndexPM10(c) {
  const bp = [
    [0,    50,   0,   50],
    [50,   100,  51,  100],
    [100,  250,  101, 200],
    [250,  350,  201, 300],
    [350,  430,  301, 400],
    [430,  600,  401, 500],
  ];
  return linearInterp(c, bp);
}

function subIndexNO2(c) {
  const bp = [
    [0,    40,   0,   50],
    [40,   80,  51,  100],
    [80,   180,  101, 200],
    [180,  280,  201, 300],
    [280,  400,  301, 400],
    [400,  800,  401, 500],
  ];
  return linearInterp(c, bp);
}

function linearInterp(c, breakpoints) {
  for (const [cLow, cHigh, iLow, iHigh] of breakpoints) {
    if (c >= cLow && c <= cHigh) {
      return ((iHigh - iLow) / (cHigh - cLow)) * (c - cLow) + iLow;
    }
  }
  return 500;
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

function setCache(key, value) {
  cache[key] = { value, expires: Date.now() + CACHE_TTL };
}

function getCache(key) {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() > entry.expires) { delete cache[key]; return null; }
  return entry.value;
}

// ─── Fallback data ────────────────────────────────────────────────────────────

const FALLBACK_DATA = {
  Delhi:     { pm25: 94,  pm10: 178, no2: 52  },
  Mumbai:    { pm25: 58,  pm10: 98,  no2: 38  },
  Kolkata:   { pm25: 62,  pm10: 112, no2: 41  },
  Bengaluru: { pm25: 35,  pm10: 68,  no2: 28  },
  Chennai:   { pm25: 42,  pm10: 78,  no2: 31  },
  Hyderabad: { pm25: 48,  pm10: 88,  no2: 34  },
  Pune:      { pm25: 44,  pm10: 82,  no2: 30  },
  Ahmedabad: { pm25: 71,  pm10: 138, no2: 45  },
};

function getFallbackReadings(cityName) {
  const data = FALLBACK_DATA[cityName] ?? { pm25: 55, pm10: 95, no2: 36 };
  return {
    ...data,
    aqi: calculateAQI(data),
    lastUpdated: new Date().toISOString(),
    isFallback: true,
  };
}

function getFallbackHistory(cityName) {
  const base = FALLBACK_DATA[cityName]?.pm25 ?? 55;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((date, i) => {
    const variation = (Math.sin(i * 1.3) * 0.2 + (Math.random() - 0.5) * 0.1);
    const pm25 = Math.max(10, Math.round(base * (1 + variation)));
    return { date, pm25, aqi: calculateAQI({ pm25 }) };
  });
}