
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserReport } from '../../domain/models/UserReport';
import { UserReportRepositoryImpl } from '../../data/repositories/UserReportRepositoryImpl';

const repository = new UserReportRepositoryImpl();

export function useUserReports() {
  const queryClient = useQueryClient();

  const reportsQuery = useQuery({
    queryKey: ['userReports'],
    queryFn: () => repository.getAllReports(),
  });

  const createMutation = useMutation({
    mutationFn: (report: UserReport) => repository.createReport(report),
    onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ['userReports'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => repository.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userReports'] });
    },
  });

  return {
    reports: reportsQuery.data ?? [],
    isLoading: reportsQuery.isLoading,
    error: reportsQuery.error,
    createReport: createMutation.mutateAsync,
    deleteReport: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
