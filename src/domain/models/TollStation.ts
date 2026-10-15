export interface TollRate {
  category: string; // e.g. 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'
  description: string;
  priceCop: number;
}

export interface TollStation {
  id: string;
  name: string;
  department: string;
  roadSector: string;
  concessionaire: string;
  latitude: number;
  longitude: number;
  rates: TollRate[];
  updatedAt: string;
}
