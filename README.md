---
title: Smartflow Backend
emoji: 🚀
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# SmartFlow AI 💰
> AI-powered cash flow management for Indian small businesses

## Problem
Indian SMBs have zero real-time visibility on their cash flow — they don't know if they're profitable, when they'll run out of cash, or where they're overspending.

## Solution
SmartFlow gives them a live dashboard, transaction tracking, and an AI advisor (powered by Groq LLaMA3) that answers questions about their business finances in plain English.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS (Vercel)
- **Backend**: Spring Boot 3.3, Java 17, Maven (Railway)
- **Database**: Supabase PostgreSQL
- **AI**: Groq LLaMA3 8B

## Features
- 📊 Dashboard with income/expense summary and monthly chart
- 💳 Transaction management (add/delete)
- 🤖 AI financial advisor chat
- 🔐 User auth (register/login)

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/transactions | Get all transactions |
| POST | /api/transactions | Add transaction |
| DELETE | /api/transactions/{id} | Delete transaction |
| GET | /api/dashboard/summary | Cash flow summary |
| GET | /api/dashboard/cashflow-chart | Monthly chart data |
| POST | /api/ai/advise | AI financial advice |

## Setup
1. Clone the repo
2. Copy `application.properties.example` → `application.properties` and fill in your keys
3. Run backend: `./mvnw spring-boot:run`
4. Run frontend: `cd frontend && npm install && npm run dev`