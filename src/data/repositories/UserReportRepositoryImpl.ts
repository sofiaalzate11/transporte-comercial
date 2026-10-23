
import { IUserReportRepository } from '../../domain/repositories/IUserReportRepository';
import { UserReport } from '../../domain/models/UserReport';
import { UserReportDao } from '../datasources/local/UserReportDao';

export class UserReportRepositoryImpl implements IUserReportRepository {
  constructor(
    private readonly localDao: UserReportDao = new UserReportDao()
  ) {}

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
