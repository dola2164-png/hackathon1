import React, { useEffect, useRef } from "react";
import { getAQIColor } from "../data/aqiColors.js";

export default function AQIMap({ cities, cityData, selectedCity, onCitySelect }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const plumeLayerRef = useRef(null);

  function drawPlume(map, L, city, data) {
    // Correctly remove previous layer groups to prevent vector leaks
    if (plumeLayerRef.current) {
      map.removeLayer(plumeLayerRef.current);
      plumeLayerRef.current = null;
    }

    const wind = data?.wind || city.fallbackWind || { speed: 10, direction: "N" };
    const aqi = data?.aqi || city.fallbackAQI || 50;
    const color = getAQIColor(aqi);

    const dirMap = { N: 180, NE: 225, NW: 135, S: 0, SE: 315, SW: 45, E: 270, W: 90 };
    const windAngleDeg = dirMap[wind.direction] || 180;
    const windAngleRad = (windAngleDeg * Math.PI) / 180;

    const spread = Math.min(aqi / 500, 1);
    const plumeLen = 1.8 + spread * 2.2;
    const plumeWidth = 0.4 + spread * 1.2;

    const dx = Math.sin(windAngleRad);
    const dy = Math.cos(windAngleRad);

    const tipLat = city.lat + dy * plumeLen;
    const tipLon = city.lon + dx * plumeLen;
    const leftLat = city.lat + dy * plumeLen * 0.3 - dx * plumeWidth;
    const leftLon = city.lon + dx * plumeLen * 0.3 + dy * plumeWidth;
    const rightLat = city.lat + dy * plumeLen * 0.3 + dx * plumeWidth;
    const rightLon = city.lon + dx * plumeLen * 0.3 - dy * plumeWidth;

    const plume = L.polygon(
      [
        [city.lat, city.lon],
        [leftLat, leftLon],
        [tipLat, tipLon],
        [rightLat, rightLon],
      ],
      {
        color: color,
        fillColor: color,
        fillOpacity: 0.18,
        weight: 1,
        opacity: 0.5,
        dashArray: "4 4",
      }
    );

    const tooltip = L.tooltip({ permanent: false, direction: "top" }).setContent(
      `<div style="background:#161b2e;border:1px solid #252d45;border-radius:8px;padding:8px 12px;font-family:monospace;color:${color};font-size:12px;">
        <b>${city.name}</b> dispersion plume<br>
        <span style="color:#8899cc;font-size:11px;">Wind: ${wind.speed} km/h ${wind.direction} · AQI ${aqi}</span>
      </div>`
    );
    plume.bindTooltip(tooltip);

    const windArrow = L.polyline(
      [
        [city.lat, city.lon],
        [city.lat + dy * 0.6, city.lon + dx * 0.6],
      ],
      { color, weight: 2, opacity: 0.8 }
    );

    // Combine into a layer group first, then add the group to the map atomically
    const arrowGroup = L.layerGroup([plume, windArrow]);
    arrowGroup.addTo(map);
    plumeLayerRef.current = arrowGroup;
  }

  useEffect(() => {
    let active = true;
    let mapInstance = null;

    import("leaflet").then((L) => {
      // Guard against component being unmounted before the module finished loading
      if (!active || !mapRef.current) return;

      // Defensive Check: Remove existing map instance linked to container if it exists
      if (mapRef.current._leaflet_id) {
        return; 
      }

      const map = L.map(mapRef.current, {
        center: [22.5, 80],
        zoom: 5,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap contributors © CARTO",
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      mapInstance = map;
      mapInstanceRef.current = map;

      cities.forEach((city) => {
        const aqi = cityData[city.id]?.aqi || city.fallbackAQI;
        const color = getAQIColor(aqi);

        const icon = L.divIcon({
          className: "",
          html: buildMarkerHTML(city.name, aqi, color, false),
          iconAnchor: [24, 0],
        });

        const marker = L.marker([city.lat, city.lon], { icon }).addTo(map);
        marker.on("click", () => {
          onCitySelect(city);
          drawPlume(map, L, city, cityData[city.id]);
        });
        markersRef.current[city.id] = { marker, L, city };
      });
    });

    return () => {
      active = false;
      if (mapInstance) {
        mapInstance.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      cities.forEach((city) => {
        const markerObj = markersRef.current[city.id];
        if (!markerObj) return;
        const aqi = cityData[city.id]?.aqi || city.fallbackAQI;
        const color = getAQIColor(aqi);
        const isSelected = selectedCity?.id === city.id;

        const icon = L.divIcon({
          className: "",
          html: buildMarkerHTML(city.name, aqi, color, isSelected),
          iconAnchor: [24, 0],
        });
        markerObj.marker.setIcon(icon);
      });

      if (selectedCity) {
        drawPlume(
          mapInstanceRef.current,
          L,
          selectedCity,
          cityData[selectedCity.id]
        );
      } else if (plumeLayerRef.current) {
        // Clear plume if no city is selected
        mapInstanceRef.current.removeLayer(plumeLayerRef.current);
        plumeLayerRef.current = null;
      }
    });
  }, [cityData, selectedCity]);

  return (
    <div 
      ref={mapRef} 
      id="map"
      style={{ width: "100%", height: "100%", borderRadius: "12px", overflow: "hidden" }} 
    />
  );
}

function buildMarkerHTML(name, aqi, color, isSelected) {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
      <div style="
        background:${color};color:#000;font-weight:700;font-size:12px;
        font-family:'JetBrains Mono',monospace;padding:4px 8px;border-radius:6px;
        box-shadow:0 0 12px ${color}88;min-width:48px;text-align:center;
        ${isSelected ? "outline:2px solid #fff;outline-offset:2px;transform:scale(1.15);" : ""}
      ">${aqi}</div>
      <div style="font-size:10px;color:#fff;background:rgba(0,0,0,0.75);padding:2px 6px;border-radius:3px;margin-top:2px;white-space:nowrap;">${name}</div>
      <div style="width:2px;height:6px;background:${color};margin-top:1px;"></div>
    </div>`;
}