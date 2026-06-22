# AQI Intel — AI-Powered Urban Air Quality Intelligence Platform

An advanced environmental intelligence and geospatial analytics platform built to address the national urban air quality crisis. This platform moves beyond reactive monitoring to provide proactive, evidence-based intervention tools for city administrators, municipal bodies, and pollution control authorities.

**Live Production Link:** [https://sayani-airaq.netlify.app/](https://sayani-airaq.netlify.app/)  
**GitHub Repository:** [https://github.com/dola2164-png/hackathon1/](https://github.com/dola2164-png/hackathon1/)

---

## 🎯 Problem Alignment & Solutions

Designed strictly in accordance with the **Smart Cities / Environmental Intelligence** framework, the application delivers a working prototype addressing the core challenge tracks:

### 1. Multi-City Comparative Intelligence Dashboard
* **Feature:** Direct spatial mapping vectors across major tier-1 and tier-2 urban centers (Kolkata, Delhi, Mumbai, Pune, Bangalore, Chennai, etc.).
* **Impact:** Provides city administrators with macro-level cross-geography trends, tracking real-world multi-station data streams side-by-side to contrast regional compliance levels.

### 2. Geospatial Pollution Source Attribution Engine (Powered by Gemini API)
* **Feature:** Real-time AI attribution metrics mapped dynamically per selected urban center.
* **Impact:** Leverages the **Gemini API** to evaluate station parameters alongside local industrial profiles to output immediate statistical confidence scores for key emission categories (Vehicle Emissions, Industrial Output, Construction Dust, Crop Burning).

### 3. Enforcement Intelligence & Prioritization Agent (Powered by Gemini API)
* **Feature:** Automated, ranked municipal enforcement checklists (P1, P2, P3 levels) detailing targeted localized policies.
* **Impact:** Integrated LLM analytical layer generates action recommendations—such as localized odd-even vehicle restrictions, construction suspensions, or industrial scaling rollbacks—complete with calculated reduction estimations ($PM_{2.5}$ / $PM_{10}$).

### 4. Hyperlocal Predictive AQI Forecasting
* **Feature:** Interactive 7-day multi-axis trend forecasting charts displaying historical interpolation alongside upcoming predictive risk indices.

---

## 🛠️ Architecture & Tech Stack

* **Core Engine:** React.js (Vite Runtime) SPA Architecture
* **AI Engine:** Google Gemini API (Structured Prompting & Tactical Diagnostics Generation)
* **Geospatial Layer:** Leaflet.js Vector Engine (Dark Maps Platform)
* **Data Layer:** World Air Quality Index (WAQI) RESTful Feed API
* **Deployment Pipe:** Netlify Automated CI/CD Production Build

---

## 💻 Local Installation & Configuration

Follow these steps to spin up the intelligence platform locally:

1. **Clone the Repository:**
```bash
   git clone [https://github.com/dola2164-png/hackathon1/.git](https://github.com/dola2164-png/hackathon1/.git)
   cd hackathon1
