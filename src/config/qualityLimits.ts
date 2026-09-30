export interface QualityParameterLimit {
  key: string;
  name: string;
  unit: string;
  min?: number;
  max?: number;
  fssaiStandard: string;
  description: string;
}

export const QUALITY_REFERENCE_LIMITS: Record<string, QualityParameterLimit> = {
  moisturePct: {
    key: 'moisturePct',
    name: 'Moisture Content',
    unit: '%',
    max: 20.0,
    fssaiStandard: 'Max 20.0%',
    description: 'Higher moisture leads to fermentation and yeast growth.'
  },
  hmfMgKg: {
    key: 'hmfMgKg',
    name: 'Hydroxymethylfurfural (HMF)',
    unit: 'mg/kg',
    max: 40.0,
    fssaiStandard: 'Max 40 mg/kg (80 mg/kg in tropical regions)',
    description: 'Indicator of honey freshness and excessive heat treatment or adulteration with invert syrup.'
  },
  electricalConductivityMsCm: {
    key: 'electricalConductivityMsCm',
    name: 'Electrical Conductivity',
    unit: 'mS/cm',
    max: 0.8,
    fssaiStandard: 'Max 0.8 mS/cm for blossom honeys',
    description: 'Differentiates blossom honeys from honeydew and indicates mineral content.'
  },
  ph: {
    key: 'ph',
    name: 'pH Value',
    unit: 'pH',
    min: 3.2,
    max: 4.5,
    fssaiStandard: '3.2 to 4.5',
    description: 'Natural acidity of honey inhibits bacterial growth.'
  },
  diastaseNumber: {
    key: 'diastaseNumber',
    name: 'Diastase Activity',
    unit: 'Schade units',
    min: 8.0,
    fssaiStandard: 'Min 8.0 Schade Units',
    description: 'Natural bee enzyme that diminishes when honey is aged or artificially heated.'
  }
};
