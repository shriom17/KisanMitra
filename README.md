<div align="center">
  <img src="C:\Users\salma\Desktop\Coding\AgriGuru\frontend\public\logo.png" alt="AgriGuru Logo" width="200" height="200">
  
  # 🌾 AgriGuru
  
  ### AI-Powered Smart Farming Platform for Indian Agriculture
  
  [![Made with ❤️ for Farmers](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F%20for%20Farmers-green.svg)](https://github.com/shriom17/AgriGuru)
  [![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg)](https://agriguru.vercel.app)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![Contributors](https://img.shields.io/github/contributors/shriom17/AgriGuru.svg)](https://github.com/shriom17/AgriGuru/graphs/contributors)
  
</div>

---

## 📖 About AgriGuru

**AgriGuru** is a comprehensive AI-powered farming platform designed specifically for Indian farmers, agricultural officers, and rural tech users. Our mission is to bridge the gap between traditional farming and modern technology, providing instant access to agricultural expertise, real-time data, and smart farming solutions.

> *"Empowering farmers with AI-driven insights for better crops, better yields, and better lives."*

---

## ✨ Key Features

<table>
  <tr>
    <td align="center">🌤️</td>
    <td><strong>Real-time Weather Forecasts</strong><br>Hyperlocal weather data with farming-specific alerts</td>
  </tr>
  <tr>
    <td align="center">🌱</td>
    <td><strong>Soil Health Analysis</strong><br>Comprehensive soil testing and crop recommendations</td>
  </tr>
  <tr>
    <td align="center">🔍</td>
    <td><strong>AI Crop Disease Detection</strong><br>Computer vision-powered disease identification and treatment</td>
  </tr>
  <tr>
    <td align="center">🧪</td>
    <td><strong>Organic Fertilizer Guidance</strong><br>Eco-friendly fertilizer recommendations and schedules</td>
  </tr>
  <tr>
    <td align="center">💰</td>
    <td><strong>Live Market Prices</strong><br>Real-time commodity prices and trend analysis</td>
  </tr>
  <tr>
    <td align="center">🏛️</td>
    <td><strong>Government Schemes</strong><br>Easy access to agricultural subsidies and programs</td>
  </tr>
  <tr>
    <td align="center">🤖</td>
    <td><strong>AI Agricultural Expert</strong><br>24/7 farming guidance in multiple Indian languages</td>
  </tr>
  <tr>
    <td align="center">📱</td>
    <td><strong>WhatsApp Disaster Alerts</strong><br>Emergency notifications for weather and crop threats</td>
  </tr>
  <tr>
    <td align="center">📰</td>
    <td><strong>Live Agricultural News</strong><br>Latest farming news and policy updates</td>
  </tr>
</table>

---

## 🚀 Live Demo

🔗 **[Experience AgriGuru Live](https://agriguru.vercel.app)**

*Try our platform with sample data or create a free account to explore all features.*

---

## 📱 Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Dashboard" alt="Dashboard" width="300">
        <br><b>🏠 Smart Dashboard</b>
      </td>
      <td align="center">
        <img src="https://via.placeholder.com/300x200/2196F3/FFFFFF?text=Soil+Analysis" alt="Soil Analysis" width="300">
        <br><b>🌱 Soil Health Analysis</b>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://via.placeholder.com/300x200/FF9800/FFFFFF?text=AI+Chat" alt="AI Chat" width="300">
        <br><b>🤖 AI Agricultural Expert</b>
      </td>
      <td align="center">
        <img src="https://via.placeholder.com/300x200/9C27B0/FFFFFF?text=Disease+Detection" alt="Disease Detection" width="300">
        <br><b>🔍 Crop Disease Detection</b>
      </td>
    </tr>
  </table>
</div>

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

### Backend & APIs
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)

### Cloud & Services
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Google Cloud](https://img.shields.io/badge/GoogleCloud-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white)

### APIs & Integrations
- 🌤️ **OpenWeatherMap API** - Weather data
- 🌱 **Custom Soil API** - Soil analysis
- 🤖 **Groq AI** - Agricultural AI assistance
- 💰 **Agmarknet API** - Market prices
- 📱 **Twilio/Gupshup** - WhatsApp integration
- 📰 **News API** - Agricultural news

---

## ⚡ Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- Git

### 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shriom17/AgriGuru.git
   cd AgriGuru
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   python farming_expert_app_ai.py
   ```
   Backend runs on [http://localhost:5000](http://localhost:5000)

### 🔑 Environment Variables

Create `.env` files in both frontend and backend directories:

#### Frontend `.env`
```env
REACT_APP_WEATHER_API_KEY=your_openweather_api_key
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_NEWS_API_KEY=your_news_api_key
```

#### Backend `.env`
```env
GROQ_API_KEY=your_groq_api_key
WEATHER_API_KEY=your_weather_api_key
TWILIO_API_KEY=your_twilio_api_key
```

> **Note:** Contact the maintainers for API key access or refer to individual service documentation.

---

## 🏗️ System Architecture

### 📊 Platform Overview

AgriGuru follows a modern, scalable microservices architecture designed for high availability and seamless user experience. The platform integrates multiple layers of technology to deliver comprehensive agricultural solutions.

<div align="center">
  <img src="docs/architecture-diagram.svg" alt="AgriGuru System Architecture" width="100%">
</div>

### 🎯 Architecture Layers

#### 👥 **User Layer**
- **🧑‍🌾 Farmers**: Primary users seeking agricultural guidance and solutions
- **👨‍💼 Agricultural Officers**: Government officials monitoring and supporting farming activities
- **📱 Rural Tech Users**: Tech-savvy farmers adopting digital farming solutions
- **🏢 AgriTech Partners**: Organizations integrating with AgriGuru services

#### 💻 **Frontend Layer (React.js)**
- **🏠 Dashboard**: Comprehensive farming analytics and insights
- **🤖 AI Chat**: Intelligent agricultural assistant with multilingual support
- **🌱 Soil Analysis**: Advanced soil health monitoring and recommendations
- **🔍 Disease Detection**: Computer vision-powered crop disease identification
- **💰 Market Dashboard**: Real-time commodity prices and market trends
- **🌤️ Weather Widget**: Hyperlocal weather forecasts and alerts
- **🛒 E-commerce**: Agricultural products marketplace
- **📚 AgriGuide**: Comprehensive farming knowledge base
- **📝 Contract Farming**: Digital contract management system
- **💬 Group Chat**: Farmer community communication platform

#### 🔧 **Backend Layer (Flask/Python)**
- **🤖 AI Expert API**: Groq-powered agricultural consultation service
- **🔍 Crop Analysis API**: Image-based crop health assessment
- **🌤️ Weather Service**: Weather data aggregation and forecasting
- **🌱 Soil Analysis API**: Soil composition and health analysis
- **💰 Market Price API**: Real-time commodity price tracking
- **📰 News Service**: Agricultural news aggregation
- **🔐 Authentication API**: Secure user management
- **📱 WhatsApp Integration**: Emergency alerts and notifications

#### 🧠 **AI & Machine Learning Layer**
- **🚀 Groq AI Engine**: Advanced natural language processing for farming queries
- **👁️ Computer Vision**: Image recognition for crop and disease identification
- **📊 ML Models**: Predictive analytics for crop recommendations
- **🌱 Soil Health Analysis**: AI-powered soil condition assessment
- **🔮 Predictive Analytics**: Weather and market trend predictions

#### 🔗 **External APIs & Services**
- **🌤️ OpenWeatherMap**: Weather data and forecasts
- **💰 Agmarknet**: Government market price data
- **📰 News API**: Latest agricultural news and updates
- **📱 Twilio/Gupshup**: SMS and WhatsApp messaging
- **🌿 PlantNet**: Plant identification and classification
- **🔍 Plant.id**: Advanced plant disease detection
- **🌍 ISRIC SoilGrids**: Global soil information system

#### 💾 **Database & Storage Layer**
- **🔥 Firebase Database**: Real-time user data and application state
- **☁️ Cloud Storage**: Media files and document storage
- **💻 Local Storage**: Client-side data caching
- **🔄 Session Storage**: Temporary user session data

#### ☁️ **Cloud Infrastructure**
- **▲ Vercel**: Frontend deployment and global CDN
- **🌐 Google Cloud Platform**: Backend services and APIs
- **📊 Analytics**: User behavior and application performance monitoring
- **🔍 Monitoring**: System health and error tracking
- **🚀 CI/CD Pipeline**: Automated deployment and testing

### 🔄 Data Flow Architecture

1. **User Interaction**: Users interact through the React.js frontend
2. **API Communication**: Frontend communicates with Flask backend via REST APIs
3. **AI Processing**: Backend leverages Groq AI and ML models for intelligent responses
4. **External Data**: Integration with weather, market, and agricultural APIs
5. **Data Storage**: Persistent storage in Firebase with cloud backup
6. **Real-time Updates**: WebSocket connections for live data streaming

### 🔒 Security & Performance

- **🛡️ Authentication**: Multi-factor authentication with Firebase Auth
- **🔐 API Security**: Rate limiting and API key management
- **📈 Scalability**: Auto-scaling cloud infrastructure
- **⚡ Performance**: CDN delivery and optimized caching
- **🔍 Monitoring**: Real-time error tracking and performance metrics

---

## 🏗️ Project Structure

```
AgriGuru/
├── 📁 frontend/                 # React frontend application
│   ├── 📁 public/              # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable UI components
│   │   ├── 📁 pages/           # Page components
│   │   ├── 📁 services/        # API service layers
│   │   └── 📁 i18n/            # Internationalization
│   └── 📄 package.json
├── 📁 backend/                  # Flask backend API
│   ├── 📄 farming_expert_app_ai.py
│   ├── 📄 requirements.txt
│   └── 📄 .env
├── 📄 README.md
└── 📄 vercel.json              # Deployment configuration
```

---

## 🌟 Core Modules

| Module | Description | Status |
|--------|-------------|--------|
| 🏠 **Dashboard** | Main farming analytics dashboard | ✅ Complete |
| 🤖 **AI Chat** | Multilingual agricultural expert | ✅ Complete |
| 🌱 **Soil Analysis** | Comprehensive soil health monitoring | ✅ Complete |
| 🔍 **Disease Detection** | AI-powered crop disease identification | ✅ Complete |
| 💰 **Market Prices** | Real-time commodity price tracking | ✅ Complete |
| 🌤️ **Weather Widget** | Hyperlocal weather forecasts | ✅ Complete |
| 🏛️ **Government Schemes** | Agricultural subsidy information | ✅ Complete |
| 📱 **WhatsApp Alerts** | Emergency disaster notifications | 🚧 In Progress |
| 📰 **News Feed** | Live agricultural news updates | ✅ Complete |

---

## 📊 API Documentation

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/expert-advice` | POST | Get AI farming recommendations |
| `/api/crop-analysis` | POST | Analyze crop disease from image |
| `/api/weather` | GET | Get weather forecast data |
| `/api/soil-analysis` | GET | Retrieve soil health metrics |
| `/api/market-prices` | GET | Fetch live commodity prices |
| `/api/news` | GET | Get latest agricultural news |

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🔄 How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with clear messages**
   ```bash
   git commit -m "Add: amazing new feature for farmers"
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### 📋 Contribution Guidelines

- Follow existing code style and conventions
- Write clear commit messages
- Add documentation for new features
- Test your changes thoroughly
- Focus on farmer-centric improvements

---

## 👥 Contributors

<div align="center">
  <a href="https://github.com/shriom17/AgriGuru/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=shriom17/AgriGuru" alt="Contributors" />
  </a>
</div>

### 🙏 Special Thanks

- **Indian Farmers** - Our inspiration and primary users
- **Agricultural Universities** - Domain expertise and validation
- **Open Source Community** - Tools and frameworks that make this possible

---

## 📞 Contact & Support

<div align="center">
  
### 📧 Get in Touch

| Platform | Contact |
|----------|---------|
| 📧 **Email** | [support@agriguru.com](mailto:support@agriguru.com) |
| 💬 **Discord** | [Join our Community](https://discord.gg/agriguru) |
| 🐦 **Twitter** | [@AgriGuruApp](https://twitter.com/AgriGuruApp) |
| 📱 **WhatsApp** | [+91-XXXX-XXXX-XX](https://wa.me/91XXXXXXXXXX) |
| 🌐 **Website** | [www.agriguru.com](https://agriguru.vercel.app) |

</div>

### 🐛 Bug Reports & Feature Requests

- **Bug Reports**: [Create an Issue](https://github.com/shriom17/AgriGuru/issues/new?template=bug_report.md)
- **Feature Requests**: [Request a Feature](https://github.com/shriom17/AgriGuru/issues/new?template=feature_request.md)
- **General Questions**: [Start a Discussion](https://github.com/shriom17/AgriGuru/discussions)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License - Feel free to use, modify, and distribute
Built with ❤️ for the farming community
```

---

## ⭐ Show Your Support

If AgriGuru helps you or someone you know, please consider:

- ⭐ **Star this repository**
- 🐛 **Report bugs** to help us improve
- 💡 **Suggest features** that farmers need
- 🤝 **Contribute code** to make farming smarter
- 📢 **Share with farmers** who could benefit

<div align="center">
  
### 🌾 Together, let's revolutionize agriculture with technology! 🚜

[![Star History Chart](https://api.star-history.com/svg?repos=shriom17/AgriGuru&type=Date)](https://star-history.com/#shriom17/AgriGuru&Date)

---

**Made with 🧡 for Indian Farmers | © 2025 AgriGuru Team**

</div>