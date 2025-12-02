export type SensorType = 'indoor' | 'outdoor';

export function getSuggestions(
  temp: number,
  humidity: number,
  sensorType: SensorType
): string[] {
  const tips: string[] = [];

  if (temp < 16) {
    tips.push('It is quite cold. Wear a thick jacket and keep socks on indoors.');
    tips.push('Consider closing windows and using a heater if you feel uncomfortable.');
  } else if (temp >= 16 && temp < 20) {
    tips.push('The temperature is a bit cool. A light sweater or hoodie is recommended.');
  } else if (temp >= 20 && temp <= 26) {
    tips.push('The temperature is comfortable for working and studying.');
  } else if (temp > 26 && temp <= 30) {
    tips.push('It feels warm. Drink more water and consider using a fan or AC.');
  } else if (temp > 30) {
    tips.push('It is very hot. Avoid intense activities and stay hydrated.');
  }

  if (humidity < 40) {
    tips.push('The air is rather dry. You may feel dry throat or skin.');
    tips.push('Consider using a humidifier or placing a cup of water in the room.');
  } else if (humidity >= 40 && humidity <= 60) {
    tips.push('Humidity is in a healthy range. Good for long indoor stays.');
  } else if (humidity > 60 && humidity <= 75) {
    tips.push('Humidity is a bit high. Open the window for 5–10 minutes if possible.');
  } else if (humidity > 75) {
    tips.push('Humidity is very high. Watch out for mold and condensation.');
  }

  if (sensorType === 'indoor') {
    tips.push('A tidy and well-ventilated room can further improve comfort.');
  } else {
    if (temp < 10) {
      tips.push('For outdoor activities, wear a hat and gloves if you stay outside for long.');
    } else if (temp > 28) {
      tips.push('Avoid staying under direct sunlight for too long around noon.');
    }
  }

  return tips.slice(0, 5);
}
