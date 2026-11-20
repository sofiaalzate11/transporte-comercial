import { create } from 'zustand';
import { RouteModel } from '../../domain/entities/route.model';
import { IncidentModel } from '../../domain/entities/incident.model';
import { RouteRepositoryImpl } from '../../data/repositories/route.repository.impl';
import { SQLiteDataSource } from '../../data/datasources/sqlite.datasource';
import { ApiDataSource } from '../../data/datasources/api.datasource';
import { IDelayEvaluationResult } from '../../shared/types';

const sqliteDs = new SQLiteDataSource();
const apiDs = new ApiDataSource();
const routeRepository = new RouteRepositoryImpl(sqliteDs, apiDs);

interface RoutesState {
  rutas: RouteModel[];
  incidentes: IncidentModel[];
  conductores: Array<{ id: string; nombre: string; documento: string; rol: string }>;
  rutaSeleccionada: RouteModel | null;
  evaluacionRetraso: IDelayEvaluationResult | null;
  cargando: boolean;
  cargarDatos: () => Promise<void>;
  cargarConductores: () => Promise<void>;
  seleccionarRuta: (ruta: RouteModel) => void;
  evaluarRetrasoRuta: (rutaId: string) => Promise<void>;
  crearRuta: (dto: any) => Promise<boolean>;
  actualizarEstadoRuta: (rutaId: string, nuevoEstado: string) => Promise<boolean>;
}

export const useRoutesStore = create<RoutesState>((set, get) => ({
  rutas: [],
  incidentes: [],
  conductores: [],
  rutaSeleccionada: null,
  evaluacionRetraso: null,
  cargando: false,

  cargarConductores: async () => {
    try {
      const conductores = await routeRepository.getDrivers();
      set({ conductores });
    } catch (e) {
      console.warn('Error cargando conductores:', e);
    }
  },

  cargarDatos: async () => {
    set({ cargando: true });
    try {
      const [rutas, incidentes] = await Promise.all([
        routeRepository.getRoutes(),
        routeRepository.getActiveIncidents(),
      ]);
      const seleccionadaActual = get().rutaSeleccionada;
      const nuevaSeleccionada = seleccionadaActual
        ? rutas.find((r) => r.id === seleccionadaActual.id) || rutas[0] || null
        : rutas[0] || null;

      set({ rutas, incidentes, rutaSeleccionada: nuevaSeleccionada, cargando: false });
      if (nuevaSeleccionada) {
        get().evaluarRetrasoRuta(nuevaSeleccionada.id);
      }
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

  crearRuta: async (dto: any) => {
    try {
      await routeRepository.createRoute(dto);
      await get().cargarDatos();
      return true;
    } catch (e) {
      console.error('Error al crear ruta:', e);
      return false;
    }
  },

  actualizarEstadoRuta: async (rutaId: string, nuevoEstado: string) => {
    try {
      await routeRepository.updateRouteStatus(rutaId, nuevoEstado);
      await get().cargarDatos();
      return true;
    } catch (e) {
      console.error('Error al actualizar estado:', e);
      return false;
    }
  },
}));
