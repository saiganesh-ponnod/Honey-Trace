export const SENSOR_THRESHOLDS = {
  temperature: {
    minNormal: 10,
    maxNormal: 30,
    abnormalLow: 5,
    abnormalHigh: 35,
    extremeHigh: 40,
    unit: '°C',
    warningText: 'Excessive heat breaks down delicate enzymes like diastase and causes HMF formation.'
  },
  humidity: {
    minNormal: 20,
    maxNormal: 65,
    abnormalHigh: 75,
    unit: '%',
    warningText: 'High ambient humidity during storage can cause honey to absorb moisture and ferment.'
  },
  staleHours: 24,
  transitMaxDays: 7
};
