import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoadAlertRepositoryImpl } from '../../data/repositories/RoadAlertRepositoryImpl';
import { GetRoadAlertsUseCase } from '../../domain/usecases/GetRoadAlertsUseCase';

const repo = new RoadAlertRepositoryImpl();
const getAlertsUseCase = new GetRoadAlertsUseCase(repo);

export function useRoadAlerts() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['road_alerts'],
    queryFn: () => getAlertsUseCase.execute(false),
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const syncMutation = useMutation({
    mutationFn: () => getAlertsUseCase.execute(true),
    onSuccess: (data) => {
      queryClient.setQueryData(['road_alerts'], data);
    },
  });

  return {
    alerts: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    syncAlerts: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
  };
}
