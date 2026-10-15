# Manual de Contribución: Módulo CRUD de Peajes Viales

Guía técnica individual para el **Integrante 3**. Contiene el código fuente completo, rutas exactas, números de línea precisos y comandos Git atómicos para demostrar autoría individual en GitHub.

---

## 📌 Resumen de Asignación y Métricas

| Parámetro | Detalle |
| :--- | :--- |
| **Rol asignado** | Integrante 3 |
| **Módulo** | Persistencia Local y Catálogo de Peajes (SODA) |
| **Archivos nuevos** | 5 archivos |
| **Archivos a modificar** | 3 archivos (`DatabaseManager.ts`, `app/tolls.tsx`, `app/index.tsx`) |
| **Commits demostrables** | 4 commits atómicos |
| **Capas involucradas** | Capa 3 (Datos e Infraestructura) y Capa 1 (Presentación) |

---

## 📍 Tabla Rápida: Líneas Exactas en Archivos Existentes

| Archivo Existente | Número de Línea | Acción a Realizar |
| :--- | :--- | :--- |
| [DatabaseManager.ts](file:///c:/Users/Duber/.gemini/antigravity/scratch/transporte_colombia_rn/docs/transporte-comercial/src/data/datasources/local/DatabaseManager.ts) | **Línea 38** | Pegar tabla SQL `toll_stations` e índices |
| [tolls.tsx](file:///c:/Users/Duber/.gemini/antigravity/scratch/transporte_colombia_rn/docs/transporte-comercial/app/tolls.tsx) | **Líneas 14 y 15** | Descomentar importaciones de `useTollStations` y `TollCard` |
| [tolls.tsx](file:///c:/Users/Duber/.gemini/antigravity/scratch/transporte_colombia_rn/docs/transporte-comercial/app/tolls.tsx) | **Línea 26** | Descomentar hook y borrar variables temporales (L27-L30) |
| [tolls.tsx](file:///c:/Users/Duber/.gemini/antigravity/scratch/transporte_colombia_rn/docs/transporte-comercial/app/tolls.tsx) | **Línea 101** | Descomentar `renderItem` con `TollCard` y retirar dummy |
| [index.tsx](file:///c:/Users/Duber/.gemini/antigravity/scratch/transporte_colombia_rn/docs/transporte-comercial/app/index.tsx) | **Línea 13** | Descomentar importación `useTollStations` |
| [index.tsx](file:///c:/Users/Duber/.gemini/antigravity/scratch/transporte_colombia_rn/docs/transporte-comercial/app/index.tsx) | **Líneas 22 y 23** | Descomentar `const { tolls } = useTollStations();` y actualizar contador |

---

## 🚀 Paso a Paso de Implementación

### Paso 1: Modificar `src/data/datasources/local/DatabaseManager.ts`
* **Acción:** Abrir [DatabaseManager.ts](file:///c:/Users/Duber/.gemini/antigravity/scratch/transporte_colombia_rn/docs/transporte-comercial/src/data/datasources/local/DatabaseManager.ts).
* **Ubicación:** Buscar la **Línea 38** (justo debajo del comentario `-- [INTEGRANTE 3: PEAJES]`).
* **Código a pegar:**
```sql
      CREATE TABLE IF NOT EXISTS toll_stations (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        road_sector TEXT NOT NULL,
        concessionaire TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        rates_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_toll_stations_dept ON toll_stations(department);
```
* **Commit en Git (Commit 1):**
```bash
git add src/data/datasources/local/DatabaseManager.ts
git commit -m "feat(db): add toll_stations table schema to DatabaseManager"
```

---

### Paso 2: Crear `src/data/datasources/local/TollStationDao.ts`
* **Acción:** Crear el archivo nuevo `src/data/datasources/local/TollStationDao.ts`.
* **Código a pegar:**
```typescript
import { DatabaseManager } from './DatabaseManager';
import { TollStation } from '../../../domain/models/TollStation';

interface TollStationRow {
  id: string;
  name: string;
  department: string;
  road_sector: string;
  concessionaire: string;
  latitude: number;
  longitude: number;
  rates_json: string;
  updated_at: string;
}

export class TollStationDao {
  private db = DatabaseManager.getDatabase();

  public getAll(): TollStation[] {
    const rows = this.db.getAllSync<TollStationRow>(
      'SELECT * FROM toll_stations ORDER BY department ASC, name ASC;'
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      department: row.department,
      roadSector: row.road_sector,
      concessionaire: row.concessionaire,
      latitude: row.latitude,
      longitude: row.longitude,
      rates: JSON.parse(row.rates_json || '[]'),
      updatedAt: row.updated_at,
    }));
  }

  public getByDepartment(dept: string): TollStation[] {
    const rows = this.db.getAllSync<TollStationRow>(
      'SELECT * FROM toll_stations WHERE LOWER(department) = LOWER(?) ORDER BY name ASC;',
      [dept]
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      department: row.department,
      roadSector: row.road_sector,
      concessionaire: row.concessionaire,
      latitude: row.latitude,
      longitude: row.longitude,
      rates: JSON.parse(row.rates_json || '[]'),
      updatedAt: row.updated_at,
    }));
  }

  public upsertBatch(tolls: TollStation[]): void {
    if (tolls.length === 0) return;

    this.db.withTransactionSync(() => {
      const statement = this.db.prepareSync(`
        INSERT INTO toll_stations (
          id, name, department, road_sector, concessionaire,
          latitude, longitude, rates_json, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          department = excluded.department,
          road_sector = excluded.road_sector,
          concessionaire = excluded.concessionaire,
          latitude = excluded.latitude,
          longitude = excluded.longitude,
          rates_json = excluded.rates_json,
          updated_at = excluded.updated_at;
      `);

      try {
        for (const toll of tolls) {
          statement.executeSync([
            toll.id,
            toll.name,
            toll.department,
            toll.roadSector,
            toll.concessionaire,
            toll.latitude,
            toll.longitude,
            JSON.stringify(toll.rates),
            toll.updatedAt,
          ]);
        }
      } finally {
        statement.finalizeSync();
      }
    });
  }
}
```

---

### Paso 3: Crear `src/data/mappers/TollStationMapper.ts`
* **Acción:** Crear el archivo nuevo `src/data/mappers/TollStationMapper.ts`.
* **Código a pegar:**
```typescript
import { TollStation, TollRate } from '../../domain/models/TollStation';
import { SodaTollRecord } from '../datasources/remote/SocrataTollsClient';

export class TollStationMapper {
  public static fromSoda(record: SodaTollRecord, index: number): TollStation {
    const rates: TollRate[] = [];

    if (record.categoria_i) {
      rates.push({
        category: 'I',
        description: 'Automoviles, camperos y camionetas',
        priceCop: Number(record.categoria_i) || 0,
      });
    }
    if (record.categoria_ii) {
      rates.push({
        category: 'II',
        description: 'Buses y busetas',
        priceCop: Number(record.categoria_ii) || 0,
      });
    }
    if (record.categoria_iii) {
      rates.push({
        category: 'III',
        description: 'Camiones de 2 ejes',
        priceCop: Number(record.categoria_iii) || 0,
      });
    }
    if (record.categoria_iv) {
      rates.push({
        category: 'IV',
        description: 'Camiones de 3 y 4 ejes',
        priceCop: Number(record.categoria_iv) || 0,
      });
    }
    if (record.categoria_v) {
      rates.push({
        category: 'V',
        description: 'Camiones de 5 y 6 ejes',
        priceCop: Number(record.categoria_v) || 0,
      });
    }

    const id = record.id || `toll-${(record.peaje || 'peaje').toLowerCase().replace(/\s+/g, '-')}-${index}`;

    return {
      id,
      name: (record.peaje || 'Peaje Nacional').toUpperCase(),
      department: (record.departamento || 'COLOMBIA').toUpperCase(),
      roadSector: record.sector || 'Red Vial Nacional',
      concessionaire: record.concesion || 'INVIAS / ANI',
      latitude: Number(record.latitud) || 4.5709,
      longitude: Number(record.longitud) || -74.2973,
      rates,
      updatedAt: new Date().toISOString(),
    };
  }
}
```

---

### Paso 4: Crear `src/data/repositories/TollStationRepositoryImpl.ts`
* **Acción:** Crear el archivo nuevo `src/data/repositories/TollStationRepositoryImpl.ts`.
* **Código a pegar:**
```typescript
import { ITollStationRepository } from '../../domain/repositories/ITollStationRepository';
import { TollStation } from '../../domain/models/TollStation';
import { TollStationDao } from '../datasources/local/TollStationDao';
import { SocrataTollsClient } from '../datasources/remote/SocrataTollsClient';
import { TollStationMapper } from '../mappers/TollStationMapper';

export class TollStationRepositoryImpl implements ITollStationRepository {
  constructor(
    private readonly localDao: TollStationDao = new TollStationDao(),
    private readonly remoteClient: SocrataTollsClient = new SocrataTollsClient()
  ) {}

  public async getAllTolls(): Promise<TollStation[]> {
    const cached = this.localDao.getAll();
    if (cached.length === 0) {
      await this.syncTollsFromRemote();
      return this.localDao.getAll();
    }
    return cached;
  }

  public async getTollsByDepartment(department: string): Promise<TollStation[]> {
    return this.localDao.getByDepartment(department);
  }

  public async syncTollsFromRemote(): Promise<number> {
    const rawRecords = await this.remoteClient.fetchTolls();
    const domainTolls = rawRecords.map((r, i) => TollStationMapper.fromSoda(r, i));
    this.localDao.upsertBatch(domainTolls);
    return domainTolls.length;
  }
}
```
* **Commit en Git (Commit 2):**
```bash
git add src/data/datasources/local/TollStationDao.ts src/data/mappers/TollStationMapper.ts src/data/repositories/TollStationRepositoryImpl.ts
git commit -m "feat(data): implement TollStationDao, Mapper and Repository with SQLite caching"
```

---

### Paso 5: Crear Hook `src/presentation/hooks/useTollStations.ts`
* **Acción:** Crear el archivo `src/presentation/hooks/useTollStations.ts`.
* **Código a pegar:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TollStationRepositoryImpl } from '../../data/repositories/TollStationRepositoryImpl';
import { GetTollStationsUseCase } from '../../domain/usecases/GetTollStationsUseCase';

const repo = new TollStationRepositoryImpl();
const getTollsUseCase = new GetTollStationsUseCase(repo);

export function useTollStations(department?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['toll_stations', department ?? 'all'],
    queryFn: () => getTollsUseCase.execute(false, department),
    staleTime: 1000 * 60 * 30,
  });

  const syncMutation = useMutation({
    mutationFn: () => getTollsUseCase.execute(true, department),
    onSuccess: (data) => {
      queryClient.setQueryData(['toll_stations', department ?? 'all'], data);
    },
  });

  return {
    tolls: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    syncTolls: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
  };
}
```

---

### Paso 6: Crear Componente `src/presentation/components/TollCard.tsx`
* **Acción:** Crear el archivo `src/presentation/components/TollCard.tsx`.
* **Código a pegar:**
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TollStation } from '../../domain/models/TollStation';

interface TollCardProps {
  toll: TollStation;
  selectedCategory?: string;
}

export const TollCard: React.FC<TollCardProps> = ({ toll, selectedCategory = 'I' }) => {
  const currentRate = toll.rates.find((r) => r.category === selectedCategory);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.tollName}>{toll.name}</Text>
        <Text style={styles.deptBadge}>{toll.department}</Text>
      </View>

      <Text style={styles.sectorText}>{toll.roadSector}</Text>
      <Text style={styles.concessionText}>Concesion: {toll.concessionaire}</Text>

      <View style={styles.rateBox}>
        <View>
          <Text style={styles.rateLabel}>Tarifa Cat. {selectedCategory}</Text>
          <Text style={styles.rateDesc}>{currentRate?.description ?? 'Tarifa estandar'}</Text>
        </View>
        <Text style={styles.ratePrice}>
          {currentRate
            ? `$${currentRate.priceCop.toLocaleString('es-CO')} COP`
            : 'Consultar'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tollName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  deptBadge: {
    color: '#38BDF8',
    backgroundColor: '#0369A120',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '600',
  },
  sectorText: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 4,
  },
  concessionText: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 12,
  },
  rateBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  rateLabel: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },
  rateDesc: {
    color: '#64748B',
    fontSize: 11,
  },
  ratePrice: {
    color: '#34D399',
    fontSize: 16,
    fontWeight: '800',
  },
});
```

---

### Paso 7: Conectar en `app/tolls.tsx` y `app/index.tsx`
1. Abrir [app/tolls.tsx](file:///c:/Users/Duber/.gemini/antigravity/scratch/transporte_colombia_rn/docs/transporte-comercial/app/tolls.tsx):
   * En la **Línea 12**, descomentar:
     ```typescript
     import { useTollStations } from '@presentation/hooks/useTollStations';
     import { TollCard } from '@presentation/components/TollCard';
     ```
   * En la **Línea 24**, descomentar:
     ```typescript
     const { tolls, isLoading, syncTolls, isSyncing } = useTollStations();
     ```
     y borrar las 4 variables dummy temporales de abajo.
   * En la **Línea 105**, descomentar el `renderItem` con `<TollCard toll={item} selectedCategory={activeCategory} />`.
2. Abrir [app/index.tsx](file:///c:/Users/Duber/.gemini/antigravity/scratch/transporte_colombia_rn/docs/transporte-comercial/app/index.tsx):
   * En la **Línea 13**, descomentar:
     ```typescript
     import { useTollStations } from '@presentation/hooks/useTollStations';
     ```
   * En la **Línea 23**, descomentar `const { tolls } = useTollStations();` y cambiar `tollsCount = 0;` por `tollsCount = tolls.length;`.
* **Commit en Git (Commit 3):**
```bash
git add src/presentation/hooks/useTollStations.ts src/presentation/components/TollCard.tsx app/tolls.tsx app/index.tsx
git commit -m "feat(presentation): connect useTollStations and TollCard into screens"
```

---

## 🔍 Comprobación Final Obligatoria

Ejecutar en la terminal antes del push final:
```bash
npx tsc --noEmit
```
Debe responder con **código 0 (cero errores)**.

* **Commit final o verificación (Commit 4):**
```bash
git log -n 4 --oneline
```
Verificar que los 4 commits figuren con la autoría del Integrante 3.
