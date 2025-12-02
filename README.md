# MonitorPro — Intelligent Climate & Lifestyle Companion  
*A Smart Environment Monitoring App with AI Assistance*  
（中文与英文双语说明）

---

## ⚠️ Disclaimer / 免责声明

### 🇨🇳 中文说明
- ⚠️ **本应用为 Alpha 测试版本，功能可能不完整或不稳定。**  
- 👩‍💻 此软件由 **西交利物浦大学学生团队** 开发，作为课程项目的一部分。  
- 🚫 **仅用于教学、学术与实验用途，不作商业使用。**  
- 📊 所有传感器/气象数据均为模拟或测试数据，不具有真实参考意义。  
- 🤖 AI 助手仅用于展示，不构成任何专业建议。

### 🇬🇧 English
- ⚠️ **This app is an Alpha testing build with incomplete or unstable features.**  
- 👩‍💻 Developed by **students at Xi’an Jiaotong-Liverpool University (XJTLU)** as part of an academic project.  
- 🚫 **Strictly for educational and experimental purposes only. Not for commercial use.**  
- 📊 All sensor/weather data are simulated for demonstration.  
- 🤖 The AI assistant is for demo purposes only and does not provide professional advice.

---

## 🌟 Project Overview / 项目简介

### 🇨🇳 中文简介
**MonitorPro** 是一个结合室内/室外环境监测、天气预报、AI 分析的智能生活助手。  
应用通过清晰的仪表盘、趋势图与个性化建议，帮助用户更好理解周围的气候环境。

### 🇬🇧 English Overview
**MonitorPro** is a smart climate and lifestyle companion integrating sensor monitoring, weather forecasting, and AI-powered suggestions.  
It provides dashboards, trend visualization, and contextual recommendations to help users understand and optimize their living environment.

---

## ✨ Key Features / 核心功能

### 📡 Sensor Monitoring（传感器监测）
- Indoor & outdoor temperature  
- Indoor & outdoor humidity  
- Real-time status badges（Optimal / Warning / Critical）  
- Mock data generation for testing

### 📈 Trend Visualization（趋势图）
- Last 1-hour mini trend  
- Smooth bezier charts  
- Real-time timestamp labeling  

### 🌤 Weather Module（天气模块）
- Real-time outdoor weather  
- 3-day forecast  
- Dynamic weather icons（Cloudy, Rain, Sunny, Fog, Windy 等）

### 🤖 AI Assistant（AI 助手）
- 生活方式建议（通风、加湿、除湿、穿衣等）  
- 深入解释温湿度状态  
- 动态生成情境建议（如“干燥天气”“温差大”“湿冷”）

### 💬 Feedback System（反馈系统）
- 内置反馈表单  
- 后台 (Bolt / Supabase) 自动存储与时间戳记录  
- 测试报告基于真实用户反馈整理

### ⚙️ Device Management（设备管理）
- Sensor list  
- Battery level display  
- Device deletion & location info  
- 全局统一卡片 UI

---

## 🛠️ Tech Stack / 技术栈

- **React Native (Expo)**
- Typescript  
- Zustand / Context API  
- react-native-chart-kit  
- lucide-react-native icons  
- Supabase / Bolt backend  
- DeepSeek / OpenAI API for AI

---

## 📂 Folder Structure / 文件结构

app/
  tabs/
    dashboard.tsx
    weather.tsx
    devices.tsx
    history.tsx
    settings.tsx
  components/
    SensorCard.tsx
    SensorDetailSheet.tsx
  utils/
    miniTrend.ts
    suggestions.ts
    statusLogic.ts
  contexts/
    LanguageContext.tsx
  assets/
    icons/
    images/

---

## 👥 Team / 开发团队

XJTLU Entrepreneur College (Taicang)
MonitorPro Development Team
ENT207-Monday-Group31
2025
