# MonitorPro — Intelligent Climate & Lifestyle Companion  
*A Smart Environment Monitoring App with AI Assistance*  
**中文说明请见下方 Chinese Version ↓**

---

# 🇬🇧 English Version

## ⚠️ Disclaimer

- **This app is an Alpha testing build**, meaning some features may be incomplete or unstable.  
- Developed by **students at Xi’an Jiaotong-Liverpool University (XJTLU)** as part of an academic coursework project.  
- **Strictly for educational, research, and demonstration purposes. Not for commercial use.**  
- All sensor and weather data may be simulated for testing and do not represent actual environmental measurements.  
- The AI assistant provides non-professional lifestyle suggestions only.

---

## 🌟 Project Overview

**MonitorPro** is an intelligent climate and lifestyle companion that integrates:

- Indoor/outdoor sensor monitoring  
- Weather forecast  
- Trend visualization  
- AI-powered comfort suggestions  

It helps users better understand environmental conditions and make informed lifestyle decisions.

---

## 🚀 Getting Started

### Web App 
- Visit: **https://monitorpro-environme-gbbc.bolt.host**  
- No installation required.

### Android APK (Recommended)
- Install the APK on any Android device.
- Launch the app to begin using MonitorPro immediately.

---

## 👤 Sign In / Sign Up

- Create a new account using **Sign Up**, or  
- Use **Guest Mode** to try the app without registration. (Recommended)

---

## 🏠 Dashboard

The Dashboard provides:

- Real-time temperature & humidity  
- Status tags: **Optimal / Warning / Critical**  
- Last-updated timestamps  
- Color-coded card UI  

This view lets users understand their current environment at a glance.

---

## 🔍 Sensor Detail View

Tap any card to see more information:

- Precise temperature and humidity readings  
- Comfort status explanation  
- 1-hour temperature trend mini-chart  
- AI-generated lifestyle suggestions (ventilation, humidity control, clothing tips)

---

## 🌤 Weather Page

The Weather page includes:

### 1. Indoor Conditions
- Temperature  
- Humidity  
- PM2.5 (if supported)

### 2. Outdoor Conditions
- Temperature  
- Humidity  
- Weather description  
- PM2.5 and air quality labels  

### 3. Forecast
- Multi-day forecast with icons  
- High/low temperature  
- Humidity & PM2.5 trends  

Suggestions are displayed based on weather conditions (e.g., “avoid opening windows due to high humidity”).

---

## 🛠 Devices Page

- View device name, location, battery level, and sensor ID  
- Add new devices using the **"+"** button  
- Toggle device power on/off  
- Delete devices with confirmation prompts  

Device removal also deletes corresponding environment data.

---

## 📊 History Page

Visualize long-term environmental trends:

- **Hourly mode**: last 24 hours  
- **Daily mode**: last 30 days  
- Statistics (min/max/average)  
- Interactive line charts  

---

## ⚙️ Settings Page

- Language switch (English / 中文)  
- Submit feedback  
- Manage account settings  

---

## 🤖 AI Assistant

Accessible through the floating **AI** button:

You can ask:
- “Is the current temperature comfortable?”  
- “Should I open the window?”  
- “How should I adjust AC/humidifier?”  

The AI uses the latest sensor data to generate lifestyle recommendations.

---

## ✨ Key Features

### 📡 Sensor Monitoring
- Indoor & outdoor temperature/humidity  
- Real-time status detection  
- Mock data support  

### 📈 Trend Visualization
- 1-hour micro trend  
- Smooth bezier charts  
- Auto-timestamp labeling  

### 🌤 Weather Module
- Real-time weather  
- Multi-day forecast  
- Dynamic weather icons  

### 🤖 AI Assistant
- Comfort analysis  
- Ventilation & humidity suggestions  
- Scenario-based advice  

### 💬 Feedback System
- Built-in report form  
- Supabase/Bolt backend storage  
- Timestamped user feedback  

### ⚙️ Device Management
- Unified card UI  
- Battery & sensor metadata  
- Safe device deletion  

---

## 🛠 Tech Stack

- **React Native (Expo)**  
- **TypeScript**  
- Zustand / Context API  
- react-native-chart-kit  
- lucide-react-native  
- Supabase & Bolt backend  
- DeepSeek / OpenAI API  

---

## 📂 Folder Structure

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

## 👥 Team

- XJTLU Entrepreneur College (Taicang)  
- MonitorPro Development Team  
- ENT207 — Monday — Group 31  
- 2025  

**© 2025 XJTLU Student Project — For academic use only.**

---

# 🇨🇳 中文版本

## ⚠️ 免责声明

- **本应用为 Alpha 测试版**，部分功能可能未完成或存在不稳定情况。  
- 本项目由 **西交利物浦大学（XJTLU）学生团队** 为课程作业开发。  
- **仅用于教学、研究与展示，不得用于商业用途。**  
- 所有环境数据可能为模拟数据，不代表真实测量。  
- AI 助手提供的建议不属于专业意见。

---

## 🌟 项目简介

**MonitorPro** 是一款集 “环境监测 + 天气预报 + 趋势分析 + AI 建议” 于一体的智能生活助手。  
通过直观仪表盘与趋势图，帮助用户理解周围环境变化并获得生活建议。

---

## 🚀 开始使用

### Web 版
- 打开浏览器访问：**https://monitorpro-environme-gbbc.bolt.host**

### Android APK （推荐）
- 在 Android 设备上安装 APK 文件后即可使用。

---

## 👤 登录与注册

- 通过 **Sign Up** 注册新账号，或  
- 使用 **访客模式（Guest Mode）** 无需登录即可体验。 （推荐）

---

## 🏠 仪表盘（Dashboard）

- 显示最新温度与湿度  
- 提供状态标签：**Optimal / Warning / Critical**  
- 显示数据更新时间  
- 颜色区分各类环境状态  

帮助用户快速了解当前室内外环境状况。

---

## 🔍 传感器详情页

点击任意卡片进入：

- 最新温湿度  
- 状态解释  
- 最近 1 小时趋势图  
- AI 的生活建议（通风、穿衣、除湿等）

---

## 🌤 天气页面

包括三部分：

### 1. 室内（Indoor）
- 温度、湿度、PM2.5（如支持）

### 2. 室外（Outdoor）
- 天气状况、温度、湿度、PM2.5  

### 3. 天气预报（Forecast）
- 未来数天的高低温、湿度、空气质量  
- 动态天气图标  

页面底部会给出开窗、除湿等生活建议。

---

## 🛠 设备页面（Devices）

- 查看设备名称、位置、电量、传感器 ID  
- 通过 **"+"** 添加新设备  
- 远程启停  
- 删除设备（带确认弹窗）  

删除设备会同时删除相关环境数据。

---

## 📊 历史趋势（History）

- **小时模式**：最近 24 小时趋势  
- **天数模式**：最近 30 天趋势  
- 显示最高/最低/平均值  
- 可滑动折线图  

---

## ⚙️ 设置（Settings）

- 切换语言（中 / 英）  
- 提交反馈  
- 管理账号信息  

---

## 🤖 AI 智能助手

点击右侧 **AI 浮动按钮** 打开：

你可以询问：
- 当前温湿度是否舒适？  
- 是否适合开窗通风？  
- 空调/加湿器应该怎么调？  

AI 会结合当前数据给出直观建议。

---

## ✨ 核心功能

- 室内外温湿度监测  
- 趋势图可视化  
- 天气与预报  
- AI 生活建议  
- 设备管理功能  
- 反馈系统  

---

## 🛠 技术栈

- React Native (Expo)  
- TypeScript  
- Zustand / Context API  
- react-native-chart-kit  
- lucide-react-native  
- Supabase / Bolt  
- DeepSeek / OpenAI API  

---

## 📂 文件结构

（同英文版本）

---

## 👥 开发团队

- 西交利物浦大学太仓校区  
- MonitorPro 项目组  
- ENT207 — 周一 — 第 31 组  
- 2025  

**© 2025 西交利物浦大学学生项目，仅用于学术用途。**

