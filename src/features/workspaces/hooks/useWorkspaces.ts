// ua: хук для отримання даних - workspaces користувача (with caching, error handling)

import { useQuery } from '@tanstack/react-query';
import { workspaceService } from '@/services/workspace.service';
import { handleGlobalError } from '@/utils/error-handler';
import { useEffect } from 'react';

export const useWorkspaces = () => {
  // ua: запит для отримання всіх workspaces користувача
  const query = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceService.getAllWorkspaces(),
    staleTime: 5 * 60 * 1000, // ua: дані вважаються свіжими протягом 5 хвилин
  });

  // ua: глобальна обробка помилок - toast sonner error messages
  useEffect(() => {
    if (query.isError) {
      handleGlobalError(query.error);
    }
  }, [query.isError, query.error]);

  return query;
};
