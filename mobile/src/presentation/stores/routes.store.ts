import { create } from 'zustand';
import { RouteModel } from '../../domain/entities/route.model';
import { IncidentModel } from '../../domain/entities/incident.model';
import { RouteRepositoryImpl } from '../../data/repositories/route.repository.impl';
import { SQLiteDataSource } from '../../data/datasources/sqlite.datasource';
import { ApiDataSource } from '../../data/datasources/api.datasource';
import { IDelayEvaluationResult } from '../../../../shared/types';

const sqliteDs = new SQLiteDataSource();
const apiDs = new ApiDataSource();
const routeRepository = new RouteRepositoryImpl(sqliteDs, apiDs);

interface RoutesState {
  rutas: RouteModel[];
  incidentes: IncidentModel[];
  rutaSeleccionada: RouteModel | null;
  evaluacionRetraso: IDelayEvaluationResult | null;
  cargando: boolean;
  cargarDatos: () => Promise<void>;
  seleccionarRuta: (ruta: RouteModel) => void;
  evaluarRetrasoRuta: (rutaId: string) => Promise<void>;
}

export const useRoutesStore = create<RoutesState>((set, get) => ({
  rutas: [],
  incidentes: [],
  rutaSeleccionada: null,
  evaluacionRetraso: null,
  cargando: false,

  cargarDatos: async () => {
    set({ cargando: true });
    try {
      const [rutas, incidentes] = await Promise.all([
        routeRepository.getRoutes(),
        routeRepository.getActiveIncidents(),
      ]);
      set({ rutas, incidentes, cargando: false });
    } catch {
      set({ cargando: false });
    }
  },

  seleccionarRuta: (ruta: RouteModel) => {
    set({ rutaSeleccionada: ruta });
    get().evaluarRetrasoRuta(ruta.id);
  },

  evaluarRetrasoRuta: async (rutaId: string) => {
    try {
      const resultado = await routeRepository.evaluateRouteDelay(rutaId);
      set({ evaluacionRetraso: resultado });
    } catch (e) {
      console.warn('Error calculando retraso:', e);
    }
  },
}));
