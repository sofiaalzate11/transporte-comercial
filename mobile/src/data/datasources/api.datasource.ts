import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { RouteModel } from '../../domain/entities/route.model';
import { IncidentModel } from '../../domain/entities/incident.model';
import { IDelayEvaluationResult, ITelemetryPayload } from '../../shared/types';

export class ApiDataSource {
  private client: AxiosInstance;

  constructor(baseURL: string = 'http://10.0.2.2:3000') {
    // 10.0.2.2 apunta al localhost de la máquina anfitriona en el emulador de Android
    this.client = axios.create({
      baseURL,
      timeout: 10000,
    });

    this.client.interceptors.request.use(async (config) => {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async fetchRoutes(): Promise<RouteModel[]> {
    const response = await this.client.get<RouteModel[]>('/routes');
    return response.data;
  }

  async fetchIncidents(): Promise<IncidentModel[]> {
    const response = await this.client.get<IncidentModel[]>('/road-incidents');
    return response.data;
  }

  async sendTelemetryBatch(payload: ITelemetryPayload): Promise<{ savedCount: number }> {
    const response = await this.client.post<{ savedCount: number }>('/telemetry/batch', payload);
    return response.data;
  }

  async evaluateDelay(routeId: string): Promise<IDelayEvaluationResult> {
    const response = await this.client.post<IDelayEvaluationResult>(`/routes/${routeId}/evaluate-delay`);
    return response.data;
  }
}
