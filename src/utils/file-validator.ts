// validator file

// ua: типи файлів на клієнті
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_MIME_TYPES = ['application/pdf'];

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateUploadedFile = (file: File): FileValidationResult => {
  const isImage = file.type.startsWith('image/');
  const isPdf = ALLOWED_MIME_TYPES.includes(file.type);

  if (!isImage && !isPdf) {
    return {
      isValid: false,
      error: 'Дозволено завантажувати лише PDF-файли та зображення.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `Розмір файлу перевищує ліміт ${MAX_FILE_SIZE_MB} MB.`,
    };
  }

  return { isValid: true };
};
