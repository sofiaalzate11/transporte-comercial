# Manual de Contribución y Asignación de Tareas CRUD (Equipo 4)

Este documento es la guía técnica de implementación para los **Integrantes 3 y 4**. Contiene las rutas exactas, números de línea precisos, código fuente y comandos Git para demostrar su autoría en el repositorio de GitHub.

---

## 📌 Resumen General de Asignación

| Integrante | Módulo CRUD | Archivos a Crear / Modificar | Commits Demostrables |
| :--- | :--- | :--- | :--- |
| **Integrante 3** | Persistencia y Cálculo de Peajes (SODA) | 5 archivos nuevos + 3 modificaciones | 4 commits |
| **Integrante 4** | Reportes Locales de Incidentes Ciudadanos | 5 archivos nuevos + 3 modificaciones | 4 commits |

---

## 📍 Tabla Rápida: Líneas Exactas en Archivos Existentes

### Para Integrante 3 (Peajes):
| Archivo Existente | Número de Línea | Qué Debe Hacer |
| :--- | :--- | :--- |
| `src/data/datasources/local/DatabaseManager.ts` | **Línea 38** | Pegar tabla SQL `toll_stations` e índices |
| `app/tolls.tsx` | **Líneas 14 y 15** | Descomentar importaciones de `useTollStations` y `TollCard` |
| `app/tolls.tsx` | **Línea 26** | Descomentar hook y borrar variables temporales (L27-L30) |
| `app/tolls.tsx` | **Línea 101** | Descomentar `renderItem` con `TollCard` y retirar L102-L106 |
| `app/index.tsx` | **Línea 13** | Descomentar importación `useTollStations` |
| `app/index.tsx` | **Líneas 22 y 23** | Descomentar `const { tolls } = useTollStations();` y actualizar contador |

### Para Integrante 4 (Reportes):
| Archivo Existente | Número de Línea | Qué Debe Hacer |
| :--- | :--- | :--- |
| `src/data/datasources/local/DatabaseManager.ts` | **Línea 40** | Pegar tabla SQL `user_reports` |
| `app/index.tsx` | **Línea 81** | Añadir botón "Mis Reportes" en `actionsRow` |
| `app/_layout.tsx` | **Línea 50** | Registrar la ruta `<Stack.Screen name="reports" />` |

---

# 👤 INTEGRANTE 3: MÓDULO CRUD DE PEAJES VIALES

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
* **Commit en Git:**
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
* **Commit en Git:**
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
* **Commit en Git:**
```bash
git add src/presentation/hooks/useTollStations.ts src/presentation/components/TollCard.tsx app/tolls.tsx app/index.tsx
git commit -m "feat(presentation): connect useTollStations and TollCard into screens"
```

---

# 👤 INTEGRANTE 4: MÓDULO CRUD DE REPORTES CIUDADANOS

### Paso 1: Modificar `src/data/datasources/local/DatabaseManager.ts`
* **Acción:** Abrir [DatabaseManager.ts](file:///c:/Users/Duber/.gemini/antigravity/scratch/transporte_colombia_rn/docs/transporte-comercial/src/data/datasources/local/DatabaseManager.ts).
* **Ubicación:** Buscar la **Línea 40** (justo debajo del comentario `-- [INTEGRANTE 4: REPORTES]`).
* **Código a pegar:**
```sql
      CREATE TABLE IF NOT EXISTS user_reports (
        id TEXT PRIMARY KEY NOT NULL,
        road_name TEXT NOT NULL,
        kilometer REAL NOT NULL,
        description TEXT NOT NULL,
        incident_type TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_user_reports_date ON user_reports(created_at);
```
* **Commit en Git:**
```bash
git add src/data/datasources/local/DatabaseManager.ts
git commit -m "feat(db): add user_reports table schema to DatabaseManager"
```

---

### Paso 2: Crear `src/domain/models/UserReport.ts`
* **Acción:** Crear el archivo nuevo `src/domain/models/UserReport.ts`.
* **Código a pegar:**
```typescript
export type UserIncidentType = 'DERRUMBE' | 'ACCIDENTE' | 'VARADO' | 'OBRAS' | 'OTRO';

export interface UserReport {
  id: string;
  roadName: string;
  kilometer: number;
  description: string;
  incidentType: UserIncidentType;
  createdAt: string; // ISO-8601
}
```

---

### Paso 3: Crear `src/domain/repositories/IUserReportRepository.ts`
* **Acción:** Crear el archivo nuevo `src/domain/repositories/IUserReportRepository.ts`.
* **Código a pegar:**
```typescript
import { UserReport } from '../models/UserReport';

export interface IUserReportRepository {
  createReport(report: UserReport): Promise<void>;
  getAllReports(): Promise<UserReport[]>;
  deleteReport(id: string): Promise<void>;
}
```
* **Commit en Git:**
```bash
git add src/domain/models/UserReport.ts src/domain/repositories/IUserReportRepository.ts
git commit -m "feat(domain): define UserReport entity and IUserReportRepository contract"
```

---

### Paso 4: Crear `src/data/datasources/local/UserReportDao.ts`
* **Acción:** Crear el archivo nuevo `src/data/datasources/local/UserReportDao.ts`.
* **Código a pegar:**
```typescript
import { DatabaseManager } from './DatabaseManager';
import { UserReport, UserIncidentType } from '../../../domain/models/UserReport';

interface UserReportRow {
  id: string;
  road_name: string;
  kilometer: number;
  description: string;
  incident_type: string;
  created_at: string;
}

export class UserReportDao {
  private db = DatabaseManager.getDatabase();

  public insertReport(report: UserReport): void {
    const stmt = this.db.prepareSync(`
      INSERT INTO user_reports (id, road_name, kilometer, description, incident_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?);
    `);
    try {
      stmt.executeSync([
        report.id,
        report.roadName,
        report.kilometer,
        report.description,
        report.incidentType,
        report.createdAt,
      ]);
    } finally {
      stmt.finalizeSync();
    }
  }

  public getAll(): UserReport[] {
    const rows = this.db.getAllSync<UserReportRow>(
      'SELECT * FROM user_reports ORDER BY created_at DESC;'
    );
    return rows.map((r) => ({
      id: r.id,
      roadName: r.road_name,
      kilometer: r.kilometer,
      description: r.description,
      incidentType: r.incident_type as UserIncidentType,
      createdAt: r.created_at,
    }));
  }

  public deleteById(id: string): void {
    const stmt = this.db.prepareSync('DELETE FROM user_reports WHERE id = ?;');
    try {
      stmt.executeSync([id]);
    } finally {
      stmt.finalizeSync();
    }
  }
}
```

---

### Paso 5: Crear `src/data/repositories/UserReportRepositoryImpl.ts`
* **Acción:** Crear el archivo nuevo `src/data/repositories/UserReportRepositoryImpl.ts`.
* **Código a pegar:**
```typescript
import { IUserReportRepository } from '../../domain/repositories/IUserReportRepository';
import { UserReport } from '../../domain/models/UserReport';
import { UserReportDao } from '../datasources/local/UserReportDao';

export class UserReportRepositoryImpl implements IUserReportRepository {
  constructor(private readonly localDao: UserReportDao = new UserReportDao()) {}

  public async createReport(report: UserReport): Promise<void> {
    this.localDao.insertReport(report);
  }

  public async getAllReports(): Promise<UserReport[]> {
    return this.localDao.getAll();
  }

  public async deleteReport(id: string): Promise<void> {
    this.localDao.deleteById(id);
  }
}
```
* **Commit en Git:**
```bash
git add src/data/datasources/local/UserReportDao.ts src/data/repositories/UserReportRepositoryImpl.ts
git commit -m "feat(data): implement UserReportDao and UserReportRepositoryImpl SQLite CRUD"
```

---

### Paso 6: Crear Hook `src/presentation/hooks/useUserReports.ts`
* **Acción:** Crear el archivo `src/presentation/hooks/useUserReports.ts`.
* **Código a pegar:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserReportRepositoryImpl } from '../../data/repositories/UserReportRepositoryImpl';
import { UserReport } from '../../domain/models/UserReport';

const repo = new UserReportRepositoryImpl();

export function useUserReports() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user_reports'],
    queryFn: () => repo.getAllReports(),
  });

  const addMutation = useMutation({
    mutationFn: (report: UserReport) => repo.createReport(report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_reports'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => repo.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_reports'] });
    },
  });

  return {
    reports: query.data ?? [],
    isLoading: query.isLoading,
    createReport: addMutation.mutate,
    deleteReport: deleteMutation.mutate,
  };
}
```

---

### Paso 7: Crear Pantalla `app/reports.tsx`
* **Acción:** Crear el archivo `app/reports.tsx`.
* **Código a pegar:**
```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useUserReports } from '@presentation/hooks/useUserReports';
import { UserIncidentType } from '@domain/models/UserReport';

export default function ReportsScreen() {
  const { reports, createReport, deleteReport } = useUserReports();
  const [roadName, setRoadName] = useState('');
  const [kilometer, setKilometer] = useState('');
  const [description, setDescription] = useState('');
  const [incidentType, setIncidentType] = useState<UserIncidentType>('DERRUMBE');

  const handleAdd = () => {
    if (!roadName.trim() || !description.trim()) {
      Alert.alert('Error', 'Ingrese la vía y la descripción.');
      return;
    }

    createReport({
      id: `rep-${Date.now()}`,
      roadName: roadName.trim(),
      kilometer: Number(kilometer) || 0,
      description: description.trim(),
      incidentType,
      createdAt: new Date().toISOString(),
    });

    setRoadName('');
    setKilometer('');
    setDescription('');
  };

  return (
    <View style={styles.container}>
      {/* Formulario Crear */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Reportar Incidencia Propia</Text>
        <TextInput
          placeholder="Nombre de la Vía (ej. Medellín - Bogotá)"
          placeholderTextColor="#64748B"
          style={styles.input}
          value={roadName}
          onChangeText={setRoadName}
        />
        <TextInput
          placeholder="Kilómetro (ej. 42)"
          placeholderTextColor="#64748B"
          keyboardType="numeric"
          style={styles.input}
          value={kilometer}
          onChangeText={setKilometer}
        />
        <TextInput
          placeholder="Descripción del incidente..."
          placeholderTextColor="#64748B"
          style={[styles.input, { height: 60 }]}
          multiline
          value={description}
          onChangeText={setDescription}
        />
        <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
          <Text style={styles.submitText}>Guardar Reporte en SQLite</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Reportes */}
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reportCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardRoad}>{item.roadName} (km {item.kilometer})</Text>
              <Text style={styles.cardType}>{item.incidentType}</Text>
            </View>
            <Text style={styles.cardDesc}>{item.description}</Text>
            <TouchableOpacity
              style={styles.delBtn}
              onPress={() => deleteReport(item.id)}
            >
              <Text style={styles.delText}>Eliminar Reporte</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No has registrado reportes personales aún.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1120', padding: 16 },
  formCard: { backgroundColor: '#1E293B', padding: 16, borderRadius: 12, marginBottom: 16 },
  formTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  input: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  submitBtn: { backgroundColor: '#0284C7', padding: 12, borderRadius: 8, alignItems: 'center' },
  submitText: { color: '#FFFFFF', fontWeight: '700' },
  reportCard: { backgroundColor: '#1E293B', padding: 14, borderRadius: 10, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardRoad: { color: '#F8FAFC', fontWeight: '700', fontSize: 14 },
  cardType: { color: '#38BDF8', fontSize: 12, fontWeight: '600' },
  cardDesc: { color: '#94A3B8', fontSize: 13, marginBottom: 8 },
  delBtn: { alignSelf: 'flex-end', padding: 4 },
  delText: { color: '#EF4444', fontSize: 12, fontWeight: '600' },
  empty: { marginTop: 30, alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 14 },
});
```

---

### Paso 8: Conectar botón en `app/index.tsx`
* **Acción:** Abrir [app/index.tsx](file:///c:/Users/Duber/.gemini/antigravity/scratch/transporte_colombia_rn/docs/transporte-comercial/app/index.tsx).
* **Ubicación:** Buscar la fila `actionsRow` (alrededor de la **Línea 75**).
* **Agregar botón:**
```tsx
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
          onPress={() => router.push('/reports')}
        >
          <Text style={styles.actionBtnText}>Mis Reportes</Text>
        </TouchableOpacity>
```
* **Commit en Git:**
```bash
git add src/presentation/hooks/useUserReports.ts app/reports.tsx app/index.tsx
git commit -m "feat(presentation): add ReportsScreen CRUD with SQLite and integrate in HomeScreen"
```

---

### Paso 9: Registrar la ruta en `app/_layout.tsx`
* **Acción:** Abrir [app/_layout.tsx](file:///c:/Users/Duber/.gemini/antigravity/scratch/transporte_colombia_rn/docs/transporte-comercial/app/_layout.tsx).
* **Ubicación:** Buscar la **Línea 50** (justo antes de `</Stack>`).
* **Código a pegar:**
```tsx
        <Stack.Screen
          name="reports"
          options={{
            title: 'Mis Reportes de Incidentes',
          }}
        />
```
* **Commit en Git:**
```bash
git add app/_layout.tsx
git commit -m "feat(navigation): register reports screen in RootLayout stack"
```

---

## 🔍 Comprobación Final Obligatoria

Ambos integrantes deben ejecutar en su terminal antes de hacer `git push`:
```bash
npx tsc --noEmit
```
Debe responder con **código 0 (cero errores)**.
