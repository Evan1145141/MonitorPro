import { seedFrom, genSeries, genHourlySeries, overrideToday, needsRegeneration } from './timeSeries';

console.log('=== Time Series Mock Data Generator Tests ===\n');

console.log('Test 1: Deterministic seed generation');
const date1 = new Date('2024-01-15');
const seed1 = seedFrom(date1, 'office');
const seed2 = seedFrom(date1, 'office');
console.log(`Same date/device should produce same seed: ${seed1 === seed2}`);
console.log(`Seed value: ${seed1}\n`);

console.log('Test 2: Different devices have different seeds');
const seedOffice = seedFrom(date1, 'office');
const seedOutdoor = seedFrom(date1, 'outdoor');
console.log(`Office seed: ${seedOffice}`);
console.log(`Outdoor seed: ${seedOutdoor}`);
console.log(`Different: ${seedOffice !== seedOutdoor}\n`);

console.log('Test 3: Generate 7-day series for office');
overrideToday('2024-01-15');
const series = genSeries({
  days: 7,
  baseTemp: 22,
  tempRange: 5,
  baseHum: 45,
  humRange: 12,
  deviceId: 'office',
});
console.log('Labels:', series.labels);
console.log('Temps:', series.temps);
console.log('Hums:', series.hums);
console.log('');

console.log('Test 4: Simulate day change');
overrideToday('2024-01-15');
const series1 = genSeries({
  days: 3,
  baseTemp: 22,
  tempRange: 5,
  baseHum: 45,
  humRange: 12,
  deviceId: 'office',
});
console.log('Day 1 (Jan 15) last temp:', series1.temps[series1.temps.length - 1]);

overrideToday('2024-01-16');
const series2 = genSeries({
  days: 3,
  baseTemp: 22,
  tempRange: 5,
  baseHum: 45,
  humRange: 12,
  deviceId: 'office',
});
console.log('Day 2 (Jan 16) last temp:', series2.temps[series2.temps.length - 1]);
console.log('Values shifted (different last temp):', series1.temps[series1.temps.length - 1] !== series2.temps[series2.temps.length - 1]);
console.log('');

console.log('Test 5: Trend application');
const seriesWithTrend = genSeries({
  days: 10,
  baseTemp: 20,
  tempRange: 3,
  baseHum: 50,
  humRange: 10,
  trend: 0.2,
  deviceId: 'office',
});
console.log('With trend (+0.2/day):');
console.log('First temp:', seriesWithTrend.temps[0]);
console.log('Last temp:', seriesWithTrend.temps[seriesWithTrend.temps.length - 1]);
console.log('Should show upward trend\n');

console.log('Test 6: Hourly data generation');
overrideToday('2024-01-15T14:30:00');
const hourlySeries = genHourlySeries({
  hours: 24,
  baseTemp: 22,
  tempRange: 5,
  baseHum: 45,
  humRange: 12,
  deviceId: 'office',
});
console.log('Hourly labels (first 6):', hourlySeries.labels.slice(0, 6));
console.log('Hourly temps (first 6):', hourlySeries.temps.slice(0, 6));
console.log('Total hours generated:', hourlySeries.labels.length);
console.log('Shows diurnal cycle (temps vary by hour):', hourlySeries.temps[0] !== hourlySeries.temps[12]);
console.log('');

overrideToday(null);
console.log('=== Tests Complete ===');
