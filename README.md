# 🌾 KisanMitra

AI-powered smart farming platform designed to support Indian farmers, agricultural officers, and rural communities.

[![Made with ❤️ for Farmers](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F%20for%20Farmers-green.svg)](https://github.com/shriom17/KisanMitra)
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg)](https://kisanmitra.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## About

KisanMitra brings together weather information, crop health insights, market data, and AI-assisted recommendations in a single platform. It is designed to help farmers access useful agricultural information and make better farming decisions through simple digital tools.

> “Empowering farmers with AI-driven insights for better crops, better decisions, and better lives.”

## Key Features

- 🌦️ Weather information and farming-related alerts
- 🌱 Soil health information and crop recommendations
- 🧠 AI-assisted crop disease detection and treatment guidance
- 🧪 Fertilizer and nutrient planning support
- 📈 Market price information and commodity trends
- 🏛️ Government schemes and agricultural program information
- 🤖 AI agricultural assistant with multilingual support
- 📲 Support for notification and communication features
- 📰 Agricultural news and updates

## Tech Stack

### Frontend

- React
- React Router
- Axios
- Recharts
- Socket.IO client
- i18next for multilingual UI
- CSS and custom styling

### Backend

- Python
- Flask
- Flask-CORS
- Requests
- Pillow
- Python-dotenv
- TensorFlow / scikit-learn for AI and model workflows

### Data & Integrations

- OpenWeatherMap API
- Agmarknet / market data APIs
- Google APIs
- Messaging service integrations
- News APIs

### Deployment & Infrastructure

- Vercel for frontend hosting
- Docker Compose support
- Smart-contract components for marketplace-related functionality

## Project Structure

```text
KisanMitra/
├── frontend/           # React-based web application
├── backend/            # Flask APIs and AI services
├── smart-contracts/    # Marketplace-related smart contracts
├── data/               # Data files and processed datasets
├── docker-compose.yml  # Local container setup
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- Git

### Frontend Setup

```bash
git clone https://github.com/shriom17/KisanMitra.git
cd KisanMitra/frontend
npm install
npm start
```

Open `http://localhost:3000` in your browser.

### Backend Setup

```bash
cd ../backend
pip install -r requirements.txt
python farming_expert_app_ai.py
```

The backend typically runs on `http://localhost:5000`.

### Environment Variables

Create environment files as required by the project configuration.

#### Frontend

```env
REACT_APP_WEATHER_API_KEY=your_weather_key
REACT_APP_FIREBASE_API_KEY=your_firebase_key
REACT_APP_NEWS_API_KEY=your_news_key
```

#### Backend

```env
GROQ_API_KEY=your_groq_key
WEATHER_API_KEY=your_weather_key
TWILIO_API_KEY=your_twilio_key
```

## Core Modules

| Module | Description | Status |
|---|---|---|
| Dashboard | Main farming insights dashboard | Complete |
| AI Chat | Multilingual agricultural assistant | Complete |
| Soil Analysis | Soil and crop recommendations | Complete |
| Disease Detection | AI-assisted crop disease identification | Complete |
| Market Prices | Commodity price information | Complete |
| Weather | Weather information and insights | Complete |
| Government Schemes | Agricultural schemes and program information | Complete |
| WhatsApp Alerts | Notification and alert functionality | In Progress |
| News Feed | Agricultural news updates | Complete |

## API Overview

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/expert-advice` | POST | AI-assisted farming guidance |
| `/api/crop-analysis` | POST | Crop disease/crop analysis |
| `/api/weather` | GET | Weather information |
| `/api/soil-analysis` | GET | Soil-related information |
| `/api/market-prices` | GET | Commodity price information |
| `/api/news` | GET | Agricultural news |

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new feature branch
3. Make your changes
4. Commit your changes clearly
5. Open a pull request

Please keep changes farmer-focused, well-documented, and easy to test.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more details.

## Contact

- GitHub: [https://github.com/shriom17/KisanMitra](https://github.com/shriom17/KisanMitra)
- Website: [https://kisanmitra.vercel.app](https://kisanmitra.vercel.app)

Made with ❤️ for Indian farmers.
