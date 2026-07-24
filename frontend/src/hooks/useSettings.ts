import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingService } from '../services/setting.service';

const DEFAULT_SETTINGS = {};


export function useSettings() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: settingService.getAllSettings,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const updateSettingsMutation = useMutation({
    mutationFn: settingService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  return {
    settings: settingsQuery.data || DEFAULT_SETTINGS,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    updateSettings: updateSettingsMutation.mutateAsync,
    isUpdating: updateSettingsMutation.isPending,
  };
}
