import { TollStation } from '../models/TollStation';

export interface ITollStationRepository {
  getAllTolls(): Promise<TollStation[]>;
  syncTollsFromRemote(): Promise<number>;
  getTollsByDepartment(department: string): Promise<TollStation[]>;
}
