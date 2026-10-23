
import { UserReport } from '../models/UserReport';

export interface IUserReportRepository {
  createReport(report: UserReport): Promise<void>;
  getAllReports(): Promise<UserReport[]>;
  deleteReport(id: string): Promise<void>;
}
