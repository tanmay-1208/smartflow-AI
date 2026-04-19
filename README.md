---
title: Smartflow AI
emoji: 💰
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---

# ⚡ SmartFlow AI

**AI-powered cash flow management for Indian SMBs.**

SmartFlow AI helps small businesses take control of their financial future. By combining real-time transaction tracking with advanced AI forecasting and a conversational financial advisor, we turn raw data into actionable growth strategies.

![SmartFlow Banner](https://img.shields.io/badge/SmartFlow-AI--Powered-emerald)
![Tech Stack](https://img.shields.io/badge/Spring%20Boot-React-blue)

## ✨ Features

- **🛡️ Secure Google Sign-In**: One-tap authentication for a seamless onboarding experience.
- **📊 Real-time Dashboard**: Live monitoring of income, expenses, and net cash flow.
- **📈 AI Forecasting**: Advanced smoothing and OLS regression models to predict your financial health for the next 3-9 months.
- **🤖 AI Financial Advisor**: A conversational assistant trained to provide personalized advice on expense reduction and growth.
- **🏗️ Workspace Collaboration**: Built-in support for team collaboration within shared workspaces.
- **🇮🇳 Built for India**: Tailored for Indian accounting patterns and currency (₹).

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (Premium Dark Theme)
- **Icons**: Lucide React
- **Charts**: Recharts (Responsive & Interactive)
- **Auth**: `@react-oauth/google`

### Backend
- **Framework**: Spring Boot 3.2+
- **Database**: PostgreSQL (hosted via Supabase)
- **Realtime**: Supabase Realtime for instant transaction updates
- **AI Models**: Custom OLS Regression & Weighted Moving Averages
- **Auth Verification**: `google-api-client` for secure token validation

## 🚀 Getting Started

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/tanmay-1208/smartflow-AI.git
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Backend Setup**:
   ```bash
   cd backend/demo
   ./mvnw spring-boot:run
   ```

## 🌐 Deployment

- **Frontend**: Hosted on [Vercel](https://smartflow-ai.vercel.app)
- **Backend API**: Hosted on [Hugging Face Spaces](https://huggingface.co/spaces/tanmaysingh12r/smartflow-backend)

---
Built with ❤️ for the Indian SMB Community.
