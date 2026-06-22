// AQI breakpoints and color mapping (India CPCB standard)
export const AQI_LEVELS = [
  {
    max: 50,
    label: "Good",
    color: "#00e676",
    bg: "rgba(0,230,118,0.12)",
    description: "Air quality is satisfactory",
  },
  {
    max: 100,
    label: "Satisfactory",
    color: "#69f0ae",
    bg: "rgba(105,240,174,0.12)",
    description: "Air quality is acceptable",
  },
  {
    max: 200,
    label: "Moderate",
    color: "#ffee58",
    bg: "rgba(255,238,88,0.12)",
    description: "Sensitive groups may experience effects",
  },
  {
    max: 300,
    label: "Poor",
    color: "#ffa726",
    bg: "rgba(255,167,38,0.12)",
    description: "Health effects possible for all",
  },
  {
    max: 400,
    label: "Very Poor",
    color: "#ef5350",
    bg: "rgba(239,83,80,0.12)",
    description: "Health alert: serious effects",
  },
  {
    max: 500,
    label: "Severe",
    color: "#ab47bc",
    bg: "rgba(171,71,188,0.12)",
    description: "Emergency conditions",
  },
];

export function getAQILevel(aqi) {
  return (
    AQI_LEVELS.find((l) => aqi <= l.max) || AQI_LEVELS[AQI_LEVELS.length - 1]
  );
}

export function getAQIColor(aqi) {
  return getAQILevel(aqi).color;
}

export function getAQILabel(aqi) {
  return getAQILevel(aqi).label;
}

// Returns a CSS box-shadow glow effect for the AQI value
export function getAQIGlow(aqi) {
  const color = getAQIColor(aqi);
  return `0 0 20px ${color}44, 0 0 40px ${color}22`;
}

// Generate mock 7-day historical trend data around a given AQI value
export function generateHistoryData(baseAQI) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day, i) => ({
    day,
    aqi: Math.max(20, Math.round(baseAQI + (Math.random() - 0.5) * 40 - i * 3)),
  }));
}
