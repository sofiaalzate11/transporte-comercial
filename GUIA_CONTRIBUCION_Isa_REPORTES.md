# Manual de Contribución: Módulo CRUD de Reportes Ciudadanos

Guía técnica individual para el **Integrante 4**. Contiene el código fuente completo, rutas exactas, números de línea precisos y comandos Git atómicos para demostrar autoría individual en GitHub.

---

## 📌 Resumen de Asignación y Métricas

| Parámetro | Detalle |
| :--- | :--- |
| **Rol asignado** | Integrante 4 |
| **Módulo** | Reportes Locales de Incidentes Ciudadanos (CRUD Completo) |
| **Archivos nuevos** | 6 archivos (`UserReport.ts`, `IUserReportRepository.ts`, `UserReportDao.ts`, `UserReportRepositoryImpl.ts`, `useUserReports.ts`, `app/reports.tsx`) |
| **Archivos a modificar** | 3 archivos (`DatabaseManager.ts`, `app/index.tsx`, `app/_layout.tsx`) |
| **Commits demostrables** | 4 commits atómicos |
| **Capas involucradas** | Capa 2 (Dominio), Capa 3 (Datos/SQLite) y Capa 1 (Presentación/UI) |

---

## 📍 Tabla Rápida: Líneas Exactas en Archivos Existentes

| Archivo Existente | Número de Línea | Acción a Realizar |
| :--- | :--- | :--- |
| [DatabaseManager.ts](file:///c:/Users/Duber/.gemini/antigravity/scratch/transporte_colombia_rn/docs/transporte-comercial/src/data/datasources/local/DatabaseManager.ts) | **Línea 40** | Pegar tabla SQL `user_reports` e índices |
| [index.tsx](file:///c:/Users/Duber/.gemini/antigravity/scratch/transporte_colombia_rn/docs/transporte-comercial/app/index.tsx) | **Línea 75 a 81** | Añadir botón "Mis Reportes" dentro de `actionsRow` |
| [_layout.tsx](file:///c:/Users/Duber/.gemini/antigravity/scratch/transporte_colombia_rn/docs/transporte-comercial/app/_layout.tsx) | **Línea 50** | Registrar la ruta `<Stack.Screen name="reports" />` |

---

## 🚀 Paso a Paso de Implementación

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
* **Commit en Git (Commit 1):**
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
* **Commit en Git (Commit 2):**
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
* **Commit en Git (Commit 3):**
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
* **Commit en Git (Commit 4):**
```bash
git add src/presentation/hooks/useUserReports.ts app/reports.tsx app/index.tsx app/_layout.tsx
git commit -m "feat(presentation): add ReportsScreen CRUD with SQLite and integrate in RootLayout"
```

---

## 🔍 Comprobación Final Obligatoria

Ejecutar en la terminal antes del push final:
```bash
npx tsc --noEmit
```
Debe responder con **código 0 (cero errores)**.

* **Verificación de historial en Git:**
```bash
git log -n 4 --oneline
```
Verificar que los 4 commits figuren con la autoría del Integrante 4.
