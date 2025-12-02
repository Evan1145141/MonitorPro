// miniTrend.ts
export interface MiniTrendPoint {
  time: string;       // 用于横坐标显示
  temperature: number;
  humidity: number;
}

export function generateMiniTrend(
  currentTemp: number,
  currentHumidity: number
): MiniTrendPoint[] {
  const now = new Date();
  const points: MiniTrendPoint[] = [];

  // 生成最近 1 小时，每 10 分钟一个点，一共 6 个
  for (let i = 5; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 10 * 60 * 1000);

    const hh = t.getHours().toString().padStart(2, '0');
    const mm = t.getMinutes().toString().padStart(2, '0');
    const label = `${hh}:${mm}`; // 例如 11:55, 11:45 ...

    // 做一点轻微波动，让曲线看起来不死板
    const tempOffset = (Math.random() - 0.5) * 0.6;      // ±0.3°C
    const humOffset = (Math.random() - 0.5) * 4;         // ±2%

    points.push({
      time: label,
      temperature: Number((currentTemp + tempOffset).toFixed(1)),
      humidity: Number((currentHumidity + humOffset).toFixed(1)),
    });
  }

  return points;
}
