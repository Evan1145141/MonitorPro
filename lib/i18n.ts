export type Language = 'en' | 'zh';

export interface Translations {
  dashboardTitle: string;
  historyTitle: string;
  settingsTitle: string;
  devicesTitle: string;
  weatherTitle: string;
  guestBanner: string;
  guestUser: string;
  notRegistered: string;
  changePassword: string;
  completeSignup: string;
  continueAsGuest: string;
  temperature: string;
  humidity: string;
  optimal: string;
  warning: string;
  lastUpdated: string;
  noDevicesFound: string;
  addDevice: string;
  loading: string;
  noDataAvailable: string;
  hourly: string;
  daily: string;
  temperatureTrend: string;
  humidityTrend: string;
  last24Hours: string;
  last30Days: string;
  statistics: string;
  avgTemperature: string;
  avgHumidity: string;
  maxTemperature: string;
  minTemperature: string;
  profile: string;
  accountSecurity: string;
  language: string;
  english: string;
  chinese: string;
  signOut: string;
  signIn: string;
  signUp: string;
  email: string;
  password: string;
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  changePasswordTitle: string;
  passwordMismatch: string;
  passwordTooShort: string;
  passwordChangeSuccess: string;
  incorrectPassword: string;
  requiredField: string;
  cancel: string;
  save: string;
  deviceName: string;
  sensorId: string;
  location: string;
  status: string;
  active: string;
  inactive: string;
  currentWeather: string;
  forecast: string;
  feelsLike: string;
  wind: string;
  precipitation: string;
  askQuestion: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  fullName: string;
  emailCannotChange: string;
  saveChanges: string;
  saving: string;
  submitFeedback: string;
  feedback: string;
  disclaimerAlpha: string;
  disclaimerDevelopers: string;
  disclaimerPurpose: string;
}

const translations: Record<Language, Translations> = {
  en: {
    dashboardTitle: 'Dashboard',
    historyTitle: 'History',
    settingsTitle: 'Settings',
    devicesTitle: 'Devices',
    weatherTitle: 'Weather',
    guestBanner: 'You are currently using guest mode. Data is for demo only.',
    guestUser: 'Guest User',
    notRegistered: 'Not registered',
    changePassword: 'Change Password',
    completeSignup: 'Complete Sign-Up',
    continueAsGuest: 'Continue as Guest',
    temperature: 'Temperature',
    humidity: 'Humidity',
    optimal: 'Optimal',
    warning: 'Warning',
    lastUpdated: 'Last updated',
    noDevicesFound: 'No Devices Found',
    addDevice: 'Add a device to start monitoring',
    loading: 'Loading...',
    noDataAvailable: 'No data available for this period',
    hourly: 'Hourly',
    daily: 'Daily',
    temperatureTrend: 'Temperature Trend',
    humidityTrend: 'Humidity Trend',
    last24Hours: 'Last 24 hours',
    last30Days: 'Last 30 days',
    statistics: 'Statistics',
    avgTemperature: 'Avg Temperature',
    avgHumidity: 'Avg Humidity',
    maxTemperature: 'Max Temperature',
    minTemperature: 'Min Temperature',
    profile: 'Profile',
    accountSecurity: 'Account Security',
    language: 'Language',
    english: 'English',
    chinese: '中文',
    signOut: 'Sign Out',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    changePasswordTitle: 'Change Password',
    passwordMismatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordChangeSuccess: 'Password changed successfully',
    incorrectPassword: 'Current password is incorrect',
    requiredField: 'This field is required',
    cancel: 'Cancel',
    save: 'Save',
    deviceName: 'Device Name',
    sensorId: 'Sensor ID',
    location: 'Location',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    currentWeather: 'Current Weather',
    forecast: 'Forecast',
    feelsLike: 'Feels like',
    wind: 'Wind',
    precipitation: 'Precipitation',
    askQuestion: 'Ask me anything about your sensors...',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    fullName: 'Full Name',
    emailCannotChange: 'Email cannot be changed',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    submitFeedback: 'Submit Feedback',
    feedback: 'Feedback',
    disclaimerAlpha: '⚠️ This app is an Alpha testing build with incomplete or unstable features.',
    disclaimerDevelopers: "👩‍💻 Developed by students at Xi'an Jiaotong-Liverpool University (XJTLU) as part of an academic project.",
    disclaimerPurpose: '🚫 Strictly for educational and experimental purposes only. Not for commercial use.',
  },
  zh: {
    dashboardTitle: '仪表盘',
    historyTitle: '历史记录',
    settingsTitle: '设置',
    devicesTitle: '设备',
    weatherTitle: '天气',
    guestBanner: '您正在以游客身份体验，当前数据仅用于演示。',
    guestUser: '游客用户',
    notRegistered: '未注册',
    changePassword: '修改密码',
    completeSignup: '完成注册',
    continueAsGuest: '游客模式',
    temperature: '温度',
    humidity: '湿度',
    optimal: '正常',
    warning: '警告',
    lastUpdated: '最后更新',
    noDevicesFound: '未找到设备',
    addDevice: '添加设备以开始监控',
    loading: '加载中...',
    noDataAvailable: '此时段无可用数据',
    hourly: '每小时',
    daily: '每日',
    temperatureTrend: '温度趋势',
    humidityTrend: '湿度趋势',
    last24Hours: '最近24小时',
    last30Days: '最近30天',
    statistics: '统计数据',
    avgTemperature: '平均温度',
    avgHumidity: '平均湿度',
    maxTemperature: '最高温度',
    minTemperature: '最低温度',
    profile: '个人资料',
    accountSecurity: '账户安全',
    language: '语言',
    english: 'English',
    chinese: '中文',
    signOut: '退出登录',
    signIn: '登录',
    signUp: '注册',
    email: '邮箱',
    password: '密码',
    confirmPassword: '确认密码',
    currentPassword: '当前密码',
    newPassword: '新密码',
    confirmNewPassword: '确认新密码',
    changePasswordTitle: '修改密码',
    passwordMismatch: '密码不匹配',
    passwordTooShort: '密码必须至少8个字符',
    passwordChangeSuccess: '密码修改成功',
    incorrectPassword: '当前密码不正确',
    requiredField: '此字段为必填项',
    cancel: '取消',
    save: '保存',
    deviceName: '设备名称',
    sensorId: '传感器ID',
    location: '位置',
    status: '状态',
    active: '活跃',
    inactive: '停用',
    currentWeather: '当前天气',
    forecast: '预报',
    feelsLike: '体感温度',
    wind: '风速',
    precipitation: '降水',
    askQuestion: '询问您的传感器相关问题...',
    alreadyHaveAccount: '已有账户？',
    dontHaveAccount: '还没有账户？',
    fullName: '全名',
    emailCannotChange: '邮箱无法更改',
    saveChanges: '保存更改',
    saving: '保存中...',
    submitFeedback: '提交反馈',
    feedback: '反馈',
    disclaimerAlpha: '⚠️ 此应用为 Alpha 测试版本，功能可能不完整或不稳定。',
    disclaimerDevelopers: '👩‍💻 由西交利物浦大学 (XJTLU) 学生开发，作为学术项目的一部分。',
    disclaimerPurpose: '🚫 仅用于教育和实验目的。禁止商业使用。',
  },
};

export function getTranslations(language: Language): Translations {
  return translations[language] || translations.en;
}

export function getLanguageFromStorage(): Language {
  if (typeof localStorage === 'undefined') return 'en';
  const stored = localStorage.getItem('language');
  return (stored === 'zh' ? 'zh' : 'en') as Language;
}

export function setLanguageInStorage(language: Language): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('language', language);
}
