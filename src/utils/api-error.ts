// ua: утиліта для отримання повідомлення помилки з різних типів помилок

import axios from 'axios';

export const getApiErrorMessage = (error: unknown): string => {
  // ua: check - чи це помилка від Axios (нп. запит дійшов до сервера або впав по дорозі)
  if (axios.isAxiosError(error)) {
    // ua: получ. повідомлення від бекенду
    return (
      error.response?.data?.message ||
      error.message ||
      'Something went wrong with the API request'
    );
  }

  // ua: звичайна помилка самого js коду
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error in the application';
};
