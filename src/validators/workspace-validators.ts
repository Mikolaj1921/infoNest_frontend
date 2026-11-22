// ua: утилітні функції-захисники для рантайм перевірки відповідей сервера
import { SingleWorkspaceResponse, WorkspacesResponse } from '@/types/workspace';

// ua: перевірка, чи структура відповіді містить один воркспейс
export const isValidSingleWorkspaceResponse = (
  data: unknown,
): data is SingleWorkspaceResponse => {
  return !!(
    data &&
    typeof data === 'object' &&
    'data' in data &&
    data.data &&
    typeof data.data === 'object' &&
    'workspace' in data.data
  );
};

// ua: перевірка, чи структура відповіді містить масив воркспейсів у полі data
export const isValidWorkspacesResponse = (
  data: unknown,
): data is WorkspacesResponse => {
  const res = data as WorkspacesResponse | null;
  return !!(
    res &&
    typeof res === 'object' &&
    res.success === true &&
    Array.isArray(res.data)
  );
};
