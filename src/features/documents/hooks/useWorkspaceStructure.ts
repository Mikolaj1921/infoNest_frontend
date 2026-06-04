// ua: hook для отримання структури воркспейсу
import { useQuery } from '@tanstack/react-query';
import { documentService } from '@/services/document.service';
import { handleGlobalError } from '@/utils/error-handler';
import { useEffect } from 'react';

// ua: хук для отримання структури воркспейсу ( дерева документів конкретного воркспейсу)
export const useWorkspaceStructure = (workspaceId: string) => {
  const query = useQuery({
    queryKey: ['workspace-structure', workspaceId], // ua: унікальний ключ для кешування даних
    queryFn: () => documentService.getWorkspaceStructure(workspaceId), // ua: функція для отримання даних з сервера через сервіс

    // ua: запобіжник - не робити запит, якщо workspaceId відсутній або некоректний
    enabled: !!workspaceId,
    staleTime: 10 * 1000, // 10s
  });

  // ua: глобальна обробка помилок - toast sonner error messages
  useEffect(() => {
    if (query.isError) {
      handleGlobalError(query.error);
    }
  }, [query.isError, query.error]);

  return query;
};
