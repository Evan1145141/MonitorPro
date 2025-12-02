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

## 📱 Usage Guide / 使用指南

下面是 MonitorPro 环境监测应用的基本使用方法，方便用户快速了解核心功能和操作流程。

---

### 🚀 Getting Started / 开始使用

**Web 版（推荐）**

- 直接访问：`https://monitorpro-environme-gbbc.bolt.host`
- 无需安装，浏览器即可使用。

**Android APK**

- 在 Android 手机上安装提供的 APK 文件。
- 首次打开后进入启动页面，即可开始使用。

---

### 👤 Sign In / Sign Up 登录与注册

- 新用户可通过 **Sign Up** 注册账号；
- 或选择 **Guest Mode（访客模式）** 直接体验，无需注册。

---

### 🏠 Dashboard / 仪表盘

- 显示所有传感器的 **实时温度与湿度**；
- 每个卡片右上角显示状态：**Optimal / Warning / Critical**；
- 卡片底部显示 `Last updated` 最后更新时间。

> 作用：一眼看到当前室内外环境是否舒适。

---

### 🔍 Sensor Detail View / 传感器详情

点击 Dashboard 中任意传感器卡片进入详情页：

- 展示该传感器最新的温度、湿度；
- 显示当前状态标签（Optimal / Warning / Critical）和文字说明；
- 显示 **过去 1 小时的温度趋势曲线**；
- 下方给出针对当前环境的日常建议（穿衣、通风等）。

---

### 🌤 Weather Page / 天气页面

Weather 页面包含三部分：

1. **Indoor（室内）**
   - 室内温度、湿度（以及 PM2.5，如有硬件支持）；
2. **Outdoor（室外）**
   - 室外天气状况、温度、湿度、PM2.5；
3. **Forecast（天气预报）**
   - 接下来几天的高/低温、湿度、PM2.5 以及天气图标。

> 页面下方会给出与天气相关的建议，例如：是否适合开窗、是否需要除湿等。

---

### 🛠 Devices Page / 设备管理

- 查看每个设备的名称、位置、传感器 ID、电量等信息；
- 右上角 **“+”** 按钮可添加新设备；
- 卡片上的 **开关图标** 用于远程控制设备启停；
- 点击 **Delete Device** 删除不再使用的设备。

---

### 📊 History Page / 历史趋势

用于查看一段时间内的环境变化趋势：

- **Hourly** 模式：显示过去 24 小时的温度/湿度变化；
- **Daily** 模式：显示过去 30 天的温度/湿度趋势；
- 提供平均温湿度、最高/最低温度等统计；
- 下方折线图用于观察整体趋势，可滑动查看。

---

### ⚙️ Settings Page / 设置

- 切换界面语言（English / 中文）；
- 提交反馈或问题；
- 管理账号相关设置。

---

### 🤖 AI Assistant / AI 智能助手

- 屏幕右侧的 **“AI” 浮动按钮** 可随时打开聊天窗口；
- 可以询问：
  - 当前温湿度是否舒适？
  - 是否适合开窗通风？
  - 如何改善 PM2.5/湿度情况？
  - 在宿舍/办公室应该如何调节空调、加湿器等？
- AI 会结合当前环境数据，给出简单易懂的生活建议。

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

- XJTLU Entrepreneur College (Taicang)
- MonitorPro Development Team
- ENT207-Monday-Group31
- 2025

© 2025 XJTLU Student Project. All rights reserved.
For academic use only.
Not for commercial applications.
