interface IndoorData {
  temp: number;
  humidity: number;
  pm25?: number;
}

interface OutdoorData {
  temp: number;
  humidity: number;
  pm25: number;
}

interface Recommendation {
  category: string;
  text: string;
}

export function generateRecommendations(
  indoor: IndoorData | null,
  outdoor: OutdoorData
): Recommendation[] {
  if (!indoor) {
    return [
      {
        category: 'No Data',
        text: 'Add a device to get indoor vs. outdoor insights.',
      },
    ];
  }

  const recommendations: Recommendation[] = [];

  const ventilationCondition =
    outdoor.pm25 <= 35 &&
    outdoor.humidity <= 70 &&
    outdoor.temp >= 18 &&
    outdoor.temp <= 28 &&
    outdoor.humidity + 5 < indoor.humidity;

  if (ventilationCondition) {
    recommendations.push({
      category: 'Ventilation',
      text: 'Open windows for 15–30 min to reduce indoor humidity.',
    });
  } else if (outdoor.pm25 > 75 || outdoor.humidity - indoor.humidity > 10) {
    recommendations.push({
      category: 'Ventilation',
      text: 'Keep windows closed to avoid humid/dirty air.',
    });
  } else {
    recommendations.push({
      category: 'Ventilation',
      text: 'Brief ventilation (5–10 min) is fine.',
    });
  }

  if (indoor.humidity >= 70) {
    recommendations.push({
      category: 'Humidity',
      text: 'Use dehumidifier or A/C dry mode.',
    });
  } else if (indoor.humidity <= 35) {
    recommendations.push({
      category: 'Humidity',
      text: 'Use a humidifier to improve comfort.',
    });
  }

  if (indoor.temp >= 28) {
    recommendations.push({
      category: 'Temperature',
      text: 'Set A/C to 24–26 °C (cooling).',
    });
  } else if (indoor.temp <= 18) {
    recommendations.push({
      category: 'Temperature',
      text: 'Set heating to 20–22 °C.',
    });
  }

  if (outdoor.pm25 > 115) {
    recommendations.push({
      category: 'Air Quality',
      text: 'Use an air purifier; keep windows closed.',
    });
  }

  return recommendations;
}
