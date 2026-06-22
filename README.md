# AQI Intel — Urban Air Quality Intelligence Dashboard

A live-streaming, interactive Air Quality Index (AQI) intelligence dashboard built for city authorities, environmental analysts, and citizens to visualize real-time pollution metrics, dispersion plumes, and AI-driven predictive insights across major urban centers in India.

**Live Production Link:** [https://sayani-airaq.netlify.app/](https://sayani-airaq.netlify.app/)

---

## 🚀 Core Features

* **Live WAQI API Streaming:** Real-time data synchronization directly fetching real-world AQI, Particulate Matter ($PM_{2.5}$ and $PM_{10}$), and Nitrogen Dioxide ($NO_2$) indices via custom live network pipelines.
* **Dynamic GIS Mapping Interface:** Responsive, high-performance leafleted map rendering dark-mode vectors, custom styled-marker components displaying instant status colors, and responsive pinpoint interactivity.
* **Wind Dispersion Plume Simulation:** Dynamic spatial vectoring layer which renders real-time pollution dispersion geometry maps based directly on live wind speed and cardinal direction vectors.
* **7-Day Historical Trend Evaluation:** Automated graph parsing showing weekly averages, fluctuations, and snapshot data breakpoints using dynamic math-interpolation calculators.
* **AI Urban Intelligence Analytics:** Tactical diagnostic readouts displaying pollution source attribution distributions (Vehicular, Industrial, Domestic) along with optimized city-enforcement recommendation checklists.

---

## 🛠️ Tech Stack & Architecture

* **Frontend Framework:** React (Vite-optimized runtime SPA architecture)
* **Mapping Framework:** Leaflet.js / React-Leaflet
* **Data Integration Layer:** World Air Quality Index (WAQI) RESTful Feed API
* **Styling Engine:** Custom Responsive Component UI & Embedded Hex CSS 
* **Deployment Base:** Netlify Core Production Pipeline

---

## 💻 Local Installation & Setup

To download, configure, and boot this project on your machine locally:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
   cd YOUR_REPO_NAME
