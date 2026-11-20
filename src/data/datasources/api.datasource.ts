import axios, { AxiosInstance } from 'axios';
import { RouteModel } from '../../domain/entities/route.model';
import { IncidentModel } from '../../domain/entities/incident.model';
import { IDelayEvaluationResult, ITelemetryPayload } from '../../shared/types';
import { API_BASE_URL } from '../config/api.config';
import { getSecureItem } from '../services/secure-storage.adapter';

export class ApiDataSource {
  private client: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
    });

    this.client.interceptors.request.use(async (config) => {
      const token = await getSecureItem('auth_token');
      if (token) {
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

  async createRoute(dto: any): Promise<RouteModel> {
    const response = await this.client.post<RouteModel>('/routes', dto);
    return response.data;
  }

  async fetchDrivers(): Promise<Array<{ id: string; nombre: string; documento: string; rol: string }>> {
    const response = await this.client.get<Array<{ id: string; nombre: string; documento: string; rol: string }>>('/users/drivers');
    return response.data;
  }

  async updateRouteStatus(routeId: string, estado: string): Promise<RouteModel> {
    const response = await this.client.patch<RouteModel>(`/routes/${routeId}/status`, { estado });
    return response.data;
  }
}
