export interface SodaTollRecord {
  id?: string;
  peaje?: string;
  departamento?: string;
  sector?: string;
  concesion?: string;
  latitud?: string | number;
  longitud?: string | number;
  categoria_i?: string | number;
  categoria_ii?: string | number;
  categoria_iii?: string | number;
  categoria_iv?: string | number;
  categoria_v?: string | number;
}

export class SocrataTollsClient {
  // Portal Datos Abiertos Colombia SODA API
  private static readonly SODA_ENDPOINT =
    'https://www.datos.gov.co/resource/723e-ub4m.json?$limit=50';

  public async fetchTolls(): Promise<SodaTollRecord[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(SocrataTollsClient.SODA_ENDPOINT, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const records: SodaTollRecord[] = await response.json();
      if (Array.isArray(records) && records.length > 0) {
        return records;
      }
      return this.getFallbackTolls();
    } catch {
      return this.getFallbackTolls();
    }
  }

  private getFallbackTolls(): SodaTollRecord[] {
    return [
      {
        id: 'peaje-copacabana',
        peaje: 'Copacabana',
        departamento: 'ANTIOQUIA',
        sector: 'Autopista Medellin - Bogota km 14',
        concesion: 'Devimed',
        latitud: 6.3475,
        longitud: -75.4988,
        categoria_i: 16200,
        categoria_ii: 21500,
        categoria_iii: 32400,
        categoria_iv: 41200,
        categoria_v: 51800,
      },
      {
        id: 'peaje-los-andes',
        peaje: 'Los Andes',
        departamento: 'CUNDINAMARCA',
        sector: 'Autopista Norte Bogota km 23',
        concesion: 'Accesos Norte',
        latitud: 4.8812,
        longitud: -74.0321,
        categoria_i: 11400,
        categoria_ii: 13900,
        categoria_iii: 28300,
        categoria_iv: 36700,
        categoria_v: 44200,
      },
      {
        id: 'peaje-el-cerrito',
        peaje: 'El Cerrito',
        departamento: 'VALLE DEL CAUCA',
        sector: 'Cali - Palmira - Cerrito',
        concesion: 'Rutas del Valle',
        latitud: 3.6841,
        longitud: -76.3129,
        categoria_i: 10800,
        categoria_ii: 14200,
        categoria_iii: 26500,
        categoria_iv: 34100,
        categoria_v: 41900,
      },
      {
        id: 'peaje-curiti',
        peaje: 'Curiti',
        departamento: 'SANTANDER',
        sector: 'Bucaramanga - San Gil',
        concesion: 'Autovias Santander',
        latitud: 6.6121,
        longitud: -73.0712,
        categoria_i: 12100,
        categoria_ii: 16700,
        categoria_iii: 29800,
        categoria_iv: 38200,
        categoria_v: 47600,
      },
    ];
  }
}
