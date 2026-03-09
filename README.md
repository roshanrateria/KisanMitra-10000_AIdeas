# 🌾 KisanMitra - Smart Agriculture Platform for Indian Farmers

<div align="center">

![KisanMitra](title.png)

**Empowering Indian Farmers with AI-Driven Sustainable Agriculture**

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)

**Made with ❤️ for Indian Farmers**

### 📺 [Watch Demo Video](https://youtu.be/HR8cliiZybg)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Architecture](#-architecture)
- [Impact & Vision](#-impact--vision)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**KisanMitra** (किसान मित्र - Farmer's Friend) is a comprehensive AI-powered agricultural platform designed specifically for Indian farmers. It combines cutting-edge technology with traditional farming wisdom to promote **sustainable, organic, and profitable farming practices**.

### Problem Statement

Indian agriculture faces multiple challenges:
- 86% of Indian farmers are small and marginal (< 2 hectares)
- Limited access to real-time market prices and weather information
- Excessive use of chemical fertilizers and pesticides
- Lack of personalized farming advice in local languages
- Poor financial planning and crop yield predictions
- Climate change impact on traditional farming patterns

### Our Solution

KisanMitra addresses these challenges through:
- 🌐 **Multilingual Interface** - Support for 10+ Indian languages via Bhashini API
- 🤖 **AI-Powered Recommendations** - Personalized, organic farming tasks using AWS Bedrock & Gemini AI
- 🛰️ **Satellite Imagery** - Real-time field monitoring via Sentinel Hub
- 💰 **Market Intelligence** - Live commodity prices from Agmarknet
- 🌦️ **Weather Integration** - Accurate weather forecasts and alerts
- 🗺️ **Field Mapping** - Interactive field management with soil analysis
- 💸 **Financial Dashboard** - Income/expense tracking and profit analysis
- 🔍 **AI Disease Detection** - Computer vision-powered crop disease identification

---

## ✨ Features

### 🌍 Core Features

#### 1. **Multilingual Support (Bhashini Integration)**
- Complete interface translation in 10+ Indian languages
- Languages: Hindi, Punjabi, Gujarati, Marathi, Tamil, Telugu, Kannada, Bengali, Malayalam, English
- Real-time translation without page reload
- Context-aware translations for agricultural terminology

#### 2. **AI Chatbot & Voice Assistant**
- 24/7 personalized farming advice powered by AWS Bedrock (Claude 3 Haiku) & Gemini 2.0 Flash
- Focus on **organic and eco-friendly** farming methods
- Multilingual voice conversations with speech-to-text and text-to-speech
- Prompt-engineered for Indian agricultural context
- Provides practical dosages and timing

#### 3. **Smart Field Management**
- Interactive map-based field marking using Leaflet
- GPS-based location detection
- Multiple field support with individual crop tracking
- Auto-detection of soil type from coordinates
- Field area calculation in acres/hectares

#### 4. **Satellite Imagery (Sentinel Hub)**
- True-color satellite images of fields
- NDVI (Normalized Difference Vegetation Index) for crop health
- Moisture index monitoring
- Historical imagery comparison
- Cloud-free image selection

#### 5. **Comprehensive Soil Analysis**
- 14 soil parameters from ISRIC SoilGrids API
- Parameters: pH, Nitrogen, Clay, Sand, Silt, Organic Carbon, CEC, etc.
- Multiple depth analysis (0-5cm to 100-200cm)
- Soil health recommendations
- Organic amendment suggestions

#### 6. **Weather Intelligence**
- Real-time weather data via OpenWeather API
- Temperature, humidity, wind speed, precipitation
- Weather-based farming alerts
- Seasonal recommendations

#### 7. **Market Prices (Agmarknet)**
- Live commodity prices from 10+ major markets across India
- Min, Max, and Modal prices per quintal
- Price comparison across markets
- Best selling time recommendations

#### 8. **AI Task Recommendations**
- Daily personalized farming tasks
- Priority-based task sorting
- Category-wise organization (irrigation, fertilization, pest control, etc.)
- Seasonal and weather-aware recommendations
- **Exclusively organic farming methods**

#### 9. **Financial Dashboard**
- Income and expense tracking
- Profit/loss analysis
- Category-wise expense breakdown
- ROI calculation
- Projected profit estimation

#### 10. **AI Disease Detection**
- Upload crop images for instant disease detection
- Powered by YOLOv8 object detection model
- Detects multiple diseases in a single image with bounding boxes
- Confidence scores for each detection
- AI-generated organic treatment recommendations
- Detection history with analytics dashboard
- Multilingual support for disease names and treatments
- Geolocation tagging for disease mapping
- Interactive chatbot for follow-up questions

#### 11. **AI Video Analysis**
- Upload videos of crops for AI-powered health assessment
- Powered by Gemini 2.0's multimodal capabilities
- Detects diseases, pests, and nutrient deficiencies from video
- Provides organic treatment recommendations with confidence scores
- Analyzes leaf conditions, discoloration, and visible damage

#### 12. **ONDC Integration**
- Buy agricultural inputs (seeds, fertilizers, pesticides) via ONDC network
- Sell produce directly to buyers through ONDC
- Transparent pricing and secure transactions
- Mock flow implementation for testing

#### 13. **AWS Bedrock Agents**
- **Remediation Agent**: Provides disease treatment recommendations
- **Sales Agent**: Market analysis and buyer search
- **Negotiation Agent**: Automated price negotiation with buyers

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - Modern UI library
- **TypeScript 5.8** - Type-safe development
- **Vite 5.4** - Lightning-fast build tool
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Shadcn/UI** - Beautiful, accessible component library

### Backend & AI
- **AWS Lambda** - Serverless compute
- **AWS Bedrock** - Claude 3 Haiku for AI agents
- **AWS SageMaker** - ML model deployment
- **Google Gemini 2.0 Flash** - Multimodal AI
- **YOLOv8** - Object detection for disease identification

### APIs & Services
- **Bhashini API** - Multilingual translation (MEITY, Govt. of India)
- **Sentinel Hub** - Satellite imagery (ESA Copernicus)
- **OpenWeather API** - Weather data
- **ISRIC SoilGrids** - Global soil data
- **Agmarknet** - Market prices
- **Auth0** - Authentication & authorization

### Maps & Visualization
- **Leaflet.js** - Interactive maps
- **React-Leaflet** - React integration for Leaflet
- **Leaflet-Draw** - Field boundary drawing
- **Recharts** - Data visualization

### State Management
- **React Context API** - Global state
- **TanStack Query** - Server state management
- **Local Storage** - Persistent data (JSON-based)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Git
- Modern web browser
- Internet connection (for APIs)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/kisanmitra.git
cd kisanmitra
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your API credentials (see [Configuration](#-configuration) section below).

4. **Start development server**
```bash
npm run dev
```

5. **Open browser**
```
http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## ⚙️ Configuration

### Required API Keys

You'll need to obtain the following API keys and add them to your `.env` file:

#### 1. **Auth0** (Authentication)
- Sign up at [Auth0](https://auth0.com/)
- Create a new application
- Add to `.env`:
```env
VITE_AUTH0_DOMAIN=your-auth0-domain.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
```

#### 2. **Google Gemini API** (AI Chatbot & Video Analysis)
- Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Add to `.env`:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
```

#### 3. **OpenWeather API** (Weather Data)
- Sign up at [OpenWeather](https://openweathermap.org/api)
- Add to `.env`:
```env
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
```

#### 4. **Bhashini API** (Translation)
- Register at [Bhashini Portal](https://bhashini.gov.in/)
- Add to `.env`:
```env
VITE_BHASHINI_ULCA_KEY=your_bhashini_api_key
VITE_BHASHINI_USER_ID=your_bhashini_user_id
VITE_BHASHINI_PIPELINE_ID=your_bhashini_pipeline_id
```

#### 5. **Sentinel Hub** (Satellite Imagery)
- Sign up at [Sentinel Hub](https://www.sentinel-hub.com/)
- Add to `.env`:
```env
VITE_SENTINEL_CLIENT_ID=your_sentinel_client_id
VITE_SENTINEL_CLIENT_SECRET=your_sentinel_client_secret
```

#### 6. **AWS Services** (Optional - for advanced features)
- **AWS Lambda**: Serverless API backend
- **AWS Bedrock**: Claude 3 Haiku for AI agents
- **AWS SageMaker**: Disease detection model deployment

For AWS setup, refer to `DEPLOYMENT.md` and `BEDROCK_ARCHITECTURE.md`.

### ⚠️ Security Notice

**Never commit your `.env` file to version control!**

- The `.env` file is already in `.gitignore`
- Use `.env.example` as a template
- Store production credentials securely (AWS Secrets Manager, etc.)

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Components │  │  Pages       │  │  Contexts    │      │
│  │  - UI       │  │  - Landing   │  │  - Auth      │      │
│  │  - Features │  │  - Dashboard │  │  - Language  │      │
│  └─────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     AWS Lambda (Node.js)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Bedrock    │  │  SageMaker   │  │   Gemini     │     │
│  │   Agents     │  │   Endpoint   │  │   Fallback   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     External APIs                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Bhashini │  │ Sentinel │  │OpenWeather│ │Agmarknet │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

1. **Frontend**: React SPA with TypeScript, Tailwind CSS, and Shadcn/UI
2. **Backend**: AWS Lambda serverless functions
3. **AI Layer**: AWS Bedrock (Claude 3 Haiku) + Google Gemini 2.0 Flash
4. **ML Models**: YOLOv8 on AWS SageMaker for disease detection
5. **Data Storage**: Browser LocalStorage (JSON-based)
6. **Authentication**: Auth0 with social login support

---

## 🌍 Impact & Vision

### Social Impact

#### Farmer Empowerment
- **Information Access**: Real-time data previously unavailable
- **Decision Support**: AI-powered recommendations reduce risk
- **Financial Inclusion**: Better financial planning
- **Language Barrier**: No more language barriers with 10+ Indian languages

#### Environmental Impact
- **Organic Farming Promotion**: 100% focus on sustainable methods
- **Reduced Chemical Use**: Organic alternatives to pesticides/fertilizers
- **Water Conservation**: Smart irrigation recommendations
- **Soil Health**: Promote regenerative agriculture
- **Carbon Sequestration**: Encourage practices that store CO2

#### Economic Impact
- **Increased Income**: 15-30% increase through better planning
- **Reduced Input Costs**: Organic methods are often cheaper
- **Better Market Access**: Real-time prices prevent exploitation
- **Financial Literacy**: Tracking leads to better money management

### Target Market

- **Primary Users**: Small & marginal farmers (86% of 140M Indian farmers)
- **Geographic Focus**: Rural India across all states
- **Crops**: Wheat, Rice, Cotton, Vegetables, Pulses, Oilseeds

### Projected Impact (5 Years)

| Metric | Year 1 | Year 3 | Year 5 |
|--------|--------|--------|--------|
| Active Users | 50,000 | 500,000 | 2,000,000 |
| Avg. Income Increase | 10% | 20% | 30% |
| Chemical Use Reduction | 20% | 40% | 60% |
| Water Savings | 15% | 25% | 35% |
| Crop Yield Improvement | 5% | 12% | 18% |

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Report Bugs**: Open an issue with detailed reproduction steps
2. **Suggest Features**: Share your ideas for new features
3. **Submit PRs**: Fix bugs or implement new features
4. **Improve Documentation**: Help us make docs better
5. **Translate**: Add support for more Indian languages

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for formatting
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **MEITY (Bhashini)**: For multilingual AI support
- **Google**: For Gemini AI API
- **AWS**: For Bedrock, Lambda, and SageMaker services
- **ESA**: For Copernicus Sentinel satellite data
- **ISRIC**: For global soil data
- **Indian Farmers**: For feedback and insights that shaped this platform

---

## 📞 Contact & Support

- **Demo Video**: [Watch on YouTube](https://youtu.be/HR8cliiZybg)
- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/kisanmitra/issues)
- **Email**: rateriaroshan2005@gmail.com

---

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Multilingual interface
- ✅ AI chatbot and voice assistant
- ✅ Disease detection
- ✅ Field management
- ✅ Weather and soil data
- ✅ Market prices

### Phase 2 (Q2 2025)
- 🔄 Mobile app (React Native)
- 🔄 Offline mode support
- 🔄 IoT sensor integration
- 🔄 Drone imagery support

### Phase 3 (Q3 2025)
- 📋 Marketplace for direct farmer-to-consumer sales
- 📋 Crop insurance integration
- 📋 Blockchain for supply chain transparency
- 📋 Community forums

### Phase 4 (Q4 2025)
- 📋 International expansion (Bangladesh, Nepal, Sri Lanka)
- 📋 Advanced analytics and predictive modeling
- 📋 Government scheme integration
- 📋 Cooperative farming features

---

<div align="center">

**Made with ❤️ for Indian Farmers**

🌾 **KisanMitra** - किसान मित्र 🌾

*Empowering sustainable agriculture through technology*

**#DigitalIndia #SustainableFarming #OrganicAgriculture #AIForGood**

### 📺 [Watch Demo Video](https://youtu.be/HR8cliiZybg)

</div>
